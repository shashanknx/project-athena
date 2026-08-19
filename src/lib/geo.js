import { COMPANIES } from '../data/mockCompanies.js'
import usStatesGeo from '../data/usStatesGeo.json'

/*
 * Geography helpers for the industry heat map. Read-only shaping, same rule as
 * lib/map.js: no matching, no hit-rate math, plain counts only.
 *
 * State outlines are real U.S. Census Bureau boundaries (public domain),
 * redistributed as pre-projected (Albers USA) TopoJSON by the topojson/us-atlas
 * project (ISC license) at https://github.com/topojson/us-atlas. src/data/usStatesGeo.json
 * was generated once, offline, by decoding that TopoJSON into flat SVG path
 * strings — see scripts/README in that PR for the decoder if it needs regenerating.
 */

export const US_STATES = usStatesGeo.states
export const US_MAP_VIEWBOX = usStatesGeo.viewBox

/** Every city in the mock dataset maps to exactly one state — small, so a literal table. */
const CITY_TO_STATE = {
  Austin: 'TX',
  Boston: 'MA',
  Denver: 'CO',
  'Los Angeles': 'CA',
  'New York': 'NY',
  'San Francisco': 'CA',
  Seattle: 'WA',
}

export function stateForCity(city) {
  return CITY_TO_STATE[city] ?? null
}

/** Company counts per state abbreviation, optionally scoped to one industry. */
export function stateCounts(industry) {
  const counts = new Map()
  COMPANIES.forEach((company) => {
    if (industry && company.industry !== industry) return
    const abbr = stateForCity(company.city)
    if (!abbr) return
    counts.set(abbr, (counts.get(abbr) ?? 0) + 1)
  })
  return counts
}

/**
 * A plain-language summary of how the given counts are distributed. Built from
 * the same counts the map renders, so the two can never disagree.
 */
export function summarizeDistribution(counts, { industry, totalMetros }) {
  const entries = [...counts.entries()]
    .map(([abbr, count]) => ({ abbr, count, name: stateName(abbr) }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)

  const total = entries.reduce((sum, e) => sum + e.count, 0)
  const label = industry || 'company'
  const plural = industry ? `${industry} companies` : 'companies'

  if (total === 0) {
    return `No ${plural} in the dataset have a mapped location yet.`
  }

  const pct = (n) => Math.round((n / total) * 100)
  const lead = entries[0]
  const runner = entries[1]

  let sentence = `${total} ${plural} appear across ${entries.length} of the ${totalMetros} states in this dataset. ` +
    `${lead.name} leads with ${lead.count} (${pct(lead.count)}%)`

  if (runner) {
    sentence += `, followed by ${runner.name} with ${runner.count} (${pct(runner.count)}%)`
  }
  sentence += '.'

  const missing = totalMetros - entries.length
  if (missing > 0) {
    sentence += ` ${missing} of the ${totalMetros} states in the dataset have no ${label === 'company' ? '' : industry + ' '}presence at all.`
  }

  return sentence
}

const STATE_NAMES = new Map(US_STATES.map((s) => [s.abbr, s.name]))
export function stateName(abbr) {
  return STATE_NAMES.get(abbr) ?? abbr
}

/** The distinct states any company in the dataset could possibly land in. */
export function trackedStateCount() {
  return new Set(Object.values(CITY_TO_STATE)).size
}
