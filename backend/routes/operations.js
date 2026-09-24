import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/inspections
router.get('/inspections', authenticateToken, (req, res) => {
  res.json(db.get('inspections'));
});

// POST /api/inspections
router.post('/inspections', authenticateToken, requireRole(['staff', 'admin']), (req, res) => {
  const { bookingId, condition, notes, checks } = req.body;
  const record = {
    id: db.nextId('inspections'),
    bookingId: bookingId,
    condition: condition || 'Good',
    notes: notes || '',
    checks: checks || [],
    createdAt: new Date().toISOString()
  };
  db.insert('inspections', record);
  res.status(201).json(record);
});

// GET /api/service-work
router.get('/service-work', authenticateToken, (req, res) => {
  res.json(db.get('serviceWork'));
});

// POST /api/service-work
router.post('/service-work', authenticateToken, requireRole(['staff', 'admin']), (req, res) => {
  const { bookingId, tasks, parts, notes, completed, finalNotes } = req.body;

  const existing = db.find('serviceWork', x => String(x.bookingId) === String(bookingId));
  if (existing) {
    const updated = db.update('serviceWork', existing.id, {
      tasks: tasks !== undefined ? tasks : existing.tasks,
      parts: parts !== undefined ? parts : existing.parts,
      notes: notes !== undefined ? notes : existing.notes,
      completed: completed !== undefined ? completed : existing.completed,
      finalNotes: finalNotes !== undefined ? finalNotes : existing.finalNotes,
      updatedAt: new Date().toISOString()
    });
    return res.json(updated);
  }

  const record = {
    id: db.nextId('serviceWork'),
    bookingId: bookingId,
    tasks: tasks || [],
    parts: parts || '',
    notes: notes || '',
    completed: completed || false,
    finalNotes: finalNotes || '',
    updatedAt: new Date().toISOString()
  };

  db.insert('serviceWork', record);
  res.status(201).json(record);
});

export default router;
