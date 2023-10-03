import { useContext } from 'react';
import { LobbyContext } from '../../providers/LobbyProvider';

export default function InfoBar() {
  const context = useContext(LobbyContext);
  const lobbyStatus = context?.lobbyStatus;
  const drawingUser = context?.drawingUser;

  const getInfoBarMessage = () => {
    switch (lobbyStatus) {
      case 'pickingWord':
        return <p>{`${drawingUser} is choosing a word to draw`}</p>;
    }
  };

  return <div>{getInfoBarMessage()}</div>;
}
