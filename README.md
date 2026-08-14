# Thesis Tester

A wireframe prototype of a career thesis-testing tool, built for user testing.

You state a **thesis** — the kind of role and company you think you are targeting
("Marketing, Space, Denver") — and the tool tells you whether that thesis exists
in the job market, **which specific part of it is unrealistic**, and then lets you
screen the actual results for fit.

The diagnostic is the point. Most job tools return a list; this one tells you that
*Denver* is what is killing your thesis, not "space" and not "marketing".

## Two numbers, deliberately never merged

| | Question | Produced by |
|---|---|---|
| **Market hit rate** | Does this thesis exist at all? | The dataset |
| **Fit hit rate** | Of the jobs that exist, are any actually right? | You, role by role |

A thesis can have a healthy market hit rate and a terrible fit hit rate — plenty
of postings say "Marketing Manager" over a description that is really a
quota-carrying sales job. Separating the two numbers is what makes that visible,
and the advice the tool gives differs completely depending on which one is low.

## Running it

```bash
npm install && npm run dev
```

See **[instructions.md](instructions.md)** for the six test scenarios, the exact
form inputs that trigger each one, a full end-to-end walkthrough, the QA
checklist, and the list of stubbed areas.

## How it works

```
src/
  data/mockCompanies.js   40 fictional companies, 81 roles. Hand-built so each
                          test scenario is reachable; the scenario map is in the
                          header comment.
  lib/search.js           Matching, the relaxation diagnostic, fit tallying, and
                          the single branch-logic function.
  lib/scenarios.test.mjs  Asserts the scenarios still produce their documented
                          counts. `npm run test:data`.
  lib/warmPaths.js        Stub. Mock warm intros from a hash of the role id.
  components/             Form, market diagnostic, fit panel, results list,
                          branch prompt, next steps, tracker.
```

The market diagnostic re-runs the search once per specified dimension with that
dimension removed. Because relaxing only ever removes a filter, a relaxed count
can never be lower than the full-thesis count — asserted across 600 combinations
in the data test. The dimension whose removal unlocks the most companies is the
binding constraint.

Branch logic resolves to exactly one value (`relax`, `screen-more`,
`reconsider-function`, `keep-screening`, `next-steps`, `empty-market`), so the UI
can never show two contradictory prompts at once.

## Out of scope

No live job data, no real network-path lookup, no auth, no monetization. All four
are mocked or stubbed — see the limitations section of
[instructions.md](instructions.md).

## Stack

React 19, Vite 8, Tailwind 4. No backend.
