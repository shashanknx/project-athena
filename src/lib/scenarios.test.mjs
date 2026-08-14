/*
 * Scenario assertions for the mock dataset. Run with `npm run test:data`.
 *
 * This is not a UI test — it verifies that the six documented test scenarios
 * actually produce the counts instructions.md promises, and that the market
 * diagnostic is internally consistent (relaxed counts always >= full count).
 * If you edit src/data/mockCompanies.js, run this to see what you broke.
 */

import {
  matchCompanies,
  countsFor,
  marketDiagnostic,
  isExploration,
  branchFor,
  fitStats,
} from './search.js'
import { COMPANIES, ROLES } from '../data/mockCompanies.js'

let failures = 0
let checks = 0

function check(label, actual, expected) {
  checks += 1
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) {
    failures += 1
    console.log(`  FAIL  ${label}\n          expected ${JSON.stringify(expected)}\n          actual   ${JSON.stringify(actual)}`)
  } else {
    console.log(`  ok    ${label}  (${JSON.stringify(actual)})`)
  }
}

function relaxed(diagnostic, key) {
  return diagnostic.relaxations.find((r) => r.key === key)?.companies
}

/** What a careful screener should conclude, per the answer key in the data. */
function expectedFit(thesis) {
  const roles = matchCompanies(thesis).flatMap((c) => c.matchingRoles)
  const verdicts = {}
  roles.forEach((r) => {
    if (r.screenerVerdict === 'match') verdicts[r.id] = 'hit'
    else if (r.screenerVerdict === 'mismatch') verdicts[r.id] = 'miss'
  })
  return fitStats(verdicts, roles.map((r) => r.id))
}

console.log('\nDataset shape')
check('company count', COMPANIES.length, 40)
check('role count', ROLES.length, 81)
check('unique role ids', new Set(ROLES.map((r) => r.id)).size, ROLES.length)
check('unique company ids', new Set(COMPANIES.map((c) => c.id)).size, COMPANIES.length)

console.log('\nS1  high market hit rate  —  BizOps + Robotics')
{
  const thesis = { function: 'BizOps', industry: 'Robotics', geography: '', stage: '' }
  const companies = matchCompanies(thesis)
  check('companies', companies.length, 8)
  check('roles', countsFor(thesis).roles, 16)
  check('every company has 2 matching roles', companies.every((c) => c.matchingRoles.length === 2), true)
  check('fit lands in the mid band', Math.round(expectedFit(thesis).rate * 100), 56)
}

console.log('\nS2  zero but relaxable  —  Marketing + Space + Denver')
{
  const thesis = { function: 'Marketing', industry: 'Space', geography: 'Denver', stage: '' }
  const d = marketDiagnostic(thesis)
  check('full thesis', d.full.companies, 0)
  check('drop geography', relaxed(d, 'geography'), 11)
  check('drop industry', relaxed(d, 'industry'), 4)
  check('drop function', relaxed(d, 'function'), 1)
  check('binding constraint', d.binding.key, 'geography')
  check('branch', branchFor({ diagnostic: d, fit: fitStats({}, []) }), 'relax')
}

console.log('\nS3  every relaxation dead  —  Legal + Space + Detroit')
{
  const thesis = { function: 'Legal', industry: 'Space', geography: 'Detroit', stage: '' }
  const d = marketDiagnostic(thesis)
  check('full thesis', d.full.companies, 0)
  check('all relaxations', d.relaxations.map((r) => r.companies), [0, 0, 0])
  check('flagged as dead', d.allRelaxationsDead, true)
  check('branch', branchFor({ diagnostic: d, fit: fitStats({}, []) }), 'empty-market')
}

console.log('\nS4  high market, low fit  —  Marketing + Space')
{
  const thesis = { function: 'Marketing', industry: 'Space', geography: '', stage: '' }
  const counts = countsFor(thesis)
  const fit = expectedFit(thesis)
  check('companies', counts.companies, 11)
  check('roles', counts.roles, 11)
  check('screener hits', fit.hits, 3)
  check('screener misses', fit.misses, 8)
  check('fit rate %', Math.round(fit.rate * 100), 27)
  check('branch', branchFor({ diagnostic: marketDiagnostic(thesis), fit }), 'reconsider-function')
}

console.log('\nS5  high market, high fit  —  Product + Biotech')
{
  const thesis = { function: 'Product', industry: 'Biotech', geography: '', stage: '' }
  const counts = countsFor(thesis)
  const fit = expectedFit(thesis)
  check('companies', counts.companies, 6)
  check('roles', counts.roles, 6)
  check('screener hits', fit.hits, 5)
  check('fit rate %', Math.round(fit.rate * 100), 83)
  check('branch', branchFor({ diagnostic: marketDiagnostic(thesis), fit }), 'next-steps')
}

console.log('\nS6  sparse exploration  —  Biotech only')
{
  const thesis = { function: '', industry: 'Biotech', geography: '', stage: '' }
  const counts = countsFor(thesis)
  check('exploration mode', isExploration(thesis), true)
  check('companies', counts.companies, 10)
  check('roles', counts.roles, 20)
}

console.log('\nInvariants')
{
  check('no company in Detroit', COMPANIES.filter((c) => c.city === 'Detroit').length, 0)
  check('exactly one Legal role', ROLES.filter((r) => r.function === 'Legal').length, 1)
  check(
    'exactly one Denver space company',
    COMPANIES.filter((c) => c.city === 'Denver' && c.industry === 'Space').length,
    1,
  )
  check('input matching is case/space insensitive',
    countsFor({ function: 'biz ops', industry: 'ROBOTICS', geography: '', stage: '' }).companies, 8)
}

console.log('\nRelaxed counts are always >= the full count (QA check 3)')
{
  const values = {
    function: ['', 'Marketing', 'BizOps', 'Product', 'Legal', 'Engineering'],
    industry: ['', 'Space', 'Robotics', 'Biotech', 'General'],
    geography: ['', 'Denver', 'Boston', 'Detroit', 'San Francisco'],
    stage: ['', 'early-stage', 'growth', 'public'],
  }
  let violations = 0
  let combos = 0
  for (const fn of values.function)
    for (const ind of values.industry)
      for (const geo of values.geography)
        for (const stage of values.stage) {
          const thesis = { function: fn, industry: ind, geography: geo, stage }
          const d = marketDiagnostic(thesis)
          combos += 1
          d.relaxations.forEach((r) => {
            if (r.companies < d.full.companies) violations += 1
          })
        }
  check(`monotonic across ${combos} theses`, violations, 0)
}

console.log(
  `\n${failures === 0 ? 'PASS' : 'FAIL'} — ${checks - failures}/${checks} checks passed\n`,
)
process.exit(failures === 0 ? 0 : 1)
