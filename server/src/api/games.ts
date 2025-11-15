import { Router, Response } from 'express';
import { gameService } from '../services/gameService';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// GET /api/games
router.get('/', async (req, res: Response) => {
  try {
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/games/:gameId
router.get('/:gameId', async (req, res: Response) => {
  try {
    const game = await gameService.getGame(req.params.gameId);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games/:gameId/settings
router.post('/:gameId/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // This would update room-specific game settings
    // For MVP, we'll just validate the game exists
    const game = await gameService.getGame(req.params.gameId);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // In a full implementation, you'd update room settings here
    res.json({ success: true, message: 'Settings updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

