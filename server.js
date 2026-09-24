import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './backend/routes/auth.js';
import profileRoutes from './backend/routes/profile.js';
import vehicleRoutes from './backend/routes/vehicles.js';
import bookingRoutes from './backend/routes/bookings.js';
import serviceRoutes from './backend/routes/services.js';
import mechanicRoutes from './backend/routes/mechanics.js';
import invoiceRoutes from './backend/routes/invoices.js';
import inventoryRoutes from './backend/routes/inventory.js';
import maintenanceRoutes from './backend/routes/maintenance.js';
import operationsRoutes from './backend/routes/operations.js';
import notificationRoutes from './backend/routes/notifications.js';
import userRoutes from './backend/routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/service-types', serviceRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api', operationsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoCare API', timestamp: new Date().toISOString() });
});

// Notifications spelling alias
app.get('/customer/notifications.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'customer', 'notofocations.html'));
});

// Static assets
app.use(express.static(__dirname));

// Root index fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AutoCare unified server running at http://0.0.0.0:${PORT}`);
});
