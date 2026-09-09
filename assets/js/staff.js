/* AutoCare Phase 5 - Staff interactions */
(function () {
  'use strict';
  const q = s => document.querySelector(s);
  const qs = s => Array.from(document.querySelectorAll(s));
  const money = n => 'Rs. ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const badge = status => `<span class="badge ${status === 'Completed' ? 'badge-complete' : status === 'In Progress' || status === 'In progress' ? 'badge-progress' : 'badge-pending'}">${esc(status)}</span>`;

  function requireStaff() { const u = window.AutoCareAuth && AutoCareAuth.currentUser(); if (u && (u.role === 'staff' || u.role === 'admin')) return u; return null; }
  async function renderJobs() {
    const table = q('.data-table tbody'); if (!table || !location.pathname.includes('/staff/jobs')) return;
    const bookings = await API.getBookings();
    const search = q('.filter-bar input'); const status = q('.filter-bar select');
    function draw() {
      const term = (search && search.value || '').toLowerCase(); const selected = status && status.value || 'All statuses';
      const rows = bookings.filter(b => (!term || `${b.id} ${b.vehicle} ${b.service}`.toLowerCase().includes(term)) && (selected === 'All statuses' || b.status === selected || (selected === 'In progress' && b.status === 'In Progress')));
      table.innerHTML = rows.map(b => `<tr><td>${esc(b.id)}</td><td>Customer #${esc(b.customerId)}</td><td>${esc(b.vehicle)}</td><td>${esc(b.service)}</td><td>${esc(b.date)}</td><td>${badge(b.status)}</td><td><a class="btn btn-secondary" href="job-details.html?id=${encodeURIComponent(b.id)}">Open</a></td></tr>`).join('') || '<tr><td colspan="7">No jobs found.</td></tr>';
    }
    search && search.addEventListener('input', draw); status && status.addEventListener('change', draw); draw();
  }
  async function renderJobDetails() {
    if (!location.pathname.includes('/staff/job-details') || location.pathname.includes('/staff/jobs_detail')) return;
    const id = new URLSearchParams(location.search).get('id') || 'BK-1001'; const b = await API.getBookingById(id); if (!b) return;
    const body = document.querySelector('.dash-content'); if (!body) return;
    const old = body.querySelector('[data-phase5-job]'); if (old) old.remove();
    const box = document.createElement('div'); box.setAttribute('data-phase5-job',''); box.className = 'table-wrap panel'; box.style.marginTop = '20px';
    box.innerHTML = `<div class="table-wrap-head"><h3>Live job controls</h3></div><div class="panel-body"><div class="info-list"><div><span>Booking</span><strong>${esc(b.id)}</strong></div><div><span>Vehicle</span><strong>${esc(b.vehicle)}</strong></div><div><span>Service</span><strong>${esc(b.service)}</strong></div><div><span>Status</span><strong>${badge(b.status)}</strong></div></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn btn-secondary" data-job-status="Confirmed">Confirm</button><button class="btn btn-secondary" data-job-status="In Progress">Start service</button><button class="btn btn-primary" data-job-status="Completed">Complete</button></div></div>`;
    body.appendChild(box);
    box.querySelectorAll('[data-job-status]').forEach(btn => btn.addEventListener('click', async () => { await API.updateBookingStatus(id, btn.dataset.jobStatus); if (window.showToast) showToast('Job status updated.'); renderJobDetails(); }));
  }
  function bindInspection() {
    if (!location.pathname.includes('/staff/inspection')) return;
    const panel = q('.panel-body'); if (!panel) return; const save = Array.from(panel.querySelectorAll('a.btn')).find(x => /save inspection/i.test(x.textContent)); if (!save) return;
    save.addEventListener('click', async e => { e.preventDefault(); const checks = Array.from(panel.querySelectorAll('input[type=checkbox]')).map(x => ({ item: x.parentElement.textContent.trim(), checked: x.checked })); const select = panel.querySelector('select'); const textarea = panel.querySelector('textarea'); const id = new URLSearchParams(location.search).get('id') || 'BK-1001'; await API.saveInspection({ bookingId: id, condition: select ? select.value : 'Good', notes: textarea ? textarea.value.trim() : '', checks }); await API.updateBookingStatus(id, 'In Progress'); if (window.showToast) showToast('Inspection saved.'); });
  }
  function bindServiceWork() {
    if (!location.pathname.includes('/staff/service_work') || location.pathname.includes('/staff/service-work')) return;
    const main = document.querySelector('.dash-content'); if (!main) return; const save = Array.from(main.querySelectorAll('a.btn')).find(x => /save progress/i.test(x.textContent)); if (!save) return;
    save.addEventListener('click', async e => { e.preventDefault(); const boxes = Array.from(main.querySelectorAll('.check-item input')).map(x => ({ item: x.parentElement.textContent.trim(), checked: x.checked })); const inputs = main.querySelectorAll('input.form-control'); const id = new URLSearchParams(location.search).get('id') || 'BK-1001'; await API.saveServiceWork({ bookingId: id, tasks: boxes, parts: inputs[0] ? inputs[0].value : '', notes: inputs[1] ? inputs[1].value : '' }); await API.updateBookingStatus(id, 'In Progress'); if (window.showToast) showToast('Service progress saved.'); });
  }
  function bindComplete() {
    if (!location.pathname.includes('/staff/complete_service') || location.pathname.includes('/staff/complete-service')) return;
    const main = document.querySelector('.dash-content'); if (!main) return; const button = Array.from(main.querySelectorAll('a.btn')).find(x => /mark service complete/i.test(x.textContent)); if (!button) return;
    button.addEventListener('click', async e => { e.preventDefault(); const checks = Array.from(main.querySelectorAll('.check-item input')).every(x => x.checked); if (!checks) { if (window.showToast) showToast('Complete both final checks first.', 'error'); return; } const notes = main.querySelector('textarea'); const id = new URLSearchParams(location.search).get('id') || 'BK-1001'; await API.updateBookingStatus(id, 'Completed'); await API.saveServiceWork({ bookingId: id, completed: true, finalNotes: notes ? notes.value : '' }); if (window.showToast) showToast('Service marked as completed.'); });
  }
  document.addEventListener('DOMContentLoaded', function () { requireStaff(); renderJobs(); renderJobDetails(); bindInspection(); bindServiceWork(); bindComplete(); });
})();
