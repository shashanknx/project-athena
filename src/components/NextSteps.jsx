import { warmPathFor } from '../lib/warmPaths.js'

/**
 * Unlocked only on the 'next-steps' branch (strong market + strong fit).
 * Warm paths are stubbed — see lib/warmPaths.js.
 */
export default function NextSteps({ hitRoles, isLogged, onLog }) {
  return (
    <section className="rounded-lg border border-emerald-300 bg-white">
      <header className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-3">
        <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">
          3 · Next steps — unlocked
        </p>
        <p className="mt-0.5 text-sm text-slate-600">
          The {hitRoles.length} {hitRoles.length === 1 ? 'role you marked' : 'roles you marked'} as
          a hit, with a suggested warm path into each.{' '}
          <span className="text-slate-400">
            Warm paths are mocked — no real network is being queried.
          </span>
        </p>
      </header>

      <ul className="divide-y divide-slate-100">
        {hitRoles.map((role) => {
          const path = warmPathFor(role)
          const logged = isLogged(role.id)
          return (
            <li key={role.id} className="flex flex-wrap items-start gap-4 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {role.title}{' '}
                  <span className="font-normal text-slate-500">· {role.company.name}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-800">
                    warm path
                  </span>{' '}
                  {path.contact} — {path.relationship}.
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{path.opener}</p>
              </div>
              <button
                type="button"
                disabled={logged}
                onClick={() => onLog(role)}
                className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium ${
                  logged
                    ? 'border border-slate-200 bg-slate-100 text-slate-400'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {logged ? 'Logged' : 'Log this job'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
