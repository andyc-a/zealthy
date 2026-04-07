import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDashboard, DashboardData } from '../../api/patients'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const formatDateTime = (dt: string) => {
    return new Date(dt).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDate = (dt: string) => {
    return new Date(dt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xl font-bold">Zealthy</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name ?? 'Patient'}
          </h1>
          <p className="text-gray-500 mt-1">Here's your health summary for the upcoming week.</p>
        </div>

        {loading && (
          <div className="text-center py-12 text-teal-600">Loading your dashboard...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Upcoming This Week */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    This Week
                  </span>
                </div>
                {data.upcoming_appointments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No appointments this week.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.upcoming_appointments.map((appt, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-teal-50 rounded">
                        <div className="mt-0.5">
                          <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{appt.provider}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(appt.occurrence_datetime || appt.datetime)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Upcoming Refills */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Upcoming Refills</h2>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    This Week
                  </span>
                </div>
                {data.upcoming_refills.length === 0 ? (
                  <p className="text-gray-400 text-sm">No refills due this week.</p>
                ) : (
                  <ul className="space-y-3">
                    {data.upcoming_refills.map((rx, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded">
                        <div className="mt-0.5">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {rx.medication} {rx.dosage}
                          </p>
                          <p className="text-xs text-gray-500">Refill by {formatDate(rx.refill_on)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Navigation Cards */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Health Records</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/appointments"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">All Appointments</p>
                  <p className="text-sm text-gray-500">View upcoming schedule</p>
                </div>
              </Link>

              <Link
                to="/prescriptions"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">My Prescriptions</p>
                  <p className="text-sm text-gray-500">Medications &amp; refill dates</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
