import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/maintenance/
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const customerVehicles = db.filter('vehicles', v => Number(v.customerId) === Number(req.user.id));
    const vehicleIds = customerVehicles.map(v => Number(v.id));
    const items = db.filter('maintenance', m => vehicleIds.includes(Number(m.vehicleId)));
    return res.json(items);
  }
  res.json(db.get('maintenance'));
});

// POST /api/maintenance/
router.post('/', authenticateToken, (req, res) => {
  const { vehicleId, item, dueValue, severity } = req.body;
  const vehicle = db.find('vehicles', v => String(v.id) === String(vehicleId));

  const newRecord = {
    id: db.nextId('maintenance'),
    vehicleId: Number(vehicleId),
    vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registration})` : (req.body.vehicle || 'Vehicle'),
    item: item || 'Routine Check',
    dueValue: dueValue || 'Soon',
    severity: severity || 'info'
  };

  db.insert('maintenance', newRecord);
  res.status(201).json(newRecord);
});

export default router;
