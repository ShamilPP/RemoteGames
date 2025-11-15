import { Router, Response } from 'express';
import { roomService } from '../services/roomService';
import { gameService } from '../services/gameService';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import QRCode from 'qrcode';

const router = Router();

// POST /api/rooms
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { gameId, maxPlayers } = req.body;
    const userId = req.user!.userId;

    if (!gameId) {
      res.status(400).json({ error: 'gameId required' });
      return;
    }

    const game = await gameService.getGame(gameId);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const room = await roomService.createRoom(
      userId,
      gameId,
      maxPlayers || game.maxPlayers,
      req.body.settings || {}
    );

    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.APP_URL || 'http://localhost:3000'}/join/${room.joinCode}`
    );

    res.json({
      roomId: room.roomId,
      joinCode: room.joinCode,
      gameId: room.gameId,
      qrCode: qrCodeUrl,
      status: room.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/:roomId
router.get('/:roomId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const room = await roomService.getRoom(req.params.roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({
      roomId: room.roomId,
      joinCode: room.joinCode,
      gameId: room.gameId,
      status: room.status,
      players: room.players.map((p) => ({
        userId: p.userId,
        name: p.name,
        isOwner: p.isOwner,
      })),
      settings: room.settings,
      createdAt: room.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:roomId/join
router.post('/:roomId/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    const room = await roomService.getRoom(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Generate controller token
    const controllerToken = generateToken({
      userId,
      type: 'controller',
      roomId,
    });

    res.json({
      controllerToken,
      roomId: room.roomId,
      gameId: room.gameId,
      status: room.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:roomId/leave
router.post('/:roomId/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    await roomService.leaveRoom(roomId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms/:roomId/start
router.post('/:roomId/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.userId;

    const room = await roomService.startGame(roomId, userId);
    res.json({
      roomId: room.roomId,
      status: room.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms?userId=
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.query.userId as string || req.user!.userId;
    const rooms = await roomService.getUserRooms(userId);

    res.json(rooms.map((r) => ({
      roomId: r.roomId,
      joinCode: r.joinCode,
      gameId: r.gameId,
      status: r.status,
      playerCount: r.players.length,
      createdAt: r.createdAt,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

