import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/inventory/
router.get('/', authenticateToken, (req, res) => {
  res.json(db.get('inventory'));
});

// POST /api/inventory/
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const { name, part_no, category, price, stock, min_stock } = req.body;
  if (!name || !part_no || price == null) {
    return res.status(400).json({ error: 'Name, part number, and price are required.' });
  }

  const newItem = {
    id: db.nextId('inventory'),
    name: name.trim(),
    part_no: part_no.trim(),
    category: (category || 'General').trim(),
    price: Number(price),
    stock: Number(stock) || 0,
    min_stock: Number(min_stock) || 5
  };

  db.insert('inventory', newItem);
  res.status(201).json(newItem);
});

// PATCH /api/inventory/:id/
router.patch('/:id', authenticateToken, requireRole(['admin', 'staff']), (req, res) => {
  const id = req.params.id;
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.part_no !== undefined) updates.part_no = req.body.part_no.trim();
  if (req.body.category !== undefined) updates.category = req.body.category.trim();
  if (req.body.price !== undefined) updates.price = Number(req.body.price);
  if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);
  if (req.body.min_stock !== undefined) updates.min_stock = Number(req.body.min_stock);

  const updated = db.update('inventory', id, updates);
  if (!updated) return res.status(404).json({ error: 'Item not found.' });
  res.json(updated);
});

// DELETE /api/inventory/:id/
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const success = db.delete('inventory', req.params.id);
  if (!success) return res.status(404).json({ error: 'Item not found.' });
  res.json({ success: true, message: 'Item deleted.' });
});

export default router;
