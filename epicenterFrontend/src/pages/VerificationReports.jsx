import { useEffect, useState } from 'react'
import logoIcon from '../assets/logo-transparent.png'
import { apiRequest } from '../lib/api.js'
import { getOfficerToken, getOfficerProfile, clearOfficerToken } from '../lib/officerAuth.js'

const STATUS_STYLES = {
  Pending: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  'AI Verified': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Waiting for Verification': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Verified: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 border-red-500/20',
  Assigned: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Resolved: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
}
const STATUS_FILTERS = ['All', 'Pending', 'AI Verified', 'Waiting for Verification', 'Verified', 'Assigned', 'Rejected', 'Resolved']
const DATE_FILTERS = ['All time', 'Today', 'This week']
const COMPLETED = ['Verified', 'Assigned', 'Rejected', 'Resolved']
const PAGE_SIZE = 3

export default function VerificationReports({ onNavigate }) {
  const [token] = useState(getOfficerToken)
  const [officer] = useState(getOfficerProfile)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All time')
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!token) onNavigate?.('verification-login')
  }, [token, onNavigate])

  useEffect(() => {
    if (!token) return
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const res = await apiRequest('/dashboard/incident', { token })
        setIncidents(Array.isArray(res.data?.incidents) ? res.data.incidents : [])
      } catch (err) {
        if (err.message.toLowerCase().includes('not authorized') || err.message.toLowerCase().includes('token')) {
          clearOfficerToken()
          onNavigate?.('verification-login')
          return
        }
        setLoadError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, onNavigate])

  const handleSignOut = () => { clearOfficerToken(); onNavigate?.('verification-login') }
  if (!token) return null

  const initials = (officer?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const now = new Date()

  const dateFiltered = incidents.filter((i) => {
    if (dateFilter === 'All time' || !i.createdAt) return true
    const d = new Date(i.createdAt)
    if (dateFilter === 'Today') return d.toDateString() === now.toDateString()
    if (dateFilter === 'This week') return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return true
  })

  const statusFiltered = statusFilter === 'All' ? dateFiltered : dateFiltered.filter((i) => i.status === statusFilter)

  // Recent completed reports (Verified/Assigned/Rejected/Resolved), most
  // recent first - this is what "the latest 2-3 reports that are
  // completed" shows as individual cards.
  const completedRecent = [...dateFiltered]
    .filter((i) => COMPLETED.includes(i.status))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))

  const visible = completedRecent.slice(0, visibleCount)

  // Status breakdown, computed from what we already have - no new
  // backend endpoint needed.
  const breakdown = STATUS_FILTERS.slice(1).map((s) => ({
    status: s,
    count: incidents.filter((i) => i.status === s).length,
  }))

  return (
    <div className="min-h-screen bg-[#0a0c12] flex">
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 border-b border-white/[0.06] bg-[#0d0f16]">
        <button onClick={() => onNavigate?.('home')} className="flex items-center gap-2">
          <img src={logoIcon} alt="" className="h-7 w-7 shrink-0" />
          <span className="font-display font-bold text-white text-[14px]">EPICENTER</span>
        </button>
        <button onClick={() => setSidebarPinned(true)} className="p-2 -mr-2 text-white/70" aria-label="Open menu">
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>

      {sidebarPinned && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setSidebarPinned(false)} />
      )}

      <aside
        onMouseEnter={() => window.innerWidth >= 1024 && setSidebarPinned(true)}
        onMouseLeave={() => window.innerWidth >= 1024 && setSidebarPinned(false)}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-[#0d0f16] transition-all duration-200 w-60 ${
          sidebarPinned ? 'translate-x-0 lg:w-60 shadow-2xl shadow-black/70' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'
        }`}
      >
        <button onClick={() => onNavigate?.('home')} className="flex items-center gap-3 h-14 lg:h-[72px] px-5 shrink-0">
          <img src={logoIcon} alt="" className="h-8 w-8 shrink-0" />
          <span className={`font-display font-bold text-white text-[16px] whitespace-nowrap ${sidebarPinned ? '' : 'lg:hidden'}`}>EPICENTER</span>
        </button>
        <nav className="flex-1 px-3 pt-4 space-y-1">
          <SidebarItem label="Command Center" expanded={sidebarPinned} icon={<QueueIcon />} onClick={() => { setSidebarPinned(false); onNavigate?.('verification-dashboard') }} />
          <SidebarItem active label="Reports" expanded={sidebarPinned} icon={<ReportsNavIcon />} onClick={() => setSidebarPinned(false)} />
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${sidebarPinned ? 'bg-white/[0.03]' : ''}`}>
            <span className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[12px] font-semibold text-white">{initials}</span>
            <div className={`min-w-0 ${sidebarPinned ? '' : 'lg:hidden'}`}>
              <p className="text-[13.5px] font-medium text-white truncate">{officer?.name || 'Officer'}</p>
              <p className="text-[11px] text-white/35 truncate">{officer?.employeeId}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className={`mt-2 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors ${!sidebarPinned && 'lg:justify-center'}`}>
            <SignOutIcon />
            <span className={sidebarPinned ? 'text-[13.5px] font-medium' : 'lg:hidden text-[13.5px] font-medium'}>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 transition-[margin] duration-200 pt-14 lg:pt-0 ml-0 lg:ml-[72px]">
        <div className="page-container !max-w-none flex-1 w-full py-7 flex flex-col gap-6">
          <div>
            <p className="text-[13px] text-white/40 mb-1">All reports received</p>
            <h1 className="text-[22px] font-semibold text-white tracking-tight">Reports</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-6 items-start">
            {/* -------- Left: filters -------- */}
            {/* order-2 on mobile: the actual report list is more
                important to see immediately than the filter options -
                desktop keeps filters visually first via lg:order-none. */}
            <div className="order-2 lg:order-none rounded-2xl border border-white/10 bg-[#11141b] p-4">
              <p className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-2.5 px-1">Status</p>
              <div className="flex flex-wrap lg:flex-col gap-1 mb-5">
                {STATUS_FILTERS.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setVisibleCount(PAGE_SIZE) }} className={`text-left rounded-lg px-3 py-2 text-[13px] transition-colors ${statusFilter === s ? 'bg-white/[0.08] text-white font-medium' : 'text-white/50 hover:bg-white/[0.04] hover:text-white/75'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-2.5 px-1">Period</p>
              <div className="flex flex-wrap lg:flex-col gap-1">
                {DATE_FILTERS.map((d) => (
                  <button key={d} onClick={() => setDateFilter(d)} className={`text-left rounded-lg px-3 py-2 text-[13px] transition-colors ${dateFilter === d ? 'bg-white/[0.08] text-white font-medium' : 'text-white/50 hover:bg-white/[0.04] hover:text-white/75'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* -------- Middle: recent completed report cards -------- */}
            <div className="order-1 lg:order-none flex flex-col gap-4">
              {loadError && <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">{loadError}</div>}

              {!loading && !loadError && statusFilter === 'All' && completedRecent.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-white/35 text-sm">No completed reports yet.</div>
              )}

              {statusFilter === 'All' ? (
                <>
                  <p className="text-[11px] font-semibold tracking-wider text-white/30 uppercase px-0.5">Recently completed</p>
                  {visible.map((incident) => (
                    <CompletedCard key={incident._id} incident={incident} onClick={() => onNavigate?.("incident-detail", { id: incident._id, from: "officer", backTo: "verification-reports" })} />
                  ))}
                  {visibleCount < completedRecent.length && (
                    <button onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} className="rounded-xl border border-white/10 text-white/55 hover:text-white hover:border-white/20 text-[13px] font-medium py-2.5 transition-colors">
                      Show more reports
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold tracking-wider text-white/30 uppercase px-0.5">{statusFilter} ({statusFiltered.length})</p>
                  {statusFiltered.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-white/35 text-sm">No reports match this filter.</div>
                  )}
                  {statusFiltered.map((incident) => (
                    <CompletedCard key={incident._id} incident={incident} onClick={() => onNavigate?.("incident-detail", { id: incident._id, from: "officer", backTo: "verification-reports" })} />
                  ))}
                </>
              )}
            </div>

            {/* -------- Right: status breakdown -------- */}
            <div className="order-3 lg:order-none rounded-2xl border border-white/10 bg-[#11141b] p-5">
              <h3 className="text-[12.5px] font-semibold text-white/55 mb-4">Breakdown by status</h3>
              <div className="space-y-2.5">
                {breakdown.map(({ status, count }) => (
                  <button key={status} onClick={() => { setStatusFilter(status); setVisibleCount(PAGE_SIZE) }} className="w-full flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.04] transition-colors">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>{status}</span>
                    <span className="text-[13.5px] font-semibold text-white">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletedCard({ incident, onClick }) {
  return (
    <button onClick={onClick} className="text-left w-full rounded-2xl border border-white/10 bg-[#11141b] p-5 flex flex-wrap items-center justify-between gap-3 hover:border-white/20 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[15px] font-medium text-white">{incident.incidentType}</h3>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[incident.status] || STATUS_STYLES.Pending}`}>{incident.status}</span>
        </div>
        <p className="text-[12.5px] text-white/40 mt-1">
          {incident.location?.placeName || incident.location?.manualAddress || 'Location unknown'} · {incident.updatedAt ? new Date(incident.updatedAt).toLocaleString() : (incident.createdAt ? new Date(incident.createdAt).toLocaleString() : '—')}
        </p>
        {incident.status === 'Rejected' && incident.rejectionReason && (
          <p className="text-[12.5px] text-red-300/80 mt-1">Reason: {incident.rejectionReason}</p>
        )}
        {incident.status === 'Assigned' && incident.assignedTeam && (
          <p className="text-[12.5px] text-purple-300/80 mt-1 truncate max-w-md">{incident.assignedTeam}</p>
        )}
      </div>
    </button>
  )
}

function SidebarItem({ icon, label, active, expanded, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/70'} ${!expanded && 'justify-center'}`}>
      <span className="shrink-0 w-5 h-5">{icon}</span>
      {expanded && <span className="text-[13.5px] font-medium whitespace-nowrap">{label}</span>}
    </button>
  )
}

function QueueIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" /></svg> }
function ReportsNavIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg> }
function SignOutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg> }
function MenuIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18M3 12h18M3 18h18" /></svg> }