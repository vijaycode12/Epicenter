import { useState } from 'react'
import Header from '../components/Header.jsx'
import { getCitizenAuth } from '../lib/citizenAuth.js'

/**
 * NotificationSettings
 *
 * Lets a signed-in citizen see and update how they get notified about
 * their reports - email (tied to their Google account, read-only).
 * Requires a citizen session; guests never
 * reach this page since it's only linked from the signed-in account
 * menu in Header.jsx.
 */
export default function NotificationSettings({ onNavigate }) {
  const [auth] = useState(getCitizenAuth)
  if (!auth?.token) {
    // Not signed in - nothing to manage, send back to the report page
    // where they can sign in.
    onNavigate?.('report')
    return null
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header onNavigate={onNavigate} activePage="report" auth={auth} />
      <main className="flex-1 page-container w-full py-8 lg:py-10 max-w-2xl">
        <button onClick={() => onNavigate?.('report')} className="flex items-center gap-2 text-[13.5px] text-muted hover:text-navy transition-colors mb-6">
          <BackIcon className="w-4 h-4" /> Back to Report Incident
        </button>

        <h1 className="font-display text-2xl font-bold text-navy mb-1">Notification Settings</h1>
        <p className="text-muted text-[14.5px] mb-8">Manage how you're notified about your incident reports.</p>

        <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
          {/* Email - always on, tied to Google account, not editable here */}
          <div className="p-5 flex items-start gap-4">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MailIcon className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-navy text-[15px]">Email</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5">
                  <CheckIcon className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-[13.5px] text-muted mt-0.5 truncate">{auth.email}</p>
              <p className="text-[12.5px] text-muted/70 mt-1">
                Status updates are always sent here. To change this, sign in with a different Google account.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function MailIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg> }
function CheckIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m20 6-11 11-5-5" /></svg> }
function BackIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> }