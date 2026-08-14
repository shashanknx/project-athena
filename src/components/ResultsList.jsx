function VerdictButton({ active, tone, children, onClick }) {
  const palette = {
    hit: active
      ? 'border-emerald-600 bg-emerald-600 text-white'
      : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-700',
    miss: active
      ? 'border-rose-600 bg-rose-600 text-white'
      : 'border-slate-300 bg-white text-slate-600 hover:border-rose-400 hover:text-rose-700',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded border px-2.5 py-1 text-xs font-medium ${palette[tone]}`}
    >
      {children}
    </button>
  )
}

function RoleRow({ role, verdict, expanded, onToggleExpand, onSetVerdict }) {
  return (
    <li className="border-t border-slate-100 first:border-t-0">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="w-3 shrink-0 text-xs text-slate-400">{expanded ? '▾' : '▸'}</span>
          <span className="truncate text-sm text-slate-900">{role.title}</span>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
            {role.function}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <VerdictButton
            tone="hit"
            active={verdict === 'hit'}
            onClick={() => onSetVerdict(verdict === 'hit' ? null : 'hit')}
          >
            Hit
          </VerdictButton>
          <VerdictButton
            tone="miss"
            active={verdict === 'miss'}
            onClick={() => onSetVerdict(verdict === 'miss' ? null : 'miss')}
          >
            Miss
          </VerdictButton>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 pl-9">
          <p className="mb-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Mock job description
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-700">{role.description}</p>
          <p className="mt-2 text-xs text-slate-400">
            Read it, then mark this role a hit or a miss above.
          </p>
        </div>
      ) : null}
    </li>
  )
}

export default function ResultsList({ companies, verdicts, expanded, onToggleExpand, onSetVerdict }) {
  if (companies.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">No open roles match this thesis.</p>
        <p className="mt-1 text-sm text-slate-500">
          There is nothing to screen for fit yet. Use the market hit rate diagnostic above to work
          out which constraint to loosen.
        </p>
      </section>
    )
  }

  const totalRoles = companies.reduce((n, c) => n + c.matchingRoles.length, 0)

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Matching companies{' '}
          <span className="font-normal text-slate-500">
            ({companies.length} {companies.length === 1 ? 'company' : 'companies'}, {totalRoles}{' '}
            {totalRoles === 1 ? 'role' : 'roles'})
          </span>
        </h3>
        <p className="text-xs text-slate-500">Click a role to read the posting</p>
      </div>

      <div className="space-y-3">
        {companies.map((company) => (
          <article
            key={company.id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{company.name}</h4>
                <p className="text-xs text-slate-500">
                  {company.industry} · {company.stage} · {company.city}
                </p>
              </div>
              <span className="text-xs text-slate-600">
                {company.matchingRoles.length} matching open{' '}
                {company.matchingRoles.length === 1 ? 'role' : 'roles'}
              </span>
            </header>
            <ul>
              {company.matchingRoles.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  verdict={verdicts[role.id] ?? null}
                  expanded={Boolean(expanded[role.id])}
                  onToggleExpand={() => onToggleExpand(role.id)}
                  onSetVerdict={(v) => onSetVerdict(role.id, v)}
                />
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
