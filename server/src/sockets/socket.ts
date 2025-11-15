import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { handleJoinRoom } from './handlers/joinRoom';
import { handleControllerInput } from './handlers/controllerInput';
import { roomService } from '../services/roomService';
import { config } from '../config';

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // Allow connection but mark as unauthenticated
      return next();
    }

    try {
      const payload = verifyToken(token);
      (socket as any).user = payload;
      next();
    } catch (error) {
      // Allow connection but mark as unauthenticated
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle joinRoom
    socket.on('joinRoom', (data) => {
      handleJoinRoom(socket, data);
    });

    // Handle controllerInput
    socket.on('controllerInput', (data) => {
      handleControllerInput(socket, data);
    });

    // Handle chat (optional)
    socket.on('chat', (data: { message: string }) => {
      const roomId = (socket as any).roomId;
      if (roomId && data.message) {
        const userId = (socket as any).userId;
        socket.to(roomId).emit('chat', {
          userId,
          message: data.message,
          timestamp: Date.now(),
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const roomId = (socket as any).roomId;
      const userId = (socket as any).userId;

      if (roomId && userId) {
        try {
          await roomService.leaveRoom(roomId, userId);
          socket.to(roomId).emit('playerLeft', { userId });
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Game state management
export class GameStateManager {
  private gameStates: Map<string, any> = new Map();
  private gameLoops: Map<string, NodeJS.Timeout> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  startGame(roomId: string, gameId: string, players: any[]) {
    // Initialize game state based on game type
    const initialState = this.initializeGameState(gameId, players);
    this.gameStates.set(roomId, {
      gameId,
      state: initialState,
      tick: 0,
      lastTick: Date.now(),
    });

    // Start game loop at 20Hz
    const tickInterval = 1000 / config.gameTickRate;
    let updateCounter = 0;

    const loop = setInterval(() => {
      const gameState = this.gameStates.get(roomId);
      if (!gameState) {
        clearInterval(loop);
        return;
      }

      // Update game state (this will be handled by game engines)
      gameState.tick++;
      gameState.lastTick = Date.now();

      // Emit state update every N ticks
      updateCounter++;
      if (updateCounter >= config.stateUpdateInterval) {
        updateCounter = 0;
        this.io.to(roomId).emit('stateUpdate', {
          tick: gameState.tick,
          state: gameState.state,
          timestamp: Date.now(),
        });
      }
    }, tickInterval);

    this.gameLoops.set(roomId, loop);
  }

  stopGame(roomId: string) {
    const loop = this.gameLoops.get(roomId);
    if (loop) {
      clearInterval(loop);
      this.gameLoops.delete(roomId);
    }
    this.gameStates.delete(roomId);
  }

  updateGameState(roomId: string, updater: (state: any) => any) {
    const gameState = this.gameStates.get(roomId);
    if (gameState) {
      gameState.state = updater(gameState.state);
    }
  }

  getGameState(roomId: string) {
    return this.gameStates.get(roomId);
  }

  private initializeGameState(gameId: string, players: any[]): any {
    // This will be implemented by game engines
    switch (gameId) {
      case 'pong':
        return {
          ball: { x: 0.5, y: 0.5, vx: 0.02, vy: 0.02 },
          paddles: players.map((_, i) => ({
            y: 0.5,
            score: 0,
          })),
        };
      case 'duel_racer':
        return {
          cars: players.map((_, i) => ({
            lane: i % 2,
            y: 0,
            speed: 0.01,
          })),
          obstacles: [],
        };
      case 'reaction_blitz':
        return {
          targets: [],
          scores: players.map(() => 0),
          round: 0,
        };
      default:
        return {};
    }
  }
}

