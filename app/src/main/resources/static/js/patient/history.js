import { get } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('PATIENT');

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

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('history');

  const spinner = document.getElementById('table-spinner');
  const wrapper = document.getElementById('table-wrapper');
  const tbody   = document.getElementById('history-tbody');

  const all = await get('/patient/appointments/history').catch(() => []);

  spinner.classList.add('d-none');
  wrapper.classList.remove('d-none');

  const history = (all || [])
    .filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED')
    .sort((a, b) => parseDateTime(b.appointmentDateTime) - parseDateTime(a.appointmentDateTime));

  if (!history.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay citas en tu historial.</td></tr>';
    return;
  }

  tbody.innerHTML = history.map(a => `
    <tr>
      <td class="fw-semibold">${a.doctorFullName}</td>
      <td>${a.specialtyName}</td>
      <td>${fmt(a.appointmentDateTime)}</td>
      <td>${a.reason || '–'}</td>
      <td>${a.notes
        ? `<span title="${a.notes}" class="text-truncate d-inline-block" style="max-width:180px">${a.notes}</span>`
        : '<span class="text-muted">–</span>'}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>`).join('');
});
