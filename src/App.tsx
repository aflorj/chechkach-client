import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Lobbies from './components/Lobbies/Lobbies';
import Lobby from './components/Lobby/Lobby';
import LobbyProvider from './providers/LobbyProvider';

function App() {
  return (
    <LobbyProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lobbies" element={<Lobbies />} />
          <Route path="/lobby/:lobbyName" element={<Lobby />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </LobbyProvider>
  );
}

export default App;
