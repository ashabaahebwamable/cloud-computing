import { Case, ShiftStats, TransferUser, UploadCaseResult, User } from '../types/index.js';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('neurox_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User; shiftId: number }> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BASE}/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  await handleResponse(res);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<TransferUser[]> {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getShiftStats(): Promise<ShiftStats> {
  const res = await fetch(`${BASE}/shift-stats`, { headers: authHeaders() });
  return handleResponse(res);
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export async function uploadCase(
  patientName: string,
  imageFile: File
): Promise<UploadCaseResult> {
  const form = new FormData();
  form.append('patientName', patientName);
  form.append('image', imageFile);

  const res = await fetch(`${BASE}/cases`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  return handleResponse(res);
}

export async function transferCase(
  caseId: number,
  sentTo: number,
  notes?: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/cases/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ caseId, sentTo, notes }),
  });
  return handleResponse(res);
}

export async function getRadiologistCases(): Promise<Case[]> {
  const res = await fetch(`${BASE}/cases/radiologist`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getSpecialistCases(): Promise<Case[]> {
  const res = await fetch(`${BASE}/cases/specialist`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateCaseStatus(
  caseId: number,
  status: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/cases/${caseId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}
