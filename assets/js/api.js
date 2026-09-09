/**
 * AutoCare API Service Layer
 * Abstracts backend HTTP communication. 
 * Facilitates transition to Django REST Framework (DRF) endpoints.
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
    vehicles: [
        { id: 1, registration: 'BA 12 PA 3456', brand: 'Toyota', model: 'Corolla', year: 2021, fuel: 'Petrol', mileage: 24500, status: 'Active' },
        { id: 2, registration: 'BA 98 PA 1234', brand: 'Yamaha', model: 'MT-15', year: 2022, fuel: 'Petrol', mileage: 12100, status: 'Active' }
    ],
    bookings: [
        { id: 'BK-1001', vehicle: 'Toyota Corolla (BA 12 PA 3456)', service: 'Full Inspection & Oil Change', date: '2026-09-12', status: 'Confirmed', mechanic: 'Ramesh Sharma' },
        { id: 'BK-1002', vehicle: 'Yamaha MT-15 (BA 98 PA 1234)', service: 'Chain Maintenance & Brake Check', date: '2026-09-15', status: 'Pending', mechanic: 'Unassigned' }
    ],
    inventory: [
        { id: 101, name: 'Engine Oil 10W-40 1L', part_no: 'OIL-10W40-01', category: 'Lubricants', price: 1200.00, stock: 42, min_stock: 10 },
        { id: 102, name: 'Front Brake Pads - Sedan', part_no: 'BRK-PAD-09', category: 'Brakes', price: 2800.00, stock: 4, min_stock: 8 }
    ]
};

const API = {
    // Auth Token Handling
    getAuthHeader() {
        const token = localStorage.getItem('autocare_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },

    // Vehicle API
    async getVehicles() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.vehicles);
        const res = await fetch(`${API_CONFIG.BASE_URL}/vehicles/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
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

    // Inventory API
    async getInventory() {
        if (API_CONFIG.USE_MOCK) return Promise.resolve(MockDB.inventory);
        const res = await fetch(`${API_CONFIG.BASE_URL}/inventory/`, { headers: { ...API_CONFIG.HEADERS, ...this.getAuthHeader() } });
        return res.json();
    }
};