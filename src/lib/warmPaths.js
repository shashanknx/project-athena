/*
 * STUB. Real warm-path discovery would need a network graph (LinkedIn or
 * similar) and is explicitly out of scope for this prototype. These
 * suggestions are generated deterministically from the role id so the same
 * role always shows the same mock path — nothing is looked up.
 */

const CONTACTS = [
  'Ana Beltrán', 'Marcus Oyelaran', 'Priya Raghunathan', 'Tom Whitfield',
  'Sofia Marchetti', 'Devon Park', 'Ruth Ekwueme', 'Ilya Novak',
  'Grace Lindqvist', 'Samir Haddad', 'Nora Castellanos', 'Ben Oyama',
]

const RELATIONSHIPS = [
  'former colleague at your last company',
  'shares your graduate program',
  '2nd-degree via a mutual contact',
  'spoke on a panel you attended',
  'alum of your undergrad, same city',
]

const OPENERS = [
  'Ask for a 20-minute call about how the team is actually structured.',
  'Ask what the hiring manager is really optimising for in this req.',
  'Ask whether this role was backfilled or newly created.',
  'Ask for an introduction to the hiring manager after the call.',
]

/** FNV-1a plus an avalanche step — a plain *31 hash clusters badly on ids
 *  that share a prefix, which put the same mock contact on half the list. */
function hash(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  return h >>> 0
}

export function warmPathFor(role) {
  // Three independent hashes. (Bit-shifting one hash is tempting here, but `>>`
  // is signed: any hash above 2^31 shifts negative and yields an empty slot.)
  const h = hash(role.id)
  return {
    contact: CONTACTS[hash(`c:${role.id}`) % CONTACTS.length],
    relationship: RELATIONSHIPS[hash(`r:${role.id}`) % RELATIONSHIPS.length],
    opener: OPENERS[h % OPENERS.length],
  }
}
