import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import ReportIncident from './pages/ReportIncident.jsx'
import VerificationLogin from './pages/VerificationLogin.jsx'
import VerificationDashboard from './pages/VerificationDashboard.jsx'
import VerificationReports from './pages/VerificationReports.jsx'
import MyReports from './pages/MyReports.jsx'
import IncidentDetail from './pages/IncidentDetail.jsx'
import NotificationSettings from './pages/NotificationSettings.jsx'

const NAV_STORAGE_KEY = 'epicenter_last_page'

const RESTORABLE_PAGES = [
  'verification-login',
  'verification-dashboard',
  'verification-reports',
  'my-reports',
  'incident-detail',
  'notification-settings',
]

function loadSavedNav() {
  try {
    const raw = window.sessionStorage.getItem(NAV_STORAGE_KEY)
    if (!raw) return { page: 'home', params: null }
    const parsed = JSON.parse(raw)
    if (!RESTORABLE_PAGES.includes(parsed.page)) return { page: 'home', params: null }
    return parsed
  } catch {
    return { page: 'home', params: null }
  }
}

export default function App() {
  const [{ page, params }, setNav] = useState(loadSavedNav)

  const handleNavigate = (nextPage, nextParams = null) => {
    setNav({ page: nextPage, params: nextParams })
    try {
      if (RESTORABLE_PAGES.includes(nextPage)) {
        window.sessionStorage.setItem(NAV_STORAGE_KEY, JSON.stringify({ page: nextPage, params: nextParams }))
      } else {
        window.sessionStorage.removeItem(NAV_STORAGE_KEY)
      }
    } catch {
      
    }
  }

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
    return () => window.cancelAnimationFrame(id)
  }, [page])

  if (page === 'report') {
    return <ReportIncident onNavigate={handleNavigate} />
  }

  if (page === 'verification-login') {
    return <VerificationLogin onNavigate={handleNavigate} />
  }

  if (page === 'verification-dashboard') {
    return <VerificationDashboard onNavigate={handleNavigate} />
  }

  if (page === 'verification-reports') {
    return <VerificationReports onNavigate={handleNavigate} />
  }

  if (page === 'my-reports') {
    return <MyReports onNavigate={handleNavigate} />
  }

  if (page === 'incident-detail') {
    return <IncidentDetail params={params} onNavigate={handleNavigate} />
  }

  if (page === 'notification-settings') {
    return <NotificationSettings onNavigate={handleNavigate} />
  }

  return <Home onNavigate={handleNavigate} />
}