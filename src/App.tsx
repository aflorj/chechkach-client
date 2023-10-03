import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Lobbies from './components/Lobbies/Lobbies';
import Lobby from './components/Lobby/Lobby';
import { useState } from 'react';
import LobbyProvider from './providers/LobbyProvider';

function App() {
  const [stateUsername, setStateUsername] = useState<undefined | string>(
    undefined
  );

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route
          path="/"
          element={
            <Landing
              setStateUsername={(username: string) =>
                setStateUsername(username)
              }
              stateUsername={stateUsername}
            />
          }
        />
        <Route
          path="/lobbies"
          element={<Lobbies stateUsername={stateUsername} />}
        />
        <Route
          path="/lobby/:lobbyName"
          element={
            <LobbyProvider>
              <Lobby stateUsername={stateUsername} />
            </LobbyProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
