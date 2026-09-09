/* =========================================================
   AutoCare — customer.js
   Page-specific rendering + form handling for /customer/*.html.
   All data comes through assets/js/api.js (mock for now — see
   API_CONFIG.USE_MOCK). Every render* function only runs when the
   page actually has the matching element, so this one file is
   safe to include on every customer page.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- small shared helpers ---------- */

  function money(n) {
    const num = Number(n) || 0;
    return "Rs. " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function badgeClass(status) {
    const map = {
      Confirmed: "badge-progress",
      Pending: "badge-pending",
      Completed: "badge-complete",
      Cancelled: "badge-cancelled",
      Paid: "badge-complete",
      Unpaid: "badge-pending"
    };
    return map[status] || "badge-pending";
  }

  function badge(status) {
    return `<span class="badge ${badgeClass(status)}">${status}</span>`;
  }

  function qs(name, fallback) {
    const v = new URLSearchParams(window.location.search).get(name);
    return v === null ? fallback : v;
  }

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /* ---------- Dashboard ---------- */

  async function renderDashboard() {
    const root = document.getElementById("stat-vehicles");
    if (!root) return;

    const [vehicles, bookings, maintenance] = await Promise.all([
      API.getVehicles(),
      API.getBookings(),
      API.getMaintenanceItems()
    ]);

    const active = bookings.filter(b => b.status === "Pending" || b.status === "Confirmed").length;
    const completed = bookings.filter(b => b.status === "Completed").length;

    document.getElementById("stat-vehicles").textContent = vehicles.length;
    document.getElementById("stat-active-bookings").textContent = active;
    document.getElementById("stat-completed").textContent = completed;

    const invoices = await API.getInvoices();
    const due = invoices.filter(i => i.status === "Unpaid").reduce((sum, i) => sum + i.amount, 0);
    document.getElementById("stat-due").textContent = money(due);

    const tbody = document.getElementById("recent-bookings-tbody");
    const recent = bookings.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    tbody.innerHTML = recent.map(b => `
      <tr>
        <td class="cell-strong">${b.id}</td>
        <td>${esc(b.vehicle)}</td>
        <td>${esc(b.service)}</td>
        <td class="cell-muted">${formatDate(b.date)}</td>
        <td>${badge(b.status)}</td>
      </tr>
    `).join("");

    const alertsEl = document.getElementById("maintenance-alerts");
    alertsEl.innerHTML = maintenance.slice(0, 3).map(m => `
      <div class="notif-item" style="padding:var(--space-3) 0;">
        <span class="notif-icon ${m.severity === 'warning' ? '' : 'teal'}">!</span>
        <div class="notif-body">
          <h4>${esc(m.item)}</h4>
          <p class="cell-muted">${esc(m.vehicle)} • ${esc(m.dueValue)}</p>
        </div>
      </div>
    `).join("") || `<p class="cell-muted">No maintenance items due.</p>`;
  }

  /* ---------- Vehicles list ---------- */

  async function renderVehiclesList() {
    const list = document.getElementById("vehicles-list");
    if (!list) return;

    const vehicles = await API.getVehicles();
    if (!vehicles.length) {
      list.innerHTML = `<div class="empty-state"><h3>No vehicles yet</h3><p>Add your first vehicle to start booking services.</p></div>`;
      return;
    }
    list.innerHTML = vehicles.map(v => `
      <div class="vehicle-card">
        <div class="vehicle-thumb">${esc(v.brand.slice(0, 2).toUpperCase())}</div>
        <div class="vehicle-card-body">
          <h3>${esc(v.brand)} ${esc(v.model)} <span class="cell-muted" style="font-weight:400;font-size:var(--text-sm);">(${v.year})</span></h3>
          <p class="cell-muted">${esc(v.registration)} • ${v.mileage.toLocaleString()} km • ${esc(v.fuel)}</p>
        </div>
        <div class="vehicle-card-actions">
          <a href="vehicles_details.html?id=${v.id}" class="btn btn-secondary btn-sm">View details</a>
        </div>
      </div>
    `).join("");
  }

  /* ---------- Vehicle details ---------- */

  async function renderVehicleDetails() {
    const titleEl = document.getElementById("vehicle-title");
    if (!titleEl) return;

    const id = qs("id", "1");
    const [vehicle, bookings] = await Promise.all([API.getVehicleById(id), API.getBookings()]);

    if (!vehicle) {
      titleEl.textContent = "Vehicle not found";
      return;
    }

    titleEl.textContent = `${vehicle.brand} ${vehicle.model}`;
    document.getElementById("vehicle-sub").textContent = `${vehicle.registration} • ${vehicle.year}`;

    document.getElementById("vehicle-info-list").innerHTML = `
      <div class="info-row"><span>Registration</span><span>${esc(vehicle.registration)}</span></div>
      <div class="info-row"><span>Brand</span><span>${esc(vehicle.brand)}</span></div>
      <div class="info-row"><span>Model</span><span>${esc(vehicle.model)}</span></div>
      <div class="info-row"><span>Year</span><span>${vehicle.year}</span></div>
      <div class="info-row"><span>Fuel type</span><span>${esc(vehicle.fuel)}</span></div>
      <div class="info-row"><span>Current mileage</span><span>${vehicle.mileage.toLocaleString()} km</span></div>
      <div class="info-row"><span>Status</span><span>${badge("Completed")}</span></div>
    `;

    const history = bookings.filter(b => String(b.vehicleId) === String(vehicle.id));
    const tbody = document.getElementById("vehicle-service-tbody");
    tbody.innerHTML = history.length ? history.map(b => `
      <tr>
        <td class="cell-strong">${b.id}</td>
        <td>${esc(b.service)}</td>
        <td class="cell-muted">${formatDate(b.date)}</td>
        <td>${badge(b.status)}</td>
        <td class="row-actions"><a href="booking_detail.html?id=${b.id}" class="btn btn-ghost btn-sm">View</a></td>
      </tr>
    `).join("") : `<tr><td colspan="5" class="cell-muted">No service records for this vehicle yet.</td></tr>`;

    const bookBtn = document.getElementById("vehicle-book-btn");
    if (bookBtn) bookBtn.href = `book_service.html?vehicle=${vehicle.id}`;
  }

  /* ---------- Add vehicle ---------- */

  function initAddVehicleForm() {
    const form = document.getElementById("add-vehicle-form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      let valid = true;
      ["registration", "brand", "model", "year", "fuel", "mileage"].forEach(function (name) {
        const input = form.elements[name];
        const group = input.closest(".form-group");
        const ok = input.checkValidity();
        group.classList.toggle("field-error", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      const data = {
        registration: form.elements.registration.value.trim(),
        brand: form.elements.brand.value.trim(),
        model: form.elements.model.value.trim(),
        year: Number(form.elements.year.value),
        fuel: form.elements.fuel.value,
        mileage: Number(form.elements.mileage.value)
      };

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";

      try {
        await API.createVehicle(data);
        showToast(`${data.brand} ${data.model} added to your garage.`, "success");
        setTimeout(function () { window.location.href = "vehicles.html"; }, 700);
      } catch (err) {
        showToast("Couldn't save the vehicle. Try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Save vehicle";
      }
    });
  }

  /* ---------- Book service ---------- */

  async function initBookServiceForm() {
    const form = document.getElementById("book-service-form");
    if (!form) return;

    const [vehicles, serviceTypes] = await Promise.all([API.getVehicles(), API.getServiceTypes()]);

    const vehicleSelect = form.elements.vehicleId;
    vehicleSelect.innerHTML = vehicles.map(v =>
      `<option value="${v.id}">${esc(v.brand)} ${esc(v.model)} (${esc(v.registration)})</option>`
    ).join("");
    const preselect = qs("vehicle", null);
    if (preselect) vehicleSelect.value = preselect;

    const serviceSelect = form.elements.serviceTypeId;
    serviceSelect.innerHTML = serviceTypes.map(s =>
      `<option value="${s.id}" data-price="${s.price}" data-duration="${esc(s.duration)}">${esc(s.name)}</option>`
    ).join("");

    const summaryVehicle = document.getElementById("summary-vehicle");
    const summaryService = document.getElementById("summary-service");
    const summaryDuration = document.getElementById("summary-duration");
    const summaryPrice = document.getElementById("summary-price");
    const summaryDate = document.getElementById("summary-date");

    function updateSummary() {
      const v = vehicles.find(v => String(v.id) === vehicleSelect.value);
      const opt = serviceSelect.options[serviceSelect.selectedIndex];
      if (v) summaryVehicle.textContent = `${v.brand} ${v.model} (${v.registration})`;
      if (opt) {
        summaryService.textContent = opt.textContent;
        summaryDuration.textContent = opt.getAttribute("data-duration");
        summaryPrice.textContent = money(opt.getAttribute("data-price"));
      }
      summaryDate.textContent = form.elements.date.value ? formatDate(form.elements.date.value) : "—";
    }
    vehicleSelect.addEventListener("change", updateSummary);
    serviceSelect.addEventListener("change", updateSummary);
    form.elements.date.addEventListener("change", updateSummary);
    updateSummary();

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const v = vehicles.find(v => String(v.id) === vehicleSelect.value);
      const opt = serviceSelect.options[serviceSelect.selectedIndex];

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Booking…";

      try {
        const booking = await API.createBooking({
          vehicleId: v.id,
          vehicle: `${v.brand} ${v.model} (${v.registration})`,
          service: opt.textContent,
          date: form.elements.date.value,
          time: form.elements.time.value,
          notes: form.elements.notes.value.trim(),
          cost: Number(opt.getAttribute("data-price"))
        });
        showToast(`Booking ${booking.id} requested.`, "success");
        setTimeout(function () { window.location.href = "booking.html"; }, 700);
      } catch (err) {
        showToast("Couldn't create the booking. Try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Confirm booking";
      }
    });
  }

  /* ---------- My bookings (list) ---------- */

  async function renderBookingsList() {
    const tbody = document.getElementById("bookings-tbody");
    if (!tbody) return;

    const bookings = (await API.getBookings()).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    function draw(filter) {
      const rows = filter === "All" ? bookings : bookings.filter(b => b.status === filter);
      tbody.innerHTML = rows.length ? rows.map(b => `
        <tr>
          <td class="cell-strong">${b.id}</td>
          <td>${esc(b.vehicle)}</td>
          <td>${esc(b.service)}</td>
          <td class="cell-muted">${formatDate(b.date)} • ${esc(b.time || "")}</td>
          <td>${badge(b.status)}</td>
          <td class="row-actions"><a href="booking_detail.html?id=${b.id}" class="btn btn-ghost btn-sm">View</a></td>
        </tr>
      `).join("") : `<tr><td colspan="6" class="cell-muted" style="text-align:center;padding:var(--space-6);">No bookings in this filter.</td></tr>`;
    }

    document.querySelectorAll("[data-booking-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll("[data-booking-filter]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        draw(chip.getAttribute("data-booking-filter"));
      });
    });

    draw("All");
  }

  /* ---------- Booking detail ---------- */

  const STEP_ORDER = ["Pending", "Confirmed", "In Progress", "Completed"];

  async function renderBookingDetail() {
    const idEl = document.getElementById("booking-id");
    if (!idEl) return;

    const id = qs("id", "BK-1001");
    const booking = await API.getBookingById(id);
    if (!booking) {
      idEl.textContent = "Booking not found";
      return;
    }

    idEl.textContent = booking.id;
    const badgeSlot = document.getElementById("booking-status-badge");
    badgeSlot.outerHTML = badge(booking.status).replace("<span", '<span id="booking-status-badge"');

    document.getElementById("booking-info-list").innerHTML = `
      <div class="info-row"><span>Vehicle</span><span>${esc(booking.vehicle)}</span></div>
      <div class="info-row"><span>Service</span><span>${esc(booking.service)}</span></div>
      <div class="info-row"><span>Date &amp; time</span><span>${formatDate(booking.date)} • ${esc(booking.time || "—")}</span></div>
      <div class="info-row"><span>Mechanic</span><span>${esc(booking.mechanic || "Unassigned")}</span></div>
      <div class="info-row"><span>Estimated cost</span><span>${money(booking.cost)}</span></div>
    `;

    const notesEl = document.getElementById("booking-notes");
    notesEl.textContent = booking.notes || "No notes added for this booking.";

    const timeline = document.getElementById("booking-timeline");
    if (booking.status === "Cancelled") {
      timeline.innerHTML = `<li class="timeline-item is-done"><span class="timeline-dot"></span><h4>Booking cancelled</h4><p>This booking was cancelled.</p></li>`;
    } else {
      const currentIdx = STEP_ORDER.indexOf(booking.status);
      timeline.innerHTML = STEP_ORDER.map(function (step, i) {
        const cls = i < currentIdx ? "is-done" : i === currentIdx ? (step === "Completed" ? "is-done" : "is-current") : "";
        return `<li class="timeline-item ${cls}"><span class="timeline-dot"></span><h4>${step}</h4></li>`;
      }).join("");
    }

    const invoiceLink = document.getElementById("booking-invoice-link");
    if (invoiceLink) {
      if (booking.status === "Completed") {
        const invoices = await API.getInvoices();
        const inv = invoices.find(i => i.bookingId === booking.id);
        if (inv) {
          invoiceLink.href = `invoice_details.html?id=${inv.id}`;
          invoiceLink.style.display = "";
        }
      } else {
        invoiceLink.style.display = "none";
      }
    }
  }

  /* ---------- Service history ---------- */

  async function renderServiceHistory() {
    const tbody = document.getElementById("history-tbody");
    if (!tbody) return;

    const history = await API.getServiceHistory();
    tbody.innerHTML = history.length ? history.map(b => `
      <tr>
        <td class="cell-muted">${formatDate(b.date)}</td>
        <td class="cell-strong">${esc(b.vehicle)}</td>
        <td>${esc(b.service)}</td>
        <td>${esc(b.mechanic || "—")}</td>
        <td>${money(b.cost)}</td>
        <td class="row-actions"><a href="booking_detail.html?id=${b.id}" class="btn btn-ghost btn-sm">Details</a></td>
      </tr>
    `).join("") : `<tr><td colspan="6" class="cell-muted" style="text-align:center;padding:var(--space-6);">No completed services yet.</td></tr>`;
  }

  /* ---------- Maintenance ---------- */

  async function renderMaintenance() {
    const list = document.getElementById("maintenance-list");
    if (!list) return;

    const items = await API.getMaintenanceItems();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><h3>All caught up</h3><p>No maintenance items need attention right now.</p></div>`;
      return;
    }
    list.innerHTML = items.map(m => `
      <div class="notif-item">
        <span class="notif-icon ${m.severity === "warning" ? "" : "teal"}">${m.severity === "ok" ? "✓" : "!"}</span>
        <div class="notif-body" style="flex:1;">
          <h4>${esc(m.item)}</h4>
          <p class="cell-muted">${esc(m.vehicle)}</p>
          <p style="margin-top:4px;">${esc(m.dueValue)}</p>
        </div>
        <a href="book_service.html?vehicle=${m.vehicleId}" class="btn btn-secondary btn-sm" style="align-self:center;">Book service</a>
      </div>`
    ).join("");
  }

  /* ---------- Invoices list ---------- */

  async function renderInvoicesList() {
    const tbody = document.getElementById("invoices-tbody");
    if (!tbody) return;

    const invoices = (await API.getInvoices()).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    tbody.innerHTML = invoices.length ? invoices.map(i => `
      <tr>
        <td class="cell-strong">${i.id}</td>
        <td class="cell-muted">${formatDate(i.date)}</td>
        <td>${esc(i.vehicle)}</td>
        <td>${money(i.amount)}</td>
        <td>${badge(i.status)}</td>
        <td class="row-actions"><a href="invoice_details.html?id=${i.id}" class="btn btn-ghost btn-sm">View</a></td>
      </tr>
    `).join("") : `<tr><td colspan="6" class="cell-muted" style="text-align:center;padding:var(--space-6);">No invoices yet.</td></tr>`;
  }

  /* ---------- Invoice details ---------- */

  async function renderInvoiceDetails() {
    const idEl = document.getElementById("invoice-id");
    if (!idEl) return;

    const id = qs("id", "INV-2026-089");
    const invoice = await API.getInvoiceById(id);
    if (!invoice) {
      idEl.textContent = "Invoice not found";
      return;
    }

    idEl.textContent = invoice.id;
    document.getElementById("invoice-date").textContent = formatDate(invoice.date);
    document.getElementById("invoice-vehicle").textContent = invoice.vehicle;
    const statusSlot = document.getElementById("invoice-status");
    statusSlot.outerHTML = badge(invoice.status).replace("<span", '<span id="invoice-status"');

    const profile = await API.getProfile();
    document.getElementById("invoice-customer-name").textContent = profile.name;
    document.getElementById("invoice-customer-phone").textContent = profile.phone;
    document.getElementById("invoice-customer-email").textContent = profile.email;

    const tbody = document.getElementById("invoice-items-tbody");
    tbody.innerHTML = invoice.items.map(it => `
      <tr>
        <td>${esc(it.desc)}</td>
        <td style="text-align:center;">${it.qty}</td>
        <td style="text-align:right;">${money(it.rate)}</td>
        <td style="text-align:right;">${money(it.amount)}</td>
      </tr>
    `).join("");

    document.getElementById("invoice-total").textContent = money(invoice.amount);
  }

  /* ---------- Notifications ---------- */

  async function renderNotifications() {
    const list = document.getElementById("notifications-list");
    if (!list) return;

    const items = await API.getNotifications();

    function draw() {
      list.innerHTML = items.length ? items.map(n => `
        <div class="notif-item ${n.read ? "" : "is-unread"}" data-notif-id="${n.id}">
          <span class="notif-icon ${n.type === "invoice" ? "teal" : ""}">${n.type === "invoice" ? "Rs" : n.type === "maintenance" ? "!" : "•"}</span>
          <div class="notif-body" style="flex:1;">
            <h4>${esc(n.title)}</h4>
            <p class="cell-muted">${esc(n.message)}</p>
          </div>
          <span class="notif-time">${esc(n.time)}</span>
        </div>
      `).join("") : `<div class="empty-state"><h3>No notifications</h3><p>You're all caught up.</p></div>`;
    }
    draw();

    const markAllBtn = document.getElementById("mark-all-read-btn");
    if (markAllBtn) {
      markAllBtn.addEventListener("click", async function () {
        await Promise.all(items.map(n => API.markNotificationRead(n.id)));
        items.forEach(n => n.read = true);
        draw();
        showToast("All notifications marked as read.", "success");
      });
    }
  }

  /* ---------- Profile ---------- */

  async function initProfileForm() {
    const form = document.getElementById("profile-form");
    if (!form) return;

    const profile = await API.getProfile();
    form.elements.name.value = profile.name;
    form.elements.email.value = profile.email;
    form.elements.phone.value = profile.phone;
    form.elements.address.value = profile.address || "";

    const memberSinceEl = document.getElementById("member-since");
    if (memberSinceEl) memberSinceEl.textContent = formatDate(profile.memberSince);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";
      try {
        await API.updateProfile({
          name: form.elements.name.value.trim(),
          email: form.elements.email.value.trim(),
          phone: form.elements.phone.value.trim(),
          address: form.elements.address.value.trim()
        });
        showToast("Profile updated.", "success");
      } catch (err) {
        showToast("Couldn't save your profile. Try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save changes";
      }
    });
  }

  /* ---------- Boot ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    renderDashboard();
    renderVehiclesList();
    renderVehicleDetails();
    initAddVehicleForm();
    initBookServiceForm();
    renderBookingsList();
    renderBookingDetail();
    renderServiceHistory();
    renderMaintenance();
    renderInvoicesList();
    renderInvoiceDetails();
    renderNotifications();
    initProfileForm();
  });
})();
