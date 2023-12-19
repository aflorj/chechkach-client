import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import clsx from 'clsx';

type IMessageProps = any;

export default function Message({ msgObj }: IMessageProps) {
  console.log('obj: ', msgObj);
  const { stateUsername } = useContext(LobbyContext);

  const buildServerMessage = (msg: any) => {
    if (msg.type === 'correctGuess') {
      if (msg?.content === stateUsername) {
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

  if (msgObj?.serverMessage) {
    return <>{buildServerMessage(msgObj.message)}</>;
  } else {
    return (
      <div
        className={clsx(
          msgObj?.message?.type === 'winnersOnly' && 'text-green-400'
        )}
      >
        {msgObj?.userName}
        {': '}
        {msgObj?.message?.content}
      </div>
    );
  }
}
