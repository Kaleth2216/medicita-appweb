import { get, post, put } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast, showConfirm } from '../utils/toast.js';

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

// ── Active appointments table ─────────────────────────────────────────────

let currentPage = 0;
let totalPages  = 1;

async function loadAppointments(page = 0) {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');

  const data = await get(`/patient/appointments?page=${page}&size=10`).catch(() => null);

  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');

  const content    = data?.content ?? [];
  totalPages       = data?.totalPages ?? 1;
  currentPage      = data?.page ?? page;
  const total      = data?.totalElements ?? content.length;

  document.getElementById('page-info').textContent =
    `Mostrando página ${currentPage + 1} de ${totalPages} (${total} cita${total !== 1 ? 's' : ''})`;
  document.getElementById('btn-prev-page').disabled = currentPage === 0;
  document.getElementById('btn-next-page').disabled = currentPage >= totalPages - 1;

  const active = content.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
  const tbody  = document.getElementById('appts-tbody');

  if (!active.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No tienes citas activas.</td></tr>';
    return;
  }

  tbody.innerHTML = active.map(a => `
    <tr>
      <td class="fw-semibold">${a.doctorFullName}</td>
      <td>${a.specialtyName}</td>
      <td>${fmt(a.appointmentDateTime)}</td>
      <td>${a.reason || '–'}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="cancelAppt('${a.id}')">
          <i class="bi bi-x-lg"></i>
        </button>
      </td>
    </tr>`).join('');
}

window.cancelAppt = async function (id) {
  const ok = await showConfirm({
    title: 'Cancelar cita',
    message: '¿Seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.',
    confirmText: 'Sí, cancelar',
    cancelText: 'No, mantener',
    variant: 'danger',
  });
  if (!ok) return;
  try {
    await put(`/patient/appointments/${id}/cancel`);
    showToast('Cita cancelada correctamente.', 'warning');
    await loadAppointments(currentPage);
  } catch (err) {
    showToast(err.message || 'Error al cancelar la cita.');
  }
};

// ── Wizard ────────────────────────────────────────────────────────────────

let selectedSpecialtyId = null;
let selectedDoctorId    = null;

function setStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step-${i}`).classList.toggle('d-none', i !== n);
    const pill = document.getElementById(`step-${i}-pill`);
    pill.classList.toggle('active', i === n);
    pill.classList.toggle('done',   i < n);
  });
}

async function loadSpecialties() {
  const specialties = await get('/public/specialties').catch(() => []);
  const sel = document.getElementById('sel-specialty');
  sel.innerHTML = '<option value="">Selecciona una especialidad</option>' +
    (specialties || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function loadDoctors(specialtyId) {
  const spinner = document.getElementById('doctors-spinner');
  const sel     = document.getElementById('sel-doctor');
  spinner.classList.remove('d-none');
  sel.classList.add('d-none');
  document.getElementById('btn-step2-next').disabled = true;

  const doctors = await get(`/public/specialties/${specialtyId}/doctors`).catch(() => []);

  spinner.classList.add('d-none');
  sel.classList.remove('d-none');
  sel.innerHTML = '<option value="">Selecciona un médico</option>' +
    (doctors || []).map(d => `<option value="${d.id}">${d.firstName} ${d.lastName}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('appointments');
  await loadAppointments(0);
  await loadSpecialties();

  document.getElementById('btn-prev-page').addEventListener('click', () => loadAppointments(currentPage - 1));
  document.getElementById('btn-next-page').addEventListener('click', () => loadAppointments(currentPage + 1));

  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  document.getElementById('appt-datetime').min = now.toISOString().slice(0, 16);

  document.getElementById('sel-specialty').addEventListener('change', (e) => {
    document.getElementById('btn-step1-next').disabled = !e.target.value;
  });

  document.getElementById('btn-step1-next').addEventListener('click', async () => {
    selectedSpecialtyId = document.getElementById('sel-specialty').value;
    setStep(2);
    await loadDoctors(selectedSpecialtyId);
  });

  document.getElementById('sel-doctor').addEventListener('change', (e) => {
    document.getElementById('btn-step2-next').disabled = !e.target.value;
  });

  document.getElementById('btn-step2-back').addEventListener('click', () => setStep(1));

  document.getElementById('btn-step2-next').addEventListener('click', () => {
    selectedDoctorId = document.getElementById('sel-doctor').value;
    setStep(3);
  });

  document.getElementById('btn-step3-back').addEventListener('click', () => setStep(2));

  document.getElementById('btn-book').addEventListener('click', async () => {
    const datetimeVal = document.getElementById('appt-datetime').value;
    const reason      = document.getElementById('appt-reason').value.trim();
    const btn         = document.getElementById('btn-book');

    if (!datetimeVal || !reason) {
      showToast('Completa la fecha/hora y el motivo.', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Agendando...';

    try {
      const appointmentDateTime = datetimeVal.length === 16 ? datetimeVal + ':00' : datetimeVal;

      await post('/patient/appointments', {
        doctorId: selectedDoctorId,
        appointmentDateTime,
        reason,
      });

      showToast('¡Cita agendada exitosamente!', 'success');
      setStep(1);
      document.getElementById('sel-specialty').value = '';
      document.getElementById('appt-datetime').value = '';
      document.getElementById('appt-reason').value   = '';
      document.getElementById('btn-step1-next').disabled = true;
      await loadAppointments(0);
    } catch (err) {
      showToast(err.message || 'Error al agendar la cita.', 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-calendar-check me-1"></i>Agendar cita';
    }
  });
});
