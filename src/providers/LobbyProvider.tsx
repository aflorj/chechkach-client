import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import { socket } from '../socket';

export type User = {
  connected: boolean;
  isOwner: boolean;
  playerId: string;
  socketId: string;
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
  messageHistory: any;
  roundWinners: string[];
  unmaskedWord: string | null;
  roundStartTimeStamp: number | null;
  roundTimer: number | null;
  roundEndTimeStamp: number | null;
}

export const LobbyContext = createContext<Partial<LobbyContextProps>>({});

const LobbyProvider = (props: ILobbyProviderProps) => {
  // temporary
  const [stateUsername, setStateUsername] = useState<undefined | string>(
    undefined
  );
  // temporary

  const [users, setUsers] = useState<User[]>([]);
  const [roundWinners, setRoundWinners] = useState<string[]>([]);
  const [maskedWord, setMaskedWord] = useState<string | null>(null);
  const [allowedToDraw, setAllowedToDraw] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState(); // TODO probably an enum
  const [scoresThisRound, setScoresThisRound] = useState();
  const [drawingUser, setDrawingUser] = useState();
  const [wordOptions, setWordOptions] = useState<string[] | null>(null);
  const [wordToDraw, setWordToDraw] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<any>([]);
  const [unmaskedWord, setUnmaskedWord] = useState<string | null>(null);
  const [roundEndTimeStamp, setRoundEndTimeStamp] = useState<number | null>(
    null
  );

  useEffect(() => {
    function onMessage(msgObj: any) {
      console.log('to je prispelo: ', msgObj);
      setMessageHistory((prevState: any) => [...prevState, msgObj]);

      // if type === correctGuess dodamo userja v winners
    }

    function onLobbyStatusChange({ newStatus, info }: any) {
      // console.log(
      //   'new info about the lobby status: ',
      //   newStatus,
      //   ' and info: ',
      //   info
      // );

      setLobbyStatus(newStatus);

      // switching to 'pickingWord' status
      if (newStatus === 'pickingWord') {
        // everyone gets notified of the drawing user (only in the first round, the following rounds info comes in 'roundOver')
        info?.drawingUser && setDrawingUser(info?.drawingUser);

        //this is basically the first status of a new round so resets are required here
        setRoundWinners([]);
        setMaskedWord(null);
        setAllowedToDraw(false);
        setWordToDraw(null);
        setUnmaskedWord(null);
        setRoundEndTimeStamp(null);

        // we already set the drawinguser for the upcoming round in the 'roundEnd'. Here we just reset the wordoptions for the user that was drawing in the previous round
        if (stateUsername !== drawingUser) {
          setWordOptions(null);
        }
      } else if (newStatus === 'playing') {
        setMaskedWord(info?.maskedWord);
        setRoundEndTimeStamp(info?.roundEndTimeStamp);
        if (info?.drawingUser === stateUsername) {
          // if we are the drawing user we are now allowed to draw
          setAllowedToDraw(true);
        }
      } else if (newStatus === 'roundOver') {
        setDrawingUser(info?.drawingNext);
      }
    }

    function onUserStateChange({ newUserState }: any) {
      //   console.log('new info about the users: ', newUserState);
      setUsers(newUserState);
    }

    function onPickAWord({
      arrayOfWordOptions,
    }: {
      arrayOfWordOptions: string[];
    }) {
      console.log('i can choose from: ', ...arrayOfWordOptions);
      setWordOptions(arrayOfWordOptions);
    }

    function onStartDrawing({ wordToDraw }: { wordToDraw: string }) {
      //   console.log('i have to draw: ', wordToDraw);
      setWordOptions(null);
      setWordToDraw(wordToDraw);
    }

    function onUnmaskedWord({ unmaskedWord }: { unmaskedWord: string }) {
      setUnmaskedWord(unmaskedWord);
    }

    socket.on('message', onMessage);
    socket.on('lobbyStatusChange', onLobbyStatusChange);
    socket.on('userStateChange', onUserStateChange);
    socket.on('pickAWord', onPickAWord);
    socket.on('startDrawing', onStartDrawing);
    socket.on('unmaskedWord', onUnmaskedWord);

    return () => {
      socket.off('message', onMessage);
      socket.off('lobbyStatusChange', onLobbyStatusChange);
      socket.off('userStateChange', onUserStateChange);
      socket.off('pickAWord', onPickAWord);
      socket.off('startDrawing', onStartDrawing);
      socket.off('unmaskedWord', onUnmaskedWord);
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

  useEffect(() => {
    console.log('users: ', users);
  }, [users]);

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
        messageHistory,
        roundWinners,
        unmaskedWord,
        roundEndTimeStamp,
      }}
    >
      {props.children}
    </LobbyContext.Provider>
  );
};

export default LobbyProvider;
