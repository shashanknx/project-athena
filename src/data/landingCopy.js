/*
 * Landing page copy, kept separate from the components that render it so
 * headline variants can be swapped or tested without touching JSX.
 *
 * HEADLINES is a small set of positioning options to test with real
 * visitors. The live headline is picked by index from the `?headline=`
 * query param (e.g. .../project-athena/?headline=2), defaulting to 0 — see
 * LandingPage.jsx. This is not a real experimentation platform: nothing is
 * tracked or logged, it just lets you hand out different links.
 */

export const HEADLINES = [
  {
    headline: 'Your personalized map of the job market',
    subhead:
      'Test whether the job you want actually exists — before you spend months chasing it.',
  },
  {
    headline: 'Stop guessing. Start testing your career thesis.',
    subhead:
      'Project Athena tells you if your dream role exists in the market, and exactly what is making it hard to find.',
  },
  {
    headline: 'Know before you leap.',
    subhead:
      'See the real job market for the role you want, then screen it for fit — not just headcount.',
  },
  {
    headline: 'Your career, workshopped.',
    subhead: 'Define a thesis. See what is real. Find the roles worth pursuing.',
  },
  {
    headline: 'Know your next move.',
    subhead:
      'Get personalized job and career recommendations based on your skills, experience, and goals.',
  },
]

export const VALUE_PROPS = [
  {
    title: 'Search less.',
    body: 'Find the right opportunities faster.',
  },
  {
    title: 'Discover what others miss.',
    body: 'Uncover hidden-gem roles beyond the obvious companies.',
  },
  {
    title: 'See the market clearly.',
    body: 'Understand where the opportunities are — and where you fit.',
  },
]

export const HOW_IT_WORKS = [
  {
    id: 'survey',
    title: 'Tell us about you',
    body: 'A short survey on your background and target level points you at the companies and roles most relevant to you before you look at anything else.',
  },
  {
    id: 'map',
    title: 'Browse the market',
    body: 'Every company in the dataset, filterable by industry and function with no thesis required. Gaps in the market are visible before you commit to anything.',
  },
  {
    id: 'listings',
    title: 'Screen real postings',
    body: 'Open any role, read the actual description, and mark it a hit or a miss. Fit is tracked separately from market size, live as you screen.',
  },
  {
    id: 'tracker',
    title: 'Track what is worth pursuing',
    body: 'Log promising roles to a simple tracker — company, role, and status — so nothing you have already screened gets lost.',
  },
]
