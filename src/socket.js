import { io } from 'socket.io-client';

const URL = 'http://localhost:9030';

export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});
