import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile/
router.get('/', authenticateToken, (req, res) => {
  res.json(req.user);
});

// PATCH /api/profile/
router.patch('/', authenticateToken, (req, res) => {
  const { name, email, phone, address } = req.body;
  const current = req.user;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone.trim();
  if (address !== undefined) updates.address = address.trim();

  if (email !== undefined) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== current.email) {
      const existing = db.find('users', u => u.email.toLowerCase() === cleanEmail && Number(u.id) !== Number(current.id));
      if (existing) {
        return res.status(400).json({ error: 'Email is already taken by another account.' });
      }
      updates.email = cleanEmail;
    }
  }

  const updated = db.update('users', current.id, updates);
  const { password: _, ...safeUser } = updated;
  res.json(safeUser);
});

export default router;
