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
import { motion, AnimatePresence } from 'motion/react';
import Button from '../Button/Button';

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
    if (!msg.trim()) return;

    socket.send({
      userName: stateUsername,
      lobbyName: lobbyName,
      messageType: 'chat',
      messageContent: msg,
    });
    setMsg('');
  };

  const startGame = () => {
    // console.log('start game button click');
    setIsStartingGame(true);
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
      // console.log('PO: ', socket?.id);
      setIsConnected(true);
    }

    function onConnectAttemptResponse({ response }: any) {
      // console.log('response tu: ', response);
      // DOING

      if (response?.allGood) {
        // console.log('all good');
        setIsLoading(false);
      }
      if (response?.alreadyActive) {
        // console.log('you shouldnt be here');
        navigate('/lobbies');
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // too general... replace with multiple specific events
    function onLobbyUpdate({ newLobbyState }: any) {
      // console.log('new lobby state: ', newLobbyState);
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
    // console.log('gremo iskat lobbyinfo');
    lobbiesApi
      .findOne(lobbyName!)
      .then((res) => {
        // console.log('successfull getLobby fetch: ', res?.data);
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

  useEffect(() => {
    getLobbyInfo();

    return () => {
      socket.disconnect(); // unmounting this view equals disconnect
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (lobbyStatus === 'open') {
    const isOwner =
      stateUsername ===
      users?.filter((player: any) => player.isOwner)?.[0]?.playerId;
    const canStart = users?.length >= 2 && !isStartingGame;

    return (
      <div className="container max-w-[1024px] h-screen pt-8 px-4 lg:px-0 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {lobbyInfo?.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <p className="text-gray-600">
                      {isConnected ? 'Povezan' : 'Ni povezan'} •{' '}
                      {users?.length || 0} igralcev
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="primary"
                      isDisabled={!canStart}
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        {isStartingGame ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Začenjam...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Začni igro
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Igralci ({users?.length || 0})
                </h2>

                <div className="space-y-3">
                  <AnimatePresence>
                    {users?.map((user: any, index: number) => (
                      <motion.div
                        key={user.playerId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/20"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-sm">
                            {user.playerId?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {user.playerId}
                            </span>
                            {user.isOwner && (
                              <span className="text-yellow-600 text-lg">♛</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isConnected ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              {isConnected ? 'Povezan' : 'Ni povezan'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 h-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Pogovor
                </h2>

                {/* Messages */}
                <div className="flex-1 mb-4 max-h-96 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {messageHistory?.length > 0 ? (
                      messageHistory?.map((msgObj: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`flex ${
                            msgObj?.userName === stateUsername
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md p-3 rounded-xl ${
                              msgObj?.userName === stateUsername
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="text-xs opacity-75 mb-1">
                              {msgObj?.userName}
                            </div>
                            <div>{msgObj?.message?.content}</div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p>Ni sporočil</p>
                        <p className="text-sm">Začni pogovor!</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="flex gap-3">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e?.target?.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    type="text"
                    placeholder="Napiši sporočilo..."
                    className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 outline-none"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="primary"
                      onClick={sendMessage}
                      isDisabled={!msg.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Game is active - render the drawing board
  return (
    <div className="h-screen mx-auto px-2 lg:px-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <DrawingBoardProvider>
        <InfoBar lobbyName={lobbyName} />
        <div className="flex flex-wrap lg:flex-nowrap p-4 gap-4">
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
