import { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { socket } from '../../socket';
import axios from 'axios';
import DrawingBoardProvider from '../../providers/DrawingBoardProvider';
import MagicCanvas from '../MagicCanvas/MagicCanvas';
import WordPicker from '../WordPicker/WordPicker';
import { LobbyContext } from '../../providers/LobbyProvider';
import InfoBar from '../InfoBar/InfoBar';
import Chat from '../Chat/Chat';
import PlayerList from '../PlayerList/PlayerList';
import Palette from '../Palette/Palette';

export default function Lobby() {
  const {
    stateUsername,
    lobbyStatus,
    wordOptions,
    allowedToDraw,
    users,
    messageHistory,
  } = useContext(LobbyContext);
  const { state } = useLocation();

  const [lobbyInfo, setLobbyInfo] = useState<any>();
  const { lobbyName } = useParams();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isStartingGame, setIsStartingGame] = useState(false);
  // const [isReady, setIsReady] = useState(false); we don't track player's ready status anymore
  const [msg, setMsg] = useState('');

  const sendMessage = () => {
    socket.send({
      userName: stateUsername,
      lobbyName: lobbyName,
      messageType: 'chat',
      messageContent: msg,
    });
  };

  const startGame = () => {
    console.log('start game button click');
    socket.emit('startGame', {
      lobbyName: lobbyName,
      userName: stateUsername,
    });
  };

  useEffect(() => {
    socket.connect();

    // Send the lobby name to the server after connection
    // socket.emit('joinLobby', { lobbyName: lobbyName, usserName: 'test' });

    console.log('render');

    function onConnect() {
      console.log('fire onconnect');
      socket.emit('join', {
        lobbyName: lobbyName,
        userName: stateUsername,
      });
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // too general... replace with multiple specific events
    function onLobbyUpdate({ newLobbyState }: any) {
      console.log('new lobby state: ', newLobbyState);
      setLobbyInfo(newLobbyState);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('lobbyUpdate', onLobbyUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('lobbyUpdate', onLobbyUpdate);

      //   socket.disconnect();
    };
  }, []);

  const getLobbyInfo = () => {
    console.log('gremo iskat lobbyinfo');
    axios({
      method: 'get',
      url: `http://localhost:9030/api/getLobby/${lobbyName}`,
    })
      .then((res) => {
        console.log('successfull getLobby fetch: ', res?.data);
        setLobbyInfo(res?.data?.lobbyInfo);
      })
      .catch((err) => {
        console.error('ta error pri getLobby: ', err);
      });
  };

  // const toggleReady = () => {
  //   socket.emit('ready_change', {
  //     userName: stateUsername,
  //     lobbyName: lobbyName,
  //     isReady: !isReady,
  //   });
  //   setIsReady(!isReady);
  // };

  useEffect(() => {
    if (state) {
      // for users coming from lobbylist/lobbbbycard - not refreshing
      setLobbyInfo(state);
    } else {
      // refresh
      getLobbyInfo();
    }
  }, []);

  if (
    lobbyStatus === 'pickingWord' ||
    lobbyStatus === 'playing' ||
    lobbyStatus === 'roundOver' ||
    lobbyStatus === 'gameOver'
  ) {
    return (
      <DrawingBoardProvider>
        {wordOptions && <WordPicker lobbyName={lobbyInfo?.name} />}
        <InfoBar lobbyName={lobbyName} />
        <div className="flex">
          <PlayerList />
          <div className="flex flex-col">
            <MagicCanvas lobbyName={lobbyInfo?.name} />
            {allowedToDraw && <Palette />}
          </div>
          <Chat lobbyName={lobbyInfo?.name} />
        </div>
      </DrawingBoardProvider>
    );
  }
  return (
    <div className="h-screen pt-8">
      <div className="bg-purple-100 md:w-1/2 mx-auto p-4">
        <div className="text-3xl flex justify-between">
          <div>
            {lobbyInfo?.name} ({lobbyStatus})
          </div>
          {stateUsername ===
            users?.filter((player: any) => player.isOwner)?.[0]?.playerId && (
            <button
              disabled={users?.length < 2 || isStartingGame}
              onClick={() => startGame()}
            >
              start
            </button>
          )}
        </div>
        <div className="bg-purple-50 rounded-md mt-4">
          {users?.map((user: any) => (
            <div>
              {user?.playerId} {user?.isOwner && <>♛</>}
            </div>
          ))}
        </div>
        <div>
          {isConnected ? 'connected' : 'not connected'}{' '}
          <button onClick={() => socket.connect()}>connect</button>
          <button onClick={() => socket.disconnect()}>disconnect</button>
          {/* <button
            onClick={() => toggleReady()}
            disabled={lobbyInfo?.status === 'playing'}
            >
            Ready {isReady ? '!' : '?'}
          </button> */}
        </div>
        <br />
        <div>
          <div>
            <input value={msg} onChange={(e) => setMsg(e?.target?.value)} />
            <button onClick={() => sendMessage()}>send</button>
          </div>
          <div>messages:</div>
          <div>
            {messageHistory?.length > 0 &&
              messageHistory?.map((msgObj: any) => (
                <div>
                  {msgObj?.userName}
                  {': '}
                  {msgObj?.message?.content}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
