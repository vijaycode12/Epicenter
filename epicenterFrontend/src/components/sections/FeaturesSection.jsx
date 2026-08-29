const FEATURES = [
  {
    key: 'verification',
    color: '#3b82f6',
    bg: 'bg-blue-500/15',
    title: 'AI-powered verification',
    description: 'Advanced AI models detect severity and reduce false reports.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h4M7 12h6M7 16h3" />
      </svg>
    ),
  },
  {
    key: 'location',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    title: 'Location intelligence',
    description: 'Accurate GPS tracking helps identify incidents with precision.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    key: 'alerts',
    color: '#f97316',
    bg: 'bg-orange-500/15',
    title: 'Real-time alerts',
    description: 'Instant notifications keep everyone informed at every step.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    key: 'storage',
    color: '#8b5cf6',
    bg: 'bg-violet-500/15',
    title: 'Cloud storage',
    description: 'All reports and data are securely stored and easily accessible.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    key: 'secure',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    title: 'Secure & private',
    description: 'End-to-end encryption ensures complete data privacy.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative bg-ink py-12 sm:py-16 lg:py-20 overflow-hidden scroll-mt-20">
      <div
        className="absolute inset-0 -z-0 opacity-70"
        style={{
          background:
            'radial-gradient(55% 45% at 8% 0%, rgba(228,36,48,0.16), transparent 65%), radial-gradient(55% 55% at 95% 100%, rgba(16,185,129,0.14), transparent 65%)',
        }}
        aria-hidden="true"
      />

      <div className="relative page-container">
        <div className="text-center max-w-[640px] mx-auto mb-8 sm:mb-10">
          <span className="inline-block text-[13px] font-bold tracking-[0.16em] text-orange-400 mb-3">
            WHAT WE OFFER
          </span>
          <h2 className="font-display font-bold text-white leading-tight text-[24px] sm:text-[28px] lg:text-[30px] mb-4">
            Features
          </h2>
          <p className="text-white/55 text-[15px] sm:text-[16px]">
            Everything you need to report, verify, and respond with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.key}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/15 transition-colors"
            >
              <span className={`h-11 w-11 rounded-xl flex items-center justify-center ${feature.bg}`} style={{ color: feature.color }}>
                <span className="h-5 w-5 block">{feature.icon}</span>
              </span>
              <div>
                <h3 className="font-display font-bold text-white text-[16px] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-[13.5px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
