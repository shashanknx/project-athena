import { useMemo } from 'react'
import MarketDiagnostic from './MarketDiagnostic.jsx'
import BranchPrompt from './BranchPrompt.jsx'
import FitPanel from './FitPanel.jsx'
import NextSteps from './NextSteps.jsx'
import ResultsList from './ResultsList.jsx'
import {
  branchFor,
  fitStats,
  isExploration,
  marketDiagnostic,
  matchCompanies,
} from '../lib/search.js'

/**
 * Everything that happens to a thesis once it is submitted: market hit rate,
 * the relax-one-dimension diagnostic, the branch prompt, fit screening, and
 * next steps.
 *
 * Rendered in two places — the standalone tester screen and, inline, inside a
 * map panel — so all of the logic lives here rather than in either caller. The
 * callers own the thesis and the screening state; this component derives
 * everything else from them.
 */
export default function ThesisAnalysis({
  thesis,
  verdicts,
  expandedRoles,
  onSetVerdict,
  onToggleRole,
  onClearScreening,
  onRelax,
  isLogged,
  onLog,
  dense = false,
}) {
  const analysis = useMemo(() => {
    const companies = matchCompanies(thesis)
    return {
      companies,
      diagnostic: marketDiagnostic(thesis),
      exploration: isExploration(thesis),
      roleIds: companies.flatMap((c) => c.matchingRoles.map((r) => r.id)),
    }
  }, [thesis])

  const fit = useMemo(
    () => fitStats(verdicts, analysis.roleIds),
    [verdicts, analysis.roleIds],
  )

  const branch = branchFor({ diagnostic: analysis.diagnostic, fit })

  const hitRoles = useMemo(
    () =>
      analysis.companies.flatMap((company) =>
        company.matchingRoles
          .filter((role) => verdicts[role.id] === 'hit')
          .map((role) => ({ ...role, company })),
      ),
    [analysis.companies, verdicts],
  )

  return (
    <div className={dense ? 'space-y-4' : 'space-y-6'}>
      <MarketDiagnostic
        thesis={thesis}
        diagnostic={analysis.diagnostic}
        exploration={analysis.exploration}
        results={analysis.companies}
        onRelax={onRelax}
      />

      <BranchPrompt
        branch={branch}
        diagnostic={analysis.diagnostic}
        fit={fit}
        onRelax={onRelax}
      />

      {analysis.companies.length > 0 ? (
        <FitPanel fit={fit} onClearScreening={onClearScreening} />
      ) : null}

      {branch === 'next-steps' ? (
        <NextSteps hitRoles={hitRoles} isLogged={isLogged} onLog={onLog} />
      ) : null}

      <ResultsList
        companies={analysis.companies}
        verdicts={verdicts}
        expanded={expandedRoles}
        onToggleExpand={onToggleRole}
        onSetVerdict={onSetVerdict}
      />
    </div>
  )
}
