import { Socket } from 'socket.io';
import { Room } from '../../models/room';

export interface ControllerInput {
  t: number; // timestamp
  e: string; // event type: "btnDown", "btnUp", "tilt", "move"
  b?: string; // button name
  x?: number; // x coordinate or tilt value
  y?: number; // y coordinate or tilt value
}

export function handleControllerInput(socket: Socket, data: ControllerInput) {
  try {
    const roomId = (socket as any).roomId;
    const controllerId = (socket as any).controllerId;
    const userId = (socket as any).userId;

    if (!roomId || !controllerId) {
      socket.emit('error', { message: 'Not in a room' });
      return;
    }

    // Validate input
    if (!data.t || !data.e) {
      socket.emit('error', { message: 'Invalid input format' });
      return;
    }

    // Rate limiting: max 10 inputs per second
    const now = Date.now();
    if (!(socket as any).lastInputTime) {
      (socket as any).lastInputTime = now;
      (socket as any).inputCount = 0;
    }

    if (now - (socket as any).lastInputTime < 100) {
      (socket as any).inputCount++;
      if ((socket as any).inputCount > 10) {
        socket.emit('error', { message: 'Input rate limit exceeded' });
        return;
      }
    } else {
      (socket as any).lastInputTime = now;
      (socket as any).inputCount = 1;
    }

    // Broadcast to room (monitor will handle it)
    socket.to(roomId).emit('controllerInput', {
      controllerId,
      userId,
      input: data,
    });
  } catch (error: any) {
    socket.emit('error', { message: error.message });
  }
}

