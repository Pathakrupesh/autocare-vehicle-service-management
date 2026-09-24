import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'autocare-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialSeed() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('12345678', salt);

  return {
    users: [
      { id: 1, name: 'Rupesh Pathak', email: 'customer@autocare.com', phone: '+977 9841000000', password: passwordHash, role: 'customer', address: 'Kathmandu, Nepal', memberSince: '2026-09-09' },
      { id: 2, name: 'Ramesh Sharma', email: 'staff@autocare.com', phone: '+977 9841000001', password: passwordHash, role: 'staff', address: 'Patan, Nepal', memberSince: '2026-08-01' },
      { id: 3, name: 'AutoCare Admin', email: 'admin@autocare.com', phone: '+977 9841000002', password: passwordHash, role: 'admin', address: 'Kathmandu, Nepal', memberSince: '2026-01-01' }
    ],
    vehicles: [
      { id: 1, customerId: 1, registration: 'BA 12 PA 3456', brand: 'Triumph', model: 'Scrambler 400x', year: 2026, fuel: 'Petrol', mileage: 24500, status: 'Active' },
      { id: 2, customerId: 1, registration: 'BA 98 PA 1234', brand: 'Yamaha', model: 'MT-15', year: 2022, fuel: 'Petrol', mileage: 12100, status: 'Active' },
      { id: 3, customerId: 3, registration: 'BA 5 CHA 7788', brand: 'Honda', model: 'City', year: 2020, fuel: 'Petrol', mileage: 51000, status: 'Active' },
      { id: 4, customerId: 3, registration: 'BA 3 PA 2211', brand: 'Hyundai', model: 'i20', year: 2019, fuel: 'Petrol', mileage: 62000, status: 'Active' }
    ],
    services: [
      { id: 1, name: 'Full Inspection & Oil Change', duration: '1.5 hrs', price: 4850 },
      { id: 2, name: 'Full Service', duration: '3 hrs', price: 6400 },
      { id: 3, name: 'Brake Replacement', duration: '1 hr', price: 3200 },
      { id: 4, name: 'Chain Maintenance & Brake Check', duration: '45 mins', price: 1800 },
      { id: 5, name: 'AC Service', duration: '1 hr', price: 2500 },
      { id: 6, name: 'Tyre Rotation & Balancing', duration: '45 mins', price: 1500 }
    ],
    mechanics: [
      { id: 1, name: 'Ramesh Sharma', email: 'ramesh@autocare.com', phone: '+977 9841000001', specialization: 'Engine Specialist', status: 'Available' },
      { id: 2, name: 'Suresh Tamang', email: 'suresh@autocare.com', phone: '+977 9841000002', specialization: 'Brake Specialist', status: 'Busy' }
    ],
    bookings: [
      { id: 'BK-1001', customerId: 1, vehicleId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', serviceId: 1, service: 'Full Inspection & Oil Change', date: '2026-09-12', time: '10:00 AM', status: 'Confirmed', mechanic: 'Ramesh Sharma', notes: 'Slight vibration at high speed.', cost: 4850 },
      { id: 'BK-1002', customerId: 1, vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', serviceId: 4, service: 'Chain Maintenance & Brake Check', date: '2026-09-15', time: '2:00 PM', status: 'Pending', mechanic: 'Unassigned', notes: '', cost: 1800 },
      { id: 'BK-0988', customerId: 1, vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', serviceId: 3, service: 'Brake Replacement', date: '2026-08-02', time: '11:30 AM', status: 'Completed', mechanic: 'Suresh Tamang', notes: 'Front brake pads worn below limit.', cost: 3200 },
      { id: 'BK-0945', customerId: 1, vehicleId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', serviceId: 2, service: 'Full Service', date: '2026-06-18', time: '9:00 AM', status: 'Completed', mechanic: 'Ramesh Sharma', notes: '', cost: 6400 },
      { id: 'BK-1038', customerId: 3, vehicleId: 3, vehicle: 'Honda City (BA 5 CHA 7788)', serviceId: 3, service: 'Brake Replacement', date: '2026-09-10', time: '11:30 AM', status: 'In Progress', mechanic: 'Ramesh Sharma', notes: 'Brake noise reported.', cost: 3200 }
    ],
    invoices: [
      { id: 'INV-2026-089', bookingId: 'BK-0988', customerId: 1, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', date: '2026-08-02', status: 'Paid', amount: 3200, items: [{ desc: 'Front Brake Pads - Sedan', qty: 1, rate: 2800, amount: 2800 }, { desc: 'Labour — Brake Replacement', qty: 1, rate: 400, amount: 400 }] },
      { id: 'INV-2026-071', bookingId: 'BK-0945', customerId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', date: '2026-06-18', status: 'Paid', amount: 6400, items: [{ desc: 'Engine Oil 10W-40 1L x4', qty: 4, rate: 1200, amount: 4800 }, { desc: 'Labour — Full Service', qty: 1, rate: 1600, amount: 1600 }] },
      { id: 'INV-2026-102', bookingId: 'BK-1001', customerId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', date: '2026-09-12', status: 'Unpaid', amount: 4850, items: [{ desc: 'Full Inspection & Oil Change', qty: 1, rate: 4850, amount: 4850 }] }
    ],
    inventory: [
      { id: 101, name: 'Engine Oil 10W-40 1L', part_no: 'OIL-10W40-01', category: 'Lubricants', price: 1200, stock: 42, min_stock: 10 },
      { id: 102, name: 'Front Brake Pads - Sedan', part_no: 'BRK-PAD-09', category: 'Brakes', price: 2800, stock: 4, min_stock: 8 },
      { id: 103, name: 'Oil Filter', part_no: 'FLT-001', category: 'Filters', price: 850, stock: 18, min_stock: 5 }
    ],
    maintenance: [
      { id: 1, vehicleId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', item: 'Engine Oil Change', dueValue: '250 km remaining', severity: 'warning' },
      { id: 2, vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', item: 'Brake Pad Check', dueValue: 'Next Jan 2027', severity: 'ok' },
      { id: 3, vehicleId: 1, vehicle: 'Triumph Scrambler 400x (BA 12 PA 3456)', item: 'Timing Belt Inspection', dueValue: 'Due at 30,000 km', severity: 'info' }
    ],
    inspections: [],
    serviceWork: [],
    notifications: [
      { id: 1, customerId: 1, type: 'booking', title: 'Booking confirmed', message: 'Your booking BK-1001 has been confirmed.', time: '2 hours ago', read: false },
      { id: 2, customerId: 1, type: 'maintenance', title: 'Engine oil change due soon', message: 'Triumph Scrambler 400x is 250 km from its next scheduled oil change.', time: '1 day ago', read: false }
    ]
  };
}

class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialSeed();
        this.save();
      }
    } catch (err) {
      console.warn('Error reading database file, initializing seed data:', err.message);
      this.data = getInitialSeed();
      this.save();
    }
  }

  save() {
    try {
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err.message);
    }
  }

  get(collection) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    return this.data[collection];
  }

  nextId(collection) {
    const list = this.get(collection);
    return list.length ? Math.max(...list.map(x => Number(x.id) || 0)) + 1 : 1;
  }

  find(collection, predicate) {
    return this.get(collection).find(predicate) || null;
  }

  filter(collection, predicate) {
    return this.get(collection).filter(predicate);
  }

  insert(collection, item) {
    const list = this.get(collection);
    list.push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(x => String(x.id) === String(id));
    if (index === -1) return null;
    list[index] = Object.assign({}, list[index], updates);
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.get(collection);
    const initialLen = list.length;
    this.data[collection] = list.filter(x => String(x.id) !== String(id));
    this.save();
    return this.data[collection].length < initialLen;
  }
}

const db = new Database();
export default db;
