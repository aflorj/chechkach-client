import { useContext, useEffect } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import { socket } from '../../socket';
import clsx from 'clsx';

export default function CanvasOverlay({ lobbyName }: any) {
  const { stateUsername, wordOptions, roundScoreboard } =
    useContext(LobbyContext);

  const pickWord = (word: string) => {
    socket.emit('wordPick', {
      pickedWord: word,
      lobbyName: lobbyName,
      userName: stateUsername,
    });
  };

  useEffect(() => {
    console.log('map this: ', roundScoreboard);
  }, [roundScoreboard]);

  return (
    <div
      id="canvas-overlay"
      className="absolute h-full w-full bg-gray-300 top-0 left-0 bg-opacity-25"
    >
      {wordOptions && (
        <>
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
        </>
      )}
      {roundScoreboard && (
        <>
          <div className="flex flex-col align-middle justify-center h-full backdrop-blur-lg">
            <div className="text-center mb-4 font-bold text-lg">
              Round over. Scores for the round:
            </div>
            <div className="mx-auto w-52">
              {roundScoreboard?.map(
                (entry: { playerId: string; score: number }) => (
                  <div
                    className={clsx(
                      'flex text-center justify-between',
                      entry?.score > 0 && 'text-green-400'
                    )}
                  >
                    <div>{entry?.playerId}</div>
                    <div>{entry?.score}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
