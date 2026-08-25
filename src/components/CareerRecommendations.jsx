import { useMemo } from 'react'
import { groupRecommendationsByIndustry, recommendCompanies, skillProfile } from '../lib/recommend.js'
import { INDUSTRY_FLAVOR } from '../data/careerGuidance.js'

/*
 * Renders what the survey promised: companies/roles that fit, which typical
 * skills the user's background already covers, and certification notes.
 * Read-only over the same recommendCompanies() output the summary line uses,
 * so the count in the sentence and the cards below it can never disagree.
 */

function LevelBadge({ level, isTarget }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
        isTarget ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {level}
    </span>
  )
}

function SkillBlock({ func, answers }) {
  const { matched, toDevelop, certification } = skillProfile(answers, func)
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-900">{func}</h4>

      {matched.length ? (
        <div className="mt-2">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">You likely already have</p>
          <ul className="mt-1 space-y-0.5">
            {matched.map((skill) => (
              <li key={skill} className="text-sm text-emerald-800">
                <span className="mr-1.5 text-emerald-600">✓</span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {toDevelop.length ? (
        <div className="mt-2">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Worth developing</p>
          <ul className="mt-1 space-y-0.5">
            {toDevelop.map((skill) => (
              <li key={skill} className="text-sm text-slate-600">
                <span className="mr-1.5 text-slate-400">○</span>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {certification ? <p className="mt-3 text-xs text-slate-500">{certification}</p> : null}
    </div>
  )
}

export default function CareerRecommendations({ answers, onEdit }) {
  const recommended = useMemo(
    () => recommendCompanies({ industries: answers.industries, functions: answers.functions }),
    [answers.industries, answers.functions],
  )
  const groups = useMemo(() => groupRecommendationsByIndustry(recommended), [recommended])

  const totalRoles = recommended.reduce((sum, c) => sum + c.matchingRoles.length, 0)

  const representedFunctions = useMemo(() => {
    const present = new Set()
    recommended.forEach((c) => c.matchingRoles.forEach((r) => present.add(r.function)))
    return answers.functions.filter((f) => present.has(f))
  }, [recommended, answers.functions])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Your recommendations</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Based on {answers.industries.join(', ')} · {answers.functions.join(', ')} ·{' '}
              {answers.level.toLowerCase()}.
            </p>
            {answers.pastIndustries.length ? (
              <p className="mt-1 max-w-2xl text-xs text-slate-400">
                Also noted: previous experience in {answers.pastIndustries.join(', ')}.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
          >
            Edit my answers
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-700">
          {recommended.length === 0
            ? `No companies in the dataset match that exact combination of industry and role. Try widening your selection — go back and add another industry or function.`
            : `${recommended.length} ${recommended.length === 1 ? 'company matches' : 'companies match'}, with ${totalRoles} open ${totalRoles === 1 ? 'role' : 'roles'} across your selected functions. Roles tagged "${answers.level}" line up with the level you're targeting; others are shown too since the dataset is small.`}
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.industry} className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            {group.industry}{' '}
            <span className="font-normal text-slate-500">
              ({group.companies.length} {group.companies.length === 1 ? 'company' : 'companies'})
            </span>
          </h3>
          <p className="mt-1 text-xs text-slate-500">{INDUSTRY_FLAVOR[group.industry]}</p>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {group.companies.map((company) => (
              <article key={company.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900">{company.name}</h4>
                  <span className="shrink-0 text-xs text-slate-500">{company.stage} · {company.city}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {company.matchingRoles.map((role) => (
                    <li key={role.id} className="flex items-center justify-between gap-2 text-sm text-slate-700">
                      <span>
                        {role.title} <span className="text-slate-400">· {role.function}</span>
                      </span>
                      <LevelBadge level={role.level} isTarget={role.level === answers.level} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ))}

      {representedFunctions.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Skills & certifications</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Typical guidance per role type, not a per-listing requirements match — see instructions.md
            for how this is derived.
          </p>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">
            Drawing on: {[...answers.degrees.filter((d) => d !== 'Other'), answers.degreeOther].filter(Boolean).join(', ') || 'no degree background'}
            {answers.experienceTypes.length ? ` · ${answers.experienceTypes.join(', ')}` : ''}
            {answers.pastRoles.length ? ` · past roles in ${answers.pastRoles.join(', ')}` : ''}
            {answers.skillKeywords.length ? ` · keywords: ${answers.skillKeywords.join(', ')}` : ''}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {representedFunctions.map((func) => (
              <SkillBlock key={func} func={func} answers={answers} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
