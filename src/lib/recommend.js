import { COMPANIES } from '../data/mockCompanies.js'
import { DEGREE_SKILLS, EXPERIENCE_SKILLS, FUNCTION_SKILLS, FUNCTION_CERTIFICATIONS } from '../data/careerGuidance.js'

/*
 * Career-survey recommendation logic. Separate from lib/map.js and
 * lib/search.js on purpose: this reads the survey answers and the same
 * dataset, but the matching rules here (level heuristic, skill overlap) are
 * specific to the survey feature and shouldn't leak into the plain-totals
 * map or the thesis-testing diagnostic.
 */

const SENIOR_TITLE = /\b(Manager|Lead|Director|Head|VP|Principal)\b/i
const ENTRY_TITLE = /\b(Analyst|Associate|Coordinator|Assistant)\b/i

/** Estimated seniority from a role's title text — a heuristic, not a stored field. */
export function inferLevel(title) {
  if (SENIOR_TITLE.test(title)) return 'Manager / senior'
  if (ENTRY_TITLE.test(title)) return 'Entry level'
  return 'Mid-level / individual contributor'
}

/**
 * Companies (with only the matching roles attached, and each role tagged
 * with its inferred level) for the industries/functions the survey selected.
 * Empty arrays mean "no filter on this dimension," not "match nothing."
 */
export function recommendCompanies({ industries = [], functions = [] }) {
  return COMPANIES.map((company) => {
    if (industries.length && !industries.includes(company.industry)) return null
    const matchingRoles = company.roles
      .filter((role) => !functions.length || functions.includes(role.function))
      .map((role) => ({ ...role, level: inferLevel(role.title) }))
    if (!matchingRoles.length) return null
    return { ...company, matchingRoles }
  }).filter(Boolean)
}

/** Same shape as lib/map.js's groupByIndustry, but keyed to matchingRoles. */
export function groupRecommendationsByIndustry(recommended) {
  const groups = new Map()
  recommended.forEach((company) => {
    if (!groups.has(company.industry)) groups.set(company.industry, [])
    groups.get(company.industry).push(company)
  })
  return [...groups.entries()].map(([industry, companies]) => ({ industry, companies }))
}

/**
 * Matched vs. to-develop skills for one function, given a survey-taker's
 * degree background and experience. Overlap is plain string equality against
 * the shared vocabulary in careerGuidance.js.
 */
export function skillProfile({ degree, experience }, func) {
  const have = new Set([...(DEGREE_SKILLS[degree] ?? []), ...(EXPERIENCE_SKILLS[experience] ?? [])])
  const required = FUNCTION_SKILLS[func] ?? []
  return {
    matched: required.filter((skill) => have.has(skill)),
    toDevelop: required.filter((skill) => !have.has(skill)),
    certification: FUNCTION_CERTIFICATIONS[func] ?? null,
  }
}
