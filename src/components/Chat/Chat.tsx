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

  const buildServerMessage = (msg: any) => {
    if (msg.type === 'correctGuess') {
      if (msg?.content === context.stateUsername) {
        return <div className="text-green-600">You have guessed the word.</div>;
      } else {
        return (
          <div className="text-green-600">
            <b>{msg?.content}</b> guessed the word.
          </div>
        );
      }
    } else if (msg.type === 'playerJoiningOrLeaving') {
      return <div className="text-yellow-400">{msg?.content}</div>;
    }
  };

  return (
    <div>
      {context?.messageHistory?.length > 0 &&
        context?.messageHistory?.map((msgObj: any) => {
          if (msgObj.serverMessage) {
            return <>{buildServerMessage(msgObj.message)}</>;
          } else {
            return (
              <div
                className={
                  msgObj?.message?.type === 'winnersOnly'
                    ? 'text-green-400'
                    : ''
                }
              >
                {msgObj?.userName}
                {': '}
                {msgObj?.message?.content}
              </div>
            );
          }
        })}
      <div>
        <input value={msg} onChange={(e) => setMsg(e?.target?.value)} />
        <button onClick={() => sendMessage()}>send</button>
      </div>
    </div>
  );
}
