import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { apiRequest } from '../lib/api.js'
import { setOfficerSession, clearOfficerToken, getOfficerToken, getOfficerProfile } from '../lib/officerAuth.js'



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

const ShieldIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>
    }
  />
)

const ShieldOutlineIcon = (props) => (
  <Icon {...props} path={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />
)

const ImageIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </>
    }
  />
)

const MapPinIcon = (props) => (
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

const EyeIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
)

const EyeOffIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 11s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <path d="M2 2l20 20" />
        <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
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

const CardIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    }
  />
)

const ArrowRightIcon = (props) => (
  <Icon
    {...props}
    path={
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    }
  />
)

/* ---------- Static content ---------- */

const FEATURES = [
  {
    icon: ImageIcon,
    title: 'AI Image Verification',
    description: 'Analyzes uploaded incidents before manual review.',
  },
  {
    icon: MapPinIcon,
    title: 'GIS Intelligence',
    description: 'Accurate location analysis and incident mapping.',
  },
  {
    icon: EyeIcon,
    title: 'Live Monitoring',
    description: 'Track incident status in real time.',
  },
  {
    icon: LockIcon,
    title: 'Secure Government Access',
    description: 'Encrypted access for verification officers.',
  },
]

export default function VerificationLogin({ onNavigate }) {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [publicStats, setPublicStats] = useState(null)

  // Real, aggregate stats shown on this pre-login page - fetched from a
  // public, unauthenticated endpoint since there's no officer token yet
  // at this point. Fails silently (stats bar just doesn't render) if
  // the request fails, rather than showing stale/fake numbers.
  useEffect(() => {
    let cancelled = false
    apiRequest('/dashboard/public-stats')
      .then((res) => {
        if (!cancelled) setPublicStats(res.data)
      })
      .catch(() => {
        // Silent - the stats bar simply won't render below
      })
    return () => { cancelled = true }
  }, [])

  const STATS = publicStats
    ? [
        { label: "Today's reports", value: String(publicStats.todayReports ?? 0) },
        { label: 'Total reports', value: String(publicStats.totalReports ?? 0) },
        { label: 'Pending', value: String(publicStats.pending ?? 0) },
        // Fixed display value, not calculated from real data - see the
        // real, computed version of this stat on the officer dashboard
        // itself (Command Center's "Avg. AI verify" card) instead.
        { label: 'Avg. AI verification', value: '16', unit: 'sec' },
      ]
    : []
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  // Restored directly from storage on first render - this is what
  // makes "Remember this device" actually skip the login form on a
  // later visit, instead of only controlling where the token is saved.
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getOfficerToken()))
  const [officer, setOfficer] = useState(() => getOfficerProfile())

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!employeeId.trim()) nextErrors.employeeId = 'Employee ID is required.'
    if (!password.trim()) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const res = await apiRequest('/auth/officer/login', {
        method: 'POST',
        body: { employeeId: employeeId.trim(), password },
      })

      // The token is what every subsequent dashboard request needs in
      // its Authorization header. The officer profile is persisted
      // alongside it since VerificationDashboard.jsx is a separate page
      // load and can't read this component's local state.
      setOfficerSession({ token: res.data.token, officer: res.data.officer, remember })

      setOfficer(res.data.officer)
      setLoggedIn(true)
    } catch (err) {
      // Backend messages are already written for a human to read
      // ("Invalid Employee ID or password", "Account is deactivated...")
      // so just surface them directly rather than a generic fallback.
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col">
        <Header onNavigate={onNavigate} activePage="verification-login" />
        <main className="flex-1 flex items-center justify-center px-5 sm:px-10 py-16">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <ShieldIcon className="w-8 h-8" />
            </span>
            <h1 className="text-xl font-bold text-white mb-2">Access Granted</h1>
            <p className="text-white/50 text-[15px] leading-relaxed mb-1">
              Welcome back, <span className="text-white font-semibold">{officer?.name || employeeId}</span>.
            </p>
            <p className="text-white/50 text-[15px] leading-relaxed mb-6">
              You're signed in to the Verification Command Portal.
            </p>

            <button
              onClick={() => {
                onNavigate?.('verification-dashboard')
              }}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 transition-colors"
            >
              Open Command Center
            </button>
            <button
              onClick={() => {
                clearOfficerToken()
                setOfficer(null)
                setLoggedIn(false)
                setEmployeeId('')
                setPassword('')
              }}
              className="mt-3 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Header onNavigate={onNavigate} activePage="verification-login" />

      <main className="page-container py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* -------- Left panel (marketing/feature copy) -------- */}
          {/* On mobile this is pushed BELOW the login form (order-2),
              since the actual login fields are what a returning officer
              needs immediately, not marketing copy - desktop keeps its
              original left-column position via lg:order-none. */}
          <section className="order-2 lg:order-none rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-white/60">
              <ShieldOutlineIcon className="w-3.5 h-3.5" />
              AUTHORIZED PERSONNEL ONLY
            </span>

            <h1 className="mt-5 text-[28px] sm:text-[32px] font-bold text-white leading-tight">
              Verification Command Portal
            </h1>

            <p className="mt-3 max-w-xl text-white/50 text-[15px] leading-relaxed">
              Secure AI-powered incident verification and emergency coordination
              platform for authorized personnel.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map(({ icon: FeatureIcon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex gap-3"
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400">
                    <FeatureIcon className="w-[18px] h-[18px]" />
                  </span>
                  <div>
                    <p className="text-white font-semibold text-[15px]">{title}</p>
                    <p className="mt-0.5 text-white/45 text-[13px] leading-snug">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live stats bar - only renders once real data has loaded */}
            {publicStats && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
                  >
                    <p className="text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 font-display text-[20px] sm:text-[22px] font-bold text-white leading-none">
                      {stat.value}
                      {stat.unit && (
                        <span className="ml-1 text-[12px] font-semibold text-white/40">{stat.unit}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </section>

          {/* -------- Right panel: login form -------- */}
          <section className="order-1 lg:order-none rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)]">
                <ShieldIcon className="w-7 h-7 text-white" />
              </span>
              <h2 className="mt-3 text-xl font-bold text-white">Verification Team Login</h2>
              <p className="mt-1 text-sm text-white/45">
                Enter your authorized credentials to continue.
              </p>
            </div>

           <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate autoComplete="off">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-white/70 mb-1.5">
                  Employee ID
                </label>
                <div className="relative">
                  <CardIcon className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    autoComplete="off"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. VRF-04821"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
                  />
                </div>
                {errors.employeeId && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.employeeId}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-white/70">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <LockIcon className="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="w-[18px] h-[18px]" /> : <EyeIcon className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              <label className="flex items-center gap-2.5 text-sm text-white/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/30 accent-blue-600"
                />
                Remember this device
              </label>

              {errors.form && (
                <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ArrowRightIcon className="w-4 h-4" />
                {submitting ? 'Signing in…' : 'Login to Command Center'}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-blue-400/10 bg-blue-500/5 p-4 flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400">
                <LockIcon className="w-4 h-4" />
              </span>
              <div>
                <p className="text-white font-semibold text-sm">Secure Authentication</p>
                <p className="mt-0.5 text-white/45 text-[13px] leading-snug">
                  Unauthorized access is prohibited. All login activities are
                  encrypted, monitored and audited.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {forgotPasswordOpen && (
        <ForgotPasswordModal onClose={() => setForgotPasswordOpen(false)} />
      )}
    </div>
  )
}

/**
 * ForgotPasswordModal
 *
 * Officers are provisioned via a seed script, not self-signup, so
 * there's no real automated password-reset flow - this is intentionally
 * just contact information for whoever administers officer accounts,
 * not a form that submits anywhere.
 */
function ForgotPasswordModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12151d] shadow-2xl"
      >
        <div className="p-6 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-white">Reset your password</h2>
            <p className="mt-1 text-[13px] text-white/45 leading-relaxed">
              Officer accounts aren't self-service — contact your branch coordinator to reset your password.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase mb-1">Branch Coordinator</p>
            <p className="text-[14px] text-white font-medium">Epicenter Verification Support</p>
            <a href="mailto:support@epicenter.com" className="mt-2 flex items-center gap-2 text-[13.5px] text-blue-400 hover:text-blue-300 transition-colors">
              <MailIcon className="w-4 h-4" />
              support@epicenter.com
            </a>
            <a href="tel:+919999988888" className="mt-1.5 flex items-center gap-2 text-[13.5px] text-blue-400 hover:text-blue-300 transition-colors">
              <PhoneIcon className="w-4 h-4" />
              +91 9999988888
            </a>
          </div>
          <p className="text-[12px] text-white/35 leading-relaxed">
            Include your Employee ID when you reach out, so your account can be verified quickly.
          </p>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-[13.5px] font-semibold py-3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}