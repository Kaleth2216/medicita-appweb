import { get } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('ADMIN');

function statusBadge(status) {
  const map = { PENDING: 'status-pending', CONFIRMED: 'status-confirmed', COMPLETED: 'status-completed', CANCELLED: 'status-cancelled' };
  return `<span class="badge ${map[status] || 'bg-secondary'}">${status}</span>`;
}

function parseDateTime(dt) {
  if (Array.isArray(dt)) {
    const [y, mo, d, h = 0, mi = 0] = dt;
    return new Date(y, mo - 1, d, h, mi);
  }
  return new Date(dt);
}

function fmt(dt) {
  return parseDateTime(dt).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('dashboard');

  const [stats, appointments] = await Promise.all([
    get('/admin/dashboard/stats').catch(() => null),
    get('/admin/appointments').catch(() => []),
  ]);

  // Stats cards
  const statsRow = document.getElementById('stats-row');
  if (stats) {
    statsRow.innerHTML = `
      ${card('bi-person-badge', 'bg-primary bg-opacity-10 text-primary', stats.totalDoctors, 'Médicos registrados')}
      ${card('bi-people', 'bg-success bg-opacity-10 text-success', stats.totalPatients, 'Pacientes registrados')}
      ${card('bi-calendar-check', 'bg-warning bg-opacity-10 text-warning', stats.pendingAppointments, 'Citas pendientes')}
      ${card('bi-calendar-x', 'bg-danger bg-opacity-10 text-danger', stats.pendingLeaves, 'Permisos pendientes')}
    `;
  } else {
    statsRow.innerHTML = '<div class="col text-danger">No se pudieron cargar las estadísticas.</div>';
  }

  // Appointments table
  const spinner = document.getElementById('table-spinner');
  const wrapper = document.getElementById('table-wrapper');
  const tbody   = document.getElementById('appointments-tbody');

  spinner.classList.add('d-none');
  wrapper.classList.remove('d-none');

  const list = Array.isArray(appointments) ? appointments.slice(0, 20) : [];
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay citas registradas.</td></tr>';
  } else {
    tbody.innerHTML = list.map(a => `
      <tr>
        <td>${a.patientFullName}</td>
        <td>${a.doctorFullName}</td>
        <td>${a.specialtyName}</td>
        <td>${fmt(a.appointmentDateTime)}</td>
        <td>${statusBadge(a.status)}</td>
      </tr>`).join('');
  }
});

function card(icon, iconClass, value, label) {
  return `
    <div class="col-sm-6 col-xl-3">
      <div class="stat-card">
        <div class="stat-icon ${iconClass}"><i class="bi ${icon}"></i></div>
        <div>
          <div class="stat-number">${value ?? '–'}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>
    </div>`;
}
