import { useMemo } from 'react'
import ThesisAnalysis from './ThesisAnalysis.jsx'
import { INDUSTRIES, FUNCTIONS } from '../data/mockCompanies.js'
import { filterCompanies, functionsFor, functionTally, groupByIndustry, totals } from '../lib/map.js'

/**
 * The map: read-only exploration of the same dataset the tester runs on.
 *
 * There is no matching, hit-rate math, or relaxation logic in this file. The
 * counts shown here are plain totals from the data. Everything diagnostic
 * happens inside ThesisAnalysis, which opens inline when a user clicks a
 * function tag.
 */

function Chip({ active, children, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs ${
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      {children}
      {count !== undefined ? (
        <span className={active ? 'ml-1.5 text-slate-300' : 'ml-1.5 text-slate-400'}>{count}</span>
      ) : null}
    </button>
  )
}

function CompanyCard({ company, activeFunction, openFunction, onTest, onClose }) {
  const functions = functionsFor(company)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">{company.name}</h4>
        <span className="shrink-0 text-xs text-slate-500">
          {company.roles.length} open {company.roles.length === 1 ? 'role' : 'roles'}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        {company.industry} · {company.stage} · {company.city}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-400">Hiring for</span>
        {functions.map((fn) => {
          const isOpen = openFunction === fn
          const dimmed = activeFunction && activeFunction !== fn
          return (
            <button
              key={fn}
              type="button"
              onClick={() => (isOpen ? onClose() : onTest(company, fn))}
              aria-expanded={isOpen}
              title={`Test "${fn} · ${company.industry} · ${company.city}" without leaving the map`}
              className={`rounded border px-2 py-0.5 text-xs font-medium ${
                isOpen
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : dimmed
                    ? 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              {fn}
              <span className={isOpen ? 'ml-1 text-blue-200' : 'ml-1 text-slate-400'}>
                {isOpen ? '×' : '→'}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

export default function MapView({
  filters,
  onFilterChange,
  panel,
  onTest,
  onClosePanel,
  onRelaxPanel,
  panelState,
  onSetVerdict,
  onToggleRole,
  onClearScreening,
  isLogged,
  onLog,
  onOpenTester,
}) {
  const visible = useMemo(() => filterCompanies(filters), [filters])
  const groups = useMemo(() => groupByIndustry(visible), [visible])

  const all = useMemo(() => filterCompanies({ industry: '', func: '' }), [])

  // Each chip row is counted against the *other* filter, not the whole
  // dataset. That is what makes a gap legible: pick Robotics and the Marketing
  // chip drops to 1, which is the observation the map exists to produce.
  const industryCounts = useMemo(() => {
    const counts = new Map()
    filterCompanies({ industry: '', func: filters.func }).forEach((c) =>
      counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1),
    )
    return counts
  }, [filters.func])

  const functionCounts = useMemo(
    () => functionTally(filterCompanies({ industry: filters.industry, func: '' })),
    [filters.industry],
  )

  const shown = totals(visible)
  const everything = totals(all)

  // A panel stays anchored to its company. If the filters hide that company the
  // panel goes with it — state and all — so say so rather than letting it
  // vanish silently.
  const hiddenPanelCompany =
    panel && !visible.some((c) => c.id === panel.companyId)
      ? all.find((c) => c.id === panel.companyId)
      : null

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">The map</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Everything in the market, with no thesis required. Browse until something catches
              your eye, then click any function tag to test that thesis right here — the
              diagnostic opens in place and the map stays where it is.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTester}
            className="shrink-0 text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
          >
            Start from scratch →
          </button>
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 w-16 text-xs font-medium tracking-wide text-slate-500 uppercase">
              Industry
            </span>
            <Chip active={!filters.industry} onClick={() => onFilterChange({ ...filters, industry: '' })}>
              All
            </Chip>
            {INDUSTRIES.map((ind) => (
              <Chip
                key={ind}
                active={filters.industry === ind}
                count={industryCounts.get(ind) ?? 0}
                onClick={() =>
                  onFilterChange({ ...filters, industry: filters.industry === ind ? '' : ind })
                }
              >
                {ind}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 w-16 text-xs font-medium tracking-wide text-slate-500 uppercase">
              Function
            </span>
            <Chip active={!filters.func} onClick={() => onFilterChange({ ...filters, func: '' })}>
              All
            </Chip>
            {FUNCTIONS.map((fn) => (
              <Chip
                key={fn}
                active={filters.func === fn}
                count={functionCounts.get(fn) ?? 0}
                onClick={() => onFilterChange({ ...filters, func: filters.func === fn ? '' : fn })}
              >
                {fn}
              </Chip>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500" data-testid="map-summary">
          Showing {shown.companies} of {everything.companies} companies · {shown.roles} open{' '}
          {shown.roles === 1 ? 'role' : 'roles'}.{' '}
          <span className="text-slate-400">
            Plain totals from the dataset — no thesis is being scored here.
          </span>
        </p>

        {hiddenPanelCompany ? (
          <p
            data-testid="hidden-panel-notice"
            className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900"
          >
            Your open test panel for <strong>{hiddenPanelCompany.name}</strong> is hidden by these
            filters. Nothing was lost — clear the filters to return to it, including anything you
            already screened.
          </p>
        ) : null}
      </section>

      {groups.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            Nothing in the map matches both filters.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Clear one of them to keep browsing.
          </p>
        </section>
      ) : null}

      {groups.map((group) => (
        <section key={group.industry}>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {group.industry}{' '}
            <span className="font-normal text-slate-500">
              ({group.companies.length} {group.companies.length === 1 ? 'company' : 'companies'})
            </span>
          </h3>

          <div className="grid gap-3 lg:grid-cols-2">
            {group.companies.map((company) => {
              const isPanelHere = panel?.companyId === company.id
              return [
                <CompanyCard
                  key={company.id}
                  company={company}
                  activeFunction={filters.func}
                  openFunction={isPanelHere ? panel.fn : null}
                  onTest={onTest}
                  onClose={onClosePanel}
                />,
                isPanelHere ? (
                  <div
                    key={`${company.id}-panel`}
                    data-testid="map-panel"
                    className="rounded-lg border-2 border-blue-300 bg-slate-50 p-4 lg:col-span-2"
                  >
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm text-slate-600">
                        Testing{' '}
                        <span className="font-semibold text-slate-900">
                          {panel.thesis.function || 'any function'} ·{' '}
                          {panel.thesis.industry || 'any industry'} ·{' '}
                          {panel.thesis.geography || 'anywhere'}
                        </span>
                        <span className="text-slate-400"> — started from {company.name}</span>
                      </p>
                      <button
                        type="button"
                        onClick={onClosePanel}
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
                      >
                        Collapse ×
                      </button>
                    </div>

                    <ThesisAnalysis
                      dense
                      thesis={panel.thesis}
                      verdicts={panelState.verdicts}
                      expandedRoles={panelState.expandedRoles}
                      onSetVerdict={onSetVerdict}
                      onToggleRole={onToggleRole}
                      onClearScreening={onClearScreening}
                      onRelax={onRelaxPanel}
                      isLogged={isLogged}
                      onLog={onLog}
                    />
                  </div>
                ) : null,
              ]
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
