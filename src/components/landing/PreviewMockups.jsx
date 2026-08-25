/*
 * Static, non-interactive reproductions of the four real product screens, for
 * the landing page's "How it works" section. These are hand-built to match
 * each screen's actual layout and colour language (see MapView.jsx,
 * ResultsList.jsx, Tracker.jsx, OnboardingSurvey.jsx) rather than live
 * screenshots, so they can't go stale in a binary asset and never drift out
 * of sync with a running dev server. They will drift from the *real*
 * components over time as those change — if you redesign a screen, update
 * its mini reproduction here too.
 */

function BrowserFrame({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 rounded bg-white px-2 py-0.5 text-[10px] text-slate-400">
          project-athena.app
        </span>
      </div>
      <div aria-hidden="true" className="pointer-events-none select-none p-3">
        {children}
      </div>
    </div>
  )
}

function Pill({ active, children }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] ${
        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 text-slate-600'
      }`}
    >
      {children}
    </span>
  )
}

export function SurveyPreview() {
  return (
    <BrowserFrame>
      <p className="text-xs font-semibold text-slate-900">Tell us about you</p>
      <p className="mt-0.5 text-[10px] text-slate-500">
        A couple of questions, then we&apos;ll point you at the roles that fit.
      </p>
      <div className="mt-2.5 space-y-1.5">
        <div>
          <p className="text-[10px] font-medium text-slate-600">Age range</p>
          <div className="mt-0.5 h-5 rounded border border-slate-300 bg-white" />
        </div>
        <div>
          <p className="text-[10px] font-medium text-slate-600">Degree background</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Pill active>Business / Economics</Pill>
            <Pill>Engineering / CS</Pill>
            <Pill>Life Sciences</Pill>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

export function MapPreview() {
  return (
    <BrowserFrame>
      <div className="flex flex-wrap gap-1">
        <Pill active>All</Pill>
        <Pill>Space 13</Pill>
        <Pill>Robotics 9</Pill>
        <Pill>Biotech 10</Pill>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="rounded border border-slate-200 p-1.5">
          <p className="text-[10px] font-semibold text-slate-900">Orbital Foundry</p>
          <p className="text-[9px] text-slate-500">Space · early-stage · San Francisco</p>
          <div className="mt-1 flex gap-1">
            <Pill>BizOps →</Pill>
            <Pill>Marketing →</Pill>
          </div>
        </div>
        <div className="rounded border border-slate-200 p-1.5">
          <p className="text-[10px] font-semibold text-slate-900">Cadence Robotics</p>
          <p className="text-[9px] text-slate-500">Robotics · growth · San Francisco</p>
          <div className="mt-1 flex gap-1">
            <Pill>BizOps →</Pill>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

export function ListingsPreview() {
  return (
    <BrowserFrame>
      <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1">
        <p className="text-[9px] font-semibold text-amber-800">2 · FIT HIT RATE</p>
        <p className="text-sm font-semibold text-slate-900">83%</p>
      </div>
      <div className="mt-2 rounded border border-slate-200 p-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-900">Product Manager, Platform</span>
          <span className="flex gap-1">
            <span className="rounded border border-emerald-600 bg-emerald-600 px-1.5 py-0.5 text-[9px] text-white">
              Hit
            </span>
            <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[9px] text-slate-500">
              Miss
            </span>
          </span>
        </div>
        <p className="mt-1 text-[9px] leading-snug text-slate-500">
          Own the roadmap for the internal data platform every discovery team runs on…
        </p>
      </div>
    </BrowserFrame>
  )
}

export function TrackerPreview() {
  return (
    <BrowserFrame>
      <table className="w-full text-left text-[10px]">
        <thead className="text-[9px] tracking-wide text-slate-400 uppercase">
          <tr>
            <th className="pb-1 font-medium">Company</th>
            <th className="pb-1 font-medium">Role</th>
            <th className="pb-1 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="py-1 text-slate-900">Helix Bio</td>
            <td className="py-1 text-slate-600">Product Manager</td>
            <td className="py-1">
              <Pill active>Interested</Pill>
            </td>
          </tr>
          <tr>
            <td className="py-1 text-slate-900">Calyx Therapeutics</td>
            <td className="py-1 text-slate-600">Sr. Product Manager</td>
            <td className="py-1">
              <Pill>Applied</Pill>
            </td>
          </tr>
        </tbody>
      </table>
    </BrowserFrame>
  )
}
