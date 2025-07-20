import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

type IMessageProps = any;

export default function Message({ msgObj }: IMessageProps) {
  console.log('obj: ', msgObj);
  const { stateUsername } = useContext(LobbyContext);
  const { t } = useTranslation();

  const buildServerMessage = (msg: any) => {
    if (msg.type === 'correctGuess') {
      if (msg?.content === stateUsername) {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="text-green-700 font-medium">
              {t('chat.correct_guess_you', 'You guessed the word! 🎉')}
            </div>
          </motion.div>
        );
      } else {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="text-green-700">
              <span className="font-semibold">{msg?.content}</span>{' '}
              {t('chat.correct_guess_other', {
                name: msg?.content,
                defaultValue: `${msg?.content} guessed the word! 🎉`,
              })}
            </div>
          </motion.div>
        );
      }
    } else if (msg.type === 'closeGuess') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl"
        >
          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          <div className="text-yellow-800 font-medium">
            {t('chat.close_guess', 'So close!')}
          </div>
        </motion.div>
      );
    } else if (msg.type === 'playerJoiningOrLeaving') {
      // Expect msg.content to be something like 'x joined the lobby' or 'x left the lobby'
      if (msg.content?.includes('joined the lobby')) {
        const name = msg.content.split(' ')[0];
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
          >
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="text-yellow-700 text-sm">
              {t('chat.joined_lobby', {
                name,
                defaultValue: `${name} joined the lobby`,
              })}
            </div>
          </motion.div>
        );
      } else if (msg.content?.includes('left the lobby')) {
        const name = msg.content.split(' ')[0];
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
          >
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="text-yellow-700 text-sm">
              {t('chat.left_lobby', {
                name,
                defaultValue: `${name} left the lobby`,
              })}
            </div>
          </motion.div>
        );
      }
      // fallback
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <div className="text-yellow-700 text-sm">{msg?.content}</div>
        </motion.div>
      );
    }
  };

  if (msgObj?.serverMessage) {
    return <>{buildServerMessage(msgObj.message)}</>;
  } else {
    const isOwnMessage = msgObj?.userName === stateUsername;
    const isWinnersOnly = msgObj?.message?.type === 'winnersOnly';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={clsx(
            'max-w-xs lg:max-w-md p-3 rounded-xl',
            isWinnersOnly &&
              'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200',
            !isWinnersOnly &&
              isOwnMessage &&
              'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
            !isWinnersOnly && !isOwnMessage && 'bg-gray-100 text-gray-800'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                isWinnersOnly &&
                  'bg-gradient-to-br from-purple-400 to-indigo-600 text-white',
                !isWinnersOnly && isOwnMessage && 'bg-white/20 text-white',
                !isWinnersOnly &&
                  !isOwnMessage &&
                  'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              )}
            >
              {msgObj?.userName?.charAt(0)?.toUpperCase()}
            </div>
            <span
              className={clsx(
                'text-xs font-medium',
                isWinnersOnly && 'text-purple-600',
                !isWinnersOnly && isOwnMessage && 'text-white/80',
                !isWinnersOnly && !isOwnMessage && 'text-gray-600'
              )}
            >
              {msgObj?.userName}
            </span>
            {isWinnersOnly && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                {t('chat.winner_only', 'Winners')}
              </span>
            )}
          </div>
          <div
            className={clsx(
              isWinnersOnly && 'text-purple-700 font-medium',
              !isWinnersOnly && 'text-sm'
            )}
          >
            {msgObj?.message?.content}
          </div>
        </div>
      </motion.div>
    );
  }
}
