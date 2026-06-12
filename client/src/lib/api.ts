const API_URL = import.meta.env.VITE_API_URL || '/api';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college: string;
  avatar_url?: string | null;
  status?: 'online' | 'idle' | 'offline';
  last_active_at?: string | null;
};

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser(): User | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
