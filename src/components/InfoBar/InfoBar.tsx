import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';

export default function InfoBar() {
  const context = useContext(LobbyContext);
  const lobbyStatus = context?.lobbyStatus;
  const drawingUser = context?.drawingUser;

  const getInfoBarMessage = () => {
    switch (lobbyStatus) {
      case 'pickingWord':
        return (
          <p>
            {context.stateUsername === drawingUser
              ? 'Choose a word to draw'
              : `${drawingUser} is choosing a word to draw`}
          </p>
        );
      case 'playing':
        return context?.wordToDraw ? (
          `You are drawing ${context.wordToDraw}`
        ) : (
          <div className="flex">
            {context?.maskedWord?.split(' ')?.map((word: string) => (
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
          </div>
        );
    }
  };

  return <div>{getInfoBarMessage()}</div>;
}
