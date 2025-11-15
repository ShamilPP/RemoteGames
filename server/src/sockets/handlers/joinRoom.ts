import { Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '../../utils/jwt';
import { roomService } from '../../services/roomService';
import { v4 as uuidv4 } from 'uuid';

export async function handleJoinRoom(socket: Socket, data: { roomId: string; token: string }) {
  try {
    const { roomId, token } = data;

    if (!roomId || !token) {
      socket.emit('error', { message: 'roomId and token required' });
      return;
    }

    const payload = verifyToken(token) as JWTPayload;
    const userId = payload.userId;

    // Get or create controller ID
    const controllerId = uuidv4();

    // Join the room
    const room = await roomService.joinRoom(roomId, userId, socket.id, controllerId);

    // Join socket room
    socket.join(roomId);

    // Store user info in socket
    (socket as any).userId = userId;
    (socket as any).roomId = roomId;
    (socket as any).controllerId = controllerId;
    (socket as any).isController = payload.type === 'controller';

    // Notify room of new player
    socket.to(roomId).emit('playerJoined', {
      userId,
      controllerId,
      playerCount: room.players.length,
    });

    // Send confirmation
    socket.emit('roomJoined', {
      roomId,
      gameId: room.gameId,
      status: room.status,
      players: room.players.map((p) => ({
        userId: p.userId.toString(),
        name: p.name,
        isOwner: p.isOwner,
      })),
    });
  } catch (error: any) {
    socket.emit('error', { message: error.message });
  }
}

