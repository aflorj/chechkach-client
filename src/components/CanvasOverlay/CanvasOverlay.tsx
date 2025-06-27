import { useContext, useEffect } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

export default function CanvasOverlay({ lobbyName }: any) {
  const { stateUsername, wordOptions, roundScoreboard } =
    useContext(LobbyContext);

  const pickWord = (word: string) => {
    socket.emit('wordPick', {
      pickedWord: word,
      lobbyName: lobbyName,
      userName: stateUsername,
    });
  };

  useEffect(() => {
    console.log('map this: ', roundScoreboard);
  }, [roundScoreboard]);

  // Find top score for highlighting
  const topScore =
    roundScoreboard && roundScoreboard.length > 0
      ? Math.max(...roundScoreboard.map((entry: any) => entry.score))
      : null;

  return (
    <div
      id="canvas-overlay"
      className="absolute h-full w-full top-0 left-0 flex items-center justify-center z-20"
      style={{ background: 'rgba(30,41,59,0.25)' }}
    >
      <AnimatePresence>
        {wordOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 px-8 py-8 flex flex-col items-center max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Izberi besedo za risanje
              </h2>
              <p className="text-gray-600 text-sm">
                Klikni na eno izmed ponujenih besed
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {wordOptions?.map((word: string) => (
                <motion.button
                  key={word}
                  whileHover={{
                    y: -2,
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pickWord(word)}
                  className="px-6 py-3 rounded-xl font-semibold text-lg shadow-md transition-all border border-white/40 bg-white/90 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {word}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {roundScoreboard && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 px-8 py-8 flex flex-col items-center max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Konec runde
              </h2>
              <p className="text-gray-600 text-sm">Točke v tej rundi</p>
            </div>
            <div className="w-full">
              <div className="divide-y divide-white/40">
                {roundScoreboard?.map(
                  (entry: { playerId: string; score: number }, idx: number) => (
                    <div
                      key={entry.playerId}
                      className={clsx(
                        'flex items-center justify-between py-3 px-2',
                        entry.score === topScore && entry.score > 0
                          ? 'bg-gradient-to-r from-lime-200 to-green-100 rounded-xl shadow-md'
                          : 'bg-transparent',
                        entry.score > 0
                          ? 'text-green-700 font-semibold'
                          : 'text-gray-700'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                          {entry.playerId.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-base">{entry.playerId}</span>
                        {entry.score === topScore && entry.score > 0 && (
                          <span
                            className="ml-2 text-yellow-500 text-lg"
                            title="Najboljši v rundi"
                          >
                            ★
                          </span>
                        )}
                      </div>
                      <div className="text-lg">{entry.score}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
