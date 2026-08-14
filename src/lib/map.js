import { COMPANIES } from '../data/mockCompanies.js'

/*
 * Helpers for the Map view. Read-only shaping of the same dataset the tester
 * uses — deliberately no matching, no hit-rate math, no relaxation logic.
 * If you find yourself adding any of those here, they belong in lib/search.js.
 */

/** The distinct functions a company hires for, derived from its roles. */
export function functionsFor(company) {
  return [...new Set(company.roles.map((role) => role.function))].sort()
}

/** Companies passing the current industry / function filters. */
export function filterCompanies({ industry, func }) {
  return COMPANIES.filter((company) => {
    if (industry && company.industry !== industry) return false
    if (func && !company.roles.some((role) => role.function === func)) return false
    return true
  })
}

/** Companies bucketed by industry, in dataset order, empty buckets dropped. */
export function groupByIndustry(companies) {
  const groups = new Map()
  companies.forEach((company) => {
    if (!groups.has(company.industry)) groups.set(company.industry, [])
    groups.get(company.industry).push(company)
  })
  return [...groups.entries()].map(([industry, items]) => ({ industry, companies: items }))
}

/** Every function present in the dataset, with how many companies hire for it. */
export function functionTally(companies) {
  const counts = new Map()
  companies.forEach((company) => {
    functionsFor(company).forEach((fn) => counts.set(fn, (counts.get(fn) ?? 0) + 1))
  })
  return counts
}

/** Static browse totals. Not a hit rate — no thesis is involved. */
export function totals(companies) {
  return {
    companies: companies.length,
    roles: companies.reduce((sum, c) => sum + c.roles.length, 0),
  }
}
