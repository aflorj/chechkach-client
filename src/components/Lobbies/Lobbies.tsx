import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import LobbyCard from '../LobbyCard/LobbyCard';
import Button from '../Button/Button';
import { motion, AnimatePresence } from 'motion/react';
import { LobbiesApi } from '@aflorj/chechkach-openapi-ts-client';
import { configuration } from '../../apiConfiguration';
import { useTranslation } from 'react-i18next';

export default function Lobbies() {
  const { t, i18n } = useTranslation();

  const lobbiesApi = new LobbiesApi(configuration);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [lobbies, setLobbies] = useState<any>();
  const [lobbyName, setLobbyName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const fetchLobbies = () => {
    lobbiesApi
      .findAll()
      .then((res) => {
        setIsLoading(false);
        console.log('lobbies:', res?.data);
        setLobbies(res?.data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        setLobbies([]);
      });
  };

  const createLobby = () => {
    if (!lobbyName.trim()) return;

    lobbiesApi
      .create({
        lobbyName: lobbyName,
        password: 'test',
        private: true,
      })
      .then((res) => {
        console.log('createLobby response: ', res);
        navigate(`/lobby/${res?.data?.name}`);
      })
      .catch((err) => {
        console.error('ta error pri kreaciji: ', err);
      });
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  return (
    <div className="container mx-auto min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container max-w-6xl mx-auto"
      >
        {/* Header Section */}
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
                  {t('lobbies.join_the_game', 'Join the game!')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t(
                    'lobbies.find_or_create',
                    'Find an existing game or create a new one'
                  )}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="primary"
                  isDisabled={isLoading}
                  onClick={() => fetchLobbies()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {t('lobbies.refresh', 'Refresh')}
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lobbies List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
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
                {t('lobbies.available_games', 'Available games')}
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
                  />
                </div>
              ) : lobbies?.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {lobbies?.map((lobby: any, index: number) => (
                      <motion.div
                        key={lobby.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <LobbyCard lobby={lobby} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">
                    {t('lobbies.no_games', 'No games available')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {t(
                      'lobbies.create_first_game',
                      'Create the first game below!'
                    )}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Create Lobby Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t('lobbies.create_new_game', 'Create new game')}
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <motion.input
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e?.target?.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    type="text"
                    id="room_name"
                    className="block w-full px-4 py-4 text-gray-900 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 outline-none"
                    // placeholder="Vnesi ime sobe..."
                  />
                  <motion.label
                    htmlFor="room_name"
                    animate={{
                      y: isFocused || lobbyName ? -12 : 0,
                      scale: isFocused || lobbyName ? 0.85 : 1,
                      color: isFocused ? '#3b82f6' : '#6b7280',
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-4 top-4 text-gray-500 bg-white/80 backdrop-blur-sm px-2 pointer-events-none"
                  >
                    {t('lobbies.room_name', 'Room name')}
                  </motion.label>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="primary"
                    onClick={createLobby}
                    isDisabled={!lobbyName.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg rounded-xl px-6 py-4 font-semibold text-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      {t('lobbies.create_game', 'Create game')}
                    </div>
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
