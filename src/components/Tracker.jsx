import { STATUSES } from '../lib/tracker.js'

export default function Tracker({ entries, onStatusChange, onRemove }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">Tracker</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Jobs you logged from the next-steps panel. This list survives running a new thesis — it
          is cleared only by reloading the page.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">
          Nothing logged yet. Screen a thesis with a strong fit hit rate to unlock the next-steps
          panel, then log a job from there.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-2 font-medium">Company</th>
                <th className="px-5 py-2 font-medium">Role</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Date added</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-5 py-2.5 text-slate-900">{entry.company}</td>
                  <td className="px-5 py-2.5 text-slate-700">{entry.role}</td>
                  <td className="px-5 py-2.5">
                    <select
                      value={entry.status}
                      aria-label={`Status for ${entry.role} at ${entry.company}`}
                      onChange={(e) => onStatusChange(entry.id, e.target.value)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-2.5 text-slate-500 tabular-nums">{entry.dateAdded}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      className="text-xs text-slate-400 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
