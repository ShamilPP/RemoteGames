import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
}

export const authAPI = {
  createAnonymous: async (): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/anon');
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
    }
    return data;
  },
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
    }
    return data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
    }
    return data;
  },
};

export interface Room {
  roomId: string;
  joinCode: string;
  gameId: string;
  status: 'waiting' | 'running' | 'finished';
  players: Array<{ userId: string; name?: string; isOwner: boolean }>;
  settings: Record<string, any>;
}

export interface CreateRoomResponse {
  roomId: string;
  joinCode: string;
  gameId: string;
  qrCode: string;
  status: string;
}

export const roomAPI = {
  createRoom: async (gameId: string, maxPlayers?: number): Promise<CreateRoomResponse> => {
    const { data } = await api.post<CreateRoomResponse>('/rooms', { gameId, maxPlayers });
    return data;
  },
  getRoom: async (roomId: string): Promise<Room> => {
    const { data } = await api.get<Room>(`/rooms/${roomId}`);
    return data;
  },
  joinRoom: async (roomId: string): Promise<{ controllerToken: string; roomId: string; gameId: string }> => {
    const { data } = await api.post(`/rooms/${roomId}/join`);
    return data;
  },
  startGame: async (roomId: string): Promise<{ roomId: string; status: string }> => {
    const { data } = await api.post(`/rooms/${roomId}/start`);
    return data;
  },
};

export interface Game {
  _id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  description?: string;
}

export const gameAPI = {
  getGames: async (): Promise<Game[]> => {
    const { data } = await api.get<Game[]>('/games');
    return data;
  },
  getGame: async (gameId: string): Promise<Game> => {
    const { data } = await api.get<Game>(`/games/${gameId}`);
    return data;
  },
};

export default api;

