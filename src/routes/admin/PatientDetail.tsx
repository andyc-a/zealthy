import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPatient, Patient } from '../../api/patients'
import { getAppointments, deleteAppointment, Appointment } from '../../api/appointments'
import { getPrescriptions, deletePrescription, Prescription } from '../../api/prescriptions'
import Table, { Column } from '../../components/Table'

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [p, appts, rxs] = await Promise.all([
        getPatient(id),
        getAppointments(id),
        getPrescriptions(id),
      ])
      setPatient(p)
      setAppointments(appts)
      setPrescriptions(rxs)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteAppointment = async (apptId: number) => {
    if (!id) return
    if (!window.confirm('Delete this appointment?')) return
    try {
      await deleteAppointment(id, apptId)
      setAppointments((prev) => prev.filter((a) => a.id !== apptId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const handleDeletePrescription = async (rxId: number) => {
    if (!id) return
    if (!window.confirm('Delete this prescription?')) return
    try {
      await deletePrescription(id, rxId)
      setPrescriptions((prev) => prev.filter((r) => r.id !== rxId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const apptColumns: Column<Appointment>[] = [
    { key: 'provider', label: 'Provider' },
    {
      key: 'datetime',
      label: 'Date/Time',
      render: (row) => formatDateTime(row.datetime),
    },
    {
      key: 'repeat',
      label: 'Repeat',
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          row.repeat === 'none' ? 'bg-gray-100 text-gray-600' :
          row.repeat === 'weekly' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {row.repeat || 'none'}
        </span>
      ),
    },
    {
      key: 'ended_at',
      label: 'Ended',
      render: (row) =>
        row.ended_at ? (
          <span className="text-xs text-gray-500">{formatDate(row.ended_at)}</span>
        ) : (
          <span className="text-xs text-green-600 font-medium">Active</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/patients/${id}/appointments/${row.id}/edit`) }}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(row.id) }}
            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  const rxColumns: Column<Prescription>[] = [
    { key: 'medication', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'quantity', label: 'Qty', render: (row) => String(row.quantity) },
    {
      key: 'refill_on',
      label: 'Refill Date',
      render: (row) => formatDate(row.refill_on),
    },
    {
      key: 'refill_schedule',
      label: 'Schedule',
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          row.refill_schedule === 'none' ? 'bg-gray-100 text-gray-600' :
          row.refill_schedule === 'weekly' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {row.refill_schedule || 'none'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/patients/${id}/prescriptions/${row.id}/edit`) }}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeletePrescription(row.id) }}
            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-teal-600 text-lg">Loading patient...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/admin"
            className="text-gray-500 hover:text-teal-600 transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-800">Patient Detail</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-700 font-bold text-xl">
                  {patient?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{patient?.name}</h2>
                <p className="text-gray-500">{patient?.email}</p>
              </div>
            </div>
            <Link
              to={`/admin/patients/${id}/edit`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Edit Patient
            </Link>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
            <Link
              to={`/admin/patients/${id}/appointments/new`}
              className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700 transition-colors text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Appointment
            </Link>
          </div>
          <Table<Appointment> columns={apptColumns} data={appointments} />
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Prescriptions</h3>
            <Link
              to={`/admin/patients/${id}/prescriptions/new`}
              className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700 transition-colors text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Prescription
            </Link>
          </div>
          <Table<Prescription> columns={rxColumns} data={prescriptions} />
        </div>
      </main>
    </div>
  )
}
