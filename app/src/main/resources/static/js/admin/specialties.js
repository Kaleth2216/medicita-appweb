import { get, post, put, del } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';

requireAuth('ADMIN');

let specialties = [];
let editingId   = null;

const modal      = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('specialtyModal'));
const alertBox   = document.getElementById('alert-box');
const alertMsg   = document.getElementById('alert-msg');
const modalAlert = document.getElementById('modal-alert');

function showAlert(msg, type = 'danger') {
  alertBox.className = `alert alert-${type} alert-dismissible fade show mb-3`;
  alertMsg.textContent = msg;
}

function renderTable() {
  const tbody = document.getElementById('specialties-tbody');
  if (!specialties.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay especialidades registradas.</td></tr>';
    return;
  }
  tbody.innerHTML = specialties.map(s => `
    <tr>
      <td class="fw-semibold">${s.name}</td>
      <td>${s.description || '<span class="text-muted">–</span>'}</td>
      <td>${s.active
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-secondary">Inactiva</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEdit('${s.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${s.id}', '${s.name}')">
          <i class="bi bi-slash-circle"></i>
        </button>
      </td>
    </tr>`).join('');
}

async function loadSpecialties() {
  document.getElementById('table-spinner').classList.remove('d-none');
  document.getElementById('table-wrapper').classList.add('d-none');
  specialties = await get('/admin/specialties').catch(() => []);
  document.getElementById('table-spinner').classList.add('d-none');
  document.getElementById('table-wrapper').classList.remove('d-none');
  renderTable();
}

window.openEdit = function (id) {
  const s = specialties.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Editar especialidad';
  document.getElementById('specialty-id').value  = s.id;
  document.getElementById('s-name').value        = s.name;
  document.getElementById('s-description').value = s.description || '';
  modalAlert.className = 'alert alert-danger d-none';
  modal().show();
};

window.confirmDelete = function (id, name) {
  if (confirm(`¿Desactivar la especialidad "${name}"?`)) deleteSpecialty(id);
};

async function deleteSpecialty(id) {
  try {
    await del(`/admin/specialties/${id}`);
    showAlert('Especialidad desactivada.', 'success');
    await loadSpecialties();
  } catch (err) {
    showAlert(err.message || 'Error al desactivar.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('specialties');
  await loadSpecialties();

  document.getElementById('btn-new').addEventListener('click', () => {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Nueva especialidad';
    document.getElementById('specialty-form').reset();
    modalAlert.className = 'alert alert-danger d-none';
  });

  document.getElementById('specialty-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save');
    const name = document.getElementById('s-name').value.trim();
    if (!name) { modalAlert.className = 'alert alert-danger'; modalAlert.textContent = 'El nombre es requerido.'; return; }

    const payload = { name, description: document.getElementById('s-description').value.trim() };

    btn.disabled = true;
    btn.textContent = 'Cargando...';
    modalAlert.className = 'alert alert-danger d-none';

    try {
      if (editingId) {
        await put(`/admin/specialties/${editingId}`, payload);
        showAlert('Especialidad actualizada.', 'success');
      } else {
        await post('/admin/specialties', payload);
        showAlert('Especialidad creada.', 'success');
      }
      modal().hide();
      await loadSpecialties();
    } catch (err) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = err.message || 'Error al guardar.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar';
    }
  });
});
