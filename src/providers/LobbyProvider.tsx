import { createContext, useState } from 'react';

export type User = {
  id: string;
  score: number;
  username: string;
};

interface ILobbyProviderProps {
  children: React.ReactNode;
}
export const LobbyContext = createContext({});

const LobbyProvider = (props: ILobbyProviderProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [maskedWord, setMaskedWord] = useState<string | null>(null);
  const [allowedToDraw, setAllowedToDraw] = useState(false);
  const [gameStatus, setGameStatus] = useState(); // TODO probaby an enum
  const [scoresThisRound, setScoresThisRound] = useState();
  const [drawingUser, setDrawingUser] = useState();

  return (
    <LobbyContext.Provider
      value={{
        users,
        maskedWord,
        allowedToDraw,
        gameStatus,
        scoresThisRound,
        drawingUser,
      }}
    >
      {props.children}
    </LobbyContext.Provider>
  );
};

export default LobbyProvider;
