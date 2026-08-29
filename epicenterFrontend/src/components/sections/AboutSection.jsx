import aboutVisual from '../../assets/about-visual.png'

const FEATURES = [
  {
    key: 'trusted',
    iconBg: 'bg-rose-100',
    iconColor: 'text-brand-red',
    title: 'Trusted network',
    description: 'Verified reports shared with authorities and communities in real time.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
  },
  {
    key: 'fast',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Under 60 seconds',
    description: 'Snap, describe, submit. Reporting an incident is fast by design.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    key: 'review',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'AI + human review',
    description: 'Machine verification paired with expert oversight for accuracy.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m20 6-11 11-5-5" />
      </svg>
    ),
  },
  {
    key: 'local',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    title: 'Local coordination',
    description: 'Routes each incident to the nearest responders automatically.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>
    ),
  },
]

export default function AboutSection({ onNavigate }) {
  return (
    <section id="about" className="bg-bg py-12 sm:py-16 lg:py-20 scroll-mt-20">
      <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left column: copy + features */}
        <div>
          <span className="inline-block text-[18px] font-bold tracking-[0.12em] text-brand-red">
            ABOUT OUR PLATFORM
          </span>

          <h2 className="font-display font-bold text-navy leading-[1.2] text-[24px] sm:text-[28px] lg:text-[30px] mt-3 mb-5">
            Smarter verification. Faster response.
            <br className="hidden sm:block" /> Stronger communities.
          </h2>

          <p className="text-muted text-[15px] sm:text-[16px] leading-relaxed max-w-[560px] mb-6">
            Our platform lets citizens report disasters in under 60 seconds. AI
            analyzes images and descriptions to verify incidents before forwarding
            them to a human verification team — cutting false reports and speeding
            coordination with local authorities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
            {FEATURES.map((feature) => (
              <div
                key={feature.key}
                className="bg-white rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3"
              >
                <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${feature.iconBg} ${feature.iconColor}`}>
                  <span className="h-5 w-5 block">{feature.icon}</span>
                </span>
                <div>
                  <h3 className="font-display font-bold text-navy text-[15.5px] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted text-[13.5px] leading-snug">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-semibold text-[15px] px-6 py-3.5 transition-colors"
            onClick={() => onNavigate('report')}
          >
            Report an incident
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Right column: visual */}
        <div className="relative">
          <div
            className="absolute -inset-6 rounded-[36px] opacity-60 blur-3xl -z-10"
            style={{
              background:
                'radial-gradient(60% 60% at 30% 20%, rgba(228,36,48,0.25), transparent 70%), radial-gradient(60% 60% at 80% 80%, rgba(59,86,217,0.2), transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="rounded-[24px] overflow-hidden bg-ink shadow-2xl border border-black/10">
            <img
              src={aboutVisual}
              alt="Epicenter platform dashboard showing global incident map, AI verification feed, and responder network"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
