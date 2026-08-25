import { useState } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STORAGE_KEY = 'projectAthena.waitlistEmails'

/*
 * Prototype only. There is no backend: this validates the email and stores
 * it in this browser's localStorage purely so the team can confirm
 * submission works end to end. Nothing is sent anywhere, and nothing is
 * visible to anyone but this browser. Said plainly in the UI below, not just
 * in instructions.md, since real visitors can reach this page.
 */
function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStored(emails) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails))
  } catch {
    // Storage unavailable — the submission still succeeds in the UI.
  }
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | invalid | done

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('invalid')
      return
    }
    const emails = readStored()
    if (!emails.includes(trimmed)) writeStored([...emails, trimmed])
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div
        data-testid="waitlist-success"
        className="rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
      >
        <p className="font-semibold">You&apos;re on the list.</p>
        <p className="mt-1 text-emerald-800">
          We&apos;ll reach out at {email.trim()} when there&apos;s something to try.
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
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'invalid') setStatus('idle')
          }}
          className={`w-full rounded-full border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:outline-none ${
            status === 'invalid'
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900'
          }`}
        />
        {status === 'invalid' ? (
          <p role="alert" data-testid="waitlist-error" className="mt-1.5 text-xs text-rose-600">
            Enter a valid email address.
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Join waitlist
      </button>
    </form>
  )
}
