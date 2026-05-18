// ── Toast notifications ───────────────────────────────────────────────────
const ICONS = {
  success: 'bi-check-circle-fill',
  danger:  'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info:    'bi-info-circle-fill',
};

const COLORS = {
  success: 'text-success',
  danger:  'text-danger',
  warning: 'text-warning',
  info:    'text-primary',
};

export function showToast(message, type = 'danger') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center border-0 shadow-sm';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${ICONS[type] || ICONS.danger} ${COLORS[type] || COLORS.danger} fs-5 flex-shrink-0"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;

  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ── Confirmation dialog (replaces native confirm()) ───────────────────────
const VARIANT_STYLES = {
  danger:  { btn: 'btn-danger',  icon: 'bi-exclamation-triangle-fill', iconColor: 'text-danger',  bgIcon: 'bg-danger-subtle' },
  warning: { btn: 'btn-warning', icon: 'bi-exclamation-triangle-fill', iconColor: 'text-warning', bgIcon: 'bg-warning-subtle' },
  success: { btn: 'btn-success', icon: 'bi-check-circle-fill',         iconColor: 'text-success', bgIcon: 'bg-success-subtle' },
  primary: { btn: 'btn-primary', icon: 'bi-question-circle-fill',      iconColor: 'text-primary', bgIcon: 'bg-primary-subtle' },
};

export function showConfirm({
  title       = 'Confirmar acción',
  message     = '¿Estás seguro?',
  confirmText = 'Confirmar',
  cancelText  = 'Cancelar',
  variant     = 'danger',
  icon,
} = {}) {
  return new Promise((resolve) => {
    const v = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;
    const iconClass = icon || v.icon;

    const wrapper = document.createElement('div');
    wrapper.className = 'modal fade';
    wrapper.tabIndex = -1;
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg" style="border-radius:1rem;">
          <div class="modal-body text-center p-4">
            <div class="confirm-icon-wrapper ${v.bgIcon} ${v.iconColor} mx-auto mb-3">
              <i class="bi ${iconClass}"></i>
            </div>
            <h6 class="fw-bold mb-2">${title}</h6>
            <p class="text-muted small mb-4">${message}</p>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light flex-fill" data-action="cancel">
                ${cancelText}
              </button>
              <button type="button" class="btn ${v.btn} flex-fill" data-action="confirm">
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.appendChild(wrapper);
    const modal = new bootstrap.Modal(wrapper, { backdrop: 'static' });

    let answer = false;
    wrapper.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      answer = true;
      modal.hide();
    });
    wrapper.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      answer = false;
      modal.hide();
    });
    wrapper.addEventListener('hidden.bs.modal', () => {
      wrapper.remove();
      resolve(answer);
    });

    modal.show();
  });
}
