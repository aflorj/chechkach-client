import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { LobbiesApi } from '@aflorj/chechkach-openapi-ts-client';
import { configuration } from '../../apiConfiguration';

interface ILobbyCardProps {
  lobby: any;
}

export default function LobbyCard({ lobby }: ILobbyCardProps) {
  const lobbiesApi = new LobbiesApi(configuration);

  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const attemptToJoinJobby = () => {
    if (isJoining) return;

    setIsJoining(true);

    lobbiesApi
      .join({
        lobbyName: lobby?.name,
        lastKnownSocketId: localStorage?.getItem('localSocketId')!,
      })
      .then((res) => {
        setIsJoining(false);
        // console.log('join res: ', res);
        navigate(`/lobby/${lobby?.name}`, {
          state: res?.data?.gameState,
        });
      })
      .catch((err) => {
        console.error(err?.response?.data?.message);
        setIsJoining(false);
      });
  };

  const playerCount = lobby?.players?.length || 0;
  const maxPlayers = 10;
  const isFull = playerCount >= maxPlayers;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
        isFull ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'
      }`}
      onClick={() => !isFull && attemptToJoinJobby()}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />

      {/* Main card content */}
      <div className="relative bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg leading-tight">
                {lobby?.name}
              </h3>
              <p className="text-sm text-gray-500 leading-tight">
                Pridruži se igri
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {lobby?.players
                  ?.slice(0, 3)
                  .map((player: any, index: number) => (
                    <div
                      key={index}
                      className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-semibold">
                        {player?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  ))}
                {playerCount > 3 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-semibold">
                      +{playerCount - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-500"
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
                  <span className="text-sm font-medium text-gray-700">
                    {playerCount}/{maxPlayers}
                  </span>
                </div>
                {isFull && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                    Polno
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for player count */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(playerCount / maxPlayers) * 100}%` }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`h-2 rounded-full ${
              playerCount >= maxPlayers
                ? 'bg-red-500'
                : playerCount >= maxPlayers * 0.8
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-green-400 to-blue-500'
            }`}
          />
        </div>

        {/* Join button */}
        <motion.div
          className={`w-full rounded-lg py-2 px-4 text-center font-semibold transition-all duration-300 ${
            isFull
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isJoining
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isJoining ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Pridružujem...
            </div>
          ) : isFull ? (
            'Igra je polna'
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Pridruži se
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
