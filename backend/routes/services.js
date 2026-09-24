import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/service-types/
router.get('/', (req, res) => {
  res.json(db.get('services'));
});

// POST /api/service-types/
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const { name, duration, price } = req.body;
  if (!name || !duration || price == null) {
    return res.status(400).json({ error: 'Name, duration, and price are required.' });
  }

  const newService = {
    id: db.nextId('services'),
    name: name.trim(),
    duration: duration.trim(),
    price: Number(price)
  };

  db.insert('services', newService);
  res.status(201).json(newService);
});

// PATCH /api/service-types/:id/
router.patch('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const id = req.params.id;
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.duration !== undefined) updates.duration = req.body.duration.trim();
  if (req.body.price !== undefined) updates.price = Number(req.body.price);

  const updated = db.update('services', id, updates);
  if (!updated) return res.status(404).json({ error: 'Service not found.' });
  res.json(updated);
});

// DELETE /api/service-types/:id/
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const success = db.delete('services', req.params.id);
  if (!success) return res.status(404).json({ error: 'Service not found.' });
  res.json({ success: true, message: 'Service type removed.' });
});

export default router;
