// Utility to get the correct API base URL
// In development: Vite proxies /api to localhost:5000
// In production: Uses VITE_API_URL environment variable
const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path: string) => `${API_BASE}${path}`;

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(apiUrl(url), { ...options, headers });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};
