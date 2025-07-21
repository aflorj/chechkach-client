import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import CountDown from '../CountDown/CountDown';
import { motion } from 'motion/react';
import { useTranslation, Trans } from 'react-i18next';

export default function InfoBar({
  lobbyName,
}: {
  lobbyName: string | undefined;
}) {
  const {
    lobbyStatus,
    drawingUser,
    maskedWord,
    unmaskedWord,
    stateUsername,
    wordToDraw,
    roundEndTimeStamp,
  } = useContext(LobbyContext);

  const { t } = useTranslation();

  const getInfoBarMessage = () => {
    switch (lobbyStatus) {
      case 'pickingWord':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <p className="text-gray-700">
              {stateUsername === drawingUser
                ? t('infobar.picking_word_you', 'Pick a word to draw')
                : t('infobar.picking_word_other', {
                    name: drawingUser,
                    defaultValue: `${drawingUser} is picking a word to draw`,
                  })}
            </p>
          </div>
        );
      case 'playing':
        return wordToDraw ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-700">
              <Trans
                i18nKey="infobar.drawing"
                values={{ word: wordToDraw }}
                components={[<span className="font-semibold text-blue-600" />]}
              />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="flex items-center gap-1">
              {unmaskedWord ? (
                <>
                  {unmaskedWord
                    ?.split(' ')
                    ?.map((word: string, index: number) => (
                      <div key={index} className="flex items-baseline gap-1">
                        <span className="text-gray-700 font-medium">
                          {word}
                        </span>
                        <span className="text-xs text-gray-500">
                          {word?.length}
                        </span>
                      </div>
                    ))}
                </>
              ) : (
                <>
                  {maskedWord
                    ?.split(' ')
                    ?.map((word: string, wordIndex: number) => (
                      <div
                        key={wordIndex}
                        className="flex items-baseline gap-1"
                      >
                        <div className="flex gap-1">
                          {word
                            ?.split('')
                            ?.map((char: string, charIndex: number) => (
                              <div
                                key={charIndex}
                                className="w-4 h-6 bg-gray-300 rounded flex items-center justify-center"
                              >
                                <span className="text-gray-600 font-mono text-sm">
                                  {char}
                                </span>
                              </div>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {word?.length}
                        </span>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        );
      case 'roundOver':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <div className="flex items-center gap-1">
              {unmaskedWord?.split(' ')?.map((word: string, index: number) => (
                <div key={index} className="flex items-baseline gap-1">
                  <span className="text-gray-700 font-medium">{word}</span>
                  <span className="text-xs text-gray-500">{word?.length}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'gameOver':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-gray-700 font-semibold">
              {t('infobar.game_over', 'Game over')}
            </span>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-4"
    >
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                {t('infobar.room', 'Room')}: {lobbyName}
              </span>
            </div>
            {roundEndTimeStamp && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <CountDown lobbyName={lobbyName} />
              </div>
            )}
          </div>
          <div className="text-center sm:text-right">{getInfoBarMessage()}</div>
        </div>
      </div>
    </motion.div>
  );
}
