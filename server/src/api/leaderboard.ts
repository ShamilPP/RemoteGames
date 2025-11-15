import { Router, Response } from 'express';
import { matchService } from '../services/matchService';

const router = Router();

// GET /api/leaderboard/:gameId
router.get('/:gameId', async (req, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '100', 10);
    const leaderboard = await matchService.getLeaderboard(req.params.gameId, limit);
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

