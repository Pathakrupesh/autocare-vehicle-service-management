import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'autocare_jwt_secret_key_change_in_production_2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = db.find('users', u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  let match = false;
  if (user.password.startsWith('$2')) {
    match = bcrypt.compareSync(password, user.password);
  } else {
    // Fallback if plain text was stored
    match = user.password === password;
  }

  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.find('users', u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: db.nextId('users'),
    name: name.trim(),
    email: cleanEmail,
    phone: (phone || '').trim(),
    password: passwordHash,
    role: 'customer',
    address: '',
    memberSince: new Date().toISOString().split('T')[0]
  };

  db.insert('users', newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;
