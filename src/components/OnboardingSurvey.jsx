import { useState } from 'react'
import { INDUSTRIES, FUNCTIONS } from '../data/mockCompanies.js'
import { AGE_RANGES, DEGREE_BACKGROUNDS, EXPERIENCE_LEVELS, TARGET_LEVELS } from '../data/careerGuidance.js'

/*
 * First-visit survey: who the user is, and what they're looking for. Feeds
 * CareerRecommendations. Every option here maps to something real in the
 * dataset (see careerGuidance.js's header comment) so a completed survey
 * never points at zero results by construction — an empty *combination* is
 * still possible and handled honestly in CareerRecommendations.
 */

export const EMPTY_SURVEY = {
  age: '',
  degree: '',
  experience: '',
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

function MultiSelectRow({ label, options, selected, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
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

  function handleSubmit(e) {
    e.preventDefault()
    if (!answers.age || !answers.degree || !answers.experience || !answers.level) {
      setError('Fill in age range, degree background, experience, and target level — they only take a click each.')
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select id="survey-age" label="Age range" value={answers.age} onChange={set('age')} options={AGE_RANGES} />
          <Select
            id="survey-degree"
            label="Degree background"
            value={answers.degree}
            onChange={set('degree')}
            options={DEGREE_BACKGROUNDS}
          />
          <Select
            id="survey-experience"
            label="Internship / work experience"
            value={answers.experience}
            onChange={set('experience')}
            options={EXPERIENCE_LEVELS}
          />
          <Select
            id="survey-level"
            label="Level you're targeting"
            value={answers.level}
            onChange={set('level')}
            options={TARGET_LEVELS}
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
