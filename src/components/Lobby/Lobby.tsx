import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { socket } from '../../socket';
import axios from 'axios';
import DrawingBoardProvider from '../../providers/DrawingBoardProvider';
import MagicCanvas from '../MagicCanvas/MagicCanvas';
import WordPicker from '../WordPicker/WordPicker';

interface ILobbyProps {
  stateUsername: string | undefined;
}

export default function Lobby({ stateUsername }: ILobbyProps) {
  const { state } = useLocation();

  const [lobbyInfo, setLobbyInfo] = useState<any>();
  const { lobbyName } = useParams();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isStartingGame, setIsStartingGame] = useState(false);
  // const [isReady, setIsReady] = useState(false); we don't track player's ready status anymore
  const [messageHistory, setMessageHistory] = useState<any>([]);
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

    function onMessage(msgObj: any) {
      setMessageHistory((prevState: any) => [...prevState, msgObj]);
    }

    // too general... replace with multiple specific events
    function onLobbyUpdate({ newLobbyState }: any) {
      console.log('new lobby state: ', newLobbyState);
      setLobbyInfo(newLobbyState);
    }

    function onPickAWord({ arrayOfWordOptions }: any) {
      console.log('pick one of these to draw: ', ...arrayOfWordOptions);

      // TODO set options and display word picker
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('lobbyUpdate', onLobbyUpdate);
    socket.on('pickAWord', onPickAWord);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('lobbyUpdate', onLobbyUpdate);
      socket.off('pickAWord', onPickAWord);

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
    console.log('msg history: ', messageHistory);
  }, [messageHistory]);

  useEffect(() => {
    if (state) {
      // for users coming from lobbylist/lobbbbycard - not refreshing
      setLobbyInfo(state);
    } else {
      // refresh
      getLobbyInfo();
    }
  }, []);

  useEffect(() => {
    console.log('lobby info je: ', lobbyInfo);
  }, [lobbyInfo]);

  if (lobbyInfo?.status !== 'open') {
    return (
      <DrawingBoardProvider>
        <WordPicker />
        <MagicCanvas lobbyName={lobbyInfo?.name} />
      </DrawingBoardProvider>
    );
  }
  return (
    <div className="h-screen pt-8">
      <div className="bg-purple-100 md:w-1/2 mx-auto p-4">
        <div className="text-3xl flex justify-between">
          <div>
            {lobbyInfo?.name} ({lobbyInfo?.status})
          </div>
          {stateUsername ===
            lobbyInfo?.players?.filter((player: any) => player.isOwner)?.[0]
              ?.playerId && (
            <button
              disabled={lobbyInfo?.players?.length < 2 || isStartingGame}
              onClick={() => startGame()}
            >
              start
            </button>
          )}
        </div>
        <div className="bg-purple-50 rounded-md mt-4">
          {lobbyInfo?.players?.map((player: any) => (
            <div
              className={`${player?.ready ? 'bg-green-200' : 'bg-gray-200'}`}
            >
              {player?.playerId} {player?.isOwner && <>♛</>}
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
