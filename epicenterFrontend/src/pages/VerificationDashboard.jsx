import { useEffect, useMemo, useState } from 'react'
import logoIcon from '../assets/logo-transparent.png'
import { apiRequest } from '../lib/api.js'
import { getOfficerToken, getOfficerProfile, clearOfficerToken } from '../lib/officerAuth.js'
import { getResponderOptions } from '../lib/responderSuggestions.js'
import { buildIncidentTimeline } from '../lib/incidentTimeline.js'
import { formatPhone } from '../lib/formatPhone.js'

const STATUS_STYLES = {
  Pending: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
  'AI Verified': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Waiting for Verification': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Verified: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 border-red-500/20',
  Assigned: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Resolved: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
}
const SEVERITY_STYLES = {
  Critical: 'bg-red-500/15 text-red-300 border-red-500/25',
  High: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Low: 'bg-gray-500/15 text-gray-300 border-gray-500/25',
}
const NEEDS_ACTION = ['Pending', 'AI Verified', 'Waiting for Verification']
const PREVIOUS_FILTERS = ['All', 'Cleared', 'Rejected']
const PAGE_SIZE = 3

function getPhones(phone) {
  const arr = Array.isArray(phone) ? phone : phone ? [phone] : []
  return arr.filter(Boolean)
}

export default function VerificationDashboard({ onNavigate }) {
  const [token] = useState(getOfficerToken)
  const [officer] = useState(getOfficerProfile)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [incomingPreview, setIncomingPreview] = useState([])
  const [nowTick, setNowTick] = useState(Date.now())
  const [previousFilter, setPreviousFilter] = useState('All')
  const [previousVisible, setPreviousVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!token) onNavigate?.('verification-login')
  }, [token, onNavigate])

  const loadIncidents = async () => {
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

  useEffect(() => {
    if (!token) return
    loadIncidents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Polls in the background - this feeds BOTH the Incoming widget and,
  // by refreshing `incidents`, naturally lets "latest" (below) pick up
  // a newly arrived report once nothing is actively being edited.
  useEffect(() => {
    if (!token) return
    const poll = async () => {
      try {
        const res = await apiRequest('/dashboard/incident?status=Pending', { token })
        setIncomingPreview(Array.isArray(res.data?.incidents) ? res.data.incidents.slice(0, 5) : [])
        await loadIncidents()
      } catch {
        // background widget, fails silently
      }
    }
    const id = window.setInterval(poll, 20000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 60000)
    return () => window.clearInterval(id)
  }, [])

  const latest = useMemo(() => {
    if (incidents.length === 0) return null
    const needsAction = incidents
      .filter((i) => NEEDS_ACTION.includes(i.status))
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    if (needsAction.length > 0) return needsAction[0]
    return [...incidents].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0]
  }, [incidents])

  const timeline = useMemo(() => {
    if (!latest) return []
    try { return buildIncidentTimeline(latest) } catch { return [] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest, nowTick])

  // "Previous reports" = everything that isn't the currently-shown
  // latest one, most recent first.
  const previousAll = incidents
    .filter((i) => i._id !== latest?._id)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))

  const previousFiltered = previousAll.filter((i) => {
    if (previousFilter === 'All') return true
    if (previousFilter === 'Cleared') return ['Verified', 'Assigned', 'Resolved'].includes(i.status)
    if (previousFilter === 'Rejected') return i.status === 'Rejected'
    return true
  })
  const previousVisibleList = previousFiltered.slice(0, previousVisible)

  const runAction = async (path, body) => {
    if (!latest) return
    setActionError('')
    setActionLoading(true)
    try {
      await apiRequest(path, { method: 'PUT', body, token })
      await loadIncidents()
      setShowRejectBox(false)
      setAssignModalOpen(false)
      setRejectReason('')
      setShowTimeline(false)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerify = () => runAction(`/dashboard/incidents/${latest._id}/verify`)
  const handleReject = () => runAction(`/dashboard/incident/${latest._id}/reject`, { reason: rejectReason || 'Not specified' })
  const handleResolve = () => runAction(`/dashboard/incident/${latest._id}/resolve`)
  const handleSignOut = () => { clearOfficerToken(); onNavigate?.('verification-login') }

  if (!token) return null

  const initials = (officer?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const firstName = officer?.name ? officer.name.split(' ')[0] : null
  const todayCount = incidents.filter((i) => i.createdAt && new Date(i.createdAt).toDateString() === new Date().toDateString()).length
  const pendingCount = incidents.filter((i) => NEEDS_ACTION.includes(i.status)).length

  // Fixed display value, not calculated from real aiCompletedAt data -
  // matches the same static "16 sec" shown on the pre-login stats bar
  // in VerificationLogin.jsx.
  const avgVerificationLabel = '16s'
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="min-h-screen bg-[#0a0c12] flex">
      {/* -------- Mobile top bar: hamburger trigger, only visible below lg -------- */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 border-b border-white/[0.06] bg-[#0d0f16]">
        <button onClick={() => onNavigate?.('home')} className="flex items-center gap-2">
          <img src={logoIcon} alt="" className="h-7 w-7 shrink-0" />
          <span className="font-display font-bold text-white text-[14px]">EPICENTER</span>
        </button>
        <button
          onClick={() => setSidebarPinned(true)}
          className="p-2 -mr-2 text-white/70"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>

      {/* -------- Mobile drawer backdrop -------- */}
      {sidebarPinned && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarPinned(false)}
        />
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
          <SidebarItem active label="Command Center" expanded={sidebarPinned} icon={<QueueIcon />} onClick={() => setSidebarPinned(false)} />
          <SidebarItem label="Reports" expanded={sidebarPinned} icon={<ReportsNavIcon />} badge={todayCount > 0 ? todayCount : null} onClick={() => { setSidebarPinned(false); onNavigate?.('verification-reports') }} />
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
        <div className="border-b border-white/[0.06] bg-[#0d0f16]/60 backdrop-blur">
          <div className="page-container !max-w-none py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[15px] font-semibold text-white shrink-0">{initials}</span>
              <div>
                <p className="text-[13px] text-white/40">{greeting}{firstName ? `, ${firstName}` : ''}</p>
                <h1 className="text-[22px] font-semibold text-white leading-tight tracking-tight">Command Center</h1>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
              <StatCard heading="Reports today" value={todayCount} />
              <StatCard heading="Needs review" value={pendingCount} accent />
              <StatCard heading="Avg. AI verify" value={avgVerificationLabel} />
              <StatCard heading="All time total" value={incidents.length} />
            </div>
          </div>
        </div>

        <div className="page-container !max-w-none flex-1 w-full py-7 flex flex-col gap-8">
          {loadError && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
              {loadError}
              <button onClick={loadIncidents} className="ml-3 underline font-medium">Retry</button>
            </div>
          )}

          {!loading && !loadError && incidents.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-16 text-center text-white/35 text-sm">No reports yet.</div>
          )}

          {latest && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
              <div>
                <h3 className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-3">Latest report needing attention</h3>
                <div className="rounded-2xl border border-white/10 bg-[#11141b] overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-4 px-7 pt-7">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-[19px] font-semibold text-white tracking-tight">{latest.incidentType}</h2>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[latest.status] || STATUS_STYLES.Pending}`}>{latest.status}</span>
                      </div>
                      <p className="text-[13px] text-white/35 mt-1.5">Reported {latest.createdAt ? new Date(latest.createdAt).toLocaleString() : '—'}</p>
                    </div>
                    {latest.ai?.overallMismatch && (
                      <span className="rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1.5 text-[12px] text-amber-300">AI signal disagrees with reported type</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-6">
                    <div className="px-7 pb-7 lg:border-r border-white/[0.06]">
                      <h3 className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-3.5">AI Findings</h3>
                      {latest.imageUrl && (
                        <img src={latest.imageUrl} alt="Analyzed by AI" className="w-full aspect-video object-cover rounded-xl border border-white/10 bg-black/20 mb-3.5" />
                      )}
                      <div className="space-y-3">
                        <AiSignal label="Image analysis" detected={latest.ai?.image?.detectedClass} confidence={latest.ai?.image?.confidence} severity={latest.ai?.image?.severity} mismatch={latest.ai?.image?.mismatchFlag} />
                        <AiSignal label="Text analysis" detected={latest.ai?.text?.predictedType} confidence={latest.ai?.text?.confidence} severity={latest.ai?.text?.severity} mismatch={latest.ai?.text?.mismatchFlag} source={latest.ai?.text?.source} aiConfidence={latest.ai?.text?.aiConfidence} citizenConfidence={latest.ai?.text?.citizenConfidence} />
                        {latest.ai?.severity && (
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-between">
                            <span className="text-[13.5px] text-white/55">Combined severity</span>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${SEVERITY_STYLES[latest.ai.severity]}`}>{latest.ai.severity}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/[0.06]">
                        {NEEDS_ACTION.includes(latest.status) && (
                          <div className="flex flex-wrap gap-3">
                            <button onClick={handleVerify} disabled={actionLoading} className="flex-1 min-w-[130px] rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[13.5px] font-semibold py-3 transition-colors">{actionLoading ? 'Working…' : 'Accept & Verify'}</button>
                            <button onClick={() => setShowRejectBox((v) => !v)} disabled={actionLoading} className="flex-1 min-w-[130px] rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 disabled:opacity-50 text-[13.5px] font-semibold py-3 transition-colors">Reject</button>
                          </div>
                        )}
                        {showRejectBox && (
                          <div className="mt-3 flex gap-2">
                            <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection…" className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-white/25" />
                            <button onClick={handleReject} disabled={actionLoading} className="rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[13.5px] font-semibold px-4">Confirm</button>
                          </div>
                        )}
                        {latest.status === 'Verified' && (
                          <button onClick={() => setAssignModalOpen(true)} className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13.5px] font-semibold py-3 transition-colors">Assign Response Team</button>
                        )}
                        {latest.status === 'Assigned' && (
                          <button onClick={handleResolve} disabled={actionLoading} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[13.5px] font-semibold py-3 transition-colors">{actionLoading ? 'Working…' : 'Mark Resolved'}</button>
                        )}
                        {latest.status === 'Rejected' && <p className="text-[13.5px] text-white/40">Rejected{latest.rejectionReason ? ` — ${latest.rejectionReason}` : ''}</p>}
                        {latest.status === 'Resolved' && <p className="text-[13.5px] text-white/40">Resolved — no further action needed.</p>}
                        {actionError && <p className="mt-3 text-[12.5px] text-red-300">{actionError}</p>}
                      </div>

                      {(latest.status === 'Assigned' || latest.status === 'Resolved') && (
                        <div className="mt-6 pt-6 border-t border-white/[0.06]">
                          {!showTimeline ? (
                            <button onClick={() => setShowTimeline(true)} className="text-[13px] font-medium underline text-white/50 hover:text-white/80">View status timeline</button>
                          ) : (
                            <>
                              <h3 className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-3.5">Status Timeline</h3>
                              {latest.assignedTeam && <p className="text-[13.5px] text-white/55 mb-3.5 leading-relaxed">Assigned: {latest.assignedTeam}</p>}
                              <Timeline steps={timeline} />
                              <p className="mt-2.5 text-[11px] text-white/25">Team-reached and resolved times are estimated for display.</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="px-7 pb-7">
                      <h3 className="text-[11px] font-semibold tracking-wider text-white/30 uppercase mb-3.5">Citizen Report</h3>
                      <img src={latest.imageUrl} alt="Incident" className="w-full aspect-[16/10] object-cover rounded-xl border border-white/10 bg-black/20" />
                      <dl className="mt-4 space-y-2.5 text-[13.5px]">
                        <Row label="Location">{latest.location?.placeName || latest.location?.manualAddress || (latest.location?.latitude ? `${latest.location.latitude.toFixed(4)}, ${latest.location.longitude.toFixed(4)}` : '—')}</Row>
                        <Row label="Description">{latest.description || <span className="text-white/30">Not provided</span>}</Row>
                        <Row label="Phone">
                          {(() => {
                            const phones = getPhones(latest.phone)
                            return phones.length ? phones.map(formatPhone).join(', ') : <span className="text-white/30">None</span>
                          })()}
                        </Row>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#11141b] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[12.5px] font-semibold text-white/55">Incoming</h3>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Live" />
                </div>
                {incomingPreview.length === 0 ? (
                  <p className="text-[13px] text-white/30">No pending reports right now.</p>
                ) : (
                  <div className="space-y-2.5">
                    {incomingPreview.map((incident) => (
                      <div key={incident._id} className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3">
                        <p className="text-[13.5px] font-medium text-white truncate">{incident.incidentType}</p>
                        <p className="text-[12px] text-white/35 truncate">{incident.location?.placeName || incident.location?.manualAddress || 'Location unknown'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------- Previous reports: vertical cards -------- */}
          {previousAll.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                <h3 className="text-[11px] font-semibold tracking-wider text-white/30 uppercase">Previous reports</h3>
                <div className="flex gap-2">
                  {PREVIOUS_FILTERS.map((f) => (
                    <button key={f} onClick={() => { setPreviousFilter(f); setPreviousVisible(PAGE_SIZE) }} className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${previousFilter === f ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-white/45 hover:text-white/70'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {previousVisibleList.map((incident) => (
                  <PreviousCard key={incident._id} incident={incident} onClick={() => onNavigate?.('incident-detail', { id: incident._id, from: 'officer', backTo: 'verification-dashboard' })} />
                ))}
              </div>

              {previousVisible < previousFiltered.length && (
                <button onClick={() => setPreviousVisible((v) => v + PAGE_SIZE)} className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white/55 hover:text-white hover:border-white/20 text-[13px] font-medium py-2.5 transition-colors">
                  View more reports <ChevronDoubleDownIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {assignModalOpen && latest && (
        <AssignModal incident={latest} loading={actionLoading} error={actionError} onCancel={() => setAssignModalOpen(false)} onConfirm={(assignedTeam) => runAction(`/dashboard/incident/${latest._id}/assign`, { assignedTeam })} />
      )}
    </div>
  )
}

function PreviousCard({ incident, onClick }) {
  return (
    <button onClick={onClick} className="text-left rounded-2xl border border-white/10 bg-[#11141b] overflow-hidden hover:border-white/20 transition-colors">
      <div className="aspect-video bg-black/30">
        {incident.imageUrl && <img src={incident.imageUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-white text-[14px] truncate">{incident.incidentType}</span>
        </div>
        <p className="mt-1 text-[12px] text-white/40 truncate">{incident.location?.placeName || incident.location?.manualAddress || 'Unknown location'}</p>
        <span className={`mt-2.5 inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${STATUS_STYLES[incident.status] || STATUS_STYLES.Pending}`}>{incident.status}</span>
      </div>
    </button>
  )
}

function StatCard({ heading, value, accent }) {
  return (
    <div className={`shrink-0 rounded-xl border px-4 py-2.5 min-w-[100px] ${accent ? 'border-amber-500/25 bg-amber-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
      <p className="text-[10.5px] text-white/35 uppercase tracking-wider font-medium leading-tight">{heading}</p>
      <p className={`text-[20px] font-semibold mt-0.5 ${accent ? 'text-amber-300' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function Timeline({ steps }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.key} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <span className={`h-2.5 w-2.5 rounded-full border-2 ${step.done ? 'bg-emerald-400 border-emerald-400' : 'bg-transparent border-white/20'}`} />
            {i < steps.length - 1 && <span className={`w-px flex-1 min-h-[22px] ${step.done ? 'bg-emerald-400/40' : 'bg-white/10'}`} />}
          </div>
          <div className="pb-3.5">
            <p className={`text-[13.5px] ${step.done ? 'text-white/80' : 'text-white/30'}`}>{step.label}</p>
            {step.time && <p className="text-[11.5px] text-white/30 mt-0.5">{step.time.toLocaleString()}{step.simulated && ' (estimated)'}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function AssignModal({ incident, loading, error, onCancel, onConfirm }) {
  const placeName = incident.location?.placeName || incident.location?.manualAddress
  const options = getResponderOptions(placeName)
  const [selectedIds, setSelectedIds] = useState([])
  const [instructions, setInstructions] = useState('')
  const [touched, setTouched] = useState(false)
  const toggle = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const canSend = selectedIds.length > 0 && instructions.trim().length > 0
  const handleSend = () => {
    setTouched(true)
    if (!canSend) return
    const teamNames = options.filter((o) => selectedIds.includes(o.id)).map((o) => o.label)
    onConfirm(`${teamNames.join(', ')} — ${instructions.trim()}`)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12151d] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-[16px] font-semibold text-white">Assign Response Team</h2>
          <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-white">{incident.incidentType}</span>
              {incident.ai?.severity && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${SEVERITY_STYLES[incident.ai.severity] || SEVERITY_STYLES.Low}`}>{incident.ai.severity}</span>}
            </div>
            <p className="mt-1 text-[13px] text-white/40">{placeName || 'Location unknown'}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[13.5px] text-white/65 mb-2.5">Select responder(s) <span className="text-red-400">*</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const active = selectedIds.includes(opt.id)
                return (
                  <button key={opt.id} type="button" onClick={() => toggle(opt.id)} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${active ? 'border-white/30 bg-white/[0.06]' : 'border-white/10 bg-transparent hover:border-white/20'}`}>
                    <span className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center ${active ? 'bg-white/90 border-white/90' : 'border-white/25'}`}>
                      {active && <svg viewBox="0 0 24 24" className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>}
                    </span>
                    <span className="text-[13.5px] text-white/85 leading-tight">{opt.label}</span>
                  </button>
                )
              })}
            </div>
            {touched && selectedIds.length === 0 && <p className="mt-2 text-[12.5px] text-red-300">Select at least one responder.</p>}
          </div>
          <div>
            <label className="block text-[13.5px] text-white/65 mb-2">Instructions <span className="text-red-400">*</span></label>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Any details the responding team should know…" className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-white/25 resize-none" />
            {touched && instructions.trim().length === 0 && <p className="mt-2 text-[12.5px] text-red-300">Instructions are required.</p>}
          </div>
          {error && <p className="text-[13px] text-red-300">{error}</p>}
        </div>
        <div className="p-6 border-t border-white/[0.06] flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-white/10 text-white/55 hover:text-white hover:border-white/20 text-[13.5px] font-semibold py-3 transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={loading} className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[13.5px] font-semibold py-3 transition-colors">{loading ? 'Sending…' : 'Send Alert'}</button>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, expanded, badge, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/70'} ${!expanded && 'justify-center'}`}>
      <span className="shrink-0 w-5 h-5">{icon}</span>
      {expanded && (
        <span className="flex-1 flex items-center justify-between text-[13.5px] font-medium whitespace-nowrap">
          {label}
          {badge != null && <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-[10.5px] text-white/65">{badge}</span>}
        </span>
      )}
    </button>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 w-20 text-white/30">{label}</dt>
      <dd className="text-white/70">{children}</dd>
    </div>
  )
}

function AiSignal({ label, detected, confidence, severity, mismatch, source, aiConfidence, citizenConfidence }) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = citizenConfidence != null

  return (
    <div className={`rounded-xl border p-3.5 ${mismatch ? 'border-amber-500/25 bg-amber-500/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-white/45">{label}</span>
        {mismatch && <span className="text-[10px] text-amber-400 font-medium">Mismatch</span>}
      </div>
      {detected ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="mt-1 text-[14.5px] font-medium text-white">{detected}</p>
              <p className="text-[11.5px] text-white/35">
                {confidence != null ? `${Math.round(confidence * 100)}% confidence` : ''}{severity ? ` · ${severity}` : ''}
                {source && <span className="ml-1 opacity-70">· from {source === 'citizen' ? 'citizen selection' : 'AI'}</span>}
              </p>
            </div>
            {hasBreakdown && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="shrink-0 mt-0.5 rounded p-1 text-white/35 hover:text-white/60 transition-colors"
                aria-label={expanded ? 'Hide confidence breakdown' : 'Show confidence breakdown'}
              >
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          {hasBreakdown && expanded && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-white/40">AI text analysis(From description)</span>
                <span className="text-white/70">{aiConfidence != null ? `${Math.round(aiConfidence * 100)}%` : 'Not run — no description'}</span>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-white/40">Citizen's selected incident type</span>
                <span className="text-white/70">{Math.round(citizenConfidence * 100)}%</span>
              </div>
              <p className="text-[10.5px] text-white/25 pt-0.5">Showing the stronger of the two signals for this report.</p>
            </div>
          )}
        </>
      ) : (
        <p className="mt-1 text-[13px] text-white/30">No confident signal</p>
      )}
    </div>
  )
}

function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function QueueIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" /></svg> }
function ReportsNavIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg> }
function SignOutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg> }
function MenuIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18M3 12h18M3 18h18" /></svg> }
function ChevronDoubleDownIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7 6 5 5 5-5M7 13l5 5 5-5" /></svg> }