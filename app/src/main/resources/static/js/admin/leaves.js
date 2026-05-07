import { get, put } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('ADMIN');

let leaves = [];

const alertBox = document.getElementById('alert-box');
const alertMsg = document.getElementById('alert-msg');

function showAlert(msg, type = 'danger') {
  alertBox.className = `alert alert-${type} alert-dismissible fade show mb-3`;
  alertMsg.textContent = msg;
}

const LEAVE_LABELS = { SICK_LEAVE: 'Incapacidad', VACATION: 'Vacaciones', PERSONAL: 'Personal' };
const STATUS_MAP   = { PENDING: 'status-pending', APPROVED: 'status-confirmed', REJECTED: 'status-cancelled' };

function parseDate(d) {
  if (Array.isArray(d)) { const [y, mo, day] = d; return new Date(y, mo - 1, day); }
  return new Date(d + 'T00:00:00');
}

function fmtDate(d) {
  return parseDate(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderTable() {
  const tbody = document.getElementById('leaves-tbody');
  if (!leaves.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay permisos pendientes.</td></tr>';
    return;
  }
  tbody.innerHTML = leaves.map(l => `
    <tr>
      <td class="fw-semibold">${l.doctorFullName}</td>
      <td>${LEAVE_LABELS[l.type] || l.type}</td>
      <td>${fmtDate(l.startDate)}</td>
      <td>${fmtDate(l.endDate)}</td>
      <td class="text-truncate" style="max-width:200px" title="${l.reason}">${l.reason}</td>
      <td><span class="badge ${STATUS_MAP[l.status] || 'bg-secondary'}">${l.status}</span></td>
      <td>
        ${l.status === 'PENDING' ? `
          <button class="btn btn-sm btn-success me-1" onclick="approveLeave('${l.id}')">
            <i class="bi bi-check-lg"></i> Aprobar
          </button>
          <button class="btn btn-sm btn-danger" onclick="rejectLeave('${l.id}')">
            <i class="bi bi-x-lg"></i> Rechazar
          </button>` : '<span class="text-muted small">–</span>'}
      </td>
    </tr>`).join('');
}

async function loadLeaves() {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');
  leaves = await get('/admin/leaves').catch(() => []);
  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');
  renderTable();
}

window.approveLeave = async function (id) {
  if (!confirm('¿Aprobar este permiso?')) return;
  try {
    await put(`/admin/leaves/${id}/approve`);
    showAlert('Permiso aprobado.', 'success');
    await loadLeaves();
  } catch (err) {
    showAlert(err.message || 'Error al aprobar.');
  }
};

window.rejectLeave = async function (id) {
  if (!confirm('¿Rechazar este permiso?')) return;
  try {
    await put(`/admin/leaves/${id}/reject`);
    showAlert('Permiso rechazado.', 'warning');
    await loadLeaves();
  } catch (err) {
    showAlert(err.message || 'Error al rechazar.');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('leaves');
  await loadLeaves();
});
