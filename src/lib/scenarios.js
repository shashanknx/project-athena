import { EMPTY_THESIS } from './search.js'

/**
 * Prefilled theses matching the six documented test scenarios in
 * instructions.md. They fill the real form fields and go through the same
 * submit path a typed thesis does — a shortcut for testers, not a separate
 * code path. The exact inputs are documented in instructions.md so a tester
 * can also reach every scenario by typing.
 */
export const SCENARIOS = [
  {
    id: 'S1',
    label: 'S1 · High market hit rate',
    thesis: { ...EMPTY_THESIS, function: 'BizOps', industry: 'Robotics' },
  },
  {
    id: 'S2',
    label: 'S2 · Zero, but relaxable',
    thesis: { ...EMPTY_THESIS, function: 'Marketing', industry: 'Space', geography: 'Denver' },
  },
  {
    id: 'S3',
    label: 'S3 · Nothing to relax',
    thesis: { ...EMPTY_THESIS, function: 'Legal', industry: 'Space', geography: 'Detroit' },
  },
  {
    id: 'S4',
    label: 'S4 · High market, low fit',
    thesis: { ...EMPTY_THESIS, function: 'Marketing', industry: 'Space' },
  },
  {
    id: 'S5',
    label: 'S5 · High market, high fit',
    thesis: { ...EMPTY_THESIS, function: 'Product', industry: 'Biotech' },
  },
  {
    id: 'S6',
    label: 'S6 · Sparse / exploration',
    thesis: { ...EMPTY_THESIS, industry: 'Biotech' },
  },
]
