import { THRESHOLDS } from '../lib/search.js'

/**
 * Exactly one prompt renders, driven by the single `branch` value computed in
 * lib/search.js. There is no path on which two prompts appear at once.
 */
/** "No companies" / "1 company" / "4 companies" — reads better than "Only 0". */
function count(n) {
  if (n === 0) return 'No companies'
  return `${n} ${n === 1 ? 'company' : 'companies'}`
}

export default function BranchPrompt({ branch, diagnostic, fit, onRelax }) {
  const binding = diagnostic.binding

  const shell = (tone, title, body, action) => {
    const tones = {
      blue: 'border-blue-300 bg-blue-50 text-blue-950',
      amber: 'border-amber-300 bg-amber-50 text-amber-950',
      slate: 'border-slate-300 bg-slate-100 text-slate-800',
      emerald: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    }
    return (
      <section
        data-testid="branch-prompt"
        data-branch={branch}
        className={`rounded-lg border px-5 py-4 ${tones[tone]}`}
      >
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-3xl text-sm">{body}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </section>
    )
  }

  if (branch === 'empty-market') {
    return shell(
      'slate',
      'This thesis is off the map — and no single relaxation rescues it.',
      'Every one-dimension relaxation still returns almost nothing, so there is no binding constraint to point at. Two or more parts of this thesis are unrealistic at the same time. Drop back to a single dimension and explore what exists before narrowing again.',
    )
  }

  if (branch === 'relax') {
    return shell(
      'blue',
      binding
        ? `Low market hit rate — ${binding.label.toLowerCase()} is what is blocking you.`
        : 'Low market hit rate.',
      binding
        ? `${count(diagnostic.full.companies)} match all of your constraints. Relaxing ${binding.label.toLowerCase()} alone — dropping "${binding.droppedValue}" — gets you to ${binding.companies}. That single change buys you more than any other.${
            diagnostic.full.companies === 0
              ? ' There is no fit hit rate to look at yet: screen roles once there are some to read.'
              : ''
          }`
        : `${count(diagnostic.full.companies)} match, and relaxing any single dimension does not change that. Try loosening two dimensions at once.`,
      binding ? (
        <button
          type="button"
          onClick={() => onRelax(binding.thesis)}
          className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          Re-run without &ldquo;{binding.droppedValue}&rdquo;
        </button>
      ) : null,
    )
  }

  if (branch === 'screen-more') {
    return shell(
      'slate',
      'The market is there. Now find out whether the jobs are any good.',
      `${diagnostic.full.companies} companies are hiring against this thesis. Open the postings below and mark each one a hit or a miss — ${THRESHOLDS.minScreened} is enough to get a first read on fit. A healthy market hit rate tells you nothing about whether these roles are actually what you want.`,
    )
  }

  if (branch === 'reconsider-function') {
    return shell(
      'amber',
      'Decent market, poor fit — the problem is your title, not your map.',
      `You have marked only ${fit.hits} of ${fit.screened} screened roles as a hit (${Math.round(
        fit.rate * 100,
      )}%). The market for this thesis clearly exists, so geography and industry are not what is hurting you. The function or title is doing the damage: these postings carry the title you searched for but the work underneath is something else. Tighten what you search on — a narrower title, or a different one entirely for the same underlying work.`,
    )
  }

  if (branch === 'keep-screening') {
    return shell(
      'slate',
      'Mixed signal so far.',
      `${Math.round(fit.rate * 100)}% of the ${
        fit.screened
      } roles you have screened are hits — between the ${Math.round(
        THRESHOLDS.lowFitRate * 100,
      )}% and ${Math.round(
        THRESHOLDS.highFitRate * 100,
      )}% marks, which is not enough to call it either way. Screen a few more roles${
        fit.unscreened > 0 ? ` (${fit.unscreened} left)` : ''
      } before drawing a conclusion.`,
    )
  }

  return shell(
    'emerald',
    'Strong fit — this thesis holds up.',
    `${Math.round(fit.rate * 100)}% of the ${
      fit.screened
    } roles you screened are hits, against a real market of ${
      diagnostic.full.companies
    } companies. Both numbers are healthy, so this is worth acting on. Next steps are unlocked below.`,
  )
}
