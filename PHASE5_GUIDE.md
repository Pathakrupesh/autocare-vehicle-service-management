# AutoCare — Phase 5 Guide

Phase 5 makes the frontend interactive using browser localStorage as a temporary mock database.

## Files added/updated
- `assets/js/storage.js` — seeds and reads/writes mock data in localStorage.
- `assets/js/auth.js` — mock login, registration, sessions and logout.
- `assets/js/api.js` — frontend service layer; currently uses localStorage and can later call Django.
- `assets/js/customer.js` — existing customer page logic now persists through API/localStorage.
- `assets/js/staff.js` — staff jobs, inspection, service work and completion interactions.
- `assets/js/admin.js` — admin tables, booking status, mechanic status, invoices/payments and dashboard totals.

## Demo accounts
- Customer: `customer@autocare.com` / `12345678`
- Staff: `staff@autocare.com` / `12345678`
- Admin: `admin@autocare.com` / `12345678`

## How to test
1. Open the project with VS Code Live Server (recommended).
2. Open `login.html`.
3. Log in using one of the demo accounts.
4. Customer: add a vehicle and create a booking. Refresh to confirm the data remains.
5. Staff: open Jobs, open a job, save inspection/service progress and complete it.
6. Admin: open Bookings, change status, check Vehicles, Mechanics, Invoices, Payments and Dashboard.

## Reset mock data
Open browser DevTools → Console and run:

```js
AutoCareStore.reset();
location.reload();
```

This deletes current demo changes and restores the seeded data.

## Important
This is frontend-only mock authentication. Passwords and data are stored in the browser and are **not secure**. It is only for development/demo use. When Django is ready, set `API_CONFIG.USE_MOCK = false` and replace the API base URL/endpoints with the real backend.
