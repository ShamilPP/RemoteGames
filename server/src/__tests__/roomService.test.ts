import { RoomService } from '../services/roomService';
import { Room } from '../models/room';
import { User } from '../models/user';
import mongoose from 'mongoose';

// Mock mongoose models
jest.mock('../models/room');
jest.mock('../models/user');

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService();
    jest.clearAllMocks();
  });

  describe('createRoom', () => {
    it('should create a room with valid parameters', async () => {
      const mockOwner = { _id: 'owner123', name: 'Test Owner' };
      const mockRoom = {
        roomId: 'room123',
        joinCode: '1234',
        ownerId: 'owner123',
        gameId: 'pong',
        players: [],
        status: 'waiting',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockOwner);
      (Room.findOne as jest.Mock).mockResolvedValue(null);
      (Room as any).mockImplementation(() => mockRoom);

      const result = await roomService.createRoom('owner123', 'pong', 2);

      expect(result).toBeDefined();
      expect(result.roomId).toBe('room123');
      expect(mockRoom.save).toHaveBeenCalled();
    });

    it('should throw error if owner not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        roomService.createRoom('invalid', 'pong', 2)
      ).rejects.toThrow('Owner not found');
    });
  });

  describe('joinRoom', () => {
    it('should add player to room', async () => {
      const mockRoom = {
        roomId: 'room123',
        players: [],
        status: 'waiting',
        settings: { maxPlayers: 2 },
        save: jest.fn().mockResolvedValue(true),
      };

      (Room.findOne as jest.Mock).mockResolvedValue(mockRoom);
      (User.findById as jest.Mock).mockResolvedValue({ name: 'Test User' });

      const result = await roomService.joinRoom(
        'room123',
        'user123',
        'socket123',
        'controller123'
      );

      expect(result.players.length).toBe(1);
      expect(mockRoom.save).toHaveBeenCalled();
    });

    it('should throw error if room not found', async () => {
      (Room.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        roomService.joinRoom('invalid', 'user123', 'socket123', 'controller123')
      ).rejects.toThrow('Room not found');
    });
  });
});

