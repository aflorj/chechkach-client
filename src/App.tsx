import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Lobbies from './components/Lobbies/Lobbies';
import Lobby from './components/Lobby/Lobby';
import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { LobbyContext } from './providers/LobbyProvider';
import { PRODUCTION } from '../config';
import LanguageSwitcher from './components/LanguageSwitcher';

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header with Language Switcher */}
      <div className="flex justify-end items-center px-4 py-2 gap-2">
        <LanguageSwitcher />
      </div>
      <div className="flex pt-4 md:pt-10 flex-1">
        <Routes>
          <Route path="/" element={stateUsername ? <Lobbies /> : <Landing />} />
          <Route path="/lobby/:lobbyName" element={<Lobby />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
