import { useEffect, useState } from 'react'
import logoIcon from '../assets/logo-transparent.png'
import Header from '../components/Header.jsx'
import { apiRequest } from '../lib/api.js'
import { getOfficerToken, getOfficerProfile, clearOfficerToken } from '../lib/officerAuth.js'
import { getCitizenAuth } from '../lib/citizenAuth.js'
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

function getPhones(phone) {
  const arr = Array.isArray(phone) ? phone : phone ? [phone] : []
  return arr.filter(Boolean)
}

export default function IncidentDetail({ params, onNavigate }) {
  const { id, from, backTo } = params || {}
  const isOfficerView = from === 'officer'

  const [officerToken] = useState(isOfficerView ? getOfficerToken : () => null)
  const [officer] = useState(isOfficerView ? getOfficerProfile : () => null)
  const [citizenAuth] = useState(!isOfficerView ? getCitizenAuth : () => null)

  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [nowTick] = useState(Date.now())

  useEffect(() => {
    if (isOfficerView && !officerToken) {
      onNavigate?.('verification-login')
      return
    }
    if (!isOfficerView && !citizenAuth?.token) {
      onNavigate?.('my-reports')
      return
    }
  }, [isOfficerView, officerToken, citizenAuth, onNavigate])

  const load = async () => {
    if (!id) return
    setLoading(true)
    setLoadError('')
    try {
      const token = isOfficerView ? officerToken : citizenAuth?.token
      const res = await apiRequest(`/incident/${id}`, { token })
      setIncident(res.data.incident)
    } catch (err) {
      if (isOfficerView && (err.message.toLowerCase().includes('not authorized') || err.message.toLowerCase().includes('token'))) {
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
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const runAction = async (path, body) => {
    if (!incident) return
    setActionError('')
    setActionLoading(true)
    try {
      await apiRequest(path, { method: 'PUT', body, token: officerToken })
      await load()
      setShowRejectBox(false)
      setAssignModalOpen(false)
      setRejectReason('')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerify = () => runAction(`/dashboard/incidents/${incident._id}/verify`)
  const handleReject = () => runAction(`/dashboard/incident/${incident._id}/reject`, { reason: rejectReason || 'Not specified' })
  const handleResolve = () => runAction(`/dashboard/incident/${incident._id}/resolve`)
  const handleSignOut = () => { clearOfficerToken(); onNavigate?.('verification-login') }

  const timeline = incident ? (() => { try { return buildIncidentTimeline(incident) } catch { return [] } })() : []

  const defaultBackTarget = isOfficerView ? 'verification-dashboard' : 'my-reports'
  const backTarget = backTo || defaultBackTarget
  const backLabel = backTarget === 'verification-reports'
    ? 'Back to Reports'
    : backTarget === 'my-reports'
    ? 'Back to My Reports'
    : 'Back to Command Center'

  // ---------- Officer chrome: same sidebar as the rest of the officer app ----------
  if (isOfficerView) {
    if (!officerToken) return null
    const initials = (officer?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

    return (
      <div className="min-h-screen bg-[#0a0c12] flex">
        <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-white/[0.06] bg-[#0d0f16] w-[72px]">
          <button onClick={() => onNavigate?.('home')} className="flex items-center gap-3 h-[72px] px-5 shrink-0">
            <img src={logoIcon} alt="" className="h-8 w-8 shrink-0" />
          </button>
          <nav className="flex-1 px-3 pt-4 space-y-1">
            <button onClick={() => onNavigate?.('verification-dashboard')} className="w-full flex items-center justify-center rounded-xl px-3 py-2.5 text-white/40 hover:text-white/70 transition-colors">
              <QueueIcon />
            </button>
            <button onClick={() => onNavigate?.('verification-reports')} className="w-full flex items-center justify-center rounded-xl px-3 py-2.5 text-white/40 hover:text-white/70 transition-colors">
              <ReportsNavIcon />
            </button>
          </nav>
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-center rounded-xl px-3 py-2.5">
              <span className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[12px] font-semibold text-white">{initials}</span>
            </div>
            <button onClick={handleSignOut} className="mt-2 w-full flex items-center justify-center rounded-xl px-3 py-2.5 text-white/40 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors">
              <SignOutIcon />
            </button>
          </div>
        </aside>

        <div className="flex-1 ml-0 lg:ml-[72px]">
          <div className="page-container !max-w-none py-7">
            <button onClick={() => onNavigate?.(backTarget)} className="flex items-center gap-2 text-[13.5px] text-white/45 hover:text-white/75 transition-colors mb-5">
              <BackIcon className="w-4 h-4" /> {backLabel}
            </button>

            {loading && <p className="text-white/40 text-sm">Loading…</p>}
            {loadError && <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">{loadError}</div>}

            {incident && (
              <DetailCard
                incident={incident}
                dark
                timeline={timeline}
                showTimeline={showTimeline}
                setShowTimeline={setShowTimeline}
                actions={
                  <>
                    {NEEDS_ACTION.includes(incident.status) && (
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
                    {incident.status === 'Verified' && (
                      <button onClick={() => setAssignModalOpen(true)} className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[13.5px] font-semibold py-3 transition-colors">Assign Response Team</button>
                    )}
                    {incident.status === 'Assigned' && (
                      <button onClick={handleResolve} disabled={actionLoading} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[13.5px] font-semibold py-3 transition-colors">{actionLoading ? 'Working…' : 'Mark Resolved'}</button>
                    )}
                    {incident.status === 'Rejected' && <p className="text-[13.5px] text-white/40">Rejected{incident.rejectionReason ? ` — ${incident.rejectionReason}` : ''}</p>}
                    {incident.status === 'Resolved' && <p className="text-[13.5px] text-white/40">Resolved — no further action needed.</p>}
                    {actionError && <p className="mt-3 text-[12.5px] text-red-300">{actionError}</p>}
                  </>
                }
              />
            )}
          </div>
        </div>

        {assignModalOpen && incident && (
          <AssignModal incident={incident} loading={actionLoading} error={actionError} onCancel={() => setAssignModalOpen(false)} onConfirm={(assignedTeam) => runAction(`/dashboard/incident/${incident._id}/assign`, { assignedTeam })} />
        )}
      </div>
    )
  }

  // ---------- Citizen chrome: light theme, matches ReportIncident/MyReports ----------
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header onNavigate={onNavigate} activePage="report" auth={citizenAuth} />
      <main className="flex-1 page-container w-full py-8 lg:py-10">
        <button onClick={() => onNavigate?.(backTarget)} className="flex items-center gap-2 text-[13.5px] text-muted hover:text-navy transition-colors mb-5">
          <BackIcon className="w-4 h-4" /> {backLabel}
        </button>

        {loading && <p className="text-muted text-sm">Loading…</p>}
        {loadError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">{loadError}</div>}

        {incident && (
          <DetailCard incident={incident} dark={false} timeline={timeline} showTimeline={showTimeline} setShowTimeline={setShowTimeline} actions={null} />
        )}
      </main>
    </div>
  )
}

function DetailCard({ incident, dark, timeline, showTimeline, setShowTimeline, actions }) {
  const cardBg = dark ? 'bg-[#11141b] border-white/10' : 'bg-white border-border'
  const headingClr = dark ? 'text-white/30' : 'text-muted/70'
  const titleClr = dark ? 'text-white' : 'text-navy'
  const subClr = dark ? 'text-white/35' : 'text-muted'
  const dividerClr = dark ? 'border-white/[0.06]' : 'border-border'
  const canShowTimelineToggle = incident.status === 'Assigned' || incident.status === 'Resolved'

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-7 pt-7">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-[19px] font-semibold tracking-tight ${titleClr}`}>{incident.incidentType}</h2>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[incident.status] || STATUS_STYLES.Pending}`}>{incident.status}</span>
          </div>
          <p className={`text-[13px] mt-1.5 ${subClr}`}>Reported {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : '—'}</p>
        </div>
        {incident.ai?.overallMismatch && (
          <span className="rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1.5 text-[12px] text-amber-300">AI signal disagrees with reported type</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-6">
        <div className={`px-7 pb-7 lg:border-r ${dividerClr}`}>
          <h3 className={`text-[11px] font-semibold tracking-wider uppercase mb-3.5 ${headingClr}`}>AI Findings</h3>
          {incident.imageUrl && (
            <img src={incident.imageUrl} alt="Analyzed by AI" className={`w-full aspect-video object-cover rounded-xl border mb-3.5 ${dark ? 'border-white/10 bg-black/20' : 'border-border bg-gray-100'}`} />
          )}
          <div className="space-y-3">
            <AiSignal dark={dark} label="Image analysis" detected={incident.ai?.image?.detectedClass} confidence={incident.ai?.image?.confidence} severity={incident.ai?.image?.severity} mismatch={incident.ai?.image?.mismatchFlag} />
            <AiSignal dark={dark} label="Text analysis" detected={incident.ai?.text?.predictedType} confidence={incident.ai?.text?.confidence} severity={incident.ai?.text?.severity} mismatch={incident.ai?.text?.mismatchFlag} source={incident.ai?.text?.source} aiConfidence={incident.ai?.text?.aiConfidence} citizenConfidence={incident.ai?.text?.citizenConfidence} />
            {incident.ai?.severity && (
              <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${dark ? 'border-white/10 bg-white/[0.02]' : 'border-border bg-gray-50'}`}>
                <span className={`text-[13.5px] ${dark ? 'text-white/55' : 'text-muted'}`}>Combined severity</span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${SEVERITY_STYLES[incident.ai.severity]}`}>{incident.ai.severity}</span>
              </div>
            )}
          </div>

          {actions && <div className={`mt-6 pt-6 border-t ${dividerClr}`}>{actions}</div>}

          {canShowTimelineToggle && (
            <div className={`mt-6 pt-6 border-t ${dividerClr}`}>
              {!showTimeline ? (
                <button onClick={() => setShowTimeline(true)} className={`text-[13px] font-medium underline ${dark ? 'text-white/50 hover:text-white/80' : 'text-muted hover:text-navy'}`}>
                  View status timeline
                </button>
              ) : (
                <>
                  <h3 className={`text-[11px] font-semibold tracking-wider uppercase mb-3.5 ${headingClr}`}>Status Timeline</h3>
                  {incident.assignedTeam && <p className={`text-[13.5px] mb-3.5 leading-relaxed ${dark ? 'text-white/55' : 'text-muted'}`}>Assigned: {incident.assignedTeam}</p>}
                  <Timeline steps={timeline} dark={dark} />
                  <p className={`mt-2.5 text-[11px] ${dark ? 'text-white/25' : 'text-muted/60'}`}>Team-reached and resolved times are estimated for display.</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-7 pb-7">
          <h3 className={`text-[11px] font-semibold tracking-wider uppercase mb-3.5 ${headingClr}`}>Citizen Report</h3>
          <img src={incident.imageUrl} alt="Incident" className={`w-full aspect-[16/10] object-cover rounded-xl border ${dark ? 'border-white/10 bg-black/20' : 'border-border bg-gray-100'}`} />
          <dl className="mt-4 space-y-2.5 text-[13.5px]">
            <Row dark={dark} label="Location">{incident.location?.placeName || incident.location?.manualAddress || (incident.location?.latitude ? `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}` : '—')}</Row>
            <Row dark={dark} label="Description">{incident.description || <span className={dark ? 'text-white/30' : 'text-muted/60'}>Not provided</span>}</Row>
            <Row dark={dark} label="Phone">
              {(() => {
                const phones = getPhones(incident.phone)
                return phones.length ? phones.map(formatPhone).join(', ') : <span className={dark ? 'text-white/30' : 'text-muted/60'}>None</span>
              })()}
            </Row>
          </dl>
        </div>
      </div>
    </div>
  )
}

function Timeline({ steps, dark }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.key} className="flex gap-3.5">
          <div className="flex flex-col items-center">
            <span className={`h-2.5 w-2.5 rounded-full border-2 ${step.done ? 'bg-emerald-400 border-emerald-400' : dark ? 'bg-transparent border-white/20' : 'bg-transparent border-gray-300'}`} />
            {i < steps.length - 1 && <span className={`w-px flex-1 min-h-[22px] ${step.done ? 'bg-emerald-400/40' : dark ? 'bg-white/10' : 'bg-gray-200'}`} />}
          </div>
          <div className="pb-3.5">
            <p className={`text-[13.5px] ${step.done ? (dark ? 'text-white/80' : 'text-navy') : (dark ? 'text-white/30' : 'text-muted/50')}`}>{step.label}</p>
            {step.time && <p className={`text-[11.5px] mt-0.5 ${dark ? 'text-white/30' : 'text-muted/60'}`}>{step.time.toLocaleString()}{step.simulated && ' (estimated)'}</p>}
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

function Row({ label, children, dark }) {
  return (
    <div className="flex gap-2">
      <dt className={`shrink-0 w-20 ${dark ? 'text-white/30' : 'text-muted/70'}`}>{label}</dt>
      <dd className={dark ? 'text-white/70' : 'text-navy'}>{children}</dd>
    </div>
  )
}

function AiSignal({ label, detected, confidence, severity, mismatch, dark, source, aiConfidence, citizenConfidence }) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = citizenConfidence != null

  return (
    <div className={`rounded-xl border p-3.5 ${mismatch ? 'border-amber-500/25 bg-amber-500/[0.06]' : dark ? 'border-white/10 bg-white/[0.02]' : 'border-border bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[12.5px] ${dark ? 'text-white/45' : 'text-muted'}`}>{label}</span>
        {mismatch && <span className="text-[10px] text-amber-400 font-medium">Mismatch</span>}
      </div>
      {detected ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`mt-1 text-[14.5px] font-medium ${dark ? 'text-white' : 'text-navy'}`}>{detected}</p>
              <p className={`text-[11.5px] ${dark ? 'text-white/35' : 'text-muted/70'}`}>
                {confidence != null ? `${Math.round(confidence * 100)}% confidence` : ''}{severity ? ` · ${severity}` : ''}
                {source && <span className="ml-1 opacity-70">· from {source === 'citizen' ? 'citizen selection' : 'AI'}</span>}
              </p>
            </div>
            {hasBreakdown && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className={`shrink-0 mt-0.5 rounded p-1 transition-colors ${dark ? 'text-white/35 hover:text-white/60' : 'text-muted/60 hover:text-navy'}`}
                aria-label={expanded ? 'Hide confidence breakdown' : 'Show confidence breakdown'}
              >
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          {hasBreakdown && expanded && (
            <div className={`mt-2.5 pt-2.5 border-t space-y-1.5 ${dark ? 'border-white/10' : 'border-border'}`}>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className={dark ? 'text-white/40' : 'text-muted/70'}>AI text analysis(From description)</span>
                <span className={dark ? 'text-white/70' : 'text-navy/80'}>{aiConfidence != null ? `${Math.round(aiConfidence * 100)}%` : 'Not run — no description'}</span>
              </div>
              <div className="flex items-center justify-between text-[11.5px]">
                <span className={dark ? 'text-white/40' : 'text-muted/70'}>Citizen's selected incident type</span>
                <span className={dark ? 'text-white/70' : 'text-navy/80'}>{Math.round(citizenConfidence * 100)}%</span>
              </div>
              <p className={`text-[10.5px] pt-0.5 ${dark ? 'text-white/25' : 'text-muted/50'}`}>
                Showing the stronger of the two signals for this report.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className={`mt-1 text-[13px] ${dark ? 'text-white/30' : 'text-muted/60'}`}>No confident signal</p>
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

function QueueIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" /></svg> }
function ReportsNavIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></svg> }
function SignOutIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg> }
function BackIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> }