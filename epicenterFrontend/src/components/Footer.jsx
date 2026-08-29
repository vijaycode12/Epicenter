import { useState } from 'react'
import logoLight from '../assets/logo-light.png'

const QUICK_LINKS = [
  { label: 'Home', hash: 'home' },
  { label: 'About', hash: 'about' },
  { label: 'Features', hash: 'features' },
  { label: 'How it works', hash: 'how-it-works' },
  { label: 'Contact', hash: 'contact' },
]

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <path d="M13.5 9H15V6.5h-1.5C11.6 6.5 10 8.1 10 10v1.5H8.5V14H10v7h2.5v-7H14l.5-2.5h-2V10c0-.55.45-1 1-1Z" />
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    icon: (
      <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round" />
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.2" cy="7.8" r="0.9" />
      </>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <>
        <rect x="5" y="9" width="3" height="10" />
        <circle cx="6.5" cy="5.8" r="1.6" />
        <path d="M11 9h3v1.6c.6-1 1.7-1.8 3.3-1.8 2.4 0 3.7 1.6 3.7 4.4V19h-3v-5.2c0-1.3-.5-2.2-1.7-2.2-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9V19h-3.4c0-.1 0-9.1 0-10Z" />
      </>
    ),
  },
]

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const go = (link) => {
    document.getElementById(link.hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    window.setTimeout(() => setSubscribed(false), 3500)
  }

  return (
    <footer id="contact" className="bg-navy border-t border-white/10 scroll-mt-20">
      <div className="page-container py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <button onClick={() => go({ hash: 'home' })} className="flex items-center mb-4" aria-label="Go to homepage">
            <img src={logoLight} alt="Epicenter" className="h-10 w-auto" />
          </button>
          <p className="text-white/50 text-[13.5px] leading-relaxed max-w-[260px] mb-5">
            Connecting citizens to emergency services through AI and technology.
          </p>
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={social.label}
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/35 hover:bg-white/5 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-white/40 text-[11.5px] font-bold tracking-[0.14em] mb-4">QUICK LINKS</h3>
          <ul className="flex flex-col gap-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => go(link)}
                  className="text-white/65 hover:text-white text-[14.5px] font-medium transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact us */}
        <div>
          <h3 className="text-white/40 text-[11.5px] font-bold tracking-[0.14em] mb-4">CONTACT US</h3>
          <ul className="flex flex-col gap-3.5">
            <li>
              <a
                href="mailto:support@epicenter.com"
                className="flex items-start gap-2.5 text-white/65 hover:text-white text-[14.5px] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5 mt-0.5 shrink-0" style={{ height: 18, width: 18 }}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                support@epicenter.com
              </a>
            </li>
            <li>
              <a
                href="tel:+919999988888"
                className="flex items-start gap-2.5 text-white/65 hover:text-white text-[14.5px] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ height: 18, width: 18 }} className="mt-0.5 shrink-0">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
                </svg>
                +91 9999988888
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-white/65 text-[14.5px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ height: 18, width: 18 }} className="mt-0.5 shrink-0">
                <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Hyderabad, Telangana, India
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white/40 text-[11.5px] font-bold tracking-[0.14em] mb-4">STAY UPDATED</h3>
          <p className="text-white/50 text-[13.5px] leading-relaxed mb-4">
            Subscribe for platform updates and important alerts.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col xs:flex-row sm:flex-col lg:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-lg bg-white/[0.04] border border-white/15 px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-white/35 focus:outline-none focus:border-brand-red/60"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-red hover:bg-brand-red-dark text-white text-[13.5px] font-semibold px-4 py-2.5 transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className="text-emerald-400 text-[12.5px] mt-2.5">You&apos;re subscribed — thank you!</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-white/35 text-[12.5px]">
            © {new Date().getFullYear()} Epicenter. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12.5px] text-white/35">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
