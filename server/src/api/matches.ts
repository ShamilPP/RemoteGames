import { Router, Response } from 'express';
import { matchService } from '../services/matchService';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// POST /api/matches (server only, called internally)
router.post('/', async (req, res: Response) => {
  try {
    const { roomId, gameId, players, winner, durationMs, eventsLog } = req.body;

    const match = await matchService.createMatch(
      roomId,
      gameId,
      players,
      winner,
      durationMs,
      eventsLog
    );

    res.json({
      matchId: match._id,
      gameId: match.gameId,
      players: match.players,
      winner: match.winner,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/matches/:matchId
router.get('/:matchId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const match = await matchService.getMatch(req.params.matchId);
    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }
    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/matches?userId=
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.query.userId as string) || req.user!.userId;
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const matches = await matchService.getUserMatches(userId, limit);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

