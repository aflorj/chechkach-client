import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';

export default function WordPicker({ lobbyName }: any) {
  const { stateUsername, wordOptions } = useContext(LobbyContext);

  const pickWord = (word: string) => {
    socket.emit('wordPick', {
      pickedWord: word,
      lobbyName: lobbyName,
      userName: stateUsername,
    });
  };

  return (
    <div>
      <div>pick a word to draw:</div>
      {wordOptions?.map((word: string) => (
        <div onClick={() => pickWord(word)}>{word}</div>
      ))}
    </div>
  );
}
