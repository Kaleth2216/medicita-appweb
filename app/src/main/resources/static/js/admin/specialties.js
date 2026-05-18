import { get, post, put, del } from '../utils/api.js';
import { requireAuth } from '../utils/auth.js';
import { renderNavbar } from '../utils/navbar.js';
import { showToast, showConfirm } from '../utils/toast.js';

requireAuth('ADMIN');

let specialties = [];
let editingId   = null;

const modal      = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('specialtyModal'));
const modalAlert = document.getElementById('modal-alert');

function renderTable() {
  const tbody = document.getElementById('specialties-tbody');
  if (!specialties.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No hay especialidades registradas.</td></tr>';
    return;
  }
  tbody.innerHTML = specialties.map(s => `
    <tr${s.active ? '' : ' class="table-row-inactive"'}>
      <td class="fw-semibold">${s.name}</td>
      <td>${s.description || '<span class="text-muted">–</span>'}</td>
      <td>${s.active
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-secondary">Inactiva</span>'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEdit('${s.id}')" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        ${s.active
          ? `<button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${s.id}', '${s.name}')" title="Desactivar">
               <i class="bi bi-slash-circle"></i>
             </button>`
          : `<button class="btn btn-sm btn-outline-success" onclick="confirmActivate('${s.id}', '${s.name}')" title="Reactivar">
               <i class="bi bi-arrow-counterclockwise"></i>
             </button>`}
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

window.confirmDelete = async function (id, name) {
  const ok = await showConfirm({
    title: 'Desactivar especialidad',
    message: `¿Deseas desactivar la especialidad <strong>${name}</strong>? No estará disponible para nuevas citas.`,
    confirmText: 'Sí, desactivar',
    cancelText: 'Cancelar',
    variant: 'danger',
    icon: 'bi-slash-circle-fill',
  });
  if (!ok) return;
  try {
    await del(`/admin/specialties/${id}`);
    showToast('Especialidad desactivada correctamente.', 'success');
    await loadSpecialties();
  } catch (err) {
    showToast(err.message || 'Error al desactivar la especialidad.');
  }
};

window.confirmActivate = async function (id, name) {
  const ok = await showConfirm({
    title: 'Reactivar especialidad',
    message: `¿Deseas reactivar la especialidad <strong>${name}</strong>? Volverá a estar disponible para nuevas citas.`,
    confirmText: 'Sí, reactivar',
    cancelText: 'Cancelar',
    variant: 'success',
    icon: 'bi-arrow-counterclockwise',
  });
  if (!ok) return;
  try {
    await put(`/admin/specialties/${id}/activate`);
    showToast('Especialidad reactivada correctamente.', 'success');
    await loadSpecialties();
  } catch (err) {
    showToast(err.message || 'Error al reactivar la especialidad.');
  }
};

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
    if (!name) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = 'El nombre es requerido.';
      return;
    }

    const payload = { name, description: document.getElementById('s-description').value.trim() };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';
    modalAlert.className = 'alert alert-danger d-none';

    try {
      if (editingId) {
        await put(`/admin/specialties/${editingId}`, payload);
        showToast('Especialidad actualizada.', 'success');
      } else {
        await post('/admin/specialties', payload);
        showToast('Especialidad creada.', 'success');
      }
      modal().hide();
      await loadSpecialties();
    } catch (err) {
      modalAlert.className = 'alert alert-danger';
      modalAlert.textContent = err.message || 'Error al guardar.';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-floppy me-1"></i>Guardar';
    }
  });
});
