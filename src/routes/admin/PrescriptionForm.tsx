import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMedications, getDosages } from '../../api/patients'
import {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  PrescriptionInput,
  Prescription,
} from '../../api/prescriptions'
import FormInput from '../../components/FormInput'

const REFILL_SCHEDULE_OPTIONS = [
  { value: 'none', label: 'No auto-refill' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

interface FormState {
  medication: string
  dosage: string
  quantity: string
  refill_on: string
  refill_schedule: string
}

export default function PrescriptionForm() {
  const { id: patientId, rxId } = useParams<{ id: string; rxId: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(rxId)

  const [form, setForm] = useState<FormState>({
    medication: '',
    dosage: '',
    quantity: '',
    refill_on: '',
    refill_schedule: 'none',
  })
  const [medications, setMedications] = useState<string[]>([])
  const [dosages, setDosages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meds, doses] = await Promise.all([getMedications(), getDosages()])
        setMedications(meds)
        setDosages(doses)

        if (isEdit && patientId && rxId) {
          const rxs: Prescription[] = await getPrescriptions(patientId)
          const rx = rxs.find((r) => String(r.id) === rxId)
          if (rx) {
            const refillDate = rx.refill_on ? rx.refill_on.split('T')[0] : ''
            setForm({
              medication: rx.medication,
              dosage: rx.dosage,
              quantity: String(rx.quantity),
              refill_on: refillDate,
              refill_schedule: rx.refill_schedule,
            })
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setFetchLoading(false)
      }
    }

    loadData()
  }, [isEdit, patientId, rxId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId) return
    setError('')
    setLoading(true)

    const data: PrescriptionInput = {
      medication: form.medication,
      dosage: form.dosage,
      quantity: Number(form.quantity),
      refill_on: form.refill_on,
      refill_schedule: form.refill_schedule,
    }

    try {
      if (isEdit && rxId) {
        await updatePrescription(patientId, rxId, data)
      } else {
        await createPrescription(patientId, data)
      }
      navigate(`/admin/patients/${patientId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-teal-600">Loading...</div>
      </div>
    )
  }

  const medicationOptions = [
    { value: '', label: 'Select a medication...' },
    ...medications.map((m) => ({ value: m, label: m })),
  ]

  const dosageOptions = [
    { value: '', label: 'Select a dosage...' },
    ...dosages.map((d) => ({ value: d, label: d })),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to={`/admin/patients/${patientId}`}
            className="text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patient
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-800">
            {isEdit ? 'Edit Prescription' : 'New Prescription'}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {isEdit ? 'Update Prescription' : 'Add New Prescription'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Medication"
              name="medication"
              value={form.medication}
              onChange={handleChange}
              required
              options={medicationOptions}
            />
            <FormInput
              label="Dosage"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              required
              options={dosageOptions}
            />
            <FormInput
              label="Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="30"
            />
            <FormInput
              label="Refill Date"
              name="refill_on"
              type="date"
              value={form.refill_on}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Refill Schedule"
              name="refill_schedule"
              value={form.refill_schedule}
              onChange={handleChange}
              required
              options={REFILL_SCHEDULE_OPTIONS}
            />

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 text-white px-6 py-2 rounded font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Prescription' : 'Add Prescription'}
              </button>
              <Link
                to={`/admin/patients/${patientId}`}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
