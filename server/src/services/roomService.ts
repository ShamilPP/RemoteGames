import { v4 as uuidv4 } from 'uuid';
import { Room, IRoom, IPlayer } from '../models/room';
import { User } from '../models/user';
import { generateJoinCode } from '../utils/roomCode';
import mongoose from 'mongoose';

export class RoomService {
  async createRoom(
    ownerId: string,
    gameId: string,
    maxPlayers: number = 2,
    settings: Record<string, any> = {}
  ): Promise<IRoom> {
    const roomId = uuidv4();
    let joinCode = generateJoinCode();

    // Ensure unique join code
    while (await Room.findOne({ joinCode })) {
      joinCode = generateJoinCode();
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }

    const room = new Room({
      roomId,
      joinCode,
      ownerId: new mongoose.Types.ObjectId(ownerId),
      gameId,
      players: [],
      status: 'waiting',
      settings: {
        maxPlayers,
        ...settings,
      },
    });

    await room.save();
    return room;
  }

  async getRoom(roomId: string): Promise<IRoom | null> {
    return Room.findOne({ roomId }).populate('ownerId', 'name email');
  }

  async getRoomByCode(joinCode: string): Promise<IRoom | null> {
    return Room.findOne({ joinCode }).populate('ownerId', 'name email');
  }

  async joinRoom(
    roomId: string,
    userId: string,
    socketId: string,
    controllerId: string
  ): Promise<IRoom> {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Room is not accepting new players');
    }

    const maxPlayers = room.settings.maxPlayers || 2;
    if (room.players.length >= maxPlayers) {
      throw new Error('Room is full');
    }

    // Check if user already in room
    const existingPlayer = room.players.find(
      (p) => p.userId.toString() === userId
    );
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      existingPlayer.controllerId = controllerId;
      await room.save();
      return room;
    }

    const user = await User.findById(userId);
    const isOwner = room.ownerId.toString() === userId;

    const player: IPlayer = {
      userId: new mongoose.Types.ObjectId(userId),
      socketId,
      controllerId,
      isOwner,
      name: user?.name,
    };

    room.players.push(player);
    await room.save();
    return room;
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    room.players = room.players.filter(
      (p) => p.userId.toString() !== userId
    );
    await room.save();

    // If room is empty, delete it
    if (room.players.length === 0) {
      await Room.deleteOne({ roomId });
    }
  }

  async startGame(roomId: string, ownerId: string): Promise<IRoom> {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.ownerId.toString() !== ownerId) {
      throw new Error('Only room owner can start the game');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game already started or finished');
    }

    room.status = 'running';
    await room.save();
    return room;
  }

  async finishGame(roomId: string): Promise<IRoom> {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = 'finished';
    await room.save();
    return room;
  }

  async getUserRooms(userId: string): Promise<IRoom[]> {
    return Room.find({
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { 'players.userId': new mongoose.Types.ObjectId(userId) },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('ownerId', 'name');
  }
}

export const roomService = new RoomService();

