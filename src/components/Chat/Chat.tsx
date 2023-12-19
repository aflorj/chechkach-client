import { useContext, useRef, useState } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';
import Message from './Message';
import clsx from 'clsx';

export default function Chat({ lobbyName }: any) {
  const inputRef = useRef<any>(null);

  const { stateUsername, messageHistory } = useContext(LobbyContext);

  const [msg, setMsg] = useState('');

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

  console.log('msg history: ', messageHistory);
  return (
    <div
      id="chat-container"
      className="flex flex-col justify-between bg-white border border-black rounded w-60"
      style={{ height: '32rem' }}
    >
      <div className="overflow-y-auto">
        {messageHistory?.map((msgObj: any, index: number) => {
          return (
            <div
              className={clsx(index % 2 == 0 ? 'bg-gray-100' : 'bg-gray-200')}
            >
              <Message msgObj={msgObj} />
            </div>
          );
        })}
      </div>
      <div>
        <input
          ref={inputRef}
          placeholder="placeholder..."
          className="w-full"
          value={msg}
          onChange={(e) => setMsg(e?.target?.value)}
          onKeyDown={handleKeyPress}
        />
        {/* <button onClick={() => sendMessage()}>send</button> */}
      </div>
    </div>
  );
}
