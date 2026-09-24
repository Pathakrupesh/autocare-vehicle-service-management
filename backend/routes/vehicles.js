import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/vehicles/
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const list = db.filter('vehicles', v => Number(v.customerId) === Number(req.user.id));
    return res.json(list);
  }
  const all = db.get('vehicles');
  res.json(all);
});

// GET /api/vehicles/:id/
router.get('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const vehicle = db.find('vehicles', v => String(v.id) === String(id));
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }
  if (req.user.role === 'customer' && Number(vehicle.customerId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized to view this vehicle.' });
  }
  res.json(vehicle);
});

// POST /api/vehicles/
router.post('/', authenticateToken, (req, res) => {
  const { registration, brand, model, year, fuel, mileage } = req.body;
  if (!registration || !brand || !model || !year || !fuel) {
    return res.status(400).json({ error: 'Registration, brand, model, year, and fuel are required.' });
  }

  const newVehicle = {
    id: db.nextId('vehicles'),
    customerId: req.user.id,
    registration: registration.trim(),
    brand: brand.trim(),
    model: model.trim(),
    year: Number(year),
    fuel: fuel.trim(),
    mileage: Number(mileage) || 0,
    status: 'Active'
  };

  db.insert('vehicles', newVehicle);
  res.status(201).json(newVehicle);
});

// PATCH /api/vehicles/:id/
router.patch('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const vehicle = db.find('vehicles', v => String(v.id) === String(id));
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  if (req.user.role === 'customer' && Number(vehicle.customerId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const updates = {};
  if (req.body.registration !== undefined) updates.registration = req.body.registration.trim();
  if (req.body.brand !== undefined) updates.brand = req.body.brand.trim();
  if (req.body.model !== undefined) updates.model = req.body.model.trim();
  if (req.body.year !== undefined) updates.year = Number(req.body.year);
  if (req.body.fuel !== undefined) updates.fuel = req.body.fuel.trim();
  if (req.body.mileage !== undefined) updates.mileage = Number(req.body.mileage);
  if (req.body.status !== undefined) updates.status = req.body.status.trim();

  const updated = db.update('vehicles', id, updates);
  res.json(updated);
});

// DELETE /api/vehicles/:id/
router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const vehicle = db.find('vehicles', v => String(v.id) === String(id));
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  if (req.user.role === 'customer' && Number(vehicle.customerId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  db.delete('vehicles', id);
  res.json({ success: true, message: 'Vehicle deleted successfully.' });
});

export default router;
