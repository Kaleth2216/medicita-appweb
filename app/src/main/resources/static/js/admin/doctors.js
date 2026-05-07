import { get, post, put, del } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('ADMIN');

let doctors    = [];
let specialties = [];
let editingId  = null;

const modal      = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('doctorModal'));
const alertBox   = document.getElementById('alert-box');
const alertMsg   = document.getElementById('alert-msg');
const modalAlert = document.getElementById('modal-alert');

function showAlert(msg, type = 'danger') {
  alertBox.className = `alert alert-${type} alert-dismissible fade show mb-3`;
  alertMsg.textContent = msg;
}

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
    <tr>
      <td class="fw-semibold">${d.firstName} ${d.lastName}</td>
      <td>${d.specialtyName || '–'}</td>
      <td><code>${d.medicalLicense}</code></td>
      <td>${d.email}</td>
      <td>${d.active
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEdit('${d.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeactivate('${d.id}', '${d.firstName} ${d.lastName}')">
          <i class="bi bi-slash-circle"></i>
        </button>
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

window.confirmDeactivate = function (id, name) {
  if (confirm(`¿Desactivar al médico ${name}?`)) deactivateDoctor(id);
};

async function deactivateDoctor(id) {
  try {
    await del(`/admin/doctors/${id}`);
    showAlert('Médico desactivado correctamente.', 'success');
    await loadData();
  } catch (err) {
    showAlert(err.message || 'Error al desactivar médico.');
  }
}

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
    btn.textContent = 'Cargando...';
    modalAlert.className = 'alert alert-danger mt-3 d-none';

    try {
      if (editingId) {
        await put(`/admin/doctors/${editingId}`, payload);
        showAlert('Médico actualizado correctamente.', 'success');
      } else {
        await post('/admin/doctors', payload);
        showAlert('Médico creado correctamente.', 'success');
      }
      modal().hide();
      await loadData();
    } catch (err) {
      showModalError(err.message || 'Error al guardar.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar';
    }
  });
});
