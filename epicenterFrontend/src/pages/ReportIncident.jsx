import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header.jsx'
import { apiRequest } from '../lib/api.js'
import { getCitizenAuth, setCitizenAuth } from '../lib/citizenAuth.js'


const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {path}
  </svg>
)

const LocationPinIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    }
  />
)

const SearchIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </>
    }
  />
)

const BellIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    }
  />
)

const LockIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    }
  />
)

const CameraIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M9 4 7.5 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3.5L15 4H9Z" />
        <circle cx="12" cy="13" r="3.5" />
        <circle cx="6.2" cy="9" r="0.6" fill="currentColor" stroke="none" />
      </>
    }
  />
)

const INCIDENT_TYPES = [
  {
    id: 'building-collapse',
    icon: '🏚️',
    iconBg: 'bg-red-100',
    title: 'Building Collapse',
    description: 'Collapsed building, damaged structure, unstable walls',
  },
  {
    id: 'people-trapped',
    icon: '❤️',
    iconBg: 'bg-pink-100',
    title: 'People Trapped or Injured',
    description: 'People trapped, injured or requiring immediate rescue',
  },
  {
    id: 'fire',
    icon: '🔥',
    iconBg: 'bg-orange-100',
    title: 'Fire',
    description: 'Flames, smoke or active fire emergency',
  },
  {
    id: 'gas-leak',
    icon: '☣️',
    iconBg: 'bg-emerald-100',
    title: 'Gas or Chemical Leak',
    description: 'Gas leak, chemical spill, toxic fumes',
  },
  {
    id: 'road-damage',
    icon: '🏛️',
    iconBg: 'bg-amber-100',
    title: 'Road or Bridge Damage',
    description: 'Road collapse, bridge damage, landslide or debris',
  },
  {
    id: 'flooding',
    icon: '🌊',
    iconBg: 'bg-blue-100',
    title: 'Flooding',
    description: 'Waterlogging, flash flood, rising water',
  },
  {
    id: 'electrical',
    icon: '⚡',
    iconBg: 'bg-yellow-100',
    title: 'Electrical Hazard',
    description: 'Fallen electric wires, transformer blast, electrical sparks',
  },
  {
    id: 'fallen-tree',
    icon: '🌳',
    iconBg: 'bg-teal-100',
    title: 'Fallen Tree or Pole',
    description: 'Tree or electric pole blocking roads or causing danger',
  },
]

// Mirrors the backend's real status progression (Pending -> AI Verified /
// Waiting for Verification -> Verified -> Assigned -> Resolved), collapsed
// to the four milestones worth showing a citizen on a tracker.
const STATUS_STEPS = [
  { key: 'reported', label: 'Reported' },
  { key: 'ai', label: 'AI Checked' },
  { key: 'verified', label: 'Verified' },
  { key: 'assigned', label: 'Team Assigned' },
]

export default function ReportIncident({ onNavigate }) {
  const [selectedType, setSelectedType] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [locationText, setLocationText] = useState('')
  const [coords, setCoords] = useState(null) // { latitude, longitude } once GPS succeeds; null if using manual text
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedIncidentId, setSubmittedIncidentId] = useState('')
  const [followUpPhone, setFollowUpPhone] = useState('')
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const [followUpError, setFollowUpError] = useState('')
  const [followUpDone, setFollowUpDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [statusIndex, setStatusIndex] = useState(0)
  const [latestStatus, setLatestStatus] = useState('Pending')
  const fileInputRef = useRef(null)

  // auth holds { name, email, avatarUrl, token } once signed in - token
  // is the citizen JWT the backend issued, needed on every authenticated
  // request (incident submission, My Reports, etc). Restored from
  // sessionStorage on mount so a page refresh doesn't sign the citizen out.
  const [auth, setAuth] = useState(getCitizenAuth)
  const [authError, setAuthError] = useState('')
  const googleButtonRef = useRef(null)

  const persistAuth = (value) => {
    setAuth(value)
    setCitizenAuth(value)
  }

  // Handles the ID token Google's script hands back after the citizen
  // picks an account, by forwarding it to the backend for verification -
  // the frontend never decides who someone is on its own, only Google's
  // signed token (checked server-side) does.
  const handleGoogleCredential = async (response) => {
    setAuthError('')
    try {
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: { idToken: response.credential },
      })
      persistAuth({
        name: res.data.user.name,
        email: res.data.user.email,
        avatarUrl: res.data.user.avatarUrl,
        token: res.data.token,
      })
    } catch (err) {
      setAuthError(err.message)
    }
  }

  // Loads Google's Identity Services script once and renders the real
  // "Sign in with Google" button into googleButtonRef, replacing our
  // custom-styled placeholder button. Requires VITE_GOOGLE_CLIENT_ID to
  // be set - without it, sign-in is simply unavailable and the guest
  // flow still works normally.
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || auth) return

    const renderButton = () => {
      if (!window.google || !googleButtonRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
      })
    }

    if (window.google?.accounts?.id) {
      renderButton()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = renderButton
    document.body.appendChild(script)
    return () => script.remove()
  }, [auth])

  const handleHeaderNavigate = (next) => {
    if (next === 'sign-out') {
      persistAuth(null)
      window.google?.accounts?.id?.disableAutoSelect?.()
      return
    }
    onNavigate?.(next)
  }

  // Real tracker: polls the incident's actual status every 8s once
  // submitted, mapping the backend's real status values onto the
  // 4-step display. Stops polling once resolved/rejected, since the
  // status won't change further after that.
  useEffect(() => {
    if (!submitted || !submittedIncidentId) return

    const statusToIndex = (status) => {
      if (['Verified', 'Assigned', 'Resolved'].includes(status)) {
        // Assigned/Resolved both show as "Team Assigned" reached (step 3)
        // - there's no 5th step in this tracker for Resolved specifically.
        return status === 'Verified' ? 2 : 3
      }
      if (['AI Verified', 'Waiting for Verification'].includes(status)) return 1
      return 0 // Pending, or Rejected (still shows as "Reported" progress-wise)
    }

    let cancelled = false

    const poll = async () => {
      try {
        const res = await apiRequest(`/incident/${submittedIncidentId}`)
        if (cancelled) return
        const incident = res.data.incident
        setStatusIndex(statusToIndex(incident.status))
        setLatestStatus(incident.status)
      } catch {
        // Silent - tracker just stays at its last known state if a poll fails
      }
    }

    poll()
    const id = window.setInterval(poll, 8000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [submitted, submittedIncidentId])

  const handleFile = (file) => {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setErrors((e) => ({ ...e, photo: 'Please upload a PNG or JPG/JPEG file.' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, photo: 'File must be under 10 MB.' }))
      return
    }
    setErrors((e) => ({ ...e, photo: undefined }))
    setPhoto(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const useCurrentLocation = () => {
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('Location services are not available on this device.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ latitude, longitude })
        setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setErrors((e) => ({ ...e, location: undefined }))
        setLocating(false)
      },
      () => {
        setLocationError('Could not access your location. Please enter it manually.')
        setLocating(false)
      }
    )
  }

  const validate = () => {
    const next = {}
    if (!selectedType) next.type = 'Please select an incident type.'
    if (!photo) next.photo = 'Please upload a photo of the incident.'
    if (!locationText.trim()) next.location = 'Please provide a location.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitError('')
    setSubmitting(true)

    try {
      const type = INCIDENT_TYPES.find((t) => t.id === selectedType)

      const formData = new FormData()
      // incidentType must be the exact category string the backend
      // validates against ("Building Collapse", "Fire", etc), not our
      // internal slug id — each INCIDENT_TYPES entry's `title` already
      // matches those strings exactly.
      formData.append('incidentType', type.title)
      formData.append('image', photo)

      if (coords) {
        formData.append('latitude', coords.latitude)
        formData.append('longitude', coords.longitude)
      } else if (locationText.trim()) {
        formData.append('manualAddress', locationText.trim())
      }

      if (description.trim()) formData.append('description', description.trim())
      if (phone.trim()) formData.append('phone', phone.trim())
      if (!auth && guestEmail.trim()) formData.append('email', guestEmail.trim())

      // Signed-in citizens link the report to their account so it shows
      // up under My Reports and status updates go to their email — this
      // only adds the header when a real session token exists.
      const token = auth?.token

      const res = await apiRequest('/incident', {
        method: 'POST',
        body: formData,
        token,
      })

      // A duplicate report merges into an existing incident instead of
      // creating a new one (see isDuplicate on the response) — same
      // success screen either way, since the citizen still gets a real
      // incident to track either way.
      setReferenceId(res.data.incident._id.slice(-6).toUpperCase())
      setSubmittedIncidentId(res.data.incident._id)
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddPhoneLater = async () => {
    if (!followUpPhone.trim() || !submittedIncidentId) return
    setFollowUpError('')
    setFollowUpSubmitting(true)
    try {
      await apiRequest(`/incident/${submittedIncidentId}/phone`, {
        method: 'PUT',
        body: { phone: followUpPhone.trim() },
      })
      setFollowUpDone(true)
    } catch (err) {
      setFollowUpError(err.message)
    } finally {
      setFollowUpSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Header onNavigate={handleHeaderNavigate} activePage="report" auth={auth} />
        <main className="flex-1 flex items-center justify-center px-5 py-12 sm:py-16">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-600" aria-hidden="true">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              </div>
              <h1 className="font-display text-xl font-bold text-navy mb-2">
                Report Submitted
              </h1>
              <p className="text-muted text-[15px] leading-relaxed mb-1">
                Reference ID <span className="font-mono font-bold text-navy">#{referenceId}</span>
              </p>
              <p className="text-muted text-[14px] leading-relaxed">
                {latestStatus === 'Rejected'
                  ? 'This report was reviewed and could not be verified.'
                  : latestStatus === 'Resolved'
                  ? 'This report has been resolved.'
                  : latestStatus === 'Assigned'
                  ? 'A response team has been assigned to this report.'
                  : latestStatus === 'Verified'
                  ? 'Your report has been verified and is being processed.'
                  : 'Your report is being verified by our AI system.'}
              </p>
            </div>

            {/* Order-tracker-style status stepper */}
            <div className="mt-7">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" aria-hidden="true" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-emerald-500 transition-all duration-700"
                  style={{ width: `calc(${(STATUS_STEPS.length - 1) === 0 ? 0 : (statusIndex / (STATUS_STEPS.length - 1)) * 100}% - ${statusIndex === 0 ? 0 : 32}px)` }}
                  aria-hidden="true"
                />
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= statusIndex
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                          done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-border text-muted'
                        }`}
                      >
                        {done ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <path d="m20 6-11 11-5-5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2.5 flex justify-between">
                {STATUS_STEPS.map((step, i) => (
                  <span
                    key={step.key}
                    className={`flex-1 text-center text-[10.5px] sm:text-[11px] font-semibold leading-tight px-0.5 ${
                      i <= statusIndex ? 'text-navy' : 'text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-border bg-gray-50/60 p-4 flex items-start gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <p className="text-[13px] text-muted leading-relaxed">
                {auth && phone && `Updates go to ${auth.email} by email, and by WhatsApp to the number you provided.`}
                {auth && !phone && `Updates will be sent to ${auth.email} by email.`}
                {!auth && phone && guestEmail && `Updates will be sent to ${guestEmail} by email, and by WhatsApp to the number you provided.`}
                {!auth && phone && !guestEmail && 'Updates will be sent by WhatsApp to the number you provided.'}
                {!auth && !phone && guestEmail && `Updates will be sent to ${guestEmail} by email.`}
                {!auth && !phone && !guestEmail && 'Sign in with Google to get status updates by email, or add a phone number or email next time for updates.'}
              </p>
            </div>

            {!auth && !phone && !guestEmail && (
              <div className="mt-4 rounded-xl border border-border bg-white p-4">
                {!followUpDone ? (
                  <>
                    <p className="text-[13.5px] font-semibold text-navy">Want live updates on this report?</p>
                    <p className="mt-1 text-[13px] text-muted">
                      Add a phone number now to get WhatsApp status updates and enable real-time tracking for this report.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <input
                        type="tel"
                        value={followUpPhone}
                        onChange={(e) => setFollowUpPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="flex-1 rounded-lg border border-border py-2.5 px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
                      />
                      <button
                        onClick={handleAddPhoneLater}
                        disabled={followUpSubmitting || !followUpPhone.trim()}
                        className="rounded-lg bg-navy hover:bg-navy/90 disabled:opacity-50 text-white text-[13.5px] font-semibold px-4 transition-colors"
                      >
                        {followUpSubmitting ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                    {followUpError && <p className="mt-2 text-[12.5px] text-brand-red">{followUpError}</p>}
                  </>
                ) : (
                  <p className="text-[13.5px] text-emerald-700 font-medium flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0" aria-hidden="true">
                      <path d="m20 6-11 11-5-5" />
                    </svg>
                    Phone number added — you'll get WhatsApp updates on this report.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => onNavigate?.('home')}
              className="mt-6 w-full rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body">
      <Header onNavigate={handleHeaderNavigate} activePage="report" auth={auth} />

      <main className="flex-1 w-full page-container py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-8">
          {/* Left column */}
          <div>
            <h1 className="font-display text-[26px] sm:text-[30px] font-bold text-navy leading-tight">
              Report an{' '}
              <span className="text-brand-red">Emergency</span>
            </h1>
            <p className="mt-4 text-muted text-[15px] leading-relaxed max-w-md">
              Help emergency responders by reporting an incident in less than 60
              seconds. AI will verify your report before forwarding it to the
              verification team.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                'No login required',
                'Your privacy is protected',
                'AI verifies reports automatically',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-navy/90 text-[15px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">
                    ✓
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            {!auth && (
              <div className="mt-8 rounded-2xl border border-border bg-white p-5">
                <h2 className="font-bold text-navy text-[15px]">Want to track updates?</h2>
                <p className="mt-1 text-sm text-muted">
                  Sign in with Google to receive status notifications.
                </p>
                <div className="mt-4">
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                    <div ref={googleButtonRef} />
                  ) : (
                    <p className="text-xs text-muted italic">
                      Google Sign-In isn't configured yet (missing VITE_GOOGLE_CLIENT_ID).
                    </p>
                  )}
                </div>
                {authError && (
                  <p className="mt-2 text-sm text-brand-red">{authError}</p>
                )}
              </div>
            )}

            {auth && (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                  Signed in with Google
                </p>
                <p className="mt-1.5 font-bold text-navy text-[15px]">{auth.name}</p>
                <p className="text-sm text-muted">
                  Status updates for this report will be sent to {auth.email}.
                </p>
              </div>
            )}
          </div>

          {/* Right column: form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-border bg-white shadow-sm p-5 sm:p-8"
          >
            <h2 className="font-display text-lg font-bold text-navy">
              Incident Details
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fill out the form below. All fields marked * are required.
            </p>

            {/* Incident type */}
            <fieldset className="mt-6">
              <legend className="font-bold text-navy text-[15px]">
                Incident Type <span className="text-brand-red">*</span>
              </legend>
              <p className="mt-1 text-sm text-muted">
                Select the emergency that best matches the incident.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INCIDENT_TYPES.map((type) => {
                  const active = selectedType === type.id
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id)
                        setErrors((e) => ({ ...e, type: undefined }))
                      }}
                      aria-pressed={active}
                      className={`text-left rounded-xl border p-4 transition-colors ${
                        active
                          ? 'border-brand-red ring-1 ring-brand-red bg-red-50/40'
                          : 'border-border hover:border-navy/20'
                      }`}
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-lg ${type.iconBg}`}
                      >
                        {type.icon}
                      </span>
                      <p className="mt-3 font-bold text-navy text-[15px]">{type.title}</p>
                      <p className="mt-1 text-[13px] text-muted leading-snug">
                        {type.description}
                      </p>
                    </button>
                  )
                })}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-brand-red">{errors.type}</p>
              )}
            </fieldset>

            {/* Photo upload */}
            <div className="mt-6">
              <label className="font-bold text-navy text-[15px]">
                Upload Incident Photo <span className="text-brand-red">*</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-brand-red bg-red-50/40' : 'border-border bg-gray-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <CameraIcon className="w-6 h-6" />
                </span>
                {photo ? (
                  <>
                    <p className="mt-4 font-bold text-navy">{photo.name}</p>
                    <p className="mt-1 text-sm text-emerald-600 font-semibold">
                      Selected — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-4 font-bold text-navy">
                      Drag &amp; Drop or Click to Upload
                    </p>
                    <p className="mt-1 text-sm text-blue-600 font-semibold">
                      Choose a file from your device
                    </p>
                  </>
                )}
                <p className="mt-2 text-xs text-muted">PNG · JPG · JPEG &nbsp;•&nbsp; Maximum Size 10 MB</p>
              </div>
              {errors.photo && (
                <p className="mt-2 text-sm text-brand-red">{errors.photo}</p>
              )}
            </div>

            {/* Location */}
            <div className="mt-6">
              <label className="font-bold text-navy text-[15px]">
                Location <span className="text-brand-red">*</span>
              </label>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3.5 transition-colors disabled:opacity-60"
              >
                <LocationPinIcon className="w-[18px] h-[18px]" />
                {locating ? 'Locating…' : 'Use Current Location'}
              </button>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold tracking-wide text-muted">
                  OR MANUAL LOCATION
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="relative">
                <SearchIcon className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => {
                    setLocationText(e.target.value)
                    setCoords(null)
                    setErrors((er) => ({ ...er, location: undefined }))
                  }}
                  placeholder="Search for a location…"
                  className="w-full rounded-xl border border-border py-3.5 pl-11 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
                />
              </div>
              {locationError && (
                <p className="mt-2 text-sm text-brand-red">{locationError}</p>
              )}
              {errors.location && (
                <p className="mt-2 text-sm text-brand-red">{errors.location}</p>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="font-bold text-navy text-[15px]">
                Description <span className="text-muted font-medium">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any extra details that could help responders — what's happening, how many people are affected, nearby landmarks…"
                rows={4}
                className="mt-3 w-full rounded-xl border border-border py-3.5 px-4 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
              />
            </div>

            {/* Phone */}
            <div className="mt-6">
              <label className="font-bold text-navy text-[15px]">
                Phone Number <span className="text-muted font-medium">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-3 w-full rounded-xl border border-border py-3.5 px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
              />
              <p className="mt-2 text-sm text-muted">Get WhatsApp updates on this number.{!auth && ' Or add your email below for updates that way instead.'}</p>
            </div>

            {/* Guest email - only relevant for guests, since signed-in
                citizens already get updates via their account email. */}
            {!auth && (
              <div className="mt-6">
                <label className="font-bold text-navy text-[15px]">
                  Email <span className="text-muted font-medium">(optional)</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-xl border border-border py-3.5 px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
                />
                <p className="mt-2 text-sm text-muted">Get status updates by email, even without signing in.</p>
              </div>
            )}

            {submitError && (
              <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-brand-red">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 text-[16px] shadow-[0_10px_24px_-8px_rgba(228,36,48,0.55)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <BellIcon className="w-[18px] h-[18px]" />
              {submitting ? 'Submitting…' : 'Report Incident'}
            </button>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <LockIcon className="w-3.5 h-3.5" />
                End-to-end encrypted
              </span>
              <span>False reports are prohibited.</span>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}