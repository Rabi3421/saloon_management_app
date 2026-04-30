import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './auth';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket && socket.connected) return socket;
  const token = await getStoredToken();
  const base = (globalThis as any).API_BASE || 'http://localhost:3000';
  const SOCKET_PORT = Number((globalThis as any).SOCKET_PORT || 4001);
  let socketUrl = (globalThis as any).SOCKET_URL;
  if (!socketUrl) {
    try {
      const parsed = new URL(base);
      socketUrl = `${parsed.protocol}//${parsed.hostname}:${SOCKET_PORT}`;
    } catch (e) {
      socketUrl = `http://localhost:${SOCKET_PORT}`;
    }
  }

  socket = io(socketUrl, {
    autoConnect: true,
    transports: ['websocket'],
    auth: { token },
  });

  socket.on('connect_error', (err: any) => {
    // log connect errors to help debugging connectivity
    // eslint-disable-next-line no-console
    console.warn('Socket connect_error', err?.message || err);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export async function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (e) {}
  socket = null;
}

export default {
  connectSocket,
  getSocket,
  disconnectSocket,
};
