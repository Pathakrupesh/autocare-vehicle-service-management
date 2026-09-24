import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/invoices/
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const list = db.filter('invoices', i => Number(i.customerId) === Number(req.user.id));
    return res.json(list);
  }
  res.json(db.get('invoices'));
});

// GET /api/invoices/:id/
router.get('/:id', authenticateToken, (req, res) => {
  const inv = db.find('invoices', i => String(i.id) === String(req.params.id));
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });

  if (req.user.role === 'customer' && Number(inv.customerId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  res.json(inv);
});

// PATCH /api/invoices/:id/
router.patch('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const updates = {};
  if (req.body.status !== undefined) updates.status = req.body.status;

  const updated = db.update('invoices', id, updates);
  if (!updated) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(updated);
});

export default router;
