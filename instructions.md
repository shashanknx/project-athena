# Thesis Tester — testing instructions

A wireframe prototype of a career thesis-testing tool. A user states a **thesis**
(the kind of role and company they think they are targeting); the tool tells them
whether that thesis exists in the job market, **which specific part of it is
unrealistic**, and then lets them screen the actual results for fit.

The diagnostic is the product. Two numbers are kept deliberately separate and are
never combined:

| | Question it answers | Who produces it | Where it appears |
|---|---|---|---|
| **Market hit rate** | Does this thesis exist at all? | Computed from the dataset | Section 1, blue |
| **Fit hit rate** | Of the jobs that exist, are any actually right? | The user, role by role | Section 2, amber |

All job data is mock. There is no live job API, no network lookup, no account.

---

## 1. Running it locally

Requires Node 20+ (built and tested on Node 26, npm 11).

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (http://localhost:5173 by default).

Other commands:

```bash
npm run test:data
```

Asserts that all six scenarios below still produce the counts this document
promises, and that relaxed counts are never lower than the full-thesis count
(checked across 600 thesis combinations). Run it after editing
`src/data/mockCompanies.js`.

```bash
npm run build
```

---

## 2. Test scenarios

Every scenario is reachable by typing into the form. The **Load a test scenario**
chips under the form fill the same fields and submit through the same code path —
use them for speed, or type the inputs to test the form itself.

Leave any field marked *(blank)* empty.

| # | Scenario | Function | Industry | Geography | Stage | What the tester should see |
|---|---|---|---|---|---|---|
| **S1** | High market hit rate | `BizOps` | `Robotics` | *(blank)* | *(blank)* | **8 companies / 16 roles**, every company with 2 open roles. Relaxing function → 9, relaxing industry → 13. Prompt: "The market is there. Now find out whether the jobs are any good." Screening all 16 honestly lands at **56%** — mid-band on purpose, so you get the "Mixed signal" prompt. S1 is about the market number. |
| **S2** | Zero on the full thesis, but relaxable | `Marketing` | `Space` | `Denver` | *(blank)* | **0 companies.** Relaxation bars: drop function → **1**, drop industry → **4**, drop geography → **11**. Geography is called out as the binding constraint, in blue, with a **Re-run without "Denver"** button. No fit section (nothing to screen). |
| **S3** | Zero on every relaxation | `Legal` | `Space` | `Detroit` | *(blank)* | **0 companies**, and all three relaxation bars also **0**. No binding constraint is claimed. Empty-state copy: the combination is off the map, change two dimensions at once. |
| **S4** | High market, low fit | `Marketing` | `Space` | *(blank)* | *(blank)* | **11 companies / 11 roles.** Read every description: only 3 are real marketing jobs (Vantage Orbit, Ranger Aerospace, Trailhead Orbital). The other 8 are quota-carrying sales, SDR, channel sales, or Salesforce admin wearing a marketing title. Honest screening = **27%** → prompt flips to "Decent market, poor fit — the problem is your title, not your map." |
| **S5** | High market, high fit | `Product` | `Biotech` | *(blank)* | *(blank)* | **6 companies / 6 roles.** Five are unambiguous product management; Pinewood Bio's "Product Manager, Clinical Ops Tools" is project management in disguise. Honest screening = **83%** → "Strong fit" prompt and the **Next steps** panel unlocks with warm paths and *Log this job*. |
| **S6** | Sparse / exploration | *(blank)* | `Biotech` | *(blank)* | *(blank)* | **10 companies / 20 roles.** No relaxation bars — instead an amber **Exploration mode** banner and a composition breakdown (functions hiring, cities, stages). The form's helper text reads "1 of 4 dimensions set — exploration mode". |

Matching is case- and punctuation-insensitive: `biz ops`, `BizOps`, and `BIZOPS`
all match, and partial words match (`market` finds Marketing roles). Geography
matches against city names in the dataset.

---

## 3. End-to-end walkthrough

One continuous session, starting from a thesis that does not exist and ending
with a job in the tracker. Do not reload the page partway through.

**Part A — a thesis that does not exist**

1. In **Function / role** type `Marketing`. In **Industry / sector** type `Space`.
   In **Geography** type `Denver`. Leave stage as *Any stage*. Click **Test thesis**.
2. **Market hit rate reads 0.** The thesis, as stated, does not exist. Note that
   no fit section appears — there is nothing to screen, and the tool does not
   invent a fit number to fill the space.
3. Look at **What happens if you relax one dimension**. Dropping the function
   gets you 1 company; dropping the industry gets you 4; dropping geography gets
   you 11. Geography is highlighted in blue and named the binding constraint.
   This is the diagnostic doing its job: *Denver* is what is killing this thesis,
   not "space" and not "marketing".

**Part B — relax the binding dimension and screen for fit**

4. Click **Re-run without "Denver"**. The form updates to `Marketing` + `Space`,
   the page scrolls back to the top, and the market hit rate now reads **11
   companies / 11 roles**.
5. The prompt changes to "The market is there. Now find out whether the jobs are
   any good." The **Fit hit rate** section appears, reading `—` with 0 of 11
   screened.
6. Scroll to **Matching companies**. Click **Marketing Lead** at Orbital Foundry
   to expand the posting. It carries a personal quota of 40 opportunities a
   quarter and 60/40 variable comp — it is a sales job with a marketing title.
   Click **Miss**.
7. The fit hit rate updates immediately: 0%, 1 of 11 screened, "Thin sample".
   Your place in the list does not move and the description stays open.
8. Keep going down the list, reading each description before deciding. Honest
   screening gives three hits — Vantage Orbit, Ranger Aerospace, and Trailhead
   Orbital — and eight misses.
9. At **27%**, the prompt changes to *"Decent market, poor fit — the problem is
   your title, not your map."* This is the second half of the diagnostic: the
   market is real, so geography and industry are not the problem. The word
   "marketing" is.

**Part C — act on the diagnostic, then log a job**

10. Take the tool's advice and test a different function. Set **Function** to
    `Product` and **Industry** to `Biotech`, then click **Test thesis** (or use
    the **S5** chip). Note that your screening from the previous thesis is
    cleared — a fit rate only ever describes the results currently on screen.
11. Market hit rate reads **6 companies / 6 roles**. Screen all six. Five are
    genuine product roles; Pinewood Bio's is project management with a product
    title, so mark that one a miss.
12. At **83%** the prompt becomes *"Strong fit — this thesis holds up"* and a
    third section, **Next steps — unlocked**, appears above the results with a
    mocked warm path for each of your five hits.
13. Click **Log this job** on *Product Manager, Platform · Helix Bio*. The button
    changes to **Logged**, and the header count becomes **Tracker (1)**.
14. Click **Tracker (1)** in the header. The job is listed with company, role, a
    status dropdown (researching / warm intro sought / applied), and the date
    added. Change the status to *warm intro sought*.
15. Go back to **Test a thesis**, run any other thesis, and return to the
    tracker. Your entry is still there — running a new thesis does not wipe it.

---

## 4. QA checklist

Every item below was verified in the browser on the build in this repo. Tick them
through yourself; the "verified" notes say what the expected result is.

- [ ] **1. One field only does not error.** Enter just `Biotech` in Industry and
      submit. *Verified: returns 10 companies / 20 roles in exploration mode.*
- [ ] **2. Zero fields is blocked with a visible message.** Clear every field and
      submit. *Verified: a red inline message appears above the buttons —
      "Fill in at least one dimension…". No results render, nothing fails
      silently.*
- [ ] **3. Full and relaxed counts are all shown and consistent.** Run S2.
      *Verified: full (0) plus all three relaxed counts (1, 4, 11) are displayed
      together. Relaxed counts can never be lower than the full count — this is
      structural (relaxing removes a filter) and is asserted across 600 thesis
      combinations by `npm run test:data`.*
- [ ] **4. The two rates are never merged.** *Verified: separate sections,
      separate numbering (1 · Market hit rate, 2 · Fit hit rate), separate accent
      colours (blue / amber), and no screen anywhere shows a combined or averaged
      figure.*
- [ ] **5. Fit hit rate updates live and resets on a new search.** Toggle any
      Hit/Miss. *Verified: the percentage, hits, misses, and "n of m screened"
      update on the same click. Running a new thesis resets screening to 0, and
      **Clear screening** resets it without changing the results.*
- [ ] **6. All six scenarios are reachable through the form.** *Verified: each
      one was reached both by typing the inputs in the table above and via the
      scenario chips, and each produced its intended UI state.*
- [ ] **7. Branch logic fires on the right thresholds, one prompt at a time.**
      *Verified: exactly one prompt renders in every state — this is structural,
      the UI renders a single computed branch value rather than independent
      conditionals. Thresholds: fewer than 3 matching companies → relax; fewer
      than 3 roles screened → keep screening; below 40% fit → reconsider
      function; 40–60% → mixed signal; 60% or above → next steps unlocked.*
- [ ] **8. The tracker survives a new search.** *Verified: logged two jobs under
      S5, ran S1, and the header still read Tracker (2) with both rows intact.*
- [ ] **9. Expanding a posting and toggling hit/miss keeps your place.**
      *Verified: scroll position measured before and after a toggle is
      unchanged; the expanded description stays open and the list never
      re-orders.*
- [ ] **10. No console errors.** *Verified in a fresh tab across all six
      scenarios, with every role expanded and toggled: no errors and no
      warnings.*

---

## 5. Known limitations and stubs

These are deliberate. Please do not file them as bugs.

**Stubbed or out of scope by design**

- **No real job data.** The market is 40 fictional companies and 81 roles in
  `src/data/mockCompanies.js`, hand-built so the six scenarios above are
  reachable. Nothing is fetched.
- **Warm paths are invented.** The contact names and relationships in the next
  steps panel are generated from a hash of the role id. No network graph,
  LinkedIn, or contact lookup exists.
- **No authentication.** No accounts, no sign-in, no per-user state.
- **No monetization.** No pricing, paywall, or payment UI anywhere.
- **Nothing persists.** All state, including the tracker, is in React memory.
  Reloading the page clears everything. The tracker survives running new
  theses — that is the requirement — but not a refresh.

**Design decisions worth probing in user testing**

- **Logging a job is gated behind a high fit hit rate.** *Log this job* lives
  only in the next steps panel, which unlocks at 60% fit or above. A user who
  finds one great role inside an otherwise poor thesis currently cannot log it.
  This follows the spec, but it is worth watching whether testers try to log
  from the results list.
- **Exploration mode suppresses the relaxation bars.** With fewer than two
  dimensions set there is nothing meaningful to relax — dropping your only
  constraint would return the entire market — so the diagnostic is replaced with
  a composition breakdown. Testers may still expect to see bars.
- **The market hit rate is a count, not a rate.** It is expressed as "N companies
  match" rather than a percentage, because the denominator (all companies
  everywhere) is not meaningful. The label still says "hit rate" to match the
  product language.
- **Screening is unweighted.** Every role counts the same toward the fit hit
  rate, regardless of company or seniority.
- **`screenerVerdict` in the data file is an answer key, not app logic.** The app
  never reads it; it exists so testers can check their own screening and so
  `npm run test:data` can assert the expected fit rates.

**Small things noticed and left alone**

- The tracker table wraps company and role names onto several lines in narrow
  windows. Wireframe-acceptable.
- Geography matches city names only. There is no notion of regions, metro areas,
  or remote work, so "Bay Area" returns nothing while "San Francisco" works.
