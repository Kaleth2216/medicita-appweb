import { get, put } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast, showConfirm } from '../utils/toast.js';

requireAuth('ADMIN');

let leaves = [];

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
          <button class="btn btn-sm btn-success me-1" onclick="approveLeave('${l.id}')" title="Aprobar">
            <i class="bi bi-check-lg"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="rejectLeave('${l.id}')" title="Rechazar">
            <i class="bi bi-x-lg"></i>
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
  const ok = await showConfirm({
    title: 'Aprobar permiso',
    message: '¿Deseas aprobar esta solicitud de permiso? El médico será notificado.',
    confirmText: 'Sí, aprobar',
    cancelText: 'Cancelar',
    variant: 'success',
    icon: 'bi-check-circle-fill',
  });
  if (!ok) return;
  try {
    await put(`/admin/leaves/${id}/approve`);
    showToast('Permiso aprobado correctamente.', 'success');
    await loadLeaves();
  } catch (err) {
    showToast(err.message || 'Error al aprobar el permiso.');
  }
};

window.rejectLeave = async function (id) {
  const ok = await showConfirm({
    title: 'Rechazar permiso',
    message: '¿Deseas rechazar esta solicitud de permiso?',
    confirmText: 'Sí, rechazar',
    cancelText: 'Cancelar',
    variant: 'danger',
    icon: 'bi-x-circle-fill',
  });
  if (!ok) return;
  try {
    await put(`/admin/leaves/${id}/reject`);
    showToast('Permiso rechazado.', 'warning');
    await loadLeaves();
  } catch (err) {
    showToast(err.message || 'Error al rechazar el permiso.');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('leaves');
  await loadLeaves();
});
