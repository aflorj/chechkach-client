import { useContext, useState } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';
import Message from './Message';

export default function Chat({ lobbyName }: any) {
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
    }
  };

  console.log('msg history: ', messageHistory);
  return (
    <div
      id="chat-container"
      className="flex flex-col bg-white border border-black rounded w-60"
    >
      <div>
        {messageHistory?.map((msgObj: any) => {
          return <Message msgObj={msgObj} />;
        })}
      </div>
      <div>
        <input
          className="w-full"
          value={msg}
          onChange={(e) => setMsg(e?.target?.value)}
        />
        <button onClick={() => sendMessage()}>send</button>
      </div>
    </div>
  );
}
