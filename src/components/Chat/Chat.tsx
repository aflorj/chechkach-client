import { useContext, useState } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';

export default function Chat({ lobbyName }: any) {
  const context = useContext(LobbyContext);

  const [msg, setMsg] = useState('');

  const sendMessage = () => {
    if (msg?.trim()) {
      socket.send({
        userName: context.stateUsername,
        lobbyName: lobbyName,
        messageType: 'chat',
        messageContent: msg?.trim(),
      });
      setMsg('');
    }
  };

  return (
    <div>
      {context?.messageHistory?.length > 0 &&
        context?.messageHistory?.map((msgObj: any) => (
          <div>
            {msgObj?.userName}
            {': '}
            {msgObj?.message?.content}
          </div>
        ))}
      <div>
        <input value={msg} onChange={(e) => setMsg(e?.target?.value)} />
        <button onClick={() => sendMessage()}>send</button>
      </div>
    </div>
  );
}
