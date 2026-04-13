// API client for communicating with the Laravel backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface LoginData {
  user: {
    id: number;
    name: string;
    email: string;
    member_number: string | null;
    role: string;
    status: string;
    avatar: string | null;
    photo: string | null;
    points: number;
    level: string;
    [key: string]: unknown;
  };
  token: string;
  token_type: string;
}

/**
 * Generic fetch wrapper for API calls.
 * Handles JSON parsing, error responses, and auth token.
 */
async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Laravel validation errors (422)
    if (response.status === 422 && data.errors) {
      return {
        success: false,
        message: data.message || 'Validasi gagal.',
        errors: data.errors,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || `Request failed with status ${response.status}`,
      data: data.data,
    };
  }

  // Ensure successful responses always indicate success: true
  // This helps when hitting standard Laravel endpoints that don't return a 'success' key
  return { success: true, ...data };
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Register via JSON (tanpa foto profil).
 */
export async function register(formData: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  phone?: string;
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

/**
 * Register via FormData — mendukung upload foto profil.
 * Browser akan set Content-Type: multipart/form-data secara otomatis.
 */
export async function registerWithPhoto(formData: FormData) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: formData,
  });
}

export async function login(credentials: { email: string; password: string }) {
  const response = await apiFetch<LoginData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Store token on successful login
  if (response.success && response.data?.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }

  return response;
}

export async function logout() {
  const response = await apiFetch('/auth/logout', {
    method: 'POST',
  });

  // Clear local storage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');

  return response;
}

export async function getMe() {
  return apiFetch('/me');
}

export async function updateProfile(data: FormData | object) {
  const isFormData = data instanceof FormData;
  return apiFetch('/profile', {
    method: 'POST', // Use POST for both cases, backend handles 'sometimes' logic
    body: isFormData ? data : JSON.stringify(data),
  });
}

export async function updatePassword(data: object) {
  return apiFetch('/profile/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getGoogleRedirectUrl() {
  return apiFetch<{ url: string }>('/auth/google');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export async function getUsers<T = unknown>(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<T>(`/users${query}`);
}

export async function getEvents<T = unknown>(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<T>(`/events${query}`);
}

export async function getAspirations<T = unknown>(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<T>(`/aspirasi${query}`);
}

export async function submitAspiration(data: { category: string; message: string; is_anonymous: boolean }) {
  return apiFetch('/aspirasi', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getNotifications() {
  return apiFetch('/notifications');
}

export async function markAsRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllAsRead() {
  return apiFetch('/notifications/read-all', { method: 'POST' });
}

export async function getTalentTests() {
  return apiFetch('/talent-tests');
}

export async function getTalentTest(id: string | number) {
  return apiFetch(`/talent-tests/${id}`);
}

export async function getTalentResults() {
  return apiFetch('/talent-test/results');
}

export async function submitTalentTest(id: string | number, data: { answers: Array<{ question_id: number; option_id: number }> }) {
  return apiFetch(`/talent-tests/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createTalentTest(data: { title: string; description: string; duration_minutes: number; status: string }) {
  return apiFetch('/talent-tests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTalentTest(id: number | string, data: { title?: string; description?: string; duration_minutes?: number; status?: string }) {
  return apiFetch(`/talent-tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function createTalentTestQuestion(testId: number | string, data: any) {
  return apiFetch(`/talent-tests/${testId}/questions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteTalentTestQuestion(questionId: number | string) {
  return apiFetch(`/talent-questions/${questionId}`, {
    method: 'DELETE'
  });
}

export async function deleteTalentTest(id: number | string) {
  return apiFetch(`/talent-tests/${id}`, {
    method: 'DELETE'
  });
}

export async function downloadKta() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const response = await fetch(`${API_BASE_URL}/me/kta-pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Download gagal');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KTA_Karang_Taruna.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ─── Admin Management API ──────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  return apiFetch('/dashboard-stats');
}

export async function updateUserStatus(userId: number, status: 'aktif' | 'nonaktif') {
  return apiFetch(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function sendActivationEmail(userId: number) {
  return apiFetch(`/users/${userId}/send-activation-email`, {
    method: 'POST'
  });
}

export async function updateUserRole(userId: number, role: 'admin' | 'pengurus' | 'anggota') {
  return apiFetch(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}

export async function updateUserPosition(userId: number, positionId: number) {
  return apiFetch(`/users/${userId}/position`, {
    method: 'PATCH',
    body: JSON.stringify({ position_id: positionId }),
  });
}

export async function getPositions() {
  return apiFetch('/positions');
}

export async function deleteUser(userId: number) {
  return apiFetch(`/users/${userId}`, {
    method: 'DELETE'
  });
}

export async function createEvent(formData: FormData) {
  return apiFetch('/events', {
    method: 'POST',
    body: formData
  });
}

export async function updateEvent(id: number | string, formData: FormData) {
  // Laravel requires method spoofing for PUT/PATCH with FormData
  formData.append('_method', 'PUT');
  return apiFetch(`/events/${id}`, {
    method: 'POST', // Spoofed to PUT
    body: formData
  });
}

export async function deleteEvent(id: number | string) {
  return apiFetch(`/events/${id}`, {
    method: 'DELETE'
  });
}

export async function updateAspirationStatus(id: number | string, status: string) {
  return apiFetch(`/aspirasi/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
