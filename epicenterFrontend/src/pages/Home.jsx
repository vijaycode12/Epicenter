import heroBg from '../assets/hero-bg.png'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import AboutSection from '../components/sections/AboutSection.jsx'
import FeaturesSection from '../components/sections/FeaturesSection.jsx'
import HowItWorksSection from '../components/sections/HowItWorksSection.jsx'
import StatsSection from '../components/sections/StatsSection.jsx'
import '../App.css'

export default function Home({ onNavigate }) {
  return (
    <div>
      <Header onNavigate={onNavigate} activePage="home" />

      <div className="hero-viewport">
        {/* 1. Main / Hero */}
        <div
          id="home"
          className="hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(4,5,8,0.75) 0%, rgba(4,5,8,0.35) 32%, rgba(4,5,8,0.55) 100%), linear-gradient(115deg, rgba(6,7,10,0.9) 8%, rgba(6,7,10,0.5) 45%, rgba(6,7,10,0.2) 100%), url(${heroBg})`,
          }}
        >
          <main className="hero__content">

            <h1 className="hero__title">
              Stronger Response.<br />
              <span className="hero__title--accent">Safer</span> Tomorrow.
            </h1>

            <p className="hero__subtitle">
              Report emergencies in seconds, AI verifies the situation, and
              alerts the right authorities instantly.
            </p>

            <div className="hero__actions">
              <button className="btn btn--primary" onClick={() => onNavigate('report')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span className="btn__stack">
                  <span className="btn__title">Report an Emergency</span>
                </span>
              </button>
              <button className="btn btn--outline" onClick={() => onNavigate('verification-login')}>
                Verification Team Login
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* 2. Platform stats */}
      <StatsSection />

      {/* 3. About */}
      <AboutSection onNavigate={onNavigate} />

      {/* 4. Features */}
      <FeaturesSection />

      {/* 5. How It Works */}
      <HowItWorksSection />

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
