import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
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
  wordToDraw: string | null;
  stateUsername: string | null;
  setStateUsername: Dispatch<SetStateAction<string | undefined>>;
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
  const [lobbyStatus, setLobbyStatus] = useState(); // TODO probably an enum
  const [scoresThisRound, setScoresThisRound] = useState();
  const [drawingUser, setDrawingUser] = useState();
  const [wordOptions, setWordOptions] = useState<string[] | null>(null);
  const [wordToDraw, setWordToDraw] = useState<string | null>(null);

  useEffect(() => {
    function onLobbyStatusChange({ newStatus, info }: any) {
      //   console.log(
      //     'new info about the lobby status: ',
      //     newStatus,
      //     ' and info: ',
      //     info
      //   );

      setLobbyStatus(newStatus);

      // switching to 'pickingWord' status
      if (newStatus === 'pickingWord') {
        // everyone gets notified of the drawing user
        setDrawingUser(info?.drawingUser); // TODO display drawing user mark next to the drawing user in the user list component
      } else if (newStatus === 'playing') {
        setMaskedWord(info?.maskedWord);
        if (info?.drawingUser === stateUsername) {
          // if we are the drawing user we are now allowed to draw
          setAllowedToDraw(true);
        }
      }
    }

    function onUserStateChange({ newUserState }: any) {
      //   console.log('new info about the users: ', newUserState);
      setUsers(newUserState);
    }

    function onPickAWord({ arrayOfWordOptions }: any) {
      //   console.log('i can choose from: ', ...arrayOfWordOptions);
      setWordOptions(arrayOfWordOptions);
    }

    function onStartDrawing({ wordToDraw }: any) {
      //   console.log('i have to draw: ', wordToDraw);
      setWordOptions(null);
      setWordToDraw(wordToDraw);
    }

    socket.on('lobbyStatusChange', onLobbyStatusChange);
    socket.on('userStateChange', onUserStateChange);
    socket.on('pickAWord', onPickAWord);
    socket.on('startDrawing', onStartDrawing);

    return () => {
      socket.off('lobbyStatusChange', onLobbyStatusChange);
      socket.off('userStateChange', onUserStateChange);
      socket.off('pickAWord', onPickAWord);
      socket.off('startDrawing', onStartDrawing);
    };
  }, [stateUsername]);

  //   useEffect(() => {
  //     console.log('atd: ', allowedToDraw);
  //   }, [allowedToDraw]);

  useEffect(() => {
    console.log('state username: ', stateUsername);
  }, [stateUsername]);

  useEffect(() => {
    console.log('lobbyStatus: ', lobbyStatus);
  }, [lobbyStatus]);

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
        wordToDraw,
        stateUsername,
        setStateUsername,
      }}
    >
      {props.children}
    </LobbyContext.Provider>
  );
};

export default LobbyProvider;
