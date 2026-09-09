/**
 * AutoCare API Service Layer
 * Abstracts backend HTTP communication.
 * Facilitates transition to Django REST Framework (DRF) endpoints.
 * Every function checks API_CONFIG.USE_MOCK first — flip that to false
 * once the Django REST API is live and every page keeps working unchanged.
 */

const API_CONFIG = {
    BASE_URL: 'https://api.autocare.local/api/v1', // Django REST API Root URL
    USE_MOCK: true, // Toggle false when DRF backend is running
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

const MockDB = {
    profile: {
        id: 1,
        name: 'Suman Thapa',
        email: 'suman@example.com',
        phone: '+977 9841000000',
        address: 'Baneshwor, Kathmandu',
        memberSince: '2024-03-10'
    },

    vehicles: [
        { id: 1, registration: 'BA 12 PA 3456', brand: 'Toyota', model: 'Corolla', year: 2021, fuel: 'Petrol', mileage: 24500, status: 'Active' },
        { id: 2, registration: 'BA 98 PA 1234', brand: 'Yamaha', model: 'MT-15', year: 2022, fuel: 'Petrol', mileage: 12100, status: 'Active' }
    ],

    bookings: [
        { id: 'BK-1001', vehicleId: 1, vehicle: 'Toyota Corolla (BA 12 PA 3456)', service: 'Full Inspection & Oil Change', date: '2026-09-12', time: '10:00 AM', status: 'Confirmed', mechanic: 'Ramesh Sharma', notes: 'Slight vibration at high speed.', cost: 4850 },
        { id: 'BK-1002', vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', service: 'Chain Maintenance & Brake Check', date: '2026-09-15', time: '2:00 PM', status: 'Pending', mechanic: 'Unassigned', notes: '', cost: 1800 },
        { id: 'BK-0988', vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', service: 'Brake Replacement', date: '2026-08-02', time: '11:30 AM', status: 'Completed', mechanic: 'Suresh Tamang', notes: 'Front brake pads worn below limit.', cost: 3200 },
        { id: 'BK-0945', vehicleId: 1, vehicle: 'Toyota Corolla (BA 12 PA 3456)', service: 'Full Service', date: '2026-06-18', time: '9:00 AM', status: 'Completed', mechanic: 'Ramesh Sharma', notes: '', cost: 6400 }
    ],

    inventory: [
        { id: 101, name: 'Engine Oil 10W-40 1L', part_no: 'OIL-10W40-01', category: 'Lubricants', price: 1200.00, stock: 42, min_stock: 10 },
        { id: 102, name: 'Front Brake Pads - Sedan', part_no: 'BRK-PAD-09', category: 'Brakes', price: 2800.00, stock: 4, min_stock: 8 }
    ],

    serviceTypes: [
        { id: 1, name: 'Full Inspection & Oil Change', duration: '1.5 hrs', price: 4850 },
        { id: 2, name: 'Full Service', duration: '3 hrs', price: 6400 },
        { id: 3, name: 'Brake Replacement', duration: '1 hr', price: 3200 },
        { id: 4, name: 'Chain Maintenance & Brake Check', duration: '45 mins', price: 1800 },
        { id: 5, name: 'AC Service', duration: '1 hr', price: 2500 },
        { id: 6, name: 'Tyre Rotation & Balancing', duration: '45 mins', price: 1500 }
    ],

    invoices: [
        {
            id: 'INV-2026-089', bookingId: 'BK-0988', vehicle: 'Yamaha MT-15 (BA 98 PA 1234)',
            date: '2026-08-02', status: 'Paid', amount: 3200,
            items: [
                { desc: 'Front Brake Pads - Sedan', qty: 1, rate: 2800, amount: 2800 },
                { desc: 'Labour — Brake Replacement', qty: 1, rate: 400, amount: 400 }
            ]
        },
        {
            id: 'INV-2026-071', bookingId: 'BK-0945', vehicle: 'Toyota Corolla (BA 12 PA 3456)',
            date: '2026-06-18', status: 'Paid', amount: 6400,
            items: [
                { desc: 'Engine Oil 10W-40 1L x4', qty: 4, rate: 1200, amount: 4800 },
                { desc: 'Labour — Full Service', qty: 1, rate: 1600, amount: 1600 }
            ]
        },
        {
            id: 'INV-2026-102', bookingId: 'BK-1001', vehicle: 'Toyota Corolla (BA 12 PA 3456)',
            date: '2026-09-12', status: 'Unpaid', amount: 4850,
            items: [
                { desc: 'Full Inspection & Oil Change', qty: 1, rate: 4850, amount: 4850 }
            ]
        }
    ],

    maintenanceItems: [
        { id: 1, vehicleId: 1, vehicle: 'Toyota Corolla (BA 12 PA 3456)', item: 'Engine Oil Change', dueType: 'mileage', dueValue: '250 km remaining', severity: 'warning' },
        { id: 2, vehicleId: 2, vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', item: 'Brake Pad Check', dueType: 'date', dueValue: 'Passed — next Jan 2027', severity: 'ok' },
        { id: 3, vehicleId: 1, vehicle: 'Toyota Corolla (BA 12 PA 3456)', item: 'Timing Belt Inspection', dueType: 'mileage', dueValue: 'Due at 30,000 km', severity: 'info' }
    ],

    notifications: [
        { id: 1, type: 'booking', title: 'Booking confirmed', message: 'Your booking BK-1001 for 12 Sep has been confirmed.', time: '2 hours ago', read: false },
        { id: 2, type: 'maintenance', title: 'Engine oil change due soon', message: 'Toyota Corolla is 250 km from its next scheduled oil change.', time: '1 day ago', read: false },
        { id: 3, type: 'invoice', title: 'Invoice paid', message: 'Payment received for invoice INV-2026-089.', time: '5 weeks ago', read: true }
    ]
};

const API = {
    // Auth Token Handling
    getAuthHeader() {
        const token = localStorage.getItem('autocare_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    // Profile API
    async getProfile() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.profile);
        const res = await fetch(`${API_CONFIG.BASE_URL}/profile/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async updateProfile(data) {
        if (API_CONFIG.USE_MOCK) {
            Object.assign(MockDB.profile, data);
            return Promise.resolve(MockDB.profile);
        }
        const res = await fetch(`${API_CONFIG.BASE_URL}/profile/`, {
            method: 'PATCH',
            headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Vehicle API
    async getVehicles() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.vehicles);
        const res = await fetch(`${API_CONFIG.BASE_URL}/vehicles/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async getVehicleById(id) {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.vehicles.find(v => String(v.id) === String(id)));
        const res = await fetch(`${API_CONFIG.BASE_URL}/vehicles/${id}/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async createVehicle(data) {
        if (API_CONFIG.USE_MOCK) {
            const newVehicle = { id: Date.now(), ...data, status: 'Active' };
            MockDB.vehicles.push(newVehicle);
            return Promise.resolve(newVehicle);
        }
        const res = await fetch(`${API_CONFIG.BASE_URL}/vehicles/`, {
            method: 'POST',
            headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Bookings API
    async getBookings() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.bookings);
        const res = await fetch(`${API_CONFIG.BASE_URL}/bookings/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async getBookingById(id) {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.bookings.find(b => String(b.id) === String(id)));
        const res = await fetch(`${API_CONFIG.BASE_URL}/bookings/${id}/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async createBooking(data) {
        if (API_CONFIG.USE_MOCK) {
            const newBooking = { id: `BK-${Math.floor(1000 + Math.random() * 9000)}`, ...data, status: 'Pending', mechanic: 'Unassigned' };
            MockDB.bookings.push(newBooking);
            return Promise.resolve(newBooking);
        }
        const res = await fetch(`${API_CONFIG.BASE_URL}/bookings/`, {
            method: 'POST',
            headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Service types (used to populate the "book a service" dropdown)
    async getServiceTypes() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.serviceTypes);
        const res = await fetch(`${API_CONFIG.BASE_URL}/service-types/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    // Service history = completed bookings
    async getServiceHistory() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.bookings.filter(b => b.status === 'Completed'));
        const res = await fetch(`${API_CONFIG.BASE_URL}/bookings/?status=completed`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    // Invoices API
    async getInvoices() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.invoices);
        const res = await fetch(`${API_CONFIG.BASE_URL}/invoices/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async getInvoiceById(id) {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.invoices.find(i => String(i.id) === String(id)));
        const res = await fetch(`${API_CONFIG.BASE_URL}/invoices/${id}/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    // Maintenance API
    async getMaintenanceItems() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.maintenanceItems);
        const res = await fetch(`${API_CONFIG.BASE_URL}/maintenance/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    // Notifications API
    async getNotifications() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.notifications);
        const res = await fetch(`${API_CONFIG.BASE_URL}/notifications/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    },

    async markNotificationRead(id) {
        if (API_CONFIG.USE_MOCK) {
            const n = MockDB.notifications.find(n => n.id === id);
            if (n) n.read = true;
            return Promise.resolve(n);
        }
        const res = await fetch(`${API_CONFIG.BASE_URL}/notifications/${id}/`, {
            method: 'PATCH',
            headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() },
            body: JSON.stringify({ read: true })
        });
        return res.json();
    },

    // Inventory API
    async getInventory() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.inventory);
        const res = await fetch(`${API_CONFIG.BASE_URL}/inventory/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    }
};
