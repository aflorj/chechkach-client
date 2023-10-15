import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';

export default function WordPicker({ lobbyName }: any) {
  const context = useContext(LobbyContext);

  const pickWord = (word: string) => {
    socket.emit('wordPick', {
      pickedWord: word,
      lobbyName: lobbyName,
      userName: context.stateUsername,
    });
  };

  return (
    <div>
      <div>pick a word to draw:</div>
      {context.wordOptions?.map((word: string) => (
        <div onClick={() => pickWord(word)}>{word}</div>
      ))}
    </div>
  );
}
