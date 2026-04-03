import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authenticateToken, AuthenticatedRequest, JWT_SECRET } from '../auth.js';

const router = Router();

// POST /api/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await db.get<{
      id: number;
      name: string;
      email: string;
      password: string;
      role: string;
    }>('SELECT * FROM Users WHERE email = ?', [email]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Start a new shift
    const shift = await db.run(
      'INSERT INTO Shifts (user_id, login_time) VALUES (?, ?)',
      [user.id, new Date().toISOString()]
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      shiftId: shift.lastID,
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    await db.run(
      'UPDATE Shifts SET logout_time = ? WHERE user_id = ? AND logout_time IS NULL',
      [new Date().toISOString(), req.user!.id]
    );
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
