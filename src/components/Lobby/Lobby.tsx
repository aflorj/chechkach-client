import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { socket } from '../../socket';
import DrawingBoardProvider from '../../providers/DrawingBoardProvider';
import MagicCanvas from '../MagicCanvas/MagicCanvas';
import { LobbyContext } from '../../providers/LobbyProvider';
import InfoBar from '../InfoBar/InfoBar';
import Chat from '../Chat/Chat';
import PlayerList from '../PlayerList/PlayerList';
import Palette from '../Palette/Palette';
import { LobbiesApi } from '@aflorj/chechkach-openapi-ts-client';
import { configuration } from '../../apiConfiguration';

export default function Lobby() {
  const lobbiesApi = new LobbiesApi(configuration);

  const navigate = useNavigate();

  const {
    stateUsername,
    lobbyStatus,
    setLobbyStatus,
    allowedToDraw,
    users,
    messageHistory,
  } = useContext(LobbyContext);
  const { state } = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [lobbyInfo, setLobbyInfo] = useState<any>();
  const { lobbyName } = useParams();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isStartingGame, setIsStartingGame] = useState(false);

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

    // when joining a lobby also send the latest known socket id to check if user is already in some lobby
    let lastKnownSocketId = localStorage?.getItem('localSocketId');
    function onConnect() {
      socket.emit('join', {
        lobbyName: lobbyName,
        userName: stateUsername,
        lastKnownSocketId: lastKnownSocketId,
      });

      // we have connected - save our socket id to localStorage
      localStorage?.setItem('localSocketId', socket?.id);
      console.log('PO: ', socket?.id);
      setIsConnected(true);
    }

    function onConnectAttemptResponse({ response }: any) {
      console.log('response tu: ', response);
      // DOING

      if (response?.allGood) {
        console.log('all good');
        setIsLoading(false);
      }
      if (response?.alreadyActive) {
        console.log('you shouldnt be here');
        navigate('/lobbies');
      }
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
    socket.on('connectAttemptResponse', onConnectAttemptResponse);
    socket.on('disconnect', onDisconnect);
    socket.on('lobbyUpdate', onLobbyUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connectAttemptResponse', onConnectAttemptResponse);
      socket.off('disconnect', onDisconnect);
      socket.off('lobbyUpdate', onLobbyUpdate);
    };
  }, []);

  const getLobbyInfo = () => {
    console.log('gremo iskat lobbyinfo');
    lobbiesApi
      .findOne(lobbyName!)
      .then((res) => {
        console.log('successfull getLobby fetch: ', res?.data);
        setLobbyInfo(res?.data);
        setLobbyStatus!(res?.data?.status);
      })
      .catch((err) => {
        console.error('ta error pri getLobby: ', err);
        if (err?.response?.data?.statusCode === 404) {
          // TODO alert user that the lobby doesn't exist
          navigate('/lobbies');
        }
      });
  };

  // useEffect(() => {
  //   if (state) {
  //     console.log('1, state: ', state);
  //     // for users coming from lobbylist/lobbycard - not refreshing
  //     setLobbyInfo(state);
  //   } else {
  //     // refresh
  //     getLobbyInfo();
  //   }
  // }, []);

  useEffect(() => {
    lobbyStatus === undefined && getLobbyInfo();
  }, []);

  // useEffect(() => {
  //   console.log('isLoading state: ', isLoading);
  // }, [isLoading]);

  return isLoading ? (
    <>Loading...</>
  ) : lobbyStatus === 'open' ? (
    <div className="container max-w-[1024px] h-screen pt-8 px-4 lg:px-0">
      <div className="bg-purple-100  mx-auto rounded-3xl p-2">
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
              {user?.playerId} {user?.isOwner && <>♛</>}{' '}
              {isConnected ? 'connected' : 'not connected'}
            </div>
          ))}
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
  ) : (
    <div className="mx-auto px-2 lg:px-0">
      <DrawingBoardProvider>
        <InfoBar lobbyName={lobbyName} />
        <div className="flex flex-wrap lg:flex-nowrap">
          <PlayerList />
          <div className="flex flex-col mx-auto lg:mx-4 order-1 lg:order-2 mb-2 md:mb-4">
            <MagicCanvas lobbyName={lobbyInfo?.name} />
            {allowedToDraw && <Palette />}
          </div>
          <Chat lobbyName={lobbyInfo?.name} />
        </div>
      </DrawingBoardProvider>
    </div>
  );
}
