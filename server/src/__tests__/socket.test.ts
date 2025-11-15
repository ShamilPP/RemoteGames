import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeSocket } from '../sockets/socket';
import { generateToken } from '../utils/jwt';

describe('Socket.IO Integration', () => {
  let httpServer: any;
  let io: SocketIOServer;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    httpServer = createServer();
    io = initializeSocket(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`, {
        auth: {
          token: generateToken({ userId: 'test123' }),
        },
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    httpServer.close();
    clientSocket.close();
  });

  it('should connect successfully', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  it('should handle joinRoom event', (done) => {
    clientSocket.emit('joinRoom', {
      roomId: 'test-room',
      token: generateToken({ userId: 'test123' }),
    });

    clientSocket.on('roomJoined', (data) => {
      expect(data).toBeDefined();
      done();
    });
  });
});

