import { COMPANIES } from '../data/mockCompanies.js'
import {
  DEGREE_SKILLS,
  EXPERIENCE_TYPE_SKILLS,
  FUNCTION_SKILLS,
  FUNCTION_CERTIFICATIONS,
  SKILL_KEYWORD_SYNONYMS,
} from '../data/careerGuidance.js'

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
 * Does a free-typed keyword count as evidence for this canonical skill tag?
 * Checked against the hand-authored synonym list first (so "python" counts
 * toward "coding / technical scripting"), then falls back to a loose
 * substring match against the tag's own words. Short keywords (<3 chars)
 * never match — too easy to collide by accident.
 */
function skillKeywordMatches(skillTag, keywords) {
  const synonyms = SKILL_KEYWORD_SYNONYMS[skillTag] ?? []
  const tagWords = skillTag.toLowerCase().split(/[^a-z0-9+]+/).filter(Boolean)
  return keywords.some((raw) => {
    const kw = raw.trim().toLowerCase()
    if (kw.length < 3) return false
    if (synonyms.some((s) => s === kw || s.includes(kw) || kw.includes(s))) return true
    return tagWords.some((w) => w === kw || w.includes(kw) || kw.includes(w))
  })
}

/**
 * Matched vs. to-develop skills for one function, given everything the
 * survey collected: degrees (multi), experience types (multi), past roles
 * actually worked in, and free-typed skill keywords. Union of all sources —
 * a survey-taker gets credit for a skill from any one of them.
 */
export function skillProfile(answers, func) {
  const { degrees = [], experienceTypes = [], pastRoles = [], skillKeywords = [] } = answers
  const have = new Set([
    ...degrees.flatMap((d) => DEGREE_SKILLS[d] ?? []),
    ...experienceTypes.flatMap((t) => EXPERIENCE_TYPE_SKILLS[t] ?? []),
    ...pastRoles.flatMap((r) => FUNCTION_SKILLS[r] ?? []),
  ])
  const required = FUNCTION_SKILLS[func] ?? []
  const matched = required.filter((skill) => have.has(skill) || skillKeywordMatches(skill, skillKeywords))
  return {
    matched,
    toDevelop: required.filter((skill) => !matched.includes(skill)),
    certification: FUNCTION_CERTIFICATIONS[func] ?? null,
  }
}
