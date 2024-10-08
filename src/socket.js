import { io } from 'socket.io-client';

const URL = 'http://localhost:9444';

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'],
  // upgrade: false TODO uncomment in case of multiple connections when spam refresh
});
