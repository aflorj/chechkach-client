import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/styles.css';
import LobbyProvider from './providers/LobbyProvider.tsx';
import { BrowserRouter } from 'react-router-dom';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <LobbyProvider>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </LobbyProvider>
);
