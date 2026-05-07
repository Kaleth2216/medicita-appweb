import { get } from '../utils/api.js';
import { requireAuth, getFullName } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('PATIENT');

function parseDateTime(dt) {
  if (Array.isArray(dt)) { const [y, mo, d, h = 0, mi = 0] = dt; return new Date(y, mo - 1, d, h, mi); }
  return new Date(dt);
}

function fmt(dt) {
  return parseDateTime(dt).toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_COLOR = {
  PENDING:   { bg: 'bg-warning bg-opacity-10', border: 'border-warning', icon: 'bi-clock text-warning' },
  CONFIRMED: { bg: 'bg-primary bg-opacity-10', border: 'border-primary', icon: 'bi-check-circle text-primary' },
  COMPLETED: { bg: 'bg-success bg-opacity-10', border: 'border-success', icon: 'bi-check-circle-fill text-success' },
  CANCELLED: { bg: 'bg-danger  bg-opacity-10', border: 'border-danger',  icon: 'bi-x-circle text-danger' },
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('dashboard');

  document.getElementById('greeting').textContent = `Hola, ${getFullName()}`;

  const spinner  = document.getElementById('spinner-area');
  const cardsArea = document.getElementById('cards-area');
  const emptyMsg  = document.getElementById('empty-msg');

  const result = await get('/patient/appointments?page=0&size=50').catch(() => null);
  const all = result?.content ?? (Array.isArray(result) ? result : []);

  spinner.classList.add('d-none');

  const upcoming = all
    .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .sort((a, b) => parseDateTime(a.appointmentDateTime) - parseDateTime(b.appointmentDateTime))
    .slice(0, 3);

  if (!upcoming.length) {
    emptyMsg.classList.remove('d-none');
    return;
  }

  cardsArea.classList.remove('d-none');
  cardsArea.innerHTML = upcoming.map(a => {
    const c = STATUS_COLOR[a.status] || { bg: '', border: 'border-secondary', icon: 'bi-calendar' };
    return `
      <div class="col-md-4">
        <div class="content-card border ${c.border} ${c.bg} h-100">
          <div class="d-flex align-items-start justify-content-between mb-2">
            <div>
              <div class="fw-bold">${a.doctorFullName}</div>
              <div class="text-muted small">${a.specialtyName}</div>
            </div>
            <i class="bi ${c.icon} fs-4"></i>
          </div>
          <div class="small text-muted mb-1"><i class="bi bi-calendar3 me-1"></i>${fmt(a.appointmentDateTime)}</div>
          ${a.reason ? `<div class="small text-muted"><i class="bi bi-chat-text me-1"></i>${a.reason}</div>` : ''}
        </div>
      </div>`;
  }).join('');
});
