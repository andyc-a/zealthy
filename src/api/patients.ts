const TOKEN_KEY = 'zealthy_token'

function getToken(override?: string | null): string {
  return override ?? localStorage.getItem(TOKEN_KEY) ?? ''
}

function authHeaders(token?: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken(token)}`,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || res.statusText)
  }
  return res.json()
}

export interface Patient {
  id: number
  name: string
  email: string
  appointment_count?: number
  prescription_count?: number
}

export interface PatientInput {
  name: string
  email: string
  password?: string
}

export async function getPatients(token?: string | null): Promise<Patient[]> {
  const res = await fetch('/api/patients', { headers: authHeaders(token) })
  return handleResponse<Patient[]>(res)
}

export async function getPatient(id: number | string, token?: string | null): Promise<Patient> {
  const res = await fetch(`/api/patients/${id}`, { headers: authHeaders(token) })
  return handleResponse<Patient>(res)
}

export async function createPatient(data: PatientInput, token?: string | null): Promise<Patient> {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Patient>(res)
}

export async function updatePatient(
  id: number | string,
  data: Partial<PatientInput>,
  token?: string | null
): Promise<Patient> {
  const res = await fetch(`/api/patients/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Patient>(res)
}

export async function getMedications(token?: string | null): Promise<string[]> {
  const res = await fetch('/api/medications', { headers: authHeaders(token) })
  return handleResponse<string[]>(res)
}

export async function getDosages(token?: string | null): Promise<string[]> {
  const res = await fetch('/api/dosages', { headers: authHeaders(token) })
  return handleResponse<string[]>(res)
}

export interface DashboardData {
  user: { id: number; name: string; email: string }
  upcoming_appointments: Array<{
    id: number
    provider: string
    datetime: string
    occurrence_datetime: string
    repeat: string
    ended_at: string | null
  }>
  upcoming_refills: Array<{
    id: number
    medication: string
    dosage: string
    quantity: number
    refill_on: string
    refill_schedule: string
  }>
}

export async function getDashboard(token?: string | null): Promise<DashboardData> {
  const res = await fetch('/api/me/dashboard', { headers: authHeaders(token) })
  return handleResponse<DashboardData>(res)
}

export interface MyAppointment {
  id: number
  provider: string
  datetime: string
  repeat: string
  ended_at: string | null
  occurrences: string[]
}

export async function getMyAppointments(token?: string | null): Promise<MyAppointment[]> {
  const res = await fetch('/api/me/appointments', { headers: authHeaders(token) })
  return handleResponse<MyAppointment[]>(res)
}

export interface MyPrescription {
  id: number
  medication: string
  dosage: string
  quantity: number
  refill_on: string
  refill_schedule: string
}

export async function getMyPrescriptions(token?: string | null): Promise<MyPrescription[]> {
  const res = await fetch('/api/me/prescriptions', { headers: authHeaders(token) })
  return handleResponse<MyPrescription[]>(res)
}
