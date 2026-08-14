import { useMemo, useState } from 'react'
import ThesisForm from './components/ThesisForm.jsx'
import MarketDiagnostic from './components/MarketDiagnostic.jsx'
import FitPanel from './components/FitPanel.jsx'
import ResultsList from './components/ResultsList.jsx'
import BranchPrompt from './components/BranchPrompt.jsx'
import NextSteps from './components/NextSteps.jsx'
import Tracker from './components/Tracker.jsx'
import { STATUSES } from './lib/tracker.js'
import {
  EMPTY_THESIS,
  branchFor,
  fitStats,
  isEmptyThesis,
  isExploration,
  marketDiagnostic,
  matchCompanies,
} from './lib/search.js'

export default function App() {
  // Draft thesis in the form, and the thesis the results on screen belong to.
  const [draft, setDraft] = useState(EMPTY_THESIS)
  const [submitted, setSubmitted] = useState(null)
  const [formError, setFormError] = useState('')

  // Screening state. Reset on every new search — a fit rate only ever
  // describes the result set currently on screen.
  const [verdicts, setVerdicts] = useState({})
  const [expanded, setExpanded] = useState({})

  // Tracker state deliberately lives above the search, so running a new
  // thesis never wipes it.
  const [tracker, setTracker] = useState([])
  const [view, setView] = useState('search')

  function runSearch(thesis) {
    setDraft(thesis)
    if (isEmptyThesis(thesis)) {
      setFormError('Fill in at least one dimension — function, industry, geography, or stage — before testing a thesis.')
      setSubmitted(null)
      return
    }
    setFormError('')
    setSubmitted(thesis)
    setVerdicts({})
    setExpanded({})
    setView('search')
    // A relax action can be triggered from far down the page; land the user
    // back on the new numbers rather than mid-list.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const analysis = useMemo(() => {
    if (!submitted) return null
    const companies = matchCompanies(submitted)
    return {
      companies,
      diagnostic: marketDiagnostic(submitted),
      exploration: isExploration(submitted),
      roleIds: companies.flatMap((c) => c.matchingRoles.map((r) => r.id)),
    }
  }, [submitted])

  const fit = useMemo(
    () => fitStats(verdicts, analysis?.roleIds ?? []),
    [verdicts, analysis],
  )

  const branch = analysis ? branchFor({ diagnostic: analysis.diagnostic, fit }) : null

  const hitRoles = useMemo(() => {
    if (!analysis) return []
    return analysis.companies.flatMap((company) =>
      company.matchingRoles
        .filter((role) => verdicts[role.id] === 'hit')
        .map((role) => ({ ...role, company })),
    )
  }, [analysis, verdicts])

  function setVerdict(roleId, verdict) {
    setVerdicts((prev) => {
      const next = { ...prev }
      if (verdict === null) delete next[roleId]
      else next[roleId] = verdict
      return next
    })
  }

  function toggleExpand(roleId) {
    setExpanded((prev) => ({ ...prev, [roleId]: !prev[roleId] }))
  }

  function logJob(role) {
    setTracker((prev) => {
      if (prev.some((e) => e.roleId === role.id)) return prev
      return [
        ...prev,
        {
          id: `${role.id}-${prev.length}`,
          roleId: role.id,
          company: role.company.name,
          role: role.title,
          status: STATUSES[0],
          dateAdded: new Date().toLocaleDateString('en-CA'),
        },
      ]
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Thesis Tester</h1>
            <p className="text-sm text-slate-500">
              Does the job you are looking for exist? Wireframe prototype — all data is mock.
            </p>
          </div>
          <nav className="flex gap-1 rounded border border-slate-200 p-0.5">
            {[
              ['search', 'Test a thesis'],
              ['tracker', `Tracker (${tracker.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  view === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        {view === 'tracker' ? (
          <Tracker
            entries={tracker}
            onStatusChange={(id, status) =>
              setTracker((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
            }
            onRemove={(id) => setTracker((prev) => prev.filter((e) => e.id !== id))}
          />
        ) : (
          <>
            <ThesisForm
              thesis={draft}
              onChange={setDraft}
              onSubmit={runSearch}
              onClear={() => {
                setDraft(EMPTY_THESIS)
                setFormError('')
              }}
              error={formError}
            />

            {analysis ? (
              <>
                <MarketDiagnostic
                  thesis={submitted}
                  diagnostic={analysis.diagnostic}
                  exploration={analysis.exploration}
                  results={analysis.companies}
                  onRelax={runSearch}
                />

                <BranchPrompt
                  branch={branch}
                  diagnostic={analysis.diagnostic}
                  fit={fit}
                  onRelax={runSearch}
                />

                {analysis.companies.length > 0 ? (
                  <FitPanel fit={fit} onClearScreening={() => setVerdicts({})} />
                ) : null}

                {branch === 'next-steps' ? (
                  <NextSteps
                    hitRoles={hitRoles}
                    isLogged={(roleId) => tracker.some((e) => e.roleId === roleId)}
                    onLog={logJob}
                  />
                ) : null}

                <ResultsList
                  companies={analysis.companies}
                  verdicts={verdicts}
                  expanded={expanded}
                  onToggleExpand={toggleExpand}
                  onSetVerdict={setVerdict}
                />
              </>
            ) : (
              <section className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">No thesis tested yet.</p>
                <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                  Describe the role and company you think you are targeting above, or load one of
                  the test scenarios. You will get two separate numbers back: whether the market
                  exists, and whether the jobs in it are any good.
                </p>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-slate-400">
        Prototype for user testing. Job data is generated, warm paths are stubbed, and there is no
        account, persistence, or payment layer. See instructions.md.
      </footer>
    </div>
  )
}
