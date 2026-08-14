import { COMPANIES } from '../data/mockCompanies.js'

/**
 * The four dimensions of a thesis. Order here drives display order.
 * `relaxLabel` is the phrasing used in the diagnostic ("Drop geography").
 */
export const DIMENSIONS = [
  { key: 'function', label: 'Function / role', relaxLabel: 'Drop function' },
  { key: 'industry', label: 'Industry / sector', relaxLabel: 'Drop industry' },
  { key: 'geography', label: 'Geography', relaxLabel: 'Drop geography' },
  { key: 'stage', label: 'Company stage', relaxLabel: 'Drop stage' },
]

export const EMPTY_THESIS = { function: '', industry: '', geography: '', stage: '' }

/** Lowercase and strip everything but letters and digits, so "Biz Ops" === "bizops". */
function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** A blank query matches everything; otherwise the field must contain the query. */
function fieldMatches(query, field) {
  const q = normalize(query)
  if (!q) return true
  return normalize(field).includes(q)
}

/** Which dimensions the user actually filled in. */
export function specifiedDimensions(thesis) {
  return DIMENSIONS.filter((d) => String(thesis[d.key] ?? '').trim() !== '')
}

export function isEmptyThesis(thesis) {
  return specifiedDimensions(thesis).length === 0
}

/**
 * Fewer than two constraints is exploration, not a testable thesis: relaxing
 * the single constraint would just return the whole market, so the diagnostic
 * has nothing to say and the UI shows a composition breakdown instead.
 */
export function isExploration(thesis) {
  return specifiedDimensions(thesis).length < 2
}

/**
 * Core matcher. Returns the companies that have at least one role satisfying
 * every specified dimension, each carrying only its matching roles.
 */
export function matchCompanies(thesis) {
  return COMPANIES.map((company) => {
    if (!fieldMatches(thesis.industry, company.industry)) return null
    if (!fieldMatches(thesis.geography, company.city)) return null
    if (!fieldMatches(thesis.stage, company.stage)) return null

    const roles = company.roles.filter((role) => fieldMatches(thesis.function, role.function))
    if (roles.length === 0) return null

    return { ...company, matchingRoles: roles }
  }).filter(Boolean)
}

export function countsFor(thesis) {
  const companies = matchCompanies(thesis)
  return {
    companies: companies.length,
    roles: companies.reduce((sum, c) => sum + c.matchingRoles.length, 0),
  }
}

/**
 * Market hit rate diagnostic: the full-thesis count plus one relaxed count per
 * specified dimension. Because relaxing removes a filter, every relaxed count
 * is mathematically guaranteed to be >= the full count.
 *
 * `gain` is how many additional companies that single relaxation unlocks. The
 * dimension with the largest gain is the binding constraint.
 */
export function marketDiagnostic(thesis) {
  const full = countsFor(thesis)
  const specified = specifiedDimensions(thesis)

  const relaxations = specified.map((dim) => {
    const relaxedThesis = { ...thesis, [dim.key]: '' }
    const counts = countsFor(relaxedThesis)
    return {
      key: dim.key,
      label: dim.label,
      relaxLabel: dim.relaxLabel,
      droppedValue: thesis[dim.key],
      thesis: relaxedThesis,
      ...counts,
      gain: counts.companies - full.companies,
    }
  })

  const bestGain = relaxations.reduce((max, r) => Math.max(max, r.gain), 0)
  const binding = bestGain > 0 ? relaxations.find((r) => r.gain === bestGain) : null

  return {
    full,
    relaxations,
    binding,
    // Nothing to relax against: every single-dimension relaxation is also dead.
    allRelaxationsDead:
      relaxations.length > 0 && relaxations.every((r) => r.companies <= 1),
  }
}

/** Function / city / stage composition of a result set, for exploration mode. */
export function composition(companies) {
  const tally = (items) => {
    const counts = new Map()
    items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }

  const roles = companies.flatMap((c) => c.matchingRoles)
  return {
    functions: tally(roles.map((r) => r.function)),
    cities: tally(companies.map((c) => c.city)),
    stages: tally(companies.map((c) => c.stage)),
  }
}

/** Human-readable one-line restatement of the thesis. */
export function describeThesis(thesis) {
  const parts = specifiedDimensions(thesis).map((d) => thesis[d.key].trim())
  return parts.length > 0 ? parts.join(' · ') : 'Any role, anywhere'
}

// --- Fit hit rate -----------------------------------------------------------

/** Tally of the user's manual hit/miss screening. Separate from market counts. */
export function fitStats(verdicts, visibleRoleIds) {
  const visible = new Set(visibleRoleIds)
  let hits = 0
  let misses = 0
  Object.entries(verdicts).forEach(([roleId, verdict]) => {
    if (!visible.has(roleId)) return
    if (verdict === 'hit') hits += 1
    else if (verdict === 'miss') misses += 1
  })
  const screened = hits + misses
  return {
    hits,
    misses,
    screened,
    unscreened: visible.size - screened,
    rate: screened === 0 ? null : hits / screened,
  }
}

// --- Branch logic -----------------------------------------------------------

export const THRESHOLDS = {
  /** Below this many matching companies, the thesis is market-constrained. */
  lowMarketCompanies: 3,
  /** Roles that must be screened before a fit rate means anything. */
  minScreened: 3,
  /** At or below this fit rate, the title/function is too loose. */
  lowFitRate: 0.4,
  /** At or above this fit rate, next steps unlock. */
  highFitRate: 0.6,
}

/**
 * Exactly one branch is active at a time. The UI renders a single prompt from
 * this value, which is what keeps contradictory advice off the screen.
 *
 * 'empty-market'       - nothing matches and relaxing does not help
 * 'relax'              - market hit rate too low; relax the binding dimension
 * 'screen-more'        - enough market, not enough screening to judge fit
 * 'reconsider-function'- market is fine but fit is poor: the title is the problem
 * 'keep-screening'     - fit is ambiguous, sample is thin
 * 'next-steps'         - fit is strong; unlock next steps
 */
export function branchFor({ diagnostic, fit }) {
  if (diagnostic.full.companies < THRESHOLDS.lowMarketCompanies) {
    if (diagnostic.full.companies === 0 && diagnostic.allRelaxationsDead) return 'empty-market'
    return 'relax'
  }
  if (fit.screened < THRESHOLDS.minScreened) return 'screen-more'
  if (fit.rate < THRESHOLDS.lowFitRate) return 'reconsider-function'
  if (fit.rate >= THRESHOLDS.highFitRate) return 'next-steps'
  return 'keep-screening'
}
