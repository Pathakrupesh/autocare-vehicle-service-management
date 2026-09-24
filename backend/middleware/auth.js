import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'autocare_jwt_secret_key_change_in_production_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  // Handle mock tokens for seamless transition
  if (token.startsWith('mock-token-')) {
    const userId = Number(token.replace('mock-token-', ''));
    const user = db.find('users', u => Number(u.id) === userId);
    if (!user) {
      return res.status(403).json({ error: 'Session expired or invalid.' });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    const user = db.find('users', u => Number(u.id) === Number(decoded.id));
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists.' });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  });
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action.' });
    }
    next();
  };
}
