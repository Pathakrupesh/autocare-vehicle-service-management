import express from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/bookings/
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'customer') {
    const list = db.filter('bookings', b => Number(b.customerId) === Number(req.user.id));
    return res.json(list);
  }
  const all = db.get('bookings');
  res.json(all);
});

// GET /api/bookings/:id/
router.get('/:id', authenticateToken, (req, res) => {
  const booking = db.find('bookings', b => String(b.id) === String(req.params.id));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  if (req.user.role === 'customer' && Number(booking.customerId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  res.json(booking);
});

// POST /api/bookings/
router.post('/', authenticateToken, (req, res) => {
  const { vehicleId, serviceTypeId, serviceId, date, time, notes } = req.body;
  const customerId = req.user.id;

  const targetServiceId = serviceTypeId || serviceId;
  const service = db.find('services', s => String(s.id) === String(targetServiceId));
  const vehicle = db.find('vehicles', v => String(v.id) === String(vehicleId));

  const bookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
  const vehicleText = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registration})` : (req.body.vehicle || 'Vehicle');
  const serviceText = service ? service.name : (req.body.service || 'Service');
  const cost = service ? Number(service.price) : (Number(req.body.cost) || 0);

  const newBooking = {
    id: bookingId,
    customerId: customerId,
    vehicleId: vehicleId || null,
    vehicle: vehicleText,
    serviceId: targetServiceId || null,
    service: serviceText,
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:00 AM',
    status: 'Pending',
    mechanic: 'Unassigned',
    notes: notes || '',
    cost: cost,
    createdAt: new Date().toISOString()
  };

  db.insert('bookings', newBooking);

  // Auto-generate unpaid invoice
  const invId = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  const newInvoice = {
    id: invId,
    bookingId: bookingId,
    customerId: customerId,
    vehicle: vehicleText,
    date: newBooking.date,
    status: 'Unpaid',
    amount: cost,
    items: [{ desc: serviceText, qty: 1, rate: cost, amount: cost }]
  };
  db.insert('invoices', newInvoice);

  // Add customer notification
  db.insert('notifications', {
    id: db.nextId('notifications'),
    customerId: customerId,
    type: 'booking',
    title: 'Booking submitted',
    message: `Your booking ${bookingId} for ${serviceText} has been submitted.`,
    time: 'Just now',
    read: false
  });

  res.status(201).json(newBooking);
});

// PATCH /api/bookings/:id/
router.patch('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const booking = db.find('bookings', b => String(b.id) === String(id));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const updates = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.mechanic !== undefined) updates.mechanic = req.body.mechanic;
  if (req.body.notes !== undefined) updates.notes = req.body.notes;
  if (req.body.date !== undefined) updates.date = req.body.date;
  if (req.body.time !== undefined) updates.time = req.body.time;

  const updated = db.update('bookings', id, updates);
  res.json(updated);
});

export default router;
