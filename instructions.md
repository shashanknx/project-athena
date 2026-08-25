# Project Athena — testing instructions

Project Athena is a wireframe prototype of a career thesis-testing tool. A user
states a **thesis** (the kind of role and company they think they are
targeting); the tool tells them whether that thesis exists in the job market,
**which specific part of it is unrealistic**, and then lets them screen the
actual results for fit.

The diagnostic is the product. Two numbers are kept deliberately separate and are
never combined:

| | Question it answers | Who produces it | Where it appears |
|---|---|---|---|
| **Market hit rate** | Does this thesis exist at all? | Computed from the dataset | Section 1, blue |
| **Fit hit rate** | Of the jobs that exist, are any actually right? | The user, role by role | Section 2, amber |

**The public URL is a landing page, not the product.** Anyone hitting
https://shashanknx.github.io/project-athena/ gets a marketing page (value prop,
how-it-works previews, an email waitlist) — nothing about the map, the survey,
or the tracker is linked from it. The actual product is mounted at an unlisted
URL, `.../project-athena/#/internal`, which only the team should have.

**This is not real access control.** The site is static and public, with no
backend and no auth. The `#/internal` route is unlinked, not gated — anyone who
has the URL, or who opens devtools and reads the shipped JavaScript, can reach
it. Treat it as "not advertised," not "protected." See §2 for the landing page
itself and §3 onward for the product it hides.

Once inside the product, there are two ways to test a thesis. **The map** is the
primary view: browse everything that exists with no thesis required, then test
any thesis inline without leaving the page. **The standalone tester** is
secondary, reached from *Start from scratch*, for building a thesis that does
not begin with a company you are already looking at.

All job data is mock. There is no live job API, no network lookup, no real
account system.

---

## 1. Running it

Deployed for testing:

- **Public landing page:** https://shashanknx.github.io/project-athena/
- **Product (team only, unlisted):** https://shashanknx.github.io/project-athena/#/internal

Both are the same static deploy, rebuilt automatically on every push to `main`;
the hash after `#` is what switches between them, entirely in the browser.

To run locally, Node 20+ (built and tested on Node 26, npm 11).

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (http://localhost:5173 by default) for the
landing page, or append `#/internal` to it for the product.

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

## 2. The landing page (public root)

What a real visitor sees at the bare project URL. One page, three anchor-linked
sections, no build step beyond the same static bundle as the product.

**Nav.** *Home*, *How It Works*, *Sign Up* — plain same-page anchors
(`#home`, `#how-it-works`, `#sign-up`), not route changes. None of them, or
anything else on the page, links to `#/internal`.

**Home.** A headline and subhead, three value-prop cards, and a *Join the
waitlist* button that scrolls to Sign Up. The headline is one of four
positioning variants in `src/data/landingCopy.js` (`HEADLINES`), picked by a
`?headline=N` query param (0–4), defaulting to 0 — hand a tester
`?headline=2` to show them a different pitch without a rebuild. This is not a
real experimentation platform: nothing is tracked, it just changes which copy
renders.

**How It Works.** Four static preview cards — Survey, Map, Job Listings,
Tracker — each a small hand-built reproduction of the real screen's layout and
colour language (`src/components/landing/PreviewMockups.jsx`), framed to look
like a browser window. **These are not live screenshots.** They cannot go
stale as a binary asset, but they also will not automatically reflect a real
redesign of the product — if you restyle a screen, update its mini
reproduction here too, or the two will visibly disagree.

**Sign Up.** An email field and *Join waitlist* button
(`src/components/landing/WaitlistForm.jsx`). A submission is validated
client-side, then POSTed directly to a Google Form's response endpoint
(`GOOGLE_FORM_ACTION` / `GOOGLE_FORM_EMAIL_ENTRY` in that file) — the visitor
never sees Google's own form UI, only this page's styling; the answers land in
that Form's linked Google Sheet. There is still no app backend of ours: this
is a client-side POST straight to Google, not a server we run.

Two things worth knowing about that technique specifically:

- **Success can't be verified.** Google's endpoint doesn't return
  CORS headers, so the fetch is made in `no-cors` mode and the response is
  opaque — the code can tell a request *failed to send* (network error,
  offline) and shows an error for that, but a "sent successfully" state
  means only that the browser dispatched the request, not that Google
  accepted it. This is a structural limit of posting to Google Forms from
  client-side JS, not something more code can fix.
- **Replacing the form.** If the Google Form ever needs to change, open the
  new form, find its hidden `<input type="hidden" name="entry.NNNNNN">`
  (view page source, or `document.querySelectorAll('input')` in devtools) —
  that name is `GOOGLE_FORM_EMAIL_ENTRY`, and the form's own `action`
  attribute (ending in `/formResponse`) is `GOOGLE_FORM_ACTION`.

A per-browser `localStorage` flag (`projectAthena.waitlistSubmittedEmail`) is
kept purely so a returning visitor who already joined sees the confirmation
again instead of an empty form — it is not the record of who signed up
anymore; the Google Sheet is.

## 3. The map (primary view)

The map is a read-only view of the same dataset the tester runs on. It does no
matching, scores no thesis, and computes no hit rates — the numbers on it are
plain totals. Its job is to let you look around with zero commitment until you
notice something worth testing.

**Browsing.** Companies are grouped by industry. Each card shows the name,
industry, stage, city, a count of open roles, and a tag for every function that
company hires for (derived from its roles).

**Filters.** Two chip rows, industry and function. They apply live, with no
submit button. Each row is counted against the *other* filter, which is what
makes gaps visible: select **Robotics** and the function row immediately reads
BizOps 8, Engineering 1, Marketing 1, Product 1, and zero for everything else.
That is the map earning its place — robotics in this market hires operators, not
marketers, and you can see it before forming any thesis.

**Testing inline.** Every function tag is also a *test this* control. Click one
and a panel expands in place, directly below that company, pre-loaded with that
company's function, industry, and city. Inside the panel you get the full
diagnostic: market hit rate, the relax-one-dimension bars, the branch prompt,
fit screening role by role, and next steps with *Log this job*. Nothing
navigates. The filters and every other company stay visible and clickable while
a panel is open.

Rules the panel follows:

- **One at a time.** Opening a panel closes whichever one was open.
- **Collapse, don't lose.** *Collapse ×* (or clicking the highlighted tag again)
  returns the card to its plain state. Reopening that same company and function
  restores everything you had screened.
- **Relaxing stays inline.** *Try this* and *Re-run without "…"* inside a panel
  re-run the diagnostic in the panel. You never leave the map.
- **Filtered out, not lost.** If your filters hide the company whose panel is
  open, the panel goes with it and a blue notice tells you so. Clear the filters
  and it comes back, screening intact.

**The standalone tester.** *Start from scratch* (top right of the map) opens the
old form-driven tester for building a thesis from nothing — free-text fields,
the stage dropdown, and the six scenario shortcuts. It behaves exactly as it
always did, including resetting screening on each new search. It is no longer a
primary nav item. *← Back to the map* returns you.

**The tracker** is reachable from every view via the header button, and nothing
— navigating, filtering, searching, collapsing a panel — ever clears it.

---

## 4. Walkthrough: map to tracker

The primary flow, start to finish. Do not reload the page partway through.
Start at the product URL, `.../project-athena/#/internal`, not the public
landing page.

**Part A — browse, and notice a gap**

1. Open `.../project-athena/#/internal`. You land on the map: 40 companies,
   81 open roles, grouped by industry.
2. Click the **Robotics** industry chip. The map narrows to 9 companies / 19
   open roles.
3. Look at the function row now. **BizOps 8**, Engineering 1, Marketing 1,
   Product 1, everything else 0. Robotics companies in this market hire
   operators almost exclusively. If you were planning a marketing move into
   robotics, you have just learned something without typing a thesis.
4. Click **Marketing** in the function row. One company survives — Basalt
   Machines in Denver. That is the whole robotics marketing market.

**Part B — test a thesis inline**

5. Clear both filters (click the highlighted chips, or **All** on each row), then
   click the **Biotech** industry chip.
6. Find **Helix Bio** (Boston) and click its **Product** tag. A panel expands
   directly beneath the card, headed *Testing Product · Biotech · Boston —
   started from Helix Bio*. The rest of the map is still there.
7. The panel's market hit rate reads **2 companies**. The relaxation bars show
   dropping function → 3, dropping industry → 3, dropping geography → **6**.
   Geography is the binding constraint.
8. Click **Re-run without "Boston"** inside the panel. It re-runs in place — the
   heading becomes *Product · Biotech · anywhere* and the market hit rate goes to
   **6 companies / 6 roles**. You have not left the map.

**Part C — screen for fit, still inline**

9. Scroll within the results in the panel and click each role to read its
   description. Five are unambiguous product management jobs. Pinewood Bio's
   *Product Manager, Clinical Ops Tools* is project management wearing a product
   title — mark that one a **Miss** and the other five **Hit**.
10. The fit hit rate updates live to **83%**, and the prompt changes to *"Strong
    fit — this thesis holds up."* A **Next steps** section appears inside the
    panel with a mocked warm path for each hit.
11. Click **Log this job** on *Product Manager, Platform · Helix Bio*. The button
    becomes **Logged** and the header count becomes **Tracker (1)**.

**Part D — collapse and keep browsing**

12. Click **Collapse ×**. The Helix Bio card returns to its plain state and the
    map is intact.
13. Click a different company's tag — say **Calyx Therapeutics · Product**. A new
    panel opens and the old one is gone; only one is ever open.
14. Now click **Helix Bio · Product** again. The panel returns with your 83% and
    all six roles still screened. Collapsing is not discarding.
15. Open **Tracker (1)** from the header. Your job is listed with company, role,
    a status dropdown, and the date. Set it to *warm intro sought*, then click
    *← Back to the map* — everything is where you left it.

---

## 5. Test scenarios

These six exercise the diagnostic's edge cases. Enter them in the **standalone
tester** (*Start from scratch* on the map), since they need field combinations
the map's one-click handoff does not produce. Every one is reachable by typing;
the **Load a test scenario** chips under the form fill the same fields and submit
through the same code path.

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

## 6. Walkthrough: the standalone tester

The secondary flow, for a user who starts from a thesis rather than from a
company. Open it with *Start from scratch* on the map. One continuous session,
starting from a thesis that does not exist. Do not reload the page partway
through.

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
15. Click *← Back to the map*, then **Tracker** again. Your entry is still
    there — navigating between the map, the tester, and the tracker never
    clears it.

---

## 7. QA checklist

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
- [ ] **11. The map handoff pre-fills all three dimensions, and matches typing
      them.** Click any function tag on the map. *Verified: the panel loads that
      company's function, industry, and city — e.g. Helix Bio's Product tag gives
      Product · Biotech · Boston. Typing those same three fields into the
      standalone tester produces an identical result: 2 companies, the same
      relaxation bars (3 / 3 / 6), and the same branch prompt. The handoff is
      the same code path, not a parallel one.*
- [ ] **12. Panels behave: one at a time, non-blocking, and state survives
      collapse.** *Verified: (a) opening a second panel closes the first — only
      one `map-panel` is ever in the DOM; (b) the filters and every other company
      stay interactive while a panel is open, and filtering mid-panel works, with
      a notice shown if the filters hide the open panel's company; (c) screening
      a role, switching to another company's panel, then reopening the first
      restores the screened roles and fit rate exactly.*
- [ ] **13. The tracker survives everything.** *Verified: a job logged from
      inside a map panel appears in the tracker, and navigating between map,
      tester, and tracker, or collapsing the panel it was logged from, leaves it
      intact.*
- [ ] **14. The public root shows only the landing page — never the product.**
      Load the bare URL fresh (no hash, private/incognito window). *Verified:
      the landing page renders, and nothing in its DOM — no link, no button —
      references `#/internal`. Inspect the page source if you want to confirm
      by hand rather than trust this.*
- [ ] **15. The hidden route works, both by direct load and by navigating to
      it.** Load `.../#/internal` fresh, and separately, load the bare URL then
      manually edit the hash in the address bar. *Verified: both paths land on
      the product; editing the hash back to empty returns to the landing page
      without a full reload, and the tab title changes between "Project
      Athena" and "Project Athena — Internal" accordingly.*
- [ ] **16. The waitlist form validates, submits, and does not silently
      fail.** Submit with an invalid email, then a valid one. *Verified: an
      invalid address shows an inline error and never fires a request
      (checked via `performance.getEntriesByType('resource')`, not just the
      UI); a valid one shows a confirmation message and a real POST to
      `docs.google.com/.../formResponse` is dispatched — confirmed the same
      way, with a non-zero round-trip duration. A dropped connection (e.g.
      offline) shows a distinct error instead of falsely claiming success.*

---

## 8. Known limitations and stubs

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
- **Nothing persists, with one exception.** All state, including the tracker,
  is in React memory and clears on refresh. The tracker survives running new
  theses — that is the requirement — but not a refresh. The one exception is
  the first-visit career survey (see below): whether it was completed or
  skipped is written to `localStorage` so it does not reappear on every
  reload. Survey *answers* are also cached there so "Edit my answers" has
  something to prefill, but no other state is persisted anywhere.

**Design decisions worth probing in user testing**

- **Logging a job is gated behind a high fit hit rate.** *Log this job* lives
  only in the next steps section, which unlocks at 60% fit or above — in the map
  panel and the standalone tester alike. A user who finds one great role inside
  an otherwise poor thesis currently cannot log it. This follows the spec, but it
  is worth watching whether testers try to log from the results list.

- **A map panel always starts with all three dimensions set**, including the
  city, so most handoffs open on a low market hit rate and immediately suggest
  relaxing geography. That is arguably the diagnostic working as intended — it
  shows the user their implicit "this company's city" assumption — but testers
  may read the first number as discouraging. Worth watching.

- **Screening is scoped per panel.** Marking a role a hit under one company's
  panel does not mark it under another panel that happens to return the same
  role. Each panel is its own question. The standalone tester is separate again,
  and still resets on every new search.
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

**The career survey (For You)**

- Shown once, on first visit, before the map — "Skip for now" is always
  available and remembered, same as completing it. Revisit or redo it anytime
  from the "For You" nav button.
- Every survey option (the four industries, the nine functions) is drawn from
  the same vocabulary the rest of the app already filters on, so a completed
  survey can never point at an industry or function with zero roles in the
  dataset. The *combination* the user picks can still be empty — that is
  handled with an honest message, not a fake match.
- **Skill and certification guidance is illustrative, not a per-listing
  match.** No role has real skill or certification fields. `src/data/
  careerGuidance.js` hand-authors typical skills per function, per degree
  background, per experience type, and per past role, and `skillProfile()`
  in `src/lib/recommend.js` unions all of them plus whatever the user typed
  into the free-text skills box — the same authored-answer-key spirit as
  `screenerVerdict`, not a claim about any specific job posting's actual
  requirements.
- **Degree background, work experience, past roles, and past industries are
  all checkbox lists, not single-select** — a person can hold more than one
  degree or have done both an internship and part-time work. "Other" next to
  degree background opens a free-text field; that text is stored and shown
  back to the user, but (honestly) contributes no inferred skills, since
  there's no reliable way to map arbitrary free text to the skill vocabulary.
- **The free-text skills box matches against a small hand-authored synonym
  list** (`SKILL_KEYWORD_SYNONYMS` in `careerGuidance.js`), so typing
  "Python" or "Excel" credits the right canonical skill tag even though
  those words don't literally appear in it. Anything typed that isn't in the
  synonym list, or doesn't loosely match a tag's own words, is still saved
  and shown back to the user — it just doesn't move any skill from "worth
  developing" to "already have."
- **Seniority ("Entry level" / "Mid-level" / "Manager / senior") is a title
  keyword heuristic**, not a stored field — see `inferLevel()` in
  `src/lib/recommend.js`. A role like "Product Manager" buckets into
  "Manager / senior" by the word "Manager" even though PM is often an
  individual-contributor title in practice. Worth watching whether testers
  find that mislabeling.
- **Age range is collected but never used to filter or recommend anything.**
  It is on the survey because it was asked for; there is no legitimate basis
  in this dataset to make age drive a career recommendation, so it does not.

**The landing page**

- **`#/internal` is unlisted, not secured.** No login, no token, no
  server-side check — anyone with the URL, or anyone who reads the shipped JS
  bundle (this is a public repo and a public static site), can reach the full
  product. If real access control ever matters, this needs actual auth and a
  non-static backend; that is a materially bigger change than this prototype.
- **The waitlist submits to a real Google Form/Sheet, but success can't be
  verified client-side.** Google's response endpoint gives no CORS headers,
  so the request is fired in `no-cors` mode: a network failure (offline) is
  caught and shown as an error, but a request that leaves the browser
  successfully always shows the confirmation, whether or not Google actually
  accepted it. Check the linked Sheet directly if you need certainty that a
  specific submission landed. There is also no dedup — resubmitting the same
  email creates another row.
- **The four "How it works" previews are hand-built reproductions, not
  screenshots**, and will silently drift from the real screens if those are
  redesigned without a matching update to `PreviewMockups.jsx`.
- **Headline variants are not tracked.** `?headline=N` changes what a visitor
  sees but nothing records which variant they got or what they did next — you
  would need to add real analytics to learn anything from handing out
  different links.

**Small things noticed and left alone**

- The tracker table wraps company and role names onto several lines in narrow
  windows. Wireframe-acceptable.
- Geography matches city names only. There is no notion of regions, metro areas,
  or remote work, so "Bay Area" returns nothing while "San Francisco" works.
