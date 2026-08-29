import { useState } from 'react'

const STEPS = [
  {
    number: 1,
    color: '#3b82f6',
    title: 'Report incident',
    description: 'Capture an image, add details and location in under 60 seconds.',
    detail: 'No account needed. Pick an incident type, snap a photo, and share your location \u2014 automatically or by typing an address.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
        <circle cx="12" cy="13" r="3.2" />
      </svg>
    ),
  },
  {
    number: 2,
    color: '#10b981',
    title: 'AI verification',
    description: 'AI analyzes the image, text and location to verify the incident.',
    detail: 'Image and text models cross-check what you reported. Mismatches are flagged for extra scrutiny, not silently dropped.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    number: 3,
    color: '#8b5cf6',
    title: 'Verification team',
    description: 'Our team reviews the AI results and confirms the incident.',
    detail: 'A trained officer sees the AI\u2019s findings side by side with your report, then verifies or rejects it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    number: 4,
    color: '#f97316',
    title: 'Assign authorities',
    description: 'Nearest emergency services are assigned automatically.',
    detail: 'Once verified, the incident routes to the closest fire, medical, or rescue team for your area.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22h18" />
        <path d="M6 18v-7" />
        <path d="M10 18v-7" />
        <path d="M14 18v-7" />
        <path d="M18 18v-7" />
        <path d="M12 2 3 7h18Z" />
      </svg>
    ),
  },
  {
    number: 5,
    color: '#ef4444',
    title: 'Notify & update',
    description: 'Users and authorities receive real-time status updates.',
    detail: 'Signed-in users get email updates by default; a phone number adds live WhatsApp status alerts too.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    number: 6,
    color: '#10b981',
    title: 'Resolved',
    description: 'Incident is resolved, marked closed and logged with feedback.',
    detail: 'The case closes with a full timeline \u2014 useful for reporting back to the community and improving response times.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

function StepIcon({ step, active }) {
  return (
    <div className="relative shrink-0">
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center bg-[#141826] border transition-all duration-300"
        style={{
          color: step.color,
          borderColor: active ? step.color : 'rgba(255,255,255,0.1)',
          boxShadow: active ? `0 0 0 4px ${step.color}1a` : 'none',
          transform: active ? 'scale(1.04)' : 'scale(1)',
        }}
      >
        <span className="h-6 w-6 block">{step.icon}</span>
      </div>
      <span
        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-4 ring-ink transition-transform duration-300"
        style={{ backgroundColor: step.color }}
      >
        {step.number}
      </span>
    </div>
  )
}

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)
  const active = STEPS.find((s) => s.number === activeStep) ?? STEPS[0]

  return (
    <section id="how-it-works" className="bg-ink py-12 sm:py-16 lg:py-20 scroll-mt-20">
      <div className="page-container w-full text-center">
        <span className="inline-block text-[13px] font-bold tracking-[0.16em] text-blue-400">
          OUR PROCESS
        </span>

        <h2 className="font-display font-bold text-white leading-tight text-[24px] sm:text-[28px] lg:text-[30px] mt-3 mb-4">
          How it works
        </h2>

        <p className="text-white/55 text-[15px] sm:text-[16px] max-w-[520px] mx-auto mb-10 sm:mb-12">
          Six clear steps from the first report to a resolved incident. Hover or tap a step for detail.
        </p>

        {/* Desktop / tablet: horizontal timeline, click/hover to focus a step */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-6 relative">
            <div className="absolute top-8 left-[8.3333%] right-[8.3333%] flex z-0">
              {STEPS.slice(0, -1).map((step, i) => (
                <div key={step.number} className="h-0.5 flex-1 relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to right, ${step.color}, ${STEPS[i + 1].color})`, opacity: 0.25 }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                    style={{
                      background: step.color,
                      width: activeStep > step.number ? '100%' : activeStep === step.number ? '50%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {STEPS.map((step) => (
              <button
                key={step.number}
                onMouseEnter={() => setActiveStep(step.number)}
                onFocus={() => setActiveStep(step.number)}
                onClick={() => setActiveStep(step.number)}
                aria-pressed={activeStep === step.number}
                className="relative z-10 flex flex-col items-center px-3 text-left group"
              >
                <StepIcon step={step} active={activeStep === step.number} />
                <h3
                  className="font-display font-bold text-[16px] mt-5 mb-2 transition-colors duration-200"
                  style={{ color: activeStep === step.number ? step.color : '#fff' }}
                >
                  {step.title}
                </h3>
                <p className="text-white/50 text-[13.5px] leading-relaxed max-w-[190px]">
                  {step.description}
                </p>
              </button>
            ))}
          </div>

          <div
            key={active.number}
            className="mt-10 mx-auto max-w-2xl rounded-2xl border p-6 text-left flex items-start gap-4"
            style={{ borderColor: `${active.color}44`, background: `${active.color}0d` }}
          >
            <span
              className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center font-display font-extrabold text-[15px]"
              style={{ background: active.color, color: '#fff' }}
            >
              {String(active.number).padStart(2, '0')}
            </span>
            <p className="text-white/75 text-[15px] leading-relaxed pt-1.5">{active.detail}</p>
          </div>
        </div>

        {/* Mobile: vertical timeline, tap to expand detail inline */}
        <div className="lg:hidden flex flex-col items-center">
          {STEPS.map((step, i) => {
            const isOpen = activeStep === step.number
            return (
              <div key={step.number} className="flex flex-col items-center w-full">
                <button
                  onClick={() => setActiveStep(isOpen ? 0 : step.number)}
                  aria-expanded={isOpen}
                  className="flex flex-col items-center w-full"
                >
                  <StepIcon step={step} active={isOpen} />
                  <h3
                    className="font-display font-bold text-[16px] mt-5 mb-2 transition-colors duration-200"
                    style={{ color: isOpen ? step.color : '#fff' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-[13.5px] leading-relaxed max-w-[280px] text-center">
                    {step.description}
                  </p>
                </button>

                {isOpen && (
                  <div
                    className="mt-4 w-full max-w-[320px] rounded-xl border p-4 text-left"
                    style={{ borderColor: `${step.color}44`, background: `${step.color}0d` }}
                  >
                    <p className="text-white/75 text-[13.5px] leading-relaxed">{step.detail}</p>
                  </div>
                )}

                {i < STEPS.length - 1 && (
                  <div
                    className="w-0.5 h-8 my-4"
                    style={{
                      background: `linear-gradient(to bottom, ${step.color}, ${STEPS[i + 1].color})`,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
