import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ReportIncident from './pages/ReportIncident.jsx'
import VerificationLogin from './pages/VerificationLogin.jsx'
import VerificationDashboard from './pages/VerificationDashboard.jsx'
import VerificationReports from './pages/VerificationReports.jsx'
import MyReports from './pages/MyReports.jsx'
import IncidentDetail from './pages/IncidentDetail.jsx'
import NotificationSettings from './pages/NotificationSettings.jsx'

// Maps the app's old page-name identifiers (used throughout every page
// component's onNavigate('pagename', params) calls) onto real URL
// paths. Kept as a single lookup table rather than rewriting every
// onNavigate call site across all 8 page files - each component still
// calls onNavigate exactly as it always did, but that call now drives
// a real browser URL change instead of just in-memory state.
const PAGE_TO_PATH = {
  home: '/',
  report: '/report',
  'verification-login': '/verification-login',
  'verification-dashboard': '/verification-dashboard',
  'verification-reports': '/verification-reports',
  'my-reports': '/my-reports',
  'notification-settings': '/notification-settings',
}

/**
 * useOnNavigate
 *
 * Returns the same onNavigate(pageName, params) function every page
 * component already expects, but backed by react-router's real
 * navigate() - so calling onNavigate('verification-dashboard') now
 * genuinely changes the URL to /verification-dashboard, supports the
 * browser's back/forward buttons, and makes every page bookmarkable
 * and directly linkable.
 */
function useOnNavigate() {
  const navigate = useNavigate()

  return (pageName, params = null) => {
    if (pageName === 'incident-detail') {
      const { id, from, backTo } = params || {}
      const query = new URLSearchParams()
      if (from) query.set('from', from)
      if (backTo) query.set('backTo', backTo)
      const queryString = query.toString()
      navigate(`/incident/${id}${queryString ? `?${queryString}` : ''}`)
      return
    }

    const path = PAGE_TO_PATH[pageName]
    if (path) {
      navigate(path)
    } else {
      // Unknown page name - fall back to home rather than silently
      // doing nothing, so a typo in a call site is at least visible
      // as an unexpected navigation rather than a dead button.
      navigate('/')
    }
  }
}

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    const id = window.requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => window.cancelAnimationFrame(id)
  }, [location.pathname])
  return null
}

function HomePage() {
  return <Home onNavigate={useOnNavigate()} />
}

function ReportPage() {
  return <ReportIncident onNavigate={useOnNavigate()} />
}

function VerificationLoginPage() {
  return <VerificationLogin onNavigate={useOnNavigate()} />
}

function VerificationDashboardPage() {
  return <VerificationDashboard onNavigate={useOnNavigate()} />
}

function VerificationReportsPage() {
  return <VerificationReports onNavigate={useOnNavigate()} />
}

function MyReportsPage() {
  return <MyReports onNavigate={useOnNavigate()} />
}

function NotificationSettingsPage() {
  return <NotificationSettings onNavigate={useOnNavigate()} />
}

function IncidentDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const params = {
    id,
    from: searchParams.get('from') || undefined,
    backTo: searchParams.get('backTo') || undefined,
  }
  return <IncidentDetail params={params} onNavigate={useOnNavigate()} />
}

function NotFoundPage() {
  const onNavigate = useOnNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h1>
      <button onClick={() => onNavigate('home')} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', background: '#e42430', color: 'white', border: 'none', cursor: 'pointer' }}>
        Back to Home
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/verification-login" element={<VerificationLoginPage />} />
        <Route path="/verification-dashboard" element={<VerificationDashboardPage />} />
        <Route path="/verification-reports" element={<VerificationReportsPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/notification-settings" element={<NotificationSettingsPage />} />
        <Route path="/incident/:id" element={<IncidentDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}