import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/ (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const users = db.get('users').map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
  res.json(users);
});

export default router;
