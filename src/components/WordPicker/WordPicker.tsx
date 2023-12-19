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
    <div
      id="word-picker-wrapper"
      className="absolute h-full w-full bg-gray-300 top-0 left-0 bg-opacity-25"
    >
      <div className="flex flex-col align-middle justify-center h-full backdrop-blur-lg">
        <div className="text-center mb-4 font-bold text-lg">
          Pick a word to draw
        </div>
        <div className="flex gap-2 justify-center">
          {wordOptions?.map((word: string) => (
            <div
              onClick={() => pickWord(word)}
              className="cursor-pointer border border-black hover:border-lime-300 rounded py-2 px-4 bg-black text-white hover:text-lime-300"
            >
              {word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
