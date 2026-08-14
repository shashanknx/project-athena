import { useState } from 'react'
import MapView from './components/MapView.jsx'
import ThesisForm from './components/ThesisForm.jsx'
import ThesisAnalysis from './components/ThesisAnalysis.jsx'
import Tracker from './components/Tracker.jsx'
import { EMPTY_THESIS, isEmptyThesis } from './lib/search.js'
import { STATUSES } from './lib/tracker.js'

/**
 * Three views. The map is primary and the landing view; the standalone tester
 * is secondary, reached from "Start from scratch"; the tracker is reachable
 * from all of them.
 *
 * Screening state is kept per map panel (keyed by company + function) rather
 * than reset on collapse, so a user can close a panel, browse on, and come
 * back to the roles they already screened. The standalone tester keeps the
 * older behaviour — a new search there is a fresh question, so it resets.
 */
export default function App() {
  const [view, setView] = useState('map')

  // Tracker sits above everything: no navigation or search clears it.
  const [tracker, setTracker] = useState([])

  // --- map state ------------------------------------------------------------
  const [filters, setFilters] = useState({ industry: '', func: '' })
  // The open panel, or null. Only one is ever open.
  const [panel, setPanel] = useState(null)
  // Screening state per panel key, retained after a panel is collapsed.
  const [panelState, setPanelState] = useState({})
  // The working thesis per panel key, so relaxing a dimension survives a
  // collapse — reopening should not silently undo the user's last move.
  const [panelTheses, setPanelTheses] = useState({})

  // --- standalone tester state ---------------------------------------------
  const [draft, setDraft] = useState(EMPTY_THESIS)
  const [submitted, setSubmitted] = useState(null)
  const [formError, setFormError] = useState('')
  const [testerVerdicts, setTesterVerdicts] = useState({})
  const [testerExpanded, setTesterExpanded] = useState({})

  // Keyed on the function the user *opened* the panel with, not the thesis's
  // current function — relaxing the function dimension must not move the panel
  // to a different state bucket and orphan what they already screened.
  const panelKey = panel ? `${panel.companyId}:${panel.fn}` : null
  const currentPanelState = panelState[panelKey] ?? { verdicts: {}, expandedRoles: {} }

  /**
   * Takes an updater rather than a patch: several verdicts can land in one
   * React batch (a fast double-click, or a test driving the DOM), and reading
   * the state captured in this render's closure would let each write clobber
   * the last.
   */
  function updatePanelState(updater) {
    if (!panelKey) return
    setPanelState((prev) => {
      const current = prev[panelKey] ?? { verdicts: {}, expandedRoles: {} }
      return { ...prev, [panelKey]: { ...current, ...updater(current) } }
    })
  }

  function openPanel(company, fn) {
    const key = `${company.id}:${fn}`
    // Opening a panel replaces whatever was open — never two at once. A panel
    // reopened after a collapse resumes from where it was left.
    setPanel({
      companyId: company.id,
      fn,
      thesis: panelTheses[key] ?? {
        ...EMPTY_THESIS,
        function: fn,
        industry: company.industry,
        geography: company.city,
      },
    })
  }

  /** Relaxing inside a panel re-runs in place; the map never navigates away. */
  function relaxPanel(nextThesis) {
    setPanel((prev) => (prev ? { ...prev, thesis: nextThesis } : prev))
    if (panelKey) setPanelTheses((prev) => ({ ...prev, [panelKey]: nextThesis }))
  }

  function setPanelVerdict(roleId, verdict) {
    updatePanelState((current) => {
      const verdicts = { ...current.verdicts }
      if (verdict === null) delete verdicts[roleId]
      else verdicts[roleId] = verdict
      return { verdicts }
    })
  }

  function togglePanelRole(roleId) {
    updatePanelState((current) => ({
      expandedRoles: { ...current.expandedRoles, [roleId]: !current.expandedRoles[roleId] },
    }))
  }

  function runSearch(thesis) {
    setDraft(thesis)
    if (isEmptyThesis(thesis)) {
      setFormError(
        'Fill in at least one dimension — function, industry, geography, or stage — before testing a thesis.',
      )
      setSubmitted(null)
      return
    }
    setFormError('')
    setSubmitted(thesis)
    setTesterVerdicts({})
    setTesterExpanded({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setTesterVerdict(roleId, verdict) {
    setTesterVerdicts((prev) => {
      const next = { ...prev }
      if (verdict === null) delete next[roleId]
      else next[roleId] = verdict
      return next
    })
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

  const isLogged = (roleId) => tracker.some((e) => e.roleId === roleId)

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-baseline gap-3">
            <button
              type="button"
              onClick={() => setView('map')}
              className="text-lg font-semibold text-slate-900"
            >
              Thesis Tester
            </button>
            {view !== 'map' ? (
              <button
                type="button"
                onClick={() => setView('map')}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                ← Back to the map
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                Does the job you are looking for exist? All data is mock.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setView('tracker')}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              view === 'tracker'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tracker ({tracker.length})
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        {view === 'map' ? (
          <MapView
            filters={filters}
            onFilterChange={setFilters}
            panel={panel}
            onTest={openPanel}
            onClosePanel={() => setPanel(null)}
            onRelaxPanel={relaxPanel}
            panelState={currentPanelState}
            onSetVerdict={setPanelVerdict}
            onToggleRole={togglePanelRole}
            onClearScreening={() => updatePanelState(() => ({ verdicts: {} }))}
            isLogged={isLogged}
            onLog={logJob}
            onOpenTester={() => setView('tester')}
          />
        ) : null}

        {view === 'tester' ? (
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

            {submitted ? (
              <ThesisAnalysis
                thesis={submitted}
                verdicts={testerVerdicts}
                expandedRoles={testerExpanded}
                onSetVerdict={setTesterVerdict}
                onToggleRole={(roleId) =>
                  setTesterExpanded((prev) => ({ ...prev, [roleId]: !prev[roleId] }))
                }
                onClearScreening={() => setTesterVerdicts({})}
                onRelax={runSearch}
                isLogged={isLogged}
                onLog={logJob}
              />
            ) : (
              <section className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">No thesis tested yet.</p>
                <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                  Build a thesis from nothing here, or go back to the map and start from a company
                  you already find interesting. You will get two separate numbers back: whether the
                  market exists, and whether the jobs in it are any good.
                </p>
              </section>
            )}
          </>
        ) : null}

        {view === 'tracker' ? (
          <Tracker
            entries={tracker}
            onStatusChange={(id, status) =>
              setTracker((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
            }
            onRemove={(id) => setTracker((prev) => prev.filter((e) => e.id !== id))}
          />
        ) : null}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-xs text-slate-400">
        Prototype for user testing. Job data is generated, warm paths are stubbed, and there is no
        account, persistence, or payment layer. See instructions.md.
      </footer>
    </div>
  )
}
