/* AutoCare API layer — connected to persistent backend API. */
(function () {
  'use strict';
  const Store = window.AutoCareStore;
  const API_CONFIG = {
    BASE_URL: '/api',
    USE_MOCK: false,
    HEADERS: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  };

  function data(key) { return Store.ensure(key); }
  function save(key, value) { return Store.write(key, value); }
  function currentUser() { return window.AutoCareAuth ? window.AutoCareAuth.currentUser() : null; }
  function customerId() { const u = currentUser(); return u && u.role === 'customer' ? Number(u.id) : 1; }
  async function request(path, options) {
    const headers = Object.assign({}, API_CONFIG.HEADERS, API.getAuthHeader(), (options && options.headers) || {});
    const res = await fetch(API_CONFIG.BASE_URL + path, Object.assign({}, options || {}, { headers }));
    if (!res.ok) throw new Error('API request failed: ' + res.status);
    return res.json();
  }

  const API = {
    config: API_CONFIG,
    getAuthHeader: function () { const token = localStorage.getItem('autocare_token'); return token ? { Authorization: 'Bearer ' + token } : {}; },

    async getProfile() {
      if (API_CONFIG.USE_MOCK) { const u = currentUser(); return u ? Object.assign({}, u, { memberSince: u.memberSince || '2026-09-09' }) : data('users')[0]; }
      return request('/profile/');
    },
    async updateProfile(update) {
      if (API_CONFIG.USE_MOCK) { const users = data('users'); const u = currentUser(); const i = users.findIndex(x => x.id === u.id); if (i >= 0) { users[i] = Object.assign({}, users[i], update); save('users', users); } return users[i]; }
      return request('/profile/', { method: 'PATCH', body: JSON.stringify(update) });
    },

    async getVehicles() {
      if (API_CONFIG.USE_MOCK) { const all = data('vehicles'); const u = currentUser(); return u && u.role === 'customer' ? all.filter(v => Number(v.customerId) === Number(u.id)) : all; }
      return request('/vehicles/');
    },
    async getAllVehicles() { if (API_CONFIG.USE_MOCK) return data('vehicles'); return request('/vehicles/'); },
    async getVehicleById(id) { if (API_CONFIG.USE_MOCK) return data('vehicles').find(v => String(v.id) === String(id)); return request('/vehicles/' + id + '/'); },
    async createVehicle(vehicle) {
      if (API_CONFIG.USE_MOCK) { const all = data('vehicles'); const item = Object.assign({ id: Store.nextId(all), customerId: customerId(), status: 'Active' }, vehicle); all.push(item); save('vehicles', all); return item; }
      return request('/vehicles/', { method: 'POST', body: JSON.stringify(vehicle) });
    },
    async updateVehicle(id, update) {
      if (API_CONFIG.USE_MOCK) { const all = data('vehicles'); const i = all.findIndex(v => String(v.id) === String(id)); if (i < 0) return null; all[i] = Object.assign({}, all[i], update); save('vehicles', all); return all[i]; }
      return request('/vehicles/' + id + '/', { method: 'PATCH', body: JSON.stringify(update) });
    },
    async deleteVehicle(id) {
      if (API_CONFIG.USE_MOCK) { save('vehicles', data('vehicles').filter(v => String(v.id) !== String(id))); return true; }
      await request('/vehicles/' + id + '/', { method: 'DELETE' }); return true;
    },

    async getBookings() {
      if (API_CONFIG.USE_MOCK) { const all = data('bookings'); const u = currentUser(); return u && u.role === 'customer' ? all.filter(b => Number(b.customerId) === Number(u.id)) : all; }
      return request('/bookings/');
    },
    async getBookingById(id) { if (API_CONFIG.USE_MOCK) return data('bookings').find(b => String(b.id) === String(id)); return request('/bookings/' + id + '/'); },
    async createBooking(booking) {
      if (API_CONFIG.USE_MOCK) {
        const all = data('bookings'); const services = data('services'); const vehicles = data('vehicles');
        const v = vehicles.find(x => String(x.id) === String(booking.vehicleId)); const s = services.find(x => String(x.id) === String(booking.serviceTypeId || booking.serviceId));
        const item = Object.assign({ id: 'BK-' + Math.floor(1000 + Math.random() * 9000), customerId: customerId(), vehicle: v ? `${v.brand} ${v.model} (${v.registration})` : '', serviceId: s ? s.id : booking.serviceId, service: s ? s.name : booking.service, status: 'Pending', mechanic: 'Unassigned', cost: s ? Number(s.price) : Number(booking.cost) || 0 }, booking);
        all.push(item); save('bookings', all); return item;
      }
      return request('/bookings/', { method: 'POST', body: JSON.stringify(booking) });
    },
    async updateBooking(id, update) {
      if (API_CONFIG.USE_MOCK) { const all = data('bookings'); const i = all.findIndex(b => String(b.id) === String(id)); if (i < 0) return null; all[i] = Object.assign({}, all[i], update); save('bookings', all); return all[i]; }
      return request('/bookings/' + id + '/', { method: 'PATCH', body: JSON.stringify(update) });
    },
    async updateBookingStatus(id, status) { return this.updateBooking(id, { status: status }); },

    async getServiceTypes() { if (API_CONFIG.USE_MOCK) return data('services'); return request('/service-types/'); },
    async getServiceHistory() { const bookings = await this.getBookings(); return bookings.filter(b => b.status === 'Completed'); },
    async getInvoices() { if (API_CONFIG.USE_MOCK) { const all = data('invoices'); const u = currentUser(); return u && u.role === 'customer' ? all.filter(i => Number(i.customerId) === Number(u.id)) : all; } return request('/invoices/'); },
    async getInvoiceById(id) { if (API_CONFIG.USE_MOCK) return data('invoices').find(i => String(i.id) === String(id)); return request('/invoices/' + id + '/'); },
    async getMaintenanceItems() { if (API_CONFIG.USE_MOCK) { const all = data('maintenance'); const u = currentUser(); return u && u.role === 'customer' ? all.filter(x => data('vehicles').some(v => Number(v.id) === Number(x.vehicleId) && Number(v.customerId) === Number(u.id))) : all; } return request('/maintenance/'); },
    async getNotifications() { if (API_CONFIG.USE_MOCK) return data('notifications'); return request('/notifications/'); },
    async markNotificationRead(id) { if (API_CONFIG.USE_MOCK) { const all = data('notifications'); const i = all.findIndex(n => Number(n.id) === Number(id)); if (i >= 0) { all[i].read = true; save('notifications', all); return all[i]; } return null; } return request('/notifications/' + id + '/', { method: 'PATCH', body: JSON.stringify({ read: true }) }); },
    async getInventory() { if (API_CONFIG.USE_MOCK) return data('inventory'); return request('/inventory/'); },

    // Staff operations
    async saveInspection(record) { if (API_CONFIG.USE_MOCK) { const all = data('inspections'); record.id = Store.nextId(all); record.createdAt = new Date().toISOString(); all.push(record); save('inspections', all); return record; } return request('/inspections', { method: 'POST', body: JSON.stringify(record) }); },
    async getInspections() { if (API_CONFIG.USE_MOCK) return data('inspections'); return request('/inspections'); },
    async saveServiceWork(record) { if (API_CONFIG.USE_MOCK) { const all = data('serviceWork'); const existing = all.findIndex(x => String(x.bookingId) === String(record.bookingId)); if (existing >= 0) { all[existing] = Object.assign({}, all[existing], record); save('serviceWork', all); return all[existing]; } record.id = Store.nextId(all); all.push(record); save('serviceWork', all); return record; } return request('/service-work', { method: 'POST', body: JSON.stringify(record) }); },
    async getServiceWork() { if (API_CONFIG.USE_MOCK) return data('serviceWork'); return request('/service-work'); },

    // Admin operations
    async getUsers() { if (API_CONFIG.USE_MOCK) return data('users'); return request('/users/'); },
    async addMechanic(mechanic) { if (API_CONFIG.USE_MOCK) { const all = data('mechanics'); mechanic.id = Store.nextId(all); all.push(mechanic); save('mechanics', all); return mechanic; } return request('/mechanics/', { method: 'POST', body: JSON.stringify(mechanic) }); },
    async updateMechanic(id, update) { if (API_CONFIG.USE_MOCK) { const all = data('mechanics'); const i = all.findIndex(x => Number(x.id) === Number(id)); if (i < 0) return null; all[i] = Object.assign({}, all[i], update); save('mechanics', all); return all[i]; } return request('/mechanics/' + id + '/', { method: 'PATCH', body: JSON.stringify(update) }); },
    async deleteMechanic(id) { if (API_CONFIG.USE_MOCK) { save('mechanics', data('mechanics').filter(x => Number(x.id) !== Number(id))); return true; } return request('/mechanics/' + id + '/', { method: 'DELETE' }); },
    async getMechanics() { if (API_CONFIG.USE_MOCK) return data('mechanics'); return request('/mechanics/'); },
    async addServiceType(service) { if (API_CONFIG.USE_MOCK) { const all = data('services'); service.id = Store.nextId(all); all.push(service); save('services', all); return service; } return request('/service-types/', { method: 'POST', body: JSON.stringify(service) }); },
    async updateServiceType(id, update) { if (API_CONFIG.USE_MOCK) { const all = data('services'); const i = all.findIndex(x => Number(x.id) === Number(id)); if (i < 0) return null; all[i] = Object.assign({}, all[i], update); save('services', all); return all[i]; } return request('/service-types/' + id + '/', { method: 'PATCH', body: JSON.stringify(update) }); },
    async deleteServiceType(id) { if (API_CONFIG.USE_MOCK) { save('services', data('services').filter(x => Number(x.id) !== Number(id))); return true; } return request('/service-types/' + id + '/', { method: 'DELETE' }); },
    async addInventoryItem(item) { if (API_CONFIG.USE_MOCK) { const all = data('inventory'); item.id = Store.nextId(all); all.push(item); save('inventory', all); return item; } return request('/inventory/', { method: 'POST', body: JSON.stringify(item) }); },
    async updateInventoryItem(id, update) { if (API_CONFIG.USE_MOCK) { const all = data('inventory'); const i = all.findIndex(x => Number(x.id) === Number(id)); if (i < 0) return null; all[i] = Object.assign({}, all[i], update); save('inventory', all); return all[i]; } return request('/inventory/' + id + '/', { method: 'PATCH', body: JSON.stringify(update) }); },
    async deleteInventoryItem(id) { if (API_CONFIG.USE_MOCK) { save('inventory', data('inventory').filter(x => Number(x.id) !== Number(id))); return true; } return request('/inventory/' + id + '/', { method: 'DELETE' }); }
  };

  window.API = API;
})();
