import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications/
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const list = db.filter('notifications', n => !n.customerId || Number(n.customerId) === Number(req.user.id));
    return res.json(list);
  }
  res.json(db.get('notifications'));
});

// PATCH /api/notifications/:id/
router.patch('/:id', authenticateToken, (req, res) => {
  const updated = db.update('notifications', req.params.id, { read: true });
  if (!updated) return res.status(404).json({ error: 'Notification not found.' });
  res.json(updated);
});

export default router;
