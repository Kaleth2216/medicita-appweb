import { showToast } from './toast.js';

const BASE_URL = 'http://localhost:8080/api';

let sessionExpiredHandled = false;

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('medicita_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, options);
  } catch (networkErr) {
    showToast('No se pudo conectar con el servidor. Verifica tu conexión.', 'danger');
    throw new Error('Network error');
  }

  if (response.status === 401) {
    if (!sessionExpiredHandled) {
      sessionExpiredHandled = true;
      const onLogin = window.location.pathname.includes('/auth/');
      if (!onLogin) {
        showToast('Tu sesión ha expirado. Redirigiendo al login…', 'warning');
        setTimeout(() => {
          ['medicita_token', 'medicita_email', 'medicita_role', 'medicita_fullName'].forEach(k =>
            localStorage.removeItem(k)
          );
          window.location.href = '/pages/auth/login.html';
        }, 1500);
      } else {
        ['medicita_token', 'medicita_email', 'medicita_role', 'medicita_fullName'].forEach(k =>
          localStorage.removeItem(k)
        );
      }
    }
    throw new Error('Unauthorized');
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }

  if (!response.ok) {
    throw new Error(json.message || 'Error en la solicitud');
  }

  return json.data;
}

export const get  = (endpoint)        => apiRequest(endpoint, 'GET');
export const post = (endpoint, body)  => apiRequest(endpoint, 'POST', body);
export const put  = (endpoint, body)  => apiRequest(endpoint, 'PUT', body ?? {});
export const del  = (endpoint)        => apiRequest(endpoint, 'DELETE');
