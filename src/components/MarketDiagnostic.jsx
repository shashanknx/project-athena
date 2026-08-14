import { composition, describeThesis } from '../lib/search.js'

function Bar({ label, sublabel, value, max, highlight, muted, action }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="grid grid-cols-[10rem_1fr_auto] items-center gap-3 py-1.5">
      <div className="min-w-0">
        <p
          className={`truncate text-sm ${highlight ? 'font-semibold text-blue-800' : 'text-slate-700'}`}
        >
          {label}
        </p>
        {sublabel ? <p className="truncate text-xs text-slate-400">{sublabel}</p> : null}
      </div>
      <div className="h-5 rounded bg-slate-100">
        <div
          className={`h-5 rounded ${
            muted ? 'bg-slate-300' : highlight ? 'bg-blue-600' : 'bg-blue-300'
          }`}
          style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`w-24 text-right text-sm tabular-nums ${
            highlight ? 'font-semibold text-blue-800' : 'text-slate-700'
          }`}
        >
          {value} {value === 1 ? 'company' : 'companies'}
        </span>
        <span className="w-20">{action}</span>
      </div>
    </div>
  )
}

export default function MarketDiagnostic({ thesis, diagnostic, exploration, results, onRelax }) {
  const { full, relaxations, binding, allRelaxationsDead } = diagnostic
  const max = Math.max(full.companies, ...relaxations.map((r) => r.companies), 1)

  return (
    <section className="rounded-lg border border-blue-200 bg-white">
      <header className="border-b border-blue-100 bg-blue-50/60 px-5 py-3">
        <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
          1 · Market hit rate
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          Does this thesis exist in the market at all? Nothing here reflects whether the jobs are
          any good — that is the fit hit rate, further down.
        </p>
      </header>

      <div className="px-5 py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-4xl font-semibold tabular-nums text-slate-900">
            {full.companies}
          </span>
          <span className="text-sm text-slate-600">
            {full.companies === 1 ? 'company' : 'companies'} match the full thesis
          </span>
          <span className="text-sm text-slate-400">
            · {full.roles} matching {full.roles === 1 ? 'role' : 'roles'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Thesis: {describeThesis(thesis)}</p>

        {exploration ? (
          <ExplorationBreakdown results={results} />
        ) : (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
              What happens if you relax one dimension
            </p>
            <Bar label="Full thesis" value={full.companies} max={max} muted />
            {relaxations.map((r) => (
              <Bar
                key={r.key}
                label={r.relaxLabel}
                sublabel={`without "${r.droppedValue}"`}
                value={r.companies}
                max={max}
                highlight={binding?.key === r.key}
                action={
                  r.gain > 0 ? (
                    <button
                      type="button"
                      onClick={() => onRelax(r.thesis)}
                      className="rounded border border-blue-300 bg-white px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Try this
                    </button>
                  ) : null
                }
              />
            ))}

            <p className="mt-3 text-sm text-slate-600">
              {allRelaxationsDead ? (
                <span data-testid="diagnostic-dead">
                  No single dimension is the problem — relaxing any one of them still returns
                  almost nothing. This combination is off the map in this market. Try changing two
                  dimensions at once, or start from a single field to explore.
                </span>
              ) : binding ? (
                <span data-testid="diagnostic-binding">
                  <strong className="font-semibold text-blue-800">
                    {binding.label} is the binding constraint.
                  </strong>{' '}
                  Dropping &ldquo;{binding.droppedValue}&rdquo; alone takes you from{' '}
                  {full.companies} to {binding.companies}{' '}
                  {binding.companies === 1 ? 'company' : 'companies'} (+{binding.gain}). The other
                  dimensions cost you far less.
                </span>
              ) : (
                <span data-testid="diagnostic-nonbinding">
                  No single dimension is binding — relaxing any one of them returns the same{' '}
                  {full.companies} {full.companies === 1 ? 'company' : 'companies'}. The thesis is
                  already as broad as its parts.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function ExplorationBreakdown({ results }) {
  const { functions, cities, stages } = composition(results)

  const Column = ({ title, rows }) => (
    <div>
      <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">{title}</p>
      <ul className="space-y-1">
        {rows.slice(0, 6).map(([name, count]) => (
          <li key={name} className="flex justify-between gap-3 text-sm text-slate-700">
            <span className="truncate">{name}</span>
            <span className="tabular-nums text-slate-500">{count}</span>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-slate-400">None</li> : null}
      </ul>
    </div>
  )

  return (
    <div className="mt-5">
      <div
        data-testid="exploration-banner"
        className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
      >
        <strong className="font-semibold">Exploration mode.</strong> With fewer than two
        constraints there is nothing to relax — dropping your only dimension would just return the
        whole market. Here is what is inside this slice instead. Add a second dimension to get the
        binding-constraint diagnostic.
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <Column title="Functions hiring" rows={functions} />
        <Column title="Cities" rows={cities} />
        <Column title="Stages" rows={stages} />
      </div>
    </div>
  )
}
