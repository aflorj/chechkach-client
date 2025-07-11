import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL;
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH;

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
  path: SOCKET_PATH,
  // upgrade: false TODO uncomment in case of multiple connections when spam refresh
});
