import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPatients, Patient } from '../../api/patients'
import Table, { Column } from '../../components/Table'

export default function AdminHome() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const columns: Column<Patient>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'appointment_count',
      label: 'Appointments',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
          {row.appointment_count ?? 0}
        </span>
      ),
    },
    {
      key: 'prescription_count',
      label: 'Prescriptions',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
          {row.prescription_count ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/admin/patients/${row.id}`)
          }}
          className="bg-teal-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Zealthy Admin</h1>
              <p className="text-xs text-gray-500">Patient Management</p>
            </div>
          </div>
          <Link
            to="/admin/patients/new"
            className="bg-teal-600 text-white px-4 py-2 rounded font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Patient
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Patients</h2>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading...' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} registered`}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-teal-600">Loading patients...</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <Table<Patient>
              columns={columns}
              data={patients}
              onRowClick={(row) => navigate(`/admin/patients/${row.id}`)}
            />
          </div>
        )}
      </main>
    </div>
  )
}
