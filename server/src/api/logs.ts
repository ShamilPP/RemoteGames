import { Router, Response } from 'express';
import { AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();

// POST /api/logs/error
router.post('/error', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, stack, url, userAgent, userId } = req.body;

    // In production, send to Sentry or logging service
    console.error('[CLIENT ERROR]', {
      message,
      stack,
      url,
      userAgent,
      userId: userId || req.user?.userId,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

