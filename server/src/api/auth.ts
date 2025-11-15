import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';
import { generateToken } from '../utils/jwt';
import { AuthRequest, authenticateToken, optionalAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/auth/anon
router.post('/anon', async (req, res: Response) => {
  try {
    const name = `Anon${Math.floor(Math.random() * 10000)}`;
    const user = new User({
      name,
      auth: { type: 'anon' },
      lastActive: new Date(),
    });
    await user.save();

    const token = generateToken({ userId: user._id.toString() });
    res.json({ token, userId: user._id.toString(), name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const pwdHash = await bcrypt.hash(password, 10);
    const user = new User({
      name: name || email.split('@')[0],
      email,
      auth: { type: 'email', pwdHash },
      lastActive: new Date(),
    });
    await user.save();

    const token = generateToken({ userId: user._id.toString() });
    res.json({ token, userId: user._id.toString(), name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || user.auth.type !== 'email' || !user.auth.pwdHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.auth.pwdHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    user.lastActive = new Date();
    await user.save();

    const token = generateToken({ userId: user._id.toString() });
    res.json({ token, userId: user._id.toString(), name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id
router.get('/users/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-auth.pwdHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Only show email to self or admins
    const isSelf = req.user?.userId === req.params.id;
    const response: any = {
      _id: user._id,
      name: user.name,
      createdAt: user.createdAt,
    };

    if (isSelf) {
      response.email = user.email;
    }

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

