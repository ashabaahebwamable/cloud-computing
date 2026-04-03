import { Router, Response } from 'express';
import { getDb } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/users — list all users except the current one
router.get('/users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const users = await db.all<{ id: number; name: string; role: string }[]>(
      'SELECT id, name, role FROM Users WHERE id != ?',
      [req.user!.id]
    );
    res.json(users);
  } catch (error) {
    console.error('[Users] Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/shift-stats — current shift info for the logged-in user
router.get('/shift-stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const stats = await db.get<{ login_time: string; cases_handled: number }>(
      `SELECT login_time, cases_handled
       FROM Shifts
       WHERE user_id = ? AND logout_time IS NULL
       ORDER BY id DESC LIMIT 1`,
      [req.user!.id]
    );
    res.json(stats ?? { login_time: null, cases_handled: 0 });
  } catch (error) {
    console.error('[Users] Shift stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
