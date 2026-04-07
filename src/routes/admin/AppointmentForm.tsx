import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getAppointments, createAppointment, updateAppointment } from '../../api/appointments'

export default function AppointmentForm() {
  const navigate = useNavigate()
  const { id, apptId } = useParams<{ id: string; apptId: string }>()
  const isEdit = Boolean(apptId)

  const [provider, setProvider] = useState('')
  const [datetime, setDatetime] = useState('')
  const [repeat, setRepeat] = useState('none')
  const [endedAt, setEndedAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit || !id || !apptId) return
    getAppointments(id)
      .then((appts) => {
        const appt = appts.find((a) => String(a.id) === apptId)
        if (appt) {
          setProvider(appt.provider)
          // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
          const dt = new Date(appt.datetime)
          const pad = (n: number) => String(n).padStart(2, '0')
          setDatetime(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`)
          setRepeat(appt.repeat || 'none')
          if (appt.ended_at) {
            const edt = new Date(appt.ended_at)
            const pad2 = (n: number) => String(n).padStart(2, '0')
            setEndedAt(`${edt.getFullYear()}-${pad2(edt.getMonth() + 1)}-${pad2(edt.getDate())}T${pad2(edt.getHours())}:${pad2(edt.getMinutes())}`)
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false))
  }, [id, apptId, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit && id && apptId) {
        await updateAppointment(id, apptId, {
          provider,
          datetime,
          repeat,
          ended_at: endedAt || null,
        })
      } else if (id) {
        await createAppointment(id, { provider, datetime, repeat })
      }
      navigate(`/admin/patients/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleEndRecurrence = async () => {
    if (!id || !apptId) return
    if (!window.confirm('End recurrence for this appointment? Future occurrences will stop.')) return
    setLoading(true)
    try {
      await updateAppointment(id, apptId, {
        provider,
        datetime,
        repeat,
        ended_at: new Date().toISOString(),
      })
      navigate(`/admin/patients/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end recurrence')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center text-teal-600">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={`/admin/patients/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name *</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                required
                placeholder="Dr. Jane Smith"
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Schedule *</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="none">One-time (no repeat)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {repeat !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Recurrence Date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={endedAt}
                  onChange={(e) => setEndedAt(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank for indefinite recurrence.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2 flex-wrap">
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 text-white px-5 py-2 rounded font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Schedule Appointment'}
              </button>
              <Link
                to={`/admin/patients/${id}`}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
              {isEdit && repeat !== 'none' && (
                <button
                  type="button"
                  onClick={handleEndRecurrence}
                  disabled={loading}
                  className="bg-amber-500 text-white px-5 py-2 rounded font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  End Recurrence Now
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
