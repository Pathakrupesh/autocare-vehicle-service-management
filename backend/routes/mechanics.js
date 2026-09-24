import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/mechanics/
router.get('/', authenticateToken, (req, res) => {
  res.json(db.get('mechanics'));
});

// POST /api/mechanics/
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const { name, email, phone, specialization, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newMechanic = {
    id: db.nextId('mechanics'),
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    specialization: (specialization || 'General Mechanic').trim(),
    status: (status || 'Available').trim()
  };

  db.insert('mechanics', newMechanic);
  res.status(201).json(newMechanic);
});

// PATCH /api/mechanics/:id/
router.patch('/:id', authenticateToken, requireRole(['admin', 'staff']), (req, res) => {
  const id = req.params.id;
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.email !== undefined) updates.email = req.body.email.trim();
  if (req.body.phone !== undefined) updates.phone = req.body.phone.trim();
  if (req.body.specialization !== undefined) updates.specialization = req.body.specialization.trim();
  if (req.body.status !== undefined) updates.status = req.body.status.trim();

  const updated = db.update('mechanics', id, updates);
  if (!updated) return res.status(404).json({ error: 'Mechanic not found.' });
  res.json(updated);
});

// DELETE /api/mechanics/:id/
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const success = db.delete('mechanics', req.params.id);
  if (!success) return res.status(404).json({ error: 'Mechanic not found.' });
  res.json({ success: true, message: 'Mechanic removed.' });
});

export default router;
