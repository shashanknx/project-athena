/*
 * Career-survey vocabulary and illustrative skill/certification guidance.
 *
 * None of this is scraped from real job postings — it's hand-authored, the
 * same way mockCompanies.js's role descriptions are. It exists so the survey
 * can flag *typical* skills and certification expectations per function, not
 * so it can claim a literal per-listing requirements match.
 *
 * The industry and function option lists below are deliberately the same
 * INDUSTRIES / FUNCTIONS the rest of the app already filters on (see
 * mockCompanies.js) rather than a broader real-world list — every survey
 * answer here maps to something actually in the dataset, so a recommendation
 * never points at zero results.
 */

export const AGE_RANGES = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55+']

export const DEGREE_BACKGROUNDS = [
  'Business / Economics',
  'Engineering / Computer Science',
  'Life Sciences',
  'Liberal Arts / Humanities',
  'Other / Undecided',
]

export const EXPERIENCE_LEVELS = [
  'No internships or jobs yet',
  '1 internship',
  '2+ internships',
  'Full-time experience (1-3 yrs)',
  'Full-time experience (3+ yrs)',
]

// Same three tiers inferLevel() in lib/recommend.js buckets real role titles
// into, so a survey answer here can be matched directly against a role.
export const TARGET_LEVELS = ['Entry level', 'Mid-level / individual contributor', 'Manager / senior']

/*
 * A small shared vocabulary. Reused, word-for-word, across DEGREE_SKILLS,
 * EXPERIENCE_SKILLS, and FUNCTION_SKILLS below so that "skills you likely
 * have" and "skills this function wants" can overlap by simple string
 * equality — that overlap is the entire matching mechanism.
 */
const SKILL = {
  FINANCIAL_MODELING: 'financial modeling',
  FORECASTING: 'forecasting & budgeting',
  DATA_ANALYSIS: 'spreadsheet / data analysis',
  TECHNICAL_SCRIPTING: 'coding / technical scripting',
  SYSTEMS_DESIGN: 'systems / technical design',
  REGULATORY: 'contract & regulatory research',
  MESSAGING: 'messaging & positioning',
  MARKET_RESEARCH: 'market / audience research',
  PROCESS_COORDINATION: 'process & vendor coordination',
  RECRUITING: 'recruiting & employee relations',
  ROADMAP: 'roadmap prioritization',
  CROSS_FUNCTIONAL: 'cross-functional communication',
  PIPELINE: 'pipeline & relationship management',
  WORKPLACE_BASICS: 'workplace fundamentals (deadlines, meetings)',
  OWNERSHIP: 'independent project ownership',
  LEADERSHIP: 'people / team leadership',
}

// What a survey-taker's degree background typically already gives them.
export const DEGREE_SKILLS = {
  'Business / Economics': [SKILL.FINANCIAL_MODELING, SKILL.FORECASTING, SKILL.MARKET_RESEARCH],
  'Engineering / Computer Science': [SKILL.TECHNICAL_SCRIPTING, SKILL.SYSTEMS_DESIGN, SKILL.DATA_ANALYSIS],
  'Life Sciences': [SKILL.REGULATORY, SKILL.DATA_ANALYSIS],
  'Liberal Arts / Humanities': [SKILL.MESSAGING, SKILL.CROSS_FUNCTIONAL],
  'Other / Undecided': [],
}

// What work/internship history typically adds on top of a degree.
export const EXPERIENCE_SKILLS = {
  'No internships or jobs yet': [],
  '1 internship': [SKILL.WORKPLACE_BASICS],
  '2+ internships': [SKILL.WORKPLACE_BASICS, SKILL.CROSS_FUNCTIONAL],
  'Full-time experience (1-3 yrs)': [SKILL.WORKPLACE_BASICS, SKILL.OWNERSHIP],
  'Full-time experience (3+ yrs)': [SKILL.WORKPLACE_BASICS, SKILL.OWNERSHIP, SKILL.LEADERSHIP],
}

// What each function's roles typically call for, in this dataset.
export const FUNCTION_SKILLS = {
  BizOps: [SKILL.DATA_ANALYSIS, SKILL.FINANCIAL_MODELING, SKILL.CROSS_FUNCTIONAL],
  Engineering: [SKILL.TECHNICAL_SCRIPTING, SKILL.SYSTEMS_DESIGN],
  Finance: [SKILL.FINANCIAL_MODELING, SKILL.FORECASTING, SKILL.DATA_ANALYSIS],
  Legal: [SKILL.REGULATORY],
  Marketing: [SKILL.MESSAGING, SKILL.MARKET_RESEARCH],
  Operations: [SKILL.PROCESS_COORDINATION, SKILL.CROSS_FUNCTIONAL],
  People: [SKILL.RECRUITING, SKILL.CROSS_FUNCTIONAL],
  Product: [SKILL.ROADMAP, SKILL.CROSS_FUNCTIONAL, SKILL.MARKET_RESEARCH],
  Sales: [SKILL.PIPELINE],
}

// Certifications are a function thing, not an industry thing, in this
// dataset — a CFA doesn't change because the employer builds rockets instead
// of robots. One line per function, always plain about "none required."
export const FUNCTION_CERTIFICATIONS = {
  BizOps: 'No formal certification expected; a strong spreadsheet/SQL portfolio matters more.',
  Engineering: 'No certification required; a project portfolio (or GitHub) matters more than credentials.',
  Finance: 'No certification required for most of these roles; CFA Level I or a finance-focused MBA is a plus for senior finance tracks.',
  Legal: 'A JD (or in progress) is typically expected for legal roles.',
  Marketing: 'No certification required; a portfolio of campaigns and results carries more weight.',
  Operations: 'No certification required; Six Sigma or supply-chain coursework is a plus, not a requirement.',
  People: 'No certification required; SHRM-CP or PHR is a plus for more senior HR roles.',
  Product: 'No certification required; a shipped-product portfolio matters more than any PM certificate.',
  Sales: 'No certification required; a demonstrated quota-carrying track record matters more.',
}

// One line of domain flavor per industry, shown alongside the function skill
// list — not part of the matching mechanic, just context.
export const INDUSTRY_FLAVOR = {
  Space: 'Space roles here lean toward long sales/development cycles and technical, regulated products.',
  Robotics: 'Robotics roles here lean hardware-adjacent — comfort with technical, physical products helps.',
  Biotech: 'Biotech roles here sit inside a regulatory/compliance-aware environment.',
  General: 'General-industry roles here span ordinary consumer-facing business contexts.',
}
