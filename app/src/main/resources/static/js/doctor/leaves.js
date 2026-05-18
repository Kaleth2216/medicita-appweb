import { get, post } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast } from '../utils/toast.js';

requireAuth('DOCTOR');

let leaves = [];

const modalAlert = document.getElementById('modal-alert');

const LEAVE_LABELS  = { SICK_LEAVE: 'Incapacidad', VACATION: 'Vacaciones', PERSONAL: 'Personal' };
const STATUS_BADGE  = { PENDING: 'status-pending', APPROVED: 'status-confirmed', REJECTED: 'status-cancelled' };

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
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No has solicitado permisos aún.</td></tr>';
    return;
  }
  tbody.innerHTML = leaves.map(l => `
    <tr>
      <td>${LEAVE_LABELS[l.type] || l.type}</td>
      <td>${fmtDate(l.startDate)}</td>
      <td>${fmtDate(l.endDate)}</td>
      <td class="text-truncate" style="max-width:200px" title="${l.reason}">${l.reason}</td>
      <td><span class="badge ${STATUS_BADGE[l.status] || 'bg-secondary'}">${l.status}</span></td>
    </tr>`).join('');
}

async function loadLeaves() {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');
  leaves = await get('/doctor/leaves').catch(() => []);
  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');
  renderTable();
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('leaves');
  await loadLeaves();

  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('l-startDate').min = today;
  document.getElementById('l-endDate').min   = today;

  document.getElementById('l-startDate').addEventListener('change', (e) => {
    document.getElementById('l-endDate').min = e.target.value;
  });

  document.getElementById('leave-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save');

    const type      = document.getElementById('l-type').value;
    const startDate = document.getElementById('l-startDate').value;
    const endDate   = document.getElementById('l-endDate').value;
    const reason    = document.getElementById('l-reason').value.trim();

    if (!type || !startDate || !endDate || !reason) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = 'Completa todos los campos obligatorios.';
      return;
    }
    if (endDate < startDate) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = 'La fecha de fin no puede ser anterior a la de inicio.';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Enviando...';
    modalAlert.className = 'alert alert-danger d-none';

    try {
      await post('/doctor/leaves', { type, startDate, endDate, reason });
      bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveModal')).hide();
      showToast('Solicitud enviada. Espera la aprobación del administrador.', 'success');
      document.getElementById('leave-form').reset();
      await loadLeaves();
    } catch (err) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = err.message || 'Error al enviar solicitud.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send me-1"></i>Enviar solicitud';
    }
  });
});
