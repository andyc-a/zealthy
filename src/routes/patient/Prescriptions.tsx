import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyPrescriptions, MyPrescription } from '../../api/patients'

export default function Prescriptions() {
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState<MyPrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyPrescriptions()
      .then(setPrescriptions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const scheduleLabel: Record<string, string> = {
    none: 'No auto-refill',
    weekly: 'Weekly',
    monthly: 'Monthly',
  }

  const isRefillSoon = (refillOn: string) => {
    const refill = new Date(refillOn)
    const sevenDays = new Date()
    sevenDays.setDate(sevenDays.getDate() + 7)
    return refill <= sevenDays && refill >= new Date()
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-xl font-bold">Prescriptions</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
          <p className="text-gray-500 mt-1">Your current medications and refill schedule</p>
        </div>

        {loading && (
          <div className="text-center py-12 text-teal-600">Loading prescriptions...</div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p>No prescriptions on file.</p>
          </div>
        )}

        {prescriptions.length > 0 && (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {rx.medication}
                      </h3>
                      <p className="text-gray-500 text-sm">{rx.dosage} &mdash; Qty: {rx.quantity}</p>
                    </div>
                  </div>
                  {isRefillSoon(rx.refill_on) && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      Refill Soon
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-400 text-xs uppercase font-medium mb-0.5">Next Refill</p>
                    <p className="text-gray-800 font-medium">{formatDate(rx.refill_on)}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-400 text-xs uppercase font-medium mb-0.5">Schedule</p>
                    <p className="text-gray-800 font-medium">
                      {scheduleLabel[rx.refill_schedule] ?? rx.refill_schedule}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
