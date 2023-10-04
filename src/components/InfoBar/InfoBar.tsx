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
        return context?.wordToDraw
          ? `You are drawing ${context.wordToDraw}`
          : context.maskedWord;
    }
  };

  return <div>{getInfoBarMessage()}</div>;
}
