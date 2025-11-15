import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export interface SocketState {
  connected: boolean;
  error: string | null;
}

export function useSocket(token?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    error: null,
  });

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setState({ connected: true, error: null });
    });

    socket.on('disconnect', () => {
      setState({ connected: false, error: 'Disconnected' });
    });

    socket.on('error', (error: { message: string }) => {
      setState({ connected: false, error: error.message });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return {
    socket: socketRef.current,
    ...state,
  };
}

