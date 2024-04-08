import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';
import CountDown from '../CountDown/CountDown';

export default function InfoBar({
  lobbyName,
}: {
  lobbyName: string | undefined;
}) {
  const {
    lobbyStatus,
    drawingUser,
    maskedWord,
    unmaskedWord,
    stateUsername,
    wordToDraw,
    roundEndTimeStamp,
  } = useContext(LobbyContext);

  const getInfoBarMessage = () => {
    switch (lobbyStatus) {
      case 'pickingWord':
        return (
          <p>
            {stateUsername === drawingUser
              ? 'Choose a word to draw'
              : `${drawingUser} is choosing a word to draw`}
          </p>
        );
      case 'playing':
        return wordToDraw ? (
          `You are drawing ${wordToDraw}`
        ) : (
          <div className="flex">
            {unmaskedWord ? (
              <>
                {unmaskedWord?.split(' ')?.map((word: string) => (
                  <>
                    <div className="me-1">{word}</div>
                    <div
                      className="me-2"
                      style={{ verticalAlign: 'super', fontSize: '0.75rem' }}
                    >
                      {word?.length}
                    </div>
                  </>
                ))}
              </>
            ) : (
              <>
                {maskedWord?.split(' ')?.map((word: string) => (
                  <>
                    <div className="flex">
                      {word?.split('')?.map((char: string) => (
                        <div className="me-1">{char}</div>
                      ))}
                    </div>
                    <div
                      className="me-2"
                      style={{ verticalAlign: 'super', fontSize: '0.75rem' }}
                    >
                      {word?.length}
                    </div>
                  </>
                ))}
              </>
            )}
          </div>
        );
      case 'roundOver':
        return (
          <>
            {unmaskedWord?.split(' ')?.map((word: string) => (
              <div className="flex">
                <div className="me-1">{word}</div>
                <div
                  className="me-2"
                  style={{ verticalAlign: 'super', fontSize: '0.75rem' }}
                >
                  {word?.length}
                </div>
              </div>
            ))}
          </>
        );
      case 'gameOver':
        return <>Game over</>;
    }
  };

  return (
    <div
      id="infobar-container"
      className="flex content-between mb-2 md:mb-4 bg-white border border-black p-2 rounded"
    >
      <div>{roundEndTimeStamp && <CountDown lobbyName={lobbyName} />}</div>
      <div>{getInfoBarMessage()}</div>
    </div>
  );
}
