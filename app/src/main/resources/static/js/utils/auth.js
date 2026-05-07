const P = 'medicita_';

export function saveAuth(token, email, role, fullName) {
  localStorage.setItem(`${P}token`,    token);
  localStorage.setItem(`${P}email`,    email);
  localStorage.setItem(`${P}role`,     role);
  localStorage.setItem(`${P}fullName`, fullName);
}

export const getToken    = () => localStorage.getItem(`${P}token`);
export const getRole     = () => localStorage.getItem(`${P}role`);
export const getFullName = () => localStorage.getItem(`${P}fullName`);
export const getEmail    = () => localStorage.getItem(`${P}email`);

export function logout() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(P))
    .forEach(k => localStorage.removeItem(k));
  window.location.href = '/pages/auth/login.html';
}

export function isAuthenticated() {
  return !!getToken();
}

export function requireAuth(allowedRole) {
  if (!isAuthenticated()) {
    window.location.href = '/pages/auth/login.html';
    return;
  }
  if (allowedRole && getRole() !== allowedRole) {
    redirectToDashboard();
  }
}

export function redirectToDashboard() {
  const role = getRole();
  if (role === 'ADMIN')   { window.location.href = '/pages/admin/dashboard.html';   return; }
  if (role === 'DOCTOR')  { window.location.href = '/pages/doctor/dashboard.html';  return; }
  if (role === 'PATIENT') { window.location.href = '/pages/patient/dashboard.html'; return; }
  window.location.href = '/pages/auth/login.html';
}
