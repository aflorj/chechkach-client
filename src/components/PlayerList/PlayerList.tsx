import { useContext, useEffect } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function PlayerList() {
  const { users, drawingUser, roundWinners } = useContext(LobbyContext);

  useEffect(() => {
    console.log('users ', users);
  }, [users]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full lg:w-64 order-2 lg:order-1"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
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
                className={clsx(
                  'p-3 rounded-xl border transition-all duration-300',
                  roundWinners?.includes(user?.playerId)
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md'
                    : 'bg-white/50 border-white/20 hover:shadow-md'
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Player Avatar */}
                  <div className="relative">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center shadow-md',
                        roundWinners?.includes(user?.playerId)
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      )}
                    >
                      <span className="text-white font-semibold text-sm">
                        {user?.playerId?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>

                    {/* Drawing Indicator */}
                    {user?.playerId === drawingUser && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md"
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'font-semibold truncate',
                          roundWinners?.includes(user?.playerId) &&
                            'text-green-700',
                          !user.connected && 'line-through text-gray-500'
                        )}
                      >
                        {user?.playerId}
                      </span>
                      {roundWinners?.includes(user?.playerId) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-yellow-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {user?.score || 0} točk
                      </span>
                      <div
                        className={clsx(
                          'w-2 h-2 rounded-full',
                          user.connected ? 'bg-green-500' : 'bg-red-500'
                        )}
                      />
                      <span className="text-xs text-gray-500">
                        {user.connected ? 'Povezan' : 'Ni povezan'}
                      </span>
                    </div>
                  </div>

                  {/* Position Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
