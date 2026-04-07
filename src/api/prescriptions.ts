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

export interface Prescription {
  id: number
  medication: string
  dosage: string
  quantity: number
  refill_on: string
  refill_schedule: string
}

export interface PrescriptionInput {
  medication: string
  dosage: string
  quantity: number
  refill_on: string
  refill_schedule: string
}

export async function getPrescriptions(
  patientId: number | string,
  token?: string | null
): Promise<Prescription[]> {
  const res = await fetch(`/api/patients/${patientId}/prescriptions`, {
    headers: authHeaders(token),
  })
  return handleResponse<Prescription[]>(res)
}

export async function createPrescription(
  patientId: number | string,
  data: PrescriptionInput,
  token?: string | null
): Promise<Prescription> {
  const res = await fetch(`/api/patients/${patientId}/prescriptions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Prescription>(res)
}

export async function updatePrescription(
  patientId: number | string,
  rxId: number | string,
  data: Partial<PrescriptionInput>,
  token?: string | null
): Promise<Prescription> {
  const res = await fetch(`/api/patients/${patientId}/prescriptions/${rxId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  return handleResponse<Prescription>(res)
}

export async function deletePrescription(
  patientId: number | string,
  rxId: number | string,
  token?: string | null
): Promise<void> {
  const res = await fetch(`/api/patients/${patientId}/prescriptions/${rxId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || res.statusText)
  }
}
