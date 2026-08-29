import { useState } from 'react'
import Header from '../components/Header.jsx'
import { apiRequest } from '../lib/api.js'
import { getCitizenAuth, setCitizenAuth } from '../lib/citizenAuth.js'
import { formatPhone } from '../lib/formatPhone.js'

/**
 * NotificationSettings
 *
 * Lets a signed-in citizen see and update how they get notified about
 * their reports - email (tied to their Google account, read-only) and
 * phone/WhatsApp (editable). Requires a citizen session; guests never
 * reach this page since it's only linked from the signed-in account
 * menu in Header.jsx.
 */
export default function NotificationSettings({ onNavigate }) {
  const [auth] = useState(getCitizenAuth)
  const [phone, setPhone] = useState(auth?.phone || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  if (!auth?.token) {
    // Not signed in - nothing to manage, send back to the report page
    // where they can sign in.
    onNavigate?.('report')
    return null
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const res = await apiRequest('/auth/me/notifications', {
        method: 'PUT',
        body: { phone: phone.trim() },
        token: auth.token,
      })
      const updatedPhone = res.data.user.phone || ''
      setPhone(updatedPhone)
      setCitizenAuth({ ...auth, phone: updatedPhone })
      setEditing(false)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePhone = async () => {
    setPhone('')
    setError('')
    setSaving(true)
    try {
      await apiRequest('/auth/me/notifications', {
        method: 'PUT',
        body: { phone: '' },
        token: auth.token,
      })
      setCitizenAuth({ ...auth, phone: '' })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
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

          {/* Phone / WhatsApp - editable */}
          <div className="p-5 flex items-start gap-4">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <PhoneIcon className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-navy text-[15px]">WhatsApp</h3>
                {phone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5">
                    <CheckIcon className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold px-2 py-0.5">
                    Not set
                  </span>
                )}
              </div>

              {!editing ? (
                <>
                  <p className="text-[13.5px] text-muted mt-0.5">
                    {phone ? formatPhone(phone) : 'No phone number added yet.'}
                  </p>
                  <div className="mt-2.5 flex gap-3">
                    <button onClick={() => setEditing(true)} className="text-[13px] font-semibold text-navy underline">
                      {phone ? 'Change number' : 'Add number'}
                    </button>
                    {phone && (
                      <button onClick={handleRemovePhone} disabled={saving} className="text-[13px] font-semibold text-brand-red underline disabled:opacity-50">
                        Remove
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-2.5">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      autoFocus
                      className="flex-1 rounded-lg border border-border py-2.5 px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red"
                    />
                    <button onClick={handleSave} disabled={saving || !phone.trim()} className="rounded-lg bg-navy hover:bg-navy/90 disabled:opacity-50 text-white text-[13.5px] font-semibold px-4 transition-colors">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setPhone(auth.phone || ''); setError('') }} className="rounded-lg border border-border text-muted hover:text-navy text-[13.5px] font-semibold px-4 transition-colors">
                      Cancel
                    </button>
                  </div>
                  {error && <p className="mt-2 text-[12.5px] text-brand-red">{error}</p>}
                </div>
              )}
              <p className="text-[12.5px] text-muted/70 mt-2">
                Get WhatsApp alerts every time a report you submitted changes status - verified, assigned, or resolved.
              </p>
            </div>
          </div>
        </div>

        {saved && (
          <p className="mt-4 flex items-center gap-2 text-[13.5px] text-emerald-700 font-medium">
            <CheckIcon className="w-4 h-4" /> Notification settings updated.
          </p>
        )}
      </main>
    </div>
  )
}

function MailIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg> }
function PhoneIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg> }
function CheckIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m20 6-11 11-5-5" /></svg> }
function BackIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> }