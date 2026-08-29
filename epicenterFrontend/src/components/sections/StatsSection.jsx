const STATS = [
  {
    key: 'reports',
    value: '100',
    suffix: '+',
    label: 'Total reports',
    caption: 'All time submissions',
    bg: 'bg-blue-500/15',
    color: '#3b82f6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    key: 'success',
    value: '95',
    suffix: '%',
    label: 'Success rate',
    caption: 'AI verification accuracy',
    bg: 'bg-emerald-500/15',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 6 13.5 15.5l-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
    ),
  },
  {
    key: 'verify-time',
    value: '16',
    suffix: 'sec',
    label: 'Avg. verification time',
    caption: 'AI processing duration',
    bg: 'bg-amber-500/15',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    key: 'response',
    value: '2.2',
    suffix: 'min',
    label: 'Response initiated',
    caption: 'Average time to dispatch',
    bg: 'bg-rose-500/15',
    color: '#e42430',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="6" width="14" height="11" rx="1" />
        <path d="M15 9h4l3 3v5h-7z" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="17.5" cy="19" r="2" />
      </svg>
    ),
  },
]

export default function StatsSection() {
  return (
    <section id="stats" className="bg-ink py-10 sm:py-12">
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.key}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <span className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`} style={{ color: stat.color }}>
                <span className="h-6 w-6 block">{stat.icon}</span>
              </span>
              <div>
                <p className="font-display font-extrabold text-white text-[26px] leading-none">
                  {stat.value}
                  <span className="text-[14px] font-semibold text-white/50 ml-1">{stat.suffix}</span>
                </p>
                <p className="mt-1.5 text-white text-[14px] font-semibold">{stat.label}</p>
                <p className="text-white/40 text-[12px]">{stat.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
