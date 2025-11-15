import { Router } from 'express';
import authRoutes from './auth';
import roomRoutes from './rooms';
import gameRoutes from './games';
import matchRoutes from './matches';
import leaderboardRoutes from './leaderboard';
import logRoutes from './logs';

const router = Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/games', gameRoutes);
router.use('/matches', matchRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/logs', logRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

