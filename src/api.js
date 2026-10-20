export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload;
}

export const loadBootstrap = () => apiRequest('/api/bootstrap');
export const loadAdminBootstrap = () => apiRequest('/api/admin/bootstrap');
export const loadAdminSession = () => apiRequest('/api/admin/session');
export const adminLogin = (payload) =>
  apiRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const adminLogout = () => apiRequest('/api/admin/logout', { method: 'POST' });
export const refreshInsight = () => apiRequest('/api/insight', { method: 'POST' });