const BASE_URL = 'http://localhost:8080/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('medicita_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (response.status === 401) {
    ['medicita_token', 'medicita_email', 'medicita_role', 'medicita_fullName'].forEach(k =>
      localStorage.removeItem(k)
    );
    window.location.href = '/pages/auth/login.html';
    return;
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error en la solicitud');
  }

  return json.data;
}

export const get  = (endpoint)        => apiRequest(endpoint, 'GET');
export const post = (endpoint, body)  => apiRequest(endpoint, 'POST', body);
export const put  = (endpoint, body)  => apiRequest(endpoint, 'PUT', body ?? {});
export const del  = (endpoint)        => apiRequest(endpoint, 'DELETE');
