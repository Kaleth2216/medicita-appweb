import { get, post, put, del } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast, showConfirm } from '../utils/toast.js';

requireAuth('ADMIN');

let doctors    = [];
let specialties = [];
let editingId  = null;

const modal      = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('doctorModal'));
const modalAlert = document.getElementById('modal-alert');

function showModalError(msg) {
  modalAlert.className = 'alert alert-danger mt-3';
  modalAlert.textContent = msg;
}

function renderTable() {
  const tbody = document.getElementById('doctors-tbody');
  if (!doctors.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No hay médicos registrados.</td></tr>';
    return;
  }
  tbody.innerHTML = doctors.map(d => `
    <tr${d.active ? '' : ' class="table-row-inactive"'}>
      <td class="fw-semibold">${d.firstName} ${d.lastName}</td>
      <td>${d.specialtyName || '–'}</td>
      <td><code>${d.medicalLicense}</code></td>
      <td>${d.email}</td>
      <td>${d.active
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEdit('${d.id}')" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        ${d.active
          ? `<button class="btn btn-sm btn-outline-danger" onclick="confirmDeactivate('${d.id}', '${d.firstName} ${d.lastName}')" title="Desactivar">
               <i class="bi bi-slash-circle"></i>
             </button>`
          : `<button class="btn btn-sm btn-outline-success" onclick="confirmActivate('${d.id}', '${d.firstName} ${d.lastName}')" title="Reactivar">
               <i class="bi bi-arrow-counterclockwise"></i>
             </button>`}
      </td>
    </tr>`).join('');
}

async function loadData() {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');

  [doctors, specialties] = await Promise.all([
    get('/admin/doctors').catch(() => []),
    get('/admin/specialties').catch(() => []),
  ]);

  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');

  renderTable();
  populateSpecialties();
}

function populateSpecialties() {
  const sel = document.getElementById('d-specialtyId');
  sel.innerHTML = '<option value="">Selecciona una especialidad</option>' +
    specialties.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

window.openEdit = function (id) {
  const doc = doctors.find(d => d.id === id);
  if (!doc) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Editar médico';
  document.getElementById('doctor-id').value     = doc.id;
  document.getElementById('d-firstName').value   = doc.firstName;
  document.getElementById('d-lastName').value    = doc.lastName;
  document.getElementById('d-email').value       = doc.email;
  document.getElementById('d-password').value    = '';
  document.getElementById('d-medicalLicense').value = doc.medicalLicense;
  document.getElementById('d-specialtyId').value = doc.specialtyId || '';
  modalAlert.className = 'alert alert-danger mt-3 d-none';
  modal().show();
};

window.confirmDeactivate = async function (id, name) {
  const ok = await showConfirm({
    title: 'Desactivar médico',
    message: `¿Deseas desactivar al médico <strong>${name}</strong>? Ya no podrá iniciar sesión.`,
    confirmText: 'Sí, desactivar',
    cancelText: 'Cancelar',
    variant: 'danger',
    icon: 'bi-slash-circle-fill',
  });
  if (!ok) return;
  try {
    await del(`/admin/doctors/${id}`);
    showToast('Médico desactivado correctamente.', 'success');
    await loadData();
  } catch (err) {
    showToast(err.message || 'Error al desactivar médico.');
  }
};

window.confirmActivate = async function (id, name) {
  const ok = await showConfirm({
    title: 'Reactivar médico',
    message: `¿Deseas reactivar al médico <strong>${name}</strong>? Podrá iniciar sesión de nuevo.`,
    confirmText: 'Sí, reactivar',
    cancelText: 'Cancelar',
    variant: 'success',
    icon: 'bi-arrow-counterclockwise',
  });
  if (!ok) return;
  try {
    await put(`/admin/doctors/${id}/activate`);
    showToast('Médico reactivado correctamente.', 'success');
    await loadData();
  } catch (err) {
    showToast(err.message || 'Error al reactivar médico.');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('doctors');
  await loadData();

  document.getElementById('btn-new').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Nuevo médico';
    document.getElementById('doctor-form').reset();
    modalAlert.className = 'alert alert-danger mt-3 d-none';
  });

  document.getElementById('doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save');
    const password = document.getElementById('d-password').value;

    if (!editingId && password.length < 8) {
      showModalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const payload = {
      firstName:      document.getElementById('d-firstName').value.trim(),
      lastName:       document.getElementById('d-lastName').value.trim(),
      email:          document.getElementById('d-email').value.trim(),
      password:       password,
      medicalLicense: document.getElementById('d-medicalLicense').value.trim(),
      specialtyId:    document.getElementById('d-specialtyId').value,
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';
    modalAlert.className = 'alert alert-danger mt-3 d-none';

    try {
      if (editingId) {
        await put(`/admin/doctors/${editingId}`, payload);
        showToast('Médico actualizado correctamente.', 'success');
      } else {
        await post('/admin/doctors', payload);
        showToast('Médico creado correctamente.', 'success');
      }
      modal().hide();
      await loadData();
    } catch (err) {
      showModalError(err.message || 'Error al guardar.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-floppy me-1"></i>Guardar';
    }
  });
});
