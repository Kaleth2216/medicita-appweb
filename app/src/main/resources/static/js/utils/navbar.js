import { getRole, getFullName, logout } from './auth.js';
import { showConfirm } from './toast.js';

const NAV = {
  ADMIN: [
    { label: 'Dashboard',      href: '/pages/admin/dashboard.html',    icon: 'bi-speedometer2',   page: 'dashboard' },
    { label: 'Médicos',        href: '/pages/admin/doctors.html',      icon: 'bi-person-badge',   page: 'doctors' },
    { label: 'Especialidades', href: '/pages/admin/specialties.html',  icon: 'bi-clipboard2-pulse', page: 'specialties' },
    { label: 'Permisos',       href: '/pages/admin/leaves.html',       icon: 'bi-calendar-x',    page: 'leaves' },
    { label: 'Citas',          href: '/pages/admin/appointments.html', icon: 'bi-calendar-check', page: 'appointments' },
  ],
  DOCTOR: [
    { label: 'Inicio',       href: '/pages/doctor/dashboard.html',    icon: 'bi-house',          page: 'dashboard' },
    { label: 'Mi Horario',   href: '/pages/doctor/schedule.html',     icon: 'bi-calendar-week',  page: 'schedule' },
    { label: 'Mis Citas',    href: '/pages/doctor/appointments.html', icon: 'bi-calendar-check', page: 'appointments' },
    { label: 'Permisos',     href: '/pages/doctor/leaves.html',       icon: 'bi-calendar-x',    page: 'leaves' },
  ],
  PATIENT: [
    { label: 'Inicio',     href: '/pages/patient/dashboard.html',    icon: 'bi-house',          page: 'dashboard' },
    { label: 'Mis Citas',  href: '/pages/patient/appointments.html', icon: 'bi-calendar-check', page: 'appointments' },
    { label: 'Historial',  href: '/pages/patient/history.html',      icon: 'bi-clock-history',  page: 'history' },
  ],
};

export function renderNavbar(activePage) {
  const role = getRole();
  const name = getFullName() || '';
  const links = NAV[role] || [];

  const el = document.getElementById('navbar');
  if (!el) return;

  el.innerHTML = `
    <nav class="sidebar">
      <a class="sidebar-brand" href="#">
        <i class="bi bi-hospital-fill fs-4"></i>
        <span class="fw-bold fs-5">MediCita</span>
      </a>
      <ul class="sidebar-nav">
        ${links.map(l => `
          <li class="nav-item">
            <a href="${l.href}" class="nav-link ${l.page === activePage ? 'active' : ''}">
              <i class="bi ${l.icon}"></i>
              <span>${l.label}</span>
            </a>
          </li>`).join('')}
      </ul>
      <div class="sidebar-footer">
        <div class="user-name mb-2">
          <i class="bi bi-person-circle flex-shrink-0"></i>
          <span>${name}</span>
        </div>
        <button id="btn-logout" class="btn btn-outline-light btn-sm w-100">
          <i class="bi bi-box-arrow-right"></i> Cerrar sesión
        </button>
      </div>
    </nav>`;

  document.getElementById('btn-logout').addEventListener('click', async () => {
    const ok = await showConfirm({
      title: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión actual?',
      confirmText: 'Sí, cerrar',
      cancelText: 'Cancelar',
      variant: 'primary',
      icon: 'bi-box-arrow-right',
    });
    if (ok) logout();
  });
}
