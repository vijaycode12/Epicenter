import { useEffect, useRef, useState } from 'react'
import logoLight from '../assets/logo-light.png'

const NAV_ITEMS = [
  { label: 'Home', hash: 'home' },
  { label: 'About', hash: 'about' },
  { label: 'Features', hash: 'features' },
  { label: 'How It Works', hash: 'how-it-works' },
  { label: 'Contact', hash: 'contact' },
]

export default function Header({ onNavigate, activePage = 'home', auth = null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const isSignedIn = Boolean(auth)
  const linkBase = 'text-[15px] font-semibold pb-1.5 border-b-2 border-transparent transition-colors text-white/75 hover:text-white'

  const go = (item) => {
    const scrollToSection = () => {
      document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setMenuOpen(false)

    if (activePage !== 'home') {
      onNavigate?.('home')
      window.setTimeout(scrollToSection, 120)
      return
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection)
    })
  }

  useEffect(() => {
    if (!accountOpen) return
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [accountOpen])

  const initials = isSignedIn
    ? (auth.name || auth.email || '?')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  return (
    <header className="sticky top-0 z-50 bg-[#0b0d12]/95 backdrop-blur border-b border-black/40">
      <div className="page-container flex items-center gap-8 py-3">
        <button
          className="flex items-center mr-auto"
          onClick={() => go({ hash: 'home' })}
          aria-label="Go to homepage"
        >
          <img
            src={logoLight}
            alt="Epicenter"
            className="h-11 sm:h-12 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
          />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => go(item)} className={linkBase}>
              {item.label}
            </button>
          ))}
        </nav>

        {activePage === 'report' && !isSignedIn && (
          <button
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-400"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Guest Mode
          </button>
        )}

        {activePage === 'report' && isSignedIn && (
          <div className="hidden md:block relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 pl-1.5 pr-3 py-1.5 transition-colors"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
            >
              {auth.avatarUrl ? (
                <img src={auth.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="h-7 w-7 rounded-full bg-brand-red flex items-center justify-center text-[11px] font-bold text-white">
                  {initials}
                </span>
              )}
              <span className="text-sm font-semibold text-white/85">{auth.name || 'Account'}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {accountOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-xl border border-white/10 bg-[#12151d] shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="px-4 py-3.5 border-b border-white/10">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <GoogleGlyph className="h-3.5 w-3.5" />
                    Signed in with Google
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white truncate">{auth.name}</p>
                  {auth.email && <p className="text-xs text-white/45 truncate">{auth.email}</p>}
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false)
                    onNavigate?.('my-reports')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors text-left"
                >
                  <ReportsGlyph className="h-4 w-4 text-white/40" />
                  My Reports
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false)
                    onNavigate?.('notification-settings')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 transition-colors text-left"
                >
                  <BellGlyph className="h-4 w-4 text-white/40" />
                  Notification Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false)
                    onNavigate?.('sign-out')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left border-t border-white/10"
                >
                  <SignOutGlyph className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-7 h-7 shrink-0"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block h-0.5 w-full rounded-full bg-white transition-transform duration-200 ${menuOpen && i === 0 ? 'translate-y-[7px] rotate-45' : ''} ${menuOpen && i === 1 ? 'opacity-0' : ''} ${menuOpen && i === 2 ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          ))}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-5 pb-5 pt-2 border-t bg-black/90 border-white/10 backdrop-blur-sm">
          {activePage === 'report' && isSignedIn && (
            <div className="flex items-center gap-3 py-4 border-b border-white/10 mb-2">
              {auth.avatarUrl ? (
                <img src={auth.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
              ) : (
                <span className="h-10 w-10 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-400">
                  <GoogleGlyph className="h-3 w-3" />
                  Signed in with Google
                </p>
                <p className="text-sm font-semibold text-white truncate">{auth.name}</p>
              </div>
            </div>
          )}

          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              className="text-left font-semibold py-3 border-b text-white/85 border-white/10"
            >
              {item.label}
            </button>
          ))}

          {activePage === 'report' && !isSignedIn && (
            <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Guest Mode
            </span>
          )}

          {activePage === 'report' && isSignedIn && (
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate?.('my-reports')
                }}
                className="flex items-center gap-2.5 py-3 text-sm font-semibold text-white/85 text-left"
              >
                <ReportsGlyph className="h-4 w-4 text-white/40" />
                My Reports
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate?.('notification-settings')
                }}
                className="flex items-center gap-2.5 py-3 text-sm font-semibold text-white/85 text-left"
              >
                <BellGlyph className="h-4 w-4 text-white/40" />
                Notification Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onNavigate?.('sign-out')
                }}
                className="flex items-center gap-2.5 py-3 text-sm font-semibold text-red-400 text-left"
              >
                <SignOutGlyph className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

function GoogleGlyph({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.6 0-14.1 4.3-17.7 11.7Z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 35.6 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 40.6 16.3 45 24 45Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.2 6l6.5 5.5C41.4 36 45 30.5 45 24c0-1.2-.1-2.4-.4-3.5Z" />
    </svg>
  )
}

function ReportsGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </svg>
  )
}

function BellGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function SignOutGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}