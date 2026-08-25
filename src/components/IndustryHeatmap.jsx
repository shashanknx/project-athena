import { useMemo, useState } from 'react'
import { INDUSTRIES } from '../data/mockCompanies.js'
import { US_STATES, US_MAP_VIEWBOX, stateCounts, stateName, summarizeDistribution, trackedStateCount } from '../lib/geo.js'

/*
 * Geographic distribution of the selected industry, by state. Read-only, same
 * rule as MapView / lib/map.js: plain counts from the dataset, no scoring.
 */

// Sequential blue ramp, light -> dark. One color per unit of concentration; the
// legend is built from whatever range the data actually uses.
const RAMP = ['#b7d3f6', '#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281', '#0d366b']
const NO_DATA_COLOR = '#e1e0d9'

function buildScale(counts) {
  const max = Math.max(0, ...counts.values())
  const cap = Math.min(max, RAMP.length)

  function colorFor(count) {
    if (!count) return NO_DATA_COLOR
    return RAMP[Math.min(count, RAMP.length) - 1]
  }

  const legend = [{ label: '0', color: NO_DATA_COLOR }]
  for (let i = 1; i <= cap; i++) {
    const isTopBucket = i === cap && max > RAMP.length
    legend.push({ label: isTopBucket ? `${i}+` : `${i}`, color: RAMP[i - 1] })
  }

  return { colorFor, legend, max }
}

function Chip({ active, children, onClick }) {
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
    </button>
  )
}

export default function IndustryHeatmap() {
  const [industry, setIndustry] = useState('')
  const [activeAbbr, setActiveAbbr] = useState(null)

  const counts = useMemo(() => stateCounts(industry), [industry])
  const scale = useMemo(() => buildScale(counts), [counts])
  const totalMetros = useMemo(() => trackedStateCount(), [])
  const summary = useMemo(
    () => summarizeDistribution(counts, { industry, totalMetros }),
    [counts, industry, totalMetros],
  )

  const activeCount = activeAbbr ? (counts.get(activeAbbr) ?? 0) : null

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Geographic distribution</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Where the selected industry's companies are located, by state. Darker states have more
          companies in the dataset.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200 pt-4">
          <span className="mr-1 w-16 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Industry
          </span>
          <Chip active={!industry} onClick={() => setIndustry('')}>
            All
          </Chip>
          {INDUSTRIES.map((ind) => (
            <Chip key={ind} active={industry === ind} onClick={() => setIndustry(industry === ind ? '' : ind)}>
              {ind}
            </Chip>
          ))}
        </div>

        <p className="mt-3 text-sm text-slate-700" data-testid="heatmap-summary">
          {summary}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          All companies are fictional. Locations are limited to the {totalMetros} states this
          prototype's mock companies are based in — this is not a real market survey.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div>
            <svg
              viewBox={US_MAP_VIEWBOX}
              role="img"
              aria-label={`Map of U.S. states shaded by number of ${industry || 'all'} companies`}
              className="w-full"
            >
              {US_STATES.map((state) => {
                const count = counts.get(state.abbr) ?? 0
                const isActive = activeAbbr === state.abbr
                return (
                  <path
                    key={state.fips}
                    d={state.d}
                    fill={scale.colorFor(count)}
                    stroke={isActive ? '#0b0b0b' : '#fcfcfb'}
                    strokeWidth={isActive ? 1.5 : 1}
                    tabIndex={0}
                    onMouseEnter={() => setActiveAbbr(state.abbr)}
                    onMouseLeave={() => setActiveAbbr((prev) => (prev === state.abbr ? null : prev))}
                    onFocus={() => setActiveAbbr(state.abbr)}
                    onBlur={() => setActiveAbbr((prev) => (prev === state.abbr ? null : prev))}
                    style={{ cursor: 'default', outline: 'none' }}
                  >
                    <title>
                      {state.name}: {count} {count === 1 ? 'company' : 'companies'}
                    </title>
                  </path>
                )
              })}
            </svg>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {activeAbbr ? stateName(activeAbbr) : 'Hover a state'}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {activeAbbr
                  ? `${activeCount} ${activeCount === 1 ? 'company' : 'companies'}${industry ? ` in ${industry}` : ''}`
                  : 'Hover or focus any state to see its count.'}
              </p>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {industry || 'All companies'} per state
              </p>
              <ul className="space-y-1">
                {scale.legend.map((entry) => (
                  <li key={entry.label} className="flex items-center gap-2 text-xs text-slate-600">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm border border-slate-300"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.label} {entry.label === '1' ? 'company' : 'companies'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
