import { get, put } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast, showConfirm } from '../utils/toast.js';

requireAuth('DOCTOR');

let appointments = [];

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

function canComplete(status) { return status === 'CONFIRMED' || status === 'PENDING'; }
function canCancel(status)   { return status === 'PENDING'   || status === 'CONFIRMED'; }

function renderTable() {
  const tbody = document.getElementById('appointments-tbody');
  if (!appointments.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay citas registradas.</td></tr>';
    return;
  }
  tbody.innerHTML = appointments
    .sort((a, b) => parseDateTime(b.appointmentDateTime) - parseDateTime(a.appointmentDateTime))
    .map(a => `
      <tr>
        <td>${fmt(a.appointmentDateTime)}</td>
        <td class="fw-semibold">${a.patientFullName}</td>
        <td>${a.reason || '–'}</td>
        <td>${a.notes || '<span class="text-muted">–</span>'}</td>
        <td>${statusBadge(a.status)}</td>
        <td>
          ${canComplete(a.status) ? `
            <button class="btn btn-sm btn-success me-1" onclick="openComplete('${a.id}')" title="Completar">
              <i class="bi bi-check-lg"></i>
            </button>` : ''}
          ${canCancel(a.status) ? `
            <button class="btn btn-sm btn-outline-danger" onclick="confirmCancel('${a.id}')" title="Cancelar">
              <i class="bi bi-x-lg"></i>
            </button>` : ''}
        </td>
      </tr>`).join('');
}

async function loadAppointments() {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');
  appointments = await get('/doctor/appointments').catch(() => []);
  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');
  renderTable();
}

window.openComplete = function (id) {
  document.getElementById('complete-id').value = id;
  document.getElementById('complete-notes').value = '';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('completeModal')).show();
};

window.confirmCancel = async function (id) {
  const ok = await showConfirm({
    title: 'Cancelar cita',
    message: '¿Seguro que deseas cancelar esta cita? El paciente será notificado.',
    confirmText: 'Sí, cancelar',
    cancelText: 'Volver',
    variant: 'danger',
  });
  if (!ok) return;
  try {
    await put(`/doctor/appointments/${id}/cancel`);
    showToast('Cita cancelada correctamente.', 'warning');
    await loadAppointments();
  } catch (err) {
    showToast(err.message || 'Error al cancelar la cita.');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('appointments');
  await loadAppointments();

  document.getElementById('btn-confirm-complete').addEventListener('click', async () => {
    const id    = document.getElementById('complete-id').value;
    const notes = document.getElementById('complete-notes').value.trim();
    const btn   = document.getElementById('btn-confirm-complete');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Cargando...';

    try {
      await put(`/doctor/appointments/${id}/complete`, notes ? { notes } : {});
      bootstrap.Modal.getOrCreateInstance(document.getElementById('completeModal')).hide();
      showToast('Cita marcada como completada.', 'success');
      await loadAppointments();
    } catch (err) {
      showToast(err.message || 'Error al completar la cita.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Marcar completada';
    }
  });
});
