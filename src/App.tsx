import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Lobbies from './components/Lobbies/Lobbies';
import Lobby from './components/Lobby/Lobby';
import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { LobbyContext } from './providers/LobbyProvider';
import { PRODUCTION } from '../config';

function App() {
  const { stateUsername, setStateUsername } = useContext(LobbyContext);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    !PRODUCTION &&
      setStateUsername!(
        searchParams.get('userName')! ??
          `test_${Math.floor(Math.random() * 10000 + 1)}`
      );
  }, [searchParams]);

  return (
    <div className="flex pt-4 md:pt-10">
      <Routes>
        <Route path="/" element={stateUsername ? <Lobbies /> : <Landing />} />
        <Route path="/lobby/:lobbyName" element={<Lobby />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
