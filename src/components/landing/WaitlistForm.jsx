import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Submissions go to a real Google Form, chosen so the team can read them in
// the linked Sheet without standing up a backend. This is a raw POST to
// Google's form-response endpoint rather than an embedded iframe, so the
// visible form stays this component's own styling — Google's UI is never
// shown. Response is a query-string-encoded body: `entry.<id>` per question,
// where the id is fixed for a given Google Form and comes from that form's
// own hidden input names (see instructions.md's "Sign Up" section for how it
// was found, if the form ever needs replacing).
const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSegX3NiUFq0LHjAKshZtmx1-8-95SAzGsUI8y0jsK9qWkqcZg/formResponse'
const GOOGLE_FORM_EMAIL_ENTRY = 'entry.1079919560'

// Purely a per-browser convenience so a returning visitor who already joined
// sees the confirmation again instead of the empty form. Google Forms is the
// actual record now; this is not relied on for anything.
const SEEN_KEY = 'projectAthena.waitlistSubmittedEmail'

function readSeenEmail() {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

/**
 * Google's form-response endpoint does not send CORS headers, so the fetch
 * below must be opaque ("no-cors"): the browser refuses to let us read
 * status or body. A resolved promise means the request left the browser
 * successfully, not that Google accepted it — there is no way to verify that
 * from client-side code. A rejected promise (network failure, offline) is
 * the one failure mode we *can* detect, and does surface an error.
 */
async function submitToGoogleForm(email) {
  const body = new URLSearchParams()
  body.set(GOOGLE_FORM_EMAIL_ENTRY, email)
  await fetch(GOOGLE_FORM_ACTION, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(() => (readSeenEmail() ? 'done' : 'idle')) // idle | invalid | submitting | error | done

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('invalid')
      return
    }
    setStatus('submitting')
    try {
      await submitToGoogleForm(trimmed)
      try {
        localStorage.setItem(SEEN_KEY, trimmed)
      } catch {
        // Non-essential — the submission itself already went through.
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div
        data-testid="waitlist-success"
        className="rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
      >
        <p className="font-semibold">You&apos;re on the list.</p>
        <p className="mt-1 text-emerald-800">
          We&apos;ll reach out at {readSeenEmail() || email.trim()} when there&apos;s something to
          try.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          value={email}
          disabled={status === 'submitting'}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'invalid' || status === 'error') setStatus('idle')
          }}
          className={`w-full rounded-full border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:outline-none disabled:opacity-60 ${
            status === 'invalid' || status === 'error'
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
          }`}
        />
        {status === 'invalid' ? (
          <p role="alert" data-testid="waitlist-error" className="mt-1.5 text-xs text-rose-600">
            Enter a valid email address.
          </p>
        ) : null}
        {status === 'error' ? (
          <p role="alert" data-testid="waitlist-error" className="mt-1.5 text-xs text-rose-600">
            Something went wrong sending that — check your connection and try again.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="shrink-0 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
      </button>
    </form>
  )
}
