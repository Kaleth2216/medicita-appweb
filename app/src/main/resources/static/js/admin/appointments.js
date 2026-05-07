import { get } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('ADMIN');

let allAppointments = [];

function parseDateTime(dt) {
  if (Array.isArray(dt)) { const [y, mo, d, h = 0, mi = 0] = dt; return new Date(y, mo - 1, d, h, mi); }
  return new Date(dt);
}

function fmt(dt) {
  return parseDateTime(dt).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status) {
  const map = { PENDING: 'status-pending', CONFIRMED: 'status-confirmed', COMPLETED: 'status-completed', CANCELLED: 'status-cancelled' };
  return `<span class="badge ${map[status] || 'bg-secondary'}">${status}</span>`;
}

function renderTable(list) {
  const tbody = document.getElementById('appointments-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay citas con ese filtro.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(a => `
    <tr>
      <td>${a.patientFullName}</td>
      <td>${a.doctorFullName}</td>
      <td>${a.specialtyName}</td>
      <td>${fmt(a.appointmentDateTime)}</td>
      <td class="text-truncate" style="max-width:180px" title="${a.reason || ''}">${a.reason || '–'}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>`).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('appointments');

  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');

  allAppointments = await get('/admin/appointments').catch(() => []);

  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');
  renderTable(allAppointments);

  document.getElementById('filter-status').addEventListener('change', (e) => {
    const val = e.target.value;
    renderTable(val ? allAppointments.filter(a => a.status === val) : allAppointments);
  });
});
