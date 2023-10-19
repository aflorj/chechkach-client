import { useContext, useEffect } from 'react';
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
                    <div>{word}</div>
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
    }
  };

  return (
    <div className="flex content-between">
      <div>{roundEndTimeStamp && <CountDown lobbyName={lobbyName} />}</div>
      <div>{getInfoBarMessage()}</div>
    </div>
  );
}
