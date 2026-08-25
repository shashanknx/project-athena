import { useMemo } from 'react'
import WaitlistForm from './WaitlistForm.jsx'
import { SurveyPreview, MapPreview, ListingsPreview, TrackerPreview } from './PreviewMockups.jsx'
import { HEADLINES, VALUE_PROPS, HOW_IT_WORKS } from '../../data/landingCopy.js'

const PREVIEWS = { survey: SurveyPreview, map: MapPreview, listings: ListingsPreview, tracker: TrackerPreview }

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#sign-up', label: 'Sign Up' },
]

/** Reads ?headline=N from the URL to pick a positioning variant to test. */
function headlineIndexFromQuery() {
  const n = Number(new URLSearchParams(window.location.search).get('headline'))
  return Number.isInteger(n) && n >= 0 && n < HEADLINES.length ? n : 0
}

/**
 * The public-facing marketing page. This is what the bare project URL shows
 * — the product itself lives behind the unlisted #/internal route (see
 * App.jsx) and is never linked from here.
 */
export default function LandingPage() {
  const { headline, subhead } = useMemo(() => HEADLINES[headlineIndexFromQuery()], [])

  return (
    <div className="min-h-screen scroll-smooth">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-wide text-slate-900">
            Project Athena
          </span>
          <nav className="flex gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Home */}
      <section id="home" className="scroll-mt-16 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {headline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">{subhead}</p>
          <a
            href="#sign-up"
            className="mt-8 inline-block rounded-full bg-slate-900 px-7 py-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Join the waitlist
          </a>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">{prop.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{prop.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 border-t border-slate-200 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Four screens, one loop: define who you are, see the market, screen it for fit, keep
              what's worth pursuing.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {HOW_IT_WORKS.map((step, i) => {
              const Preview = PREVIEWS[step.id]
              return (
                <div key={step.id}>
                  <Preview />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Previews above are illustrative mock-ups of the real screens, built for this page — not
            live screenshots.
          </p>
        </div>
      </section>

      {/* Sign up */}
      <section id="sign-up" className="scroll-mt-16 px-6 py-20">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Join the waitlist</h2>
          <p className="mt-2 text-sm text-slate-600">
            We're testing Project Athena with a small group before opening it up. Leave your email
            and we'll follow up.
          </p>
          <div className="mt-6 text-left">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-xs text-slate-400">
            This is a prototype for user testing — no email is sent or stored beyond this browser.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8 text-center text-xs text-slate-400">
        Project Athena is an early-stage prototype. Company and job data referenced in the product
        is entirely mock.
      </footer>
    </div>
  )
}
