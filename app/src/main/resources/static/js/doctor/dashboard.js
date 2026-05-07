import { get } from '../utils/api.js';
import { requireAuth, getFullName } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('DOCTOR');

function parseDateTime(dt) {
  if (Array.isArray(dt)) { const [y, mo, d, h = 0, mi = 0] = dt; return new Date(y, mo - 1, d, h, mi); }
  return new Date(dt);
}

function statusBadge(status) {
  const map = { PENDING: 'status-pending', CONFIRMED: 'status-confirmed', COMPLETED: 'status-completed', CANCELLED: 'status-cancelled' };
  return `<span class="badge ${map[status] || 'bg-secondary'}">${status}</span>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('dashboard');

  document.getElementById('greeting').textContent = `Hola, ${getFullName()}`;

  const today = new Date();
  document.getElementById('today-label').textContent =
    today.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const spinner = document.getElementById('table-spinner');
  const wrapper = document.getElementById('table-wrapper');
  const tbody   = document.getElementById('today-tbody');

  const appointments = await get('/doctor/appointments').catch(() => []);

  spinner.classList.add('d-none');
  wrapper.classList.remove('d-none');

  const todayStr = today.toISOString().slice(0, 10);
  const todayAppts = (appointments || []).filter(a => {
    const dt = parseDateTime(a.appointmentDateTime);
    return dt.toISOString().slice(0, 10) === todayStr;
  });

  if (!todayAppts.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay citas para hoy.</td></tr>';
    return;
  }

  tbody.innerHTML = todayAppts
    .sort((a, b) => parseDateTime(a.appointmentDateTime) - parseDateTime(b.appointmentDateTime))
    .map(a => {
      const dt = parseDateTime(a.appointmentDateTime);
      return `
        <tr>
          <td class="fw-semibold">${dt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
          <td>${a.patientFullName}</td>
          <td>${a.reason || '–'}</td>
          <td>${statusBadge(a.status)}</td>
        </tr>`;
    }).join('');
});
