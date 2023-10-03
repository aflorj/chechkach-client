import { createContext, useEffect, useState } from 'react';
import { socket } from '../socket';

export type User = {
  id: string;
  score: number;
  username: string;
};

interface ILobbyProviderProps {
  children: React.ReactNode;
}

export interface LobbyContextProps {
  users: any;
  maskedWord: string | null;
  allowedToDraw: boolean;
  lobbyStatus: string; // TOOD enum
  scoresThisRound: any;
  drawingUser: string;
  wordOptions: string[] | null;
}

export const LobbyContext = createContext<Partial<LobbyContextProps>>({});

const LobbyProvider = (props: ILobbyProviderProps) => {
  // temporary
  const [stateUsername, setStateUsername] = useState<undefined | string>(
    undefined
  );
  // temporary

  const [users, setUsers] = useState<User[]>([]);
  const [maskedWord, setMaskedWord] = useState<string | null>(null);
  const [allowedToDraw, setAllowedToDraw] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState(); // TODO probaby an enum
  const [scoresThisRound, setScoresThisRound] = useState();
  const [drawingUser, setDrawingUser] = useState();
  const [wordOptions, setWordOptions] = useState<string[] | null>(null);

  useEffect(() => {
    socket.on('lobbyStatusChange', ({ newStatus, info }) => {
      console.log('new info about the lobby status: ', newStatus);

      setLobbyStatus(newStatus);

      // switching to 'pickingWord' status
      if (newStatus === 'pickingWord') {
        // everyone gets notified of the drawing user
        setDrawingUser(info?.drawingUser);
        if (info?.drawingUser === stateUsername) {
          // if we are the drawing user we are now allowed to draw
          setAllowedToDraw(true);
        }
      }
    });

    socket.on('userStateChange', ({ newUserState }) => {
      console.log('new info about the users: ', newUserState);
      setUsers(newUserState);
    });

    socket.on('pickAWord', ({ arrayOfWordOptions }) => {
      console.log('i can choose from: ', ...arrayOfWordOptions);
      setWordOptions(arrayOfWordOptions);
    });
  }, []);

  return (
    <LobbyContext.Provider
      value={{
        users,
        maskedWord,
        allowedToDraw,
        lobbyStatus,
        scoresThisRound,
        drawingUser,
        wordOptions,
      }}
    >
      {props.children}
    </LobbyContext.Provider>
  );
};

export default LobbyProvider;
