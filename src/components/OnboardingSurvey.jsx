import { useState } from 'react'
import { INDUSTRIES, FUNCTIONS } from '../data/mockCompanies.js'
import { AGE_RANGES, DEGREE_BACKGROUNDS, EXPERIENCE_TYPES, TARGET_LEVELS } from '../data/careerGuidance.js'

/*
 * First-visit survey: who the user is, and what they're looking for. Feeds
 * CareerRecommendations. Every option here maps to something real in the
 * dataset (see careerGuidance.js's header comment) so a completed survey
 * never points at zero results by construction — an empty *combination* is
 * still possible and handled honestly in CareerRecommendations.
 */

export const EMPTY_SURVEY = {
  age: '',
  degrees: [],
  degreeOther: '',
  experienceTypes: [],
  pastRoles: [],
  pastIndustries: [],
  skillKeywords: [],
  industries: [],
  functions: [],
  level: '',
}

function Select({ id, label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select one</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function ToggleChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function MultiSelectRow({ label, hint, options, selected, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {hint ? <p className="-mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <ToggleChip key={o} active={selected.includes(o)} onClick={() => onToggle(o)}>
            {o}
          </ToggleChip>
        ))}
      </div>
    </div>
  )
}

const OTHER = 'Other'

function DegreeRow({ selected, other, onToggle, onOtherChange }) {
  const otherActive = selected.includes(OTHER)
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">Degree background</span>
      <p className="-mt-1 text-xs text-slate-500">Pick as many as apply.</p>
      <div className="flex flex-wrap gap-1.5">
        {DEGREE_BACKGROUNDS.map((o) => (
          <ToggleChip key={o} active={selected.includes(o)} onClick={() => onToggle(o)}>
            {o}
          </ToggleChip>
        ))}
        <ToggleChip active={otherActive} onClick={() => onToggle(OTHER)}>
          {OTHER}
        </ToggleChip>
      </div>
      {otherActive ? (
        <input
          type="text"
          value={other}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Tell us your background"
          aria-label="Other degree background"
          className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      ) : null}
    </div>
  )
}

function KeywordInput({ label, hint, values, onAdd, onRemove }) {
  const [draft, setDraft] = useState('')

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) onAdd(trimmed)
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="survey-skills" className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint ? <p className="-mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="flex gap-2">
        <input
          id="survey-skills"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder="e.g. Excel, Python, public speaking"
          className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={commit}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Add
        </button>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {v}
              <button
                type="button"
                onClick={() => onRemove(v)}
                aria-label={`Remove ${v}`}
                className="text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function OnboardingSurvey({ initial, onSubmit, onSkip }) {
  const [answers, setAnswers] = useState(initial ?? EMPTY_SURVEY)
  const [error, setError] = useState('')

  const set = (key) => (value) => setAnswers((prev) => ({ ...prev, [key]: value }))

  function toggleMulti(key, value) {
    setAnswers((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }))
  }

  function addKeyword(value) {
    setAnswers((prev) => ({ ...prev, skillKeywords: [...prev.skillKeywords, value] }))
  }

  function removeKeyword(value) {
    setAnswers((prev) => ({ ...prev, skillKeywords: prev.skillKeywords.filter((v) => v !== value) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!answers.age || !answers.level) {
      setError('Fill in age range and target level — they only take a click each.')
      return
    }
    const hasDegree = answers.degrees.some((d) => d !== OTHER) || (answers.degrees.includes(OTHER) && answers.degreeOther.trim())
    if (!hasDegree) {
      setError(
        answers.degrees.includes(OTHER)
          ? 'Say a word or two about your background in the "Other" box, or pick a listed degree.'
          : 'Pick at least one degree background, or choose "Other" and describe it.',
      )
      return
    }
    if (answers.industries.length === 0 || answers.functions.length === 0) {
      setError('Pick at least one industry and at least one role to explore.')
      return
    }
    setError('')
    onSubmit(answers)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Tell us about you</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          A couple of questions, then we'll point you at the companies and roles in this dataset
          that best fit, and flag which typical skills you likely already have.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="survey-age" label="Age range" value={answers.age} onChange={set('age')} options={AGE_RANGES} />
          <Select
            id="survey-level"
            label="Level you're targeting"
            value={answers.level}
            onChange={set('level')}
            options={TARGET_LEVELS}
          />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <DegreeRow
            selected={answers.degrees}
            other={answers.degreeOther}
            onToggle={(v) => toggleMulti('degrees', v)}
            onOtherChange={set('degreeOther')}
          />
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
          <MultiSelectRow
            label="Work experience so far"
            hint="Pick every type that applies — it's fine to pick none."
            options={EXPERIENCE_TYPES}
            selected={answers.experienceTypes}
            onToggle={(v) => toggleMulti('experienceTypes', v)}
          />
          <MultiSelectRow
            label="Past roles you've held"
            hint="Functions you've actually worked in before, if any."
            options={FUNCTIONS}
            selected={answers.pastRoles}
            onToggle={(v) => toggleMulti('pastRoles', v)}
          />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <MultiSelectRow
            label="Past industries you've worked in"
            hint="Optional — leave blank if this would be your first."
            options={INDUSTRIES}
            selected={answers.pastIndustries}
            onToggle={(v) => toggleMulti('pastIndustries', v)}
          />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <KeywordInput
            label="Skills"
            hint="Type a skill and press Enter to add it — tools, languages, anything you'd put on a resume."
            values={answers.skillKeywords}
            onAdd={addKeyword}
            onRemove={removeKeyword}
          />
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
          <MultiSelectRow
            label="Industries you want to explore"
            options={INDUSTRIES}
            selected={answers.industries}
            onToggle={(v) => toggleMulti('industries', v)}
          />
          <MultiSelectRow
            label="Roles you're looking for"
            options={FUNCTIONS}
            selected={answers.functions}
            onToggle={(v) => toggleMulti('functions', v)}
          />
        </div>

        {error ? (
          <p role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            See my recommendations
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
          >
            Skip for now
          </button>
        </div>
      </form>
    </section>
  )
}
