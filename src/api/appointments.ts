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

export interface Appointment {
  id: number
  provider: string
  datetime: string
  repeat: string
  ended_at: string | null
}

export interface AppointmentInput {
  provider: string
  datetime: string
  repeat: string
  ended_at?: string | null
}

export async function getAppointments(
  patientId: number | string,
  token?: string | null
): Promise<Appointment[]> {
  const res = await fetch(`/api/patients/${patientId}/appointments`, {
    headers: authHeaders(token),
  })
  return handleResponse<Appointment[]>(res)
}

export async function createAppointment(
  patientId: number | string,
  data: Omit<AppointmentInput, 'ended_at'>,
  token?: string | null
): Promise<Appointment> {
  const res = await fetch(`/api/patients/${patientId}/appointments`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Appointment>(res)
}

export async function updateAppointment(
  patientId: number | string,
  apptId: number | string,
  data: Partial<AppointmentInput>,
  token?: string | null
): Promise<Appointment> {
  const res = await fetch(`/api/patients/${patientId}/appointments/${apptId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Appointment>(res)
}

export async function deleteAppointment(
  patientId: number | string,
  apptId: number | string,
  token?: string | null
): Promise<void> {
  const res = await fetch(`/api/patients/${patientId}/appointments/${apptId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || res.statusText)
  }
}
