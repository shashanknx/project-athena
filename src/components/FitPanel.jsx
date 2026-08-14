import { THRESHOLDS } from '../lib/search.js'

/**
 * Fit hit rate. Deliberately a separate section with a separate accent colour
 * and separate wording from the market hit rate — the two numbers answer
 * different questions and are never combined into one figure.
 */
export default function FitPanel({ fit, onClearScreening }) {
  const pct = fit.rate === null ? null : Math.round(fit.rate * 100)

  const readout =
    fit.rate === null
      ? 'Not screened yet'
      : fit.screened < THRESHOLDS.minScreened
        ? `Thin sample — screen at least ${THRESHOLDS.minScreened}`
        : pct >= THRESHOLDS.highFitRate * 100
          ? 'Strong fit signal'
          : pct < THRESHOLDS.lowFitRate * 100
            ? 'Weak fit signal'
            : 'Mixed fit signal'

  return (
    <section className="rounded-lg border border-amber-300 bg-white">
      <header className="border-b border-amber-100 bg-amber-50/70 px-5 py-3">
        <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">
          2 · Fit hit rate
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          Of the roles you actually read, how many are genuinely a fit? You decide this one, role
          by role, in the list below. It is not the market hit rate and is never averaged with it.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
        <div>
          <p className="text-4xl font-semibold tabular-nums text-slate-900" data-testid="fit-rate">
            {pct === null ? '—' : `${pct}%`}
          </p>
          <p className="text-xs text-slate-500">of screened roles marked a hit</p>
        </div>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Hits</dt>
            <dd className="tabular-nums text-slate-900" data-testid="fit-hits">
              {fit.hits}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Misses</dt>
            <dd className="tabular-nums text-slate-900">{fit.misses}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Screened</dt>
            <dd className="tabular-nums text-slate-900" data-testid="fit-screened">
              {fit.screened} of {fit.screened + fit.unscreened}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Signal</dt>
            <dd className="text-slate-900">{readout}</dd>
          </div>
        </dl>
        {fit.screened > 0 ? (
          <button
            type="button"
            onClick={onClearScreening}
            className="ml-auto rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear screening
          </button>
        ) : null}
      </div>
    </section>
  )
}
