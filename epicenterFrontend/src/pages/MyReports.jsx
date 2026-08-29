import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { apiRequest } from '../lib/api.js'
import { getCitizenAuth } from '../lib/citizenAuth.js'

const STATUS_STYLES = {
  Pending: 'bg-gray-100 text-gray-600',
  'AI Verified': 'bg-blue-100 text-blue-700',
  'Waiting for Verification': 'bg-amber-100 text-amber-700',
  Verified: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Assigned: 'bg-purple-100 text-purple-700',
  Resolved: 'bg-teal-100 text-teal-700',
}

/**
 * MyReports
 *
 * Signed-in citizen's own report history, via GET /incident/my-reports
 * (requires the citizen JWT - redirects to the report page if not
 * signed in, since there's no separate citizen login screen).
 */
export default function MyReports({ onNavigate }) {
  const [auth] = useState(getCitizenAuth)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth?.token) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await apiRequest('/incident/my-reports', { token: auth.token })
        setReports(Array.isArray(res.data?.incidents) ? res.data.incidents : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [auth])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header onNavigate={onNavigate} activePage="report" auth={auth} />

      <main className="flex-1 page-container w-full py-8 lg:py-10">
        <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-navy">My Reports</h1>
        <p className="mt-1.5 text-muted text-[15px]">Reports you've submitted while signed in.</p>

        {!auth?.token && (
          <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center">
            <p className="text-navy font-semibold">Sign in with Google to see your reports.</p>
            <p className="mt-1.5 text-sm text-muted">
              Reports submitted as a guest aren't tied to an account, so they can't be listed here — use the
              tracking option on the report page instead.
            </p>
            <button
              onClick={() => onNavigate?.('report')}
              className="mt-5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-5 py-2.5 transition-colors"
            >
              Go to Report Page
            </button>
          </div>
        )}

        {auth?.token && loading && (
          <div className="mt-8 text-center text-muted text-sm">Loading your reports…</div>
        )}

        {auth?.token && !loading && error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
            {error}
          </div>
        )}

        {auth?.token && !loading && !error && reports.length === 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-white p-10 text-center text-muted text-sm">
            You haven't submitted any reports yet.
          </div>
        )}

        {auth?.token && reports.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => (
              <button
                key={r._id}
                onClick={() => onNavigate?.('incident-detail', { id: r._id, from: 'citizen', backTo: 'my-reports' })}
                className="text-left rounded-2xl border border-border bg-white p-4 hover:border-navy/20 transition-colors"
              >
                <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden mb-3">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-navy text-[15px]">{r.incidentType}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {r.location?.placeName || r.location?.manualAddress || 'Location not specified'}
                </p>
                <p className="mt-1 text-[12px] text-muted/70">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}