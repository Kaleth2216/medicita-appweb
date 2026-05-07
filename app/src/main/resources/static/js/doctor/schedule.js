import { get } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('DOCTOR');

const DAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS  = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function parseDateTime(dt) {
  if (Array.isArray(dt)) { const [y, mo, d, h = 0, mi = 0] = dt; return new Date(y, mo - 1, d, h, mi); }
  return new Date(dt);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

let weekStart = getMonday(new Date());

async function loadSchedule() {
  const spinner = document.getElementById('spinner-area');
  const area    = document.getElementById('schedule-area');
  spinner.classList.remove('d-none');
  area.classList.add('d-none');

  const weekEnd = addDays(weekStart, 5);
  document.getElementById('week-label').textContent =
    `${weekStart.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ` +
    `${weekEnd.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const appointments = await get(`/doctor/schedule?weekStart=${dateToISO(weekStart)}`).catch(() => []);

  spinner.classList.add('d-none');
  area.classList.remove('d-none');

  buildGrid(appointments || []);
}

function buildGrid(appointments) {
  // Build header row
  const header = document.getElementById('schedule-header');
  const weekDays = DAYS.map((_, i) => addDays(weekStart, i));
  header.innerHTML =
    '<th class="hour-col">Hora</th>' +
    weekDays.map((d, i) => `<th>${DAYS[i]}<br>
      <small class="fw-normal text-muted">${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</small>
    </th>`).join('');

  // Group appointments by [dayIndex][hour]
  const grid = {};
  for (const a of appointments) {
    const dt  = parseDateTime(a.appointmentDateTime);
    const dayOffset = Math.round((new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) - weekStart) / 86400000);
    if (dayOffset < 0 || dayOffset > 5) continue;
    const hour = dt.getHours();
    if (!grid[dayOffset]) grid[dayOffset] = {};
    if (!grid[dayOffset][hour]) grid[dayOffset][hour] = [];
    grid[dayOffset][hour].push(a);
  }

  // Build body
  const tbody = document.getElementById('schedule-body');
  tbody.innerHTML = HOURS.map(h => `
    <tr>
      <td class="hour-col">${String(h).padStart(2, '0')}:00</td>
      ${weekDays.map((_, di) => {
        const appts = grid[di]?.[h] || [];
        return `<td>${appts.map(a => {
          const dt = parseDateTime(a.appointmentDateTime);
          const time = dt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
          const cls = a.status.toLowerCase();
          return `<div class="appt-chip status-${cls}" title="${a.patientFullName} – ${a.reason || ''}">
            <strong>${time}</strong> ${a.patientFullName}
          </div>`;
        }).join('')}</td>`;
      }).join('')}
    </tr>`).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('schedule');

  // Restore weekStart from URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get('weekStart')) {
    weekStart = getMonday(new Date(params.get('weekStart') + 'T00:00:00'));
  }

  await loadSchedule();

  document.getElementById('btn-prev').addEventListener('click', async () => {
    weekStart = addDays(weekStart, -7);
    history.replaceState(null, '', `?weekStart=${dateToISO(weekStart)}`);
    await loadSchedule();
  });

  document.getElementById('btn-next').addEventListener('click', async () => {
    weekStart = addDays(weekStart, 7);
    history.replaceState(null, '', `?weekStart=${dateToISO(weekStart)}`);
    await loadSchedule();
  });
});
