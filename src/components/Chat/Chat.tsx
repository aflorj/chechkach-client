import { useContext, useRef, useState } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';
import Message from './Message';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../Button/Button';
import { useTranslation } from 'react-i18next';

export default function Chat({ lobbyName }: any) {
  const inputRef = useRef<any>(null);

  const { stateUsername, messageHistory } = useContext(LobbyContext);

  const [msg, setMsg] = useState('');

  const { t } = useTranslation();

  const sendMessage = () => {
    if (msg?.trim()) {
      socket.send({
        userName: stateUsername,
        lobbyName: lobbyName,
        messageType: 'chat',
        messageContent: msg?.trim(),
      });
      setMsg('');
      inputRef.current!.focus();
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // console.log('msg history: ', messageHistory);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full lg:w-80 order-3 flex flex-col max-h-[70vh] h-full min-h-0"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col h-full min-h-0 max-h-[65vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/20">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
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
            {t('chat.chat', 'Chat')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('chat.room', {
              room: lobbyName,
              defaultValue: `Room: ${lobbyName}`,
            })}
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {messageHistory?.length > 0 ? (
              messageHistory?.map((msgObj: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Message msgObj={msgObj} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500"
              >
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
                <p>{t('chat.no_messages', 'No messages')}</p>
                <p className="text-sm">
                  {t('chat.start_conversation', 'Start the conversation!')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              placeholder={t(
                'chat.send_message_placeholder',
                'Type a message...'
              )}
              className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 outline-none text-sm"
              value={msg}
              onChange={(e) => setMsg(e?.target?.value)}
              onKeyDown={handleKeyPress}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                onClick={sendMessage}
                isDisabled={!msg.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg rounded-xl px-4 py-3 font-semibold transition-all duration-300"
              >
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
