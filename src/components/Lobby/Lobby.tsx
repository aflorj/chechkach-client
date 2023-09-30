import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { socket } from '../../socket';
import axios from 'axios';
import { ReactSketchCanvas } from 'react-sketch-canvas';

interface ILobbyProps {
  stateUsername: string | undefined;
}

export default function Lobby({ stateUsername }: ILobbyProps) {
  const canvasRef = useRef<any>();
  const canvasRef2 = useRef<any>();

  const drawer = 'yoshi';
  const { state } = useLocation();

  const [lobbyInfo, setLobbyInfo] = useState<any>();
  const { lobbyName } = useParams();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReady, setIsReady] = useState(false);
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

    function onLobbyUpdate({ newLobbyState }: any) {
      console.log('new lobby state: ', newLobbyState);
      setLobbyInfo(newLobbyState);
    }

    function onPathsUpdate({ newPaths, userName }: any) {
      console.log(
        `incoming paths from ${userName} and my username is ${stateUsername}`
      );

      // TEMP? spet nastavljam samo, ce user ne rise

      if (stateUsername !== userName) {
        // ni risac
        canvasRef.current.loadPaths(newPaths);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('lobbyUpdate', onLobbyUpdate);
    socket.on('pathsUpdate', onPathsUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('lobbyUpdate', onLobbyUpdate);
      socket.off('pathsUpdate', onPathsUpdate);
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

  const toggleReady = () => {
    socket.emit('ready_change', {
      userName: stateUsername,
      lobbyName: lobbyName,
      isReady: !isReady,
    });
    setIsReady(!isReady);
  };

  const emitNewPaths = (newPaths: any) => {
    socket.emit('newPaths', {
      userName: stateUsername,
      lobbyName: lobbyName,
      newPaths: newPaths,
    });
  };

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

  return lobbyInfo?.status !== 'playing' ? (
    <div className="h-screen pt-8">
      <div className="bg-purple-100 md:w-1/2 mx-auto p-4">
        <div className="text-3xl">
          {lobbyInfo?.name} ({lobbyInfo?.status})
        </div>
        <div className="bg-purple-50 rounded-md mt-4">
          {lobbyInfo?.players?.map((player: any) => (
            <div
              className={`${player?.ready ? 'bg-green-200' : 'bg-gray-200'}`}
            >
              {player?.playerId} (
              {player?.connected ? 'connected' : 'not connected'}) (
              {player?.ready ? 'ready' : 'not ready'})
            </div>
          ))}
        </div>
        <div>
          {isConnected ? 'connected' : 'not connected'}{' '}
          <button onClick={() => socket.connect()}>connect</button>
          <button onClick={() => socket.disconnect()}>disconnect</button>
          <button
            onClick={() => toggleReady()}
            disabled={lobbyInfo?.status === 'playing'}
          >
            Ready {isReady ? '!' : '?'}
          </button>
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
    <div>
      <ReactSketchCanvas
        width="100%"
        height="500px"
        strokeWidth={10}
        ref={canvasRef}
        onChange={(updatedPaths) => {
          if (updatedPaths?.length && drawer === stateUsername) {
            emitNewPaths(updatedPaths?.[updatedPaths?.length - 1]);
          }
        }}
      />
    </div>
  );
}
