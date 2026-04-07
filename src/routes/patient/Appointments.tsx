import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyAppointments, MyAppointment } from '../../api/patients'

interface FlatAppointment {
  id: number
  provider: string
  occurrence: string
  repeat: string
}

export default function Appointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const threeMonthsLater = new Date(now)
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)

  // Flatten all occurrences within next 3 months
  const flat: FlatAppointment[] = []
  for (const appt of appointments) {
    const occurrences = appt.occurrences ?? []
    for (const occ of occurrences) {
      const d = new Date(occ)
      if (d >= now && d <= threeMonthsLater) {
        flat.push({ id: appt.id, provider: appt.provider, occurrence: occ, repeat: appt.repeat })
      }
    }
    // fallback: if no occurrences array, show the base datetime
    if (occurrences.length === 0) {
      const d = new Date(appt.datetime)
      if (d >= now && d <= threeMonthsLater) {
        flat.push({ id: appt.id, provider: appt.provider, occurrence: appt.datetime, repeat: appt.repeat })
      }
    }
  }

  flat.sort((a, b) => new Date(a.occurrence).getTime() - new Date(b.occurrence).getTime())

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

  const repeatLabel: Record<string, string> = {
    none: 'One-time',
    weekly: 'Weekly',
    monthly: 'Monthly',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-teal-100 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xl font-bold">Appointments</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Appointments</h1>
            <p className="text-gray-500 mt-1">Upcoming appointments for the next 3 months</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-teal-600">Loading appointments...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && flat.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No upcoming appointments in the next 3 months.</p>
          </div>
        )}

        {flat.length > 0 && (
          <div className="space-y-3">
            {flat.map((appt, idx) => (
              <div key={`${appt.id}-${idx}`} className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{appt.provider}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(appt.occurrence)}</p>
                </div>
                {appt.repeat !== 'none' && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                    {repeatLabel[appt.repeat] ?? appt.repeat}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
