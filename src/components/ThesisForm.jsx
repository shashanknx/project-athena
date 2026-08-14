import { FUNCTIONS, INDUSTRIES, CITIES, STAGES } from '../data/mockCompanies.js'
import { specifiedDimensions } from '../lib/search.js'
import { SCENARIOS } from '../lib/scenarios.js'

function Field({ id, label, hint, value, onChange, options, type = 'text' }) {
  const listId = `${id}-options`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Any stage</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            id={id}
            type="text"
            value={value}
            list={listId}
            placeholder={hint}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <datalist id={listId}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </>
      )}
    </div>
  )
}

export default function ThesisForm({ thesis, onChange, onSubmit, onClear, error }) {
  const filled = specifiedDimensions(thesis).length

  const set = (key) => (value) => onChange({ ...thesis, [key]: value })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Define your thesis</h2>
        <p className="mt-1 text-sm text-slate-500">
          The kind of role and company you think you are targeting. Every field is optional, but
          fill at least one. Leave fields blank on purpose — a sparser thesis is an exploration,
          and the tool will treat it as one.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(thesis)
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="thesis-function"
            label="Function / role"
            hint="e.g. Marketing, BizOps"
            value={thesis.function}
            onChange={set('function')}
            options={FUNCTIONS}
          />
          <Field
            id="thesis-industry"
            label="Industry / sector"
            hint="e.g. Space, Biotech"
            value={thesis.industry}
            onChange={set('industry')}
            options={INDUSTRIES}
          />
          <Field
            id="thesis-geography"
            label="Geography"
            hint="e.g. Denver, Boston"
            value={thesis.geography}
            onChange={set('geography')}
            options={CITIES}
          />
          <Field
            id="thesis-stage"
            label="Company stage"
            type="select"
            value={thesis.stage}
            onChange={set('stage')}
            options={STAGES}
          />
        </div>

        {error ? (
          <p
            role="alert"
            data-testid="thesis-error"
            className="mt-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Test thesis
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
          <span className="text-xs text-slate-500">
            {filled === 0
              ? 'No constraints set'
              : `${filled} of 4 dimensions set${filled < 2 ? ' — exploration mode' : ''}`}
          </span>
        </div>
      </form>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          Load a test scenario
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSubmit(s.thesis)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
