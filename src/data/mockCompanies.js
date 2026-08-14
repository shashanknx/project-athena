/*
 * ============================================================================
 * MOCK JOB MARKET DATA  —  40 companies, 81 roles
 * ============================================================================
 *
 * Every company, role, and job description below is FICTIONAL. There is no
 * live job API in this prototype; this file *is* the job market.
 *
 * The dataset is constructed deliberately so that each of the six test
 * scenarios is reachable through the actual form. Exact expected counts are
 * asserted in `src/lib/scenarios.test.mjs` — if you edit this file, run
 * `npm run test:data` to see which scenarios you broke.
 *
 * ----------------------------------------------------------------------------
 * SCENARIO MAP — which form input triggers which scenario
 * ----------------------------------------------------------------------------
 *
 * S1. HIGH MARKET HIT RATE
 *     Input:  Function "BizOps", Industry "Robotics", Geography blank
 *     Expect: 8 companies / 16 matching roles, every company with 2 open roles.
 *             Fit lands mid-band (56%) by design — half these "BizOps" reqs
 *             are genuine strategy work, half are shop-floor/support ops. S1 is
 *             about the MARKET number; the mid-band fit prompt is expected.
 *
 * S2. ZERO ON THE FULL THESIS, BUT RELAXABLE (the flagship diagnostic)
 *     Input:  Function "Marketing", Industry "Space", Geography "Denver"
 *     Expect: Full thesis           ->  0 companies
 *             Drop geography        -> 11 companies   <- binding constraint
 *             Drop industry         ->  4 companies
 *             Drop function         ->  1 company
 *             Counts are far apart on purpose, so the bar chart makes the
 *             binding constraint (Denver) visually obvious.
 *
 * S3. ZERO ON EVERY RELAXATION (diagnostic empty state)
 *     Input:  Function "Legal", Industry "Space", Geography "Detroit"
 *     Expect: Full 0, and all three single-dimension relaxations also 0.
 *             (Only one Legal role exists in the whole dataset — Austin,
 *             biotech — and no company is in Detroit.) The UI should say the
 *             diagnostic has nothing to offer rather than showing an empty bar
 *             chart.
 *
 * S4. HIGH MARKET HIT RATE, LOW FIT HIT RATE
 *     Input:  Function "Marketing", Industry "Space", Geography blank
 *             (i.e. exactly the S2 "drop geography" relaxation — this is the
 *             natural continuation of the S2 walkthrough)
 *     Expect: 11 companies / 11 roles. Only 3 of the 11 descriptions are real
 *             marketing jobs; the other 8 are quota-carrying sales, SDR, or
 *             CRM-admin work wearing a marketing title. A careful screener
 *             lands near 27% fit -> "reconsider function/title specificity".
 *
 * S5. HIGH MARKET HIT RATE, HIGH FIT HIT RATE (unlock path)
 *     Input:  Function "Product", Industry "Biotech", Geography blank
 *     Expect: 6 companies / 6 roles. Five are unambiguous product-management
 *             jobs; one (Pinewood Bio) is project management in disguise, so a
 *             careful screener lands near 83% -> next-steps panel unlocks.
 *
 * S6. SPARSE / EXPLORATION THESIS
 *     Input:  Industry "Biotech" only
 *     Expect: 10 companies / 20 roles, exploration-mode banner, no relaxation
 *             bars (nothing to relax against), and a composition breakdown of
 *             functions / cities / stages instead.
 *
 * ----------------------------------------------------------------------------
 * INVARIANTS THE DATA MAINTAINS (don't break these when editing)
 * ----------------------------------------------------------------------------
 *   - Exactly 1 space company sits in Denver (Front Range Orbital) and it has
 *     no marketing role  -> makes S2's full thesis 0 and its drop-function 1.
 *   - Exactly 11 space companies have a marketing role, none in Denver.
 *   - Exactly 4 companies in Denver have a marketing role (2 general,
 *     1 robotics, 1 biotech).
 *   - Exactly 1 Legal role exists, in Austin, at a biotech company.
 *   - No company is in Detroit.
 *
 * `screenerVerdict` on each role is the answer key for the fit-rate scenarios:
 * what a careful human screener *should* conclude after reading the
 * description. The app never reads this field — it exists so a tester can
 * check their own screening, and so the scenario tests can assert expected fit
 * rates. 'match' = should be marked a hit, 'mismatch' = should be marked a
 * miss, 'neutral' = genuinely a judgement call.
 */

export const INDUSTRIES = ['Space', 'Robotics', 'Biotech', 'General']

export const STAGES = ['early-stage', 'growth', 'public']

export const FUNCTIONS = [
  'BizOps',
  'Engineering',
  'Finance',
  'Legal',
  'Marketing',
  'Operations',
  'People',
  'Product',
  'Sales',
]

export const CITIES = [
  'Austin',
  'Boston',
  'Denver',
  'Los Angeles',
  'New York',
  'San Francisco',
  'Seattle',
]

/** Builds a company, stamping ids and companyId onto its roles. */
function company(id, name, industry, stage, city, roles) {
  return {
    id,
    name,
    industry,
    stage,
    city,
    roles: roles.map((role, i) => ({ id: `${id}-r${i + 1}`, companyId: id, ...role })),
  }
}

// ============================================================================
// SPACE — 13 companies. 11 carry a marketing role (none in Denver); Front
// Range Orbital is the lone Denver space company and has no marketing role.
// ============================================================================

const space = [
  company('orbital-foundry', 'Orbital Foundry', 'Space', 'early-stage', 'San Francisco', [
    {
      title: 'Marketing Lead',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Own the top of the funnel for our satellite bus product line. You will carry a personal quota of 40 qualified opportunities per quarter, run outbound sequences to defense primes, and sit in the weekly pipeline review with the CRO. Expected to travel to 6-8 industry conferences a year to work the booth and set meetings. Brand, content, and positioning work is handled by an outside agency. Comp is 60/40 base to variable, tied to closed-won revenue.',
    },
    {
      title: 'BizOps Analyst',
      function: 'BizOps',
      screenerVerdict: 'neutral',
      description:
        'Support the finance and operations team with build-vs-buy models, vendor analysis, and the quarterly board deck. Heavy spreadsheet work, reporting into the Head of Finance.',
    },
  ]),

  company('perigee-systems', 'Perigee Systems', 'Space', 'growth', 'Los Angeles', [
    {
      title: 'Growth Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'This is a revenue-first role. You will manage two SDRs, own the meetings-booked number, and be measured monthly on sourced pipeline against a $4M annual target. Day to day is call blocks, sequence tuning in Outreach, and territory planning with the regional sales directors. Prior quota-carrying experience required. If you are looking for a brand or product marketing seat, this is not it.',
    },
    {
      title: 'Avionics Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Design and test flight avionics hardware for our upper stage. Requires embedded C and a background in aerospace systems.',
    },
  ]),

  company('vantage-orbit', 'Vantage Orbit', 'Space', 'growth', 'Seattle', [
    {
      title: 'Product Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'match',
      description:
        'Own positioning and messaging for our earth-observation data products. You will run win/loss interviews, write the messaging framework and launch narratives, build the competitive landscape, and partner with product on roadmap sequencing. Success is measured on launch quality and message adoption across the go-to-market org, not on pipeline. No quota, no territory.',
    },
    {
      title: 'Mission Operations Associate',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Support daily satellite tasking and downlink scheduling. Rotating on-call, based out of our Seattle operations center.',
    },
  ]),

  company('helio-launch', 'Helio Launch', 'Space', 'public', 'Los Angeles', [
    {
      title: 'Field Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Support the West region sales team with event execution and local demand generation. You will be assigned to a named-account territory alongside two account executives and share their regional bookings target. Roughly 50% travel. Most of the week is logistics: booth shipping, badge scanning, dinner reservations, and following up on scanned leads until they accept a meeting.',
    },
    {
      title: 'Propulsion Test Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Run hot-fire test campaigns at our Mojave site. Test stand instrumentation, data reduction, and anomaly investigation.',
    },
  ]),

  company('ranger-aerospace', 'Ranger Aerospace', 'Space', 'early-stage', 'Austin', [
    {
      title: 'Marketing Generalist',
      function: 'Marketing',
      screenerVerdict: 'match',
      description:
        'First marketing hire at a 30-person launch services company. You will own the website rebuild, the technical blog, our conference presence, and the customer case study program. Reports to the CEO. This is a build-the-function role: you decide what marketing means here, set the first set of goals, and hire behind you in year two. No sales quota attached to this seat.',
    },
    {
      title: 'Manufacturing Operations Associate',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Keep the production floor stocked and scheduled. Inventory counts, work order tracking, and supplier follow-up.',
    },
  ]),

  company('nimbus-space', 'Nimbus Space', 'Space', 'growth', 'San Francisco', [
    {
      title: 'Demand Generation Manager',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Own the inbound-to-meeting conversion number. You will personally qualify inbound leads, run discovery calls, and hand off to account executives — effectively a senior SDR seat with a marketing title. Weekly metrics: dials, connects, meetings set, meetings held. Compensation includes a monthly commission on held meetings. Campaign strategy and creative are owned by the VP.',
    },
    {
      title: 'Finance Analyst',
      function: 'Finance',
      screenerVerdict: 'neutral',
      description:
        'Own the monthly close and the rolling 18-month cash forecast. Reports to the Controller.',
    },
  ]),

  company('trailhead-orbital', 'Trailhead Orbital', 'Space', 'early-stage', 'Boston', [
    {
      title: 'Brand & Content Marketing Lead',
      function: 'Marketing',
      screenerVerdict: 'match',
      description:
        'Define how a technical company talks about itself. You will own the brand system, the editorial calendar, our long-form technical explainers, and the recruiting narrative that helps us win engineers against much larger competitors. Partner with the founders on external communications and conference keynotes. Measured on brand awareness studies and inbound engineering applications, not on pipeline.',
    },
    {
      title: 'Systems Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Own requirements flowdown and interface control for our docking mechanism program.',
    },
  ]),

  company('apex-payloads', 'Apex Payloads', 'Space', 'growth', 'New York', [
    {
      title: 'Marketing Operations Manager',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Administer the go-to-market tech stack. Roughly 70% of this job is Salesforce hygiene, lead routing rules, and territory assignment for the sales org; the remainder is building reports the CRO asks for on Friday afternoons. You will report into Sales Operations, not Marketing, despite the title. Strong Salesforce admin credentials are the hard requirement.',
    },
    {
      title: 'BizOps Associate',
      function: 'BizOps',
      screenerVerdict: 'neutral',
      description:
        'Analytics and planning support for the executive team. Pricing analysis, capacity modeling, and board reporting.',
    },
  ]),

  company('lodestar-space', 'Lodestar Space', 'Space', 'early-stage', 'Seattle', [
    {
      title: 'Marketing Associate',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Entry-level seat on the revenue team. Build target account lists, research contacts, send 60+ personalized outbound emails a day, and book intro calls for the two founders. Ramp target is 12 booked meetings per month by month three. Titled marketing because the founders wanted the emails to land softer; the work and the metrics are sales development.',
    },
    {
      title: 'Ground Software Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Build the mission control web application our operators live in. React and Python.',
    },
  ]),

  company('kestrel-dynamics', 'Kestrel Dynamics', 'Space', 'public', 'Austin', [
    {
      title: 'Partner Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Manage a portfolio of eight reseller and integrator partners. You carry an indirect bookings quota for that portfolio, run quarterly business reviews on their numbers, and negotiate co-op marketing spend against committed revenue targets. This is a channel sales role in everything but name. Marketing collateral is produced centrally; you distribute it.',
    },
    {
      title: 'Contracts Manager',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Administer government and commercial contracts, including FAR/DFARS flowdowns and subcontractor agreements.',
    },
  ]),

  company('solstice-aerospace', 'Solstice Aerospace', 'Space', 'early-stage', 'Los Angeles', [
    {
      title: 'Marketing Lead',
      function: 'Marketing',
      screenerVerdict: 'mismatch',
      description:
        'Lead capture and business development for government programs. You will track solicitations on SAM.gov, build capture plans, write proposal sections, and own relationships with contracting officers. Success is measured in awarded contract value. The title says marketing because that is how the primes label this function; the work is federal business development and proposal management.',
    },
    {
      title: 'Structures Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Composite primary structure design and analysis for satellite platforms.',
    },
  ]),

  company('deep-field-instruments', 'Deep Field Instruments', 'Space', 'public', 'San Francisco', [
    {
      title: 'Optical Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Design and characterize space-qualified optical payloads. Zemax, stray light analysis, thermal-optical modeling.',
    },
    {
      title: 'Program Operations Manager',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Run schedule, cost, and risk for a $40M instrument program. Earned value management experience required.',
    },
  ]),

  // The single Denver space company — deliberately has NO marketing role.
  company('front-range-orbital', 'Front Range Orbital', 'Space', 'growth', 'Denver', [
    {
      title: 'Manufacturing Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Own build processes for our propulsion line. Fixture design, work instructions, and yield improvement.',
    },
    {
      title: 'Supply Chain Operations Lead',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Manage supplier qualification and long-lead procurement for flight hardware.',
    },
  ]),
]

// ============================================================================
// ROBOTICS — 9 companies. 8 carry two BizOps roles each (16 total), split
// evenly between genuine strategy work and operational work in disguise.
// ============================================================================

const robotics = [
  company('cadence-robotics', 'Cadence Robotics', 'Robotics', 'growth', 'San Francisco', [
    {
      title: 'Business Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Sit between the CEO and the functional leads on the questions that do not have an owner yet. Recent projects: rebuilding the unit economics model for our robots-as-a-service pricing, running the annual planning cycle, and standing up the metrics layer the exec team reviews weekly. High autonomy, direct exec exposure, and a mandate to pick your own problems within the quarter.',
    },
    {
      title: 'Strategy & Operations Analyst',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Analytical partner to the commercial org. You will build the deployment capacity model, size new market segments, and own the weekly business review. SQL and financial modeling are the core tools. Reports to the Head of BizOps.',
    },
  ]),

  company('ironwood-automation', 'Ironwood Automation', 'Robotics', 'growth', 'Austin', [
    {
      title: 'Strategy & Operations Lead',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Own strategic planning for a 200-person robotics company entering two new verticals. You will run the market entry analysis, build the business case, and then own execution against it with a small cross-functional team. Reports to the COO.',
    },
    {
      title: 'Business Operations Analyst',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Day-to-day warehouse and inventory coordination for our Austin facility. You will reconcile cycle counts, chase down misrouted shipments, keep the ERP records clean, and produce a daily on-hand report. Onsite five days a week, some lifting required. Titled BizOps but the work is warehouse operations — no strategy, planning, or modeling component.',
    },
  ]),

  company('northstar-robotics', 'Northstar Robotics', 'Robotics', 'early-stage', 'Boston', [
    {
      title: 'BizOps Generalist',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Employee number 24 and the first business hire. You will do a bit of everything: pricing, fundraising support, hiring process design, and the first real financial model. The founders want a thought partner who can also execute. Scope grows with the company.',
    },
    {
      title: 'Revenue Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Support the sales team on forecast accuracy and CRM discipline. You will chase reps for pipeline updates, run the Monday forecast call, maintain dashboards, and administer commission plan calculations at quarter end. Most of the week is Salesforce and Excel maintenance in service of the sales org rather than independent analysis.',
    },
  ]),

  company('gantry-labs', 'Gantry Labs', 'Robotics', 'growth', 'Seattle', [
    {
      title: 'Business Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Own the operating cadence: annual planning, quarterly OKRs, and the exec staff meeting. You will also run one or two special projects a quarter — this year that meant a make-vs-buy analysis on our vision stack and a pricing overhaul. Reports to the CFO with a dotted line to the CEO.',
    },
    {
      title: 'Operations Strategy Associate',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Production scheduling for our Seattle assembly line. You will sequence work orders, balance line loading against takt time, and expedite parts when a build slips. Strategy appears in the title but the role is a shop-floor planning seat reporting to the production supervisor.',
    },
  ]),

  company('meridian-motion', 'Meridian Motion', 'Robotics', 'public', 'San Francisco', [
    {
      title: 'Senior Business Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Lead a two-person BizOps team supporting the Industrial segment. Own the segment P&L review, the investment case process for new product bets, and the integration plan for our most recent acquisition. Frequent exposure to the segment president and the corporate strategy team.',
    },
    {
      title: 'Strategy & Ops, Supply Chain',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Purchase order administration and supplier scorecard upkeep for the components org. You will issue POs, expedite late deliveries, and maintain the approved vendor list. Despite the strategy label, this is a procurement coordinator role; sourcing strategy is set two levels up.',
    },
  ]),

  company('tinbot-systems', 'Tinbot Systems', 'Robotics', 'early-stage', 'Los Angeles', [
    {
      title: 'Founding BizOps Lead',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Own everything non-engineering at a 15-person company: the financial model, the Series A data room, pricing for our first ten customers, and whatever else is on fire. Direct partnership with two technical founders who explicitly want a business counterpart, not an assistant.',
    },
    {
      title: 'Business Operations Associate',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Front line of our customer support queue for deployed robots. You will triage tickets, coordinate field service visits, and keep the support knowledge base current. Rotating weekend on-call. Analytical work is limited to a weekly ticket volume report.',
    },
  ]),

  company('halyard-robotics', 'Halyard Robotics', 'Robotics', 'growth', 'New York', [
    {
      title: 'Business Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Partner to the Chief of Staff on company-level planning and the quarterly board package. Recent work: a pricing migration that moved 40 accounts from perpetual to subscription, and the operating model for our new services business. Small team, wide remit, exec visibility.',
    },
    {
      title: 'Strategy and Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Manage the field service dispatch desk covering the Northeast. You will assign technicians to service calls, manage the parts van inventory, and hit a same-day response SLA. This is a hands-on dispatch and scheduling role despite the strategy title.',
    },
  ]),

  company('basalt-machines', 'Basalt Machines', 'Robotics', 'growth', 'Denver', [
    {
      title: 'Business Operations Lead',
      function: 'BizOps',
      screenerVerdict: 'match',
      description:
        'Own planning, analytics, and special projects for a 120-person agricultural robotics company. You will build the model that decides which crops we expand into next and own the metrics the board sees. Reports to the CEO.',
    },
    {
      title: 'Revenue Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'mismatch',
      description:
        'Own quota setting, territory carving, and commission administration for a 30-person sales org. Quarter end is consumed by dispute resolution on commission calculations. Sits inside the sales organization and is measured on sales productivity metrics.',
    },
    {
      title: 'Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'match',
      description:
        'Own demand generation and product marketing for our Denver-based agricultural robotics line. Campaign strategy, field trial storytelling, and the grower conference circuit.',
    },
  ]),

  company('verge-robotics', 'Verge Robotics', 'Robotics', 'public', 'Boston', [
    {
      title: 'Perception Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Sensor fusion and 3D perception for warehouse autonomy. C++, point clouds, and a lot of edge cases.',
    },
    {
      title: 'Product Manager, Fleet',
      function: 'Product',
      screenerVerdict: 'neutral',
      description:
        'Own the fleet management product used by warehouse operators to schedule and monitor robot fleets.',
    },
  ]),
]

// ============================================================================
// BIOTECH — 10 companies. 6 carry a Product role; 5 of those are unambiguous
// product management, 1 (Pinewood) is project management in disguise.
// ============================================================================

const biotech = [
  company('helix-bio', 'Helix Bio', 'Biotech', 'growth', 'Boston', [
    {
      title: 'Product Manager, Platform',
      function: 'Product',
      screenerVerdict: 'match',
      description:
        'Own the roadmap for the internal data platform every one of our discovery teams runs on. You will do user research with bench scientists, write the specs, prioritize against a shared engineering pod, and make real tradeoff calls on scope. Classic product management with a scientific user base — prior life sciences experience helpful but not required.',
    },
    {
      title: 'Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'neutral',
      description:
        'Scientific communications and conference presence for our discovery platform.',
    },
  ]),

  company('calyx-therapeutics', 'Calyx Therapeutics', 'Biotech', 'public', 'San Francisco', [
    {
      title: 'Senior Product Manager, Data Platform',
      function: 'Product',
      screenerVerdict: 'match',
      description:
        'Own a product area end to end: strategy, roadmap, and outcomes for the clinical data platform used across five therapeutic programs. You will define success metrics, run quarterly planning with two engineering teams, and present the area review to the CTO. Decision rights on prioritization sit with you.',
    },
    {
      title: 'Biostatistician',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Design and analyze clinical trial endpoints. R, SAS, and regulatory submission experience.',
    },
  ]),

  company('marrow-labs', 'Marrow Labs', 'Biotech', 'early-stage', 'Boston', [
    {
      title: 'Founding Product Manager',
      function: 'Product',
      screenerVerdict: 'match',
      description:
        'First product hire at a 40-person company turning a lab assay into a software-enabled diagnostic. You will define what the product is, talk to twenty clinicians a month, and own the roadmap alongside the CTO. Genuine zero-to-one product ownership, including pricing and packaging.',
    },
    {
      title: 'Research Associate',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Run assay development experiments at the bench. Wet lab role, five days onsite.',
    },
  ]),

  company('cyan-biosciences', 'Cyan Biosciences', 'Biotech', 'growth', 'San Francisco', [
    {
      title: 'Product Manager, Lab Software',
      function: 'Product',
      screenerVerdict: 'match',
      description:
        'Own our electronic lab notebook and sample tracking products, used by 4,000 scientists at customer sites. You will run the discovery process, write PRDs, prioritize the backlog with your engineering counterpart, and own adoption and retention metrics for the product line.',
    },
    {
      title: 'Software Engineer, Integrations',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Build integrations between our platform and customer LIMS systems. TypeScript and Python.',
    },
  ]),

  company('pinewood-bio', 'Pinewood Bio', 'Biotech', 'growth', 'Seattle', [
    {
      title: 'Product Manager, Clinical Ops Tools',
      function: 'Product',
      screenerVerdict: 'mismatch',
      description:
        'Coordinate delivery of clinical operations tooling across three vendor teams. You will maintain the master project plan, run the weekly status meeting, track dependencies in Smartsheet, and escalate slippage. Requirements come from the clinical operations leadership team; you translate them into tickets and chase completion. This is a project management role with a product title — no roadmap ownership, no prioritization authority, no user research.',
    },
    {
      title: 'Clinical Operations Associate',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Support site startup and monitoring logistics for two active trials.',
    },
  ]),

  company('alder-genomics', 'Alder Genomics', 'Biotech', 'early-stage', 'Denver', [
    {
      title: 'Product Manager, Sequencing Platform',
      function: 'Product',
      screenerVerdict: 'match',
      description:
        'Own the software layer of our benchtop sequencer: run setup, analysis pipelines, and the reporting workflow customers actually see. You will spend real time in customer labs, own the roadmap, and make the call on what ships each quarter. Reports to the VP of Product at a 60-person company.',
    },
    {
      title: 'Marketing Lead',
      function: 'Marketing',
      screenerVerdict: 'match',
      description:
        'Own positioning, launch, and the scientific content program for our first commercial instrument.',
    },
  ]),

  company('verity-diagnostics', 'Verity Diagnostics', 'Biotech', 'public', 'Austin', [
    {
      title: 'Legal Counsel',
      function: 'Legal',
      screenerVerdict: 'neutral',
      description:
        'Commercial contracting, licensing, and regulatory counsel for a public diagnostics company. JD and bar admission required. (This is the only Legal role in the dataset — see scenario S3.)',
    },
    {
      title: 'Regulatory Affairs Manager',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Own 510(k) submissions and post-market surveillance reporting.',
    },
  ]),

  company('quanta-bio', 'Quanta Bio', 'Biotech', 'growth', 'New York', [
    {
      title: 'Bioinformatics Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Build and maintain genomic analysis pipelines. Nextflow, Python, and cloud batch compute.',
    },
    {
      title: 'Finance Manager',
      function: 'Finance',
      screenerVerdict: 'neutral',
      description:
        'Own budgeting and program-level cost tracking across three research programs.',
    },
  ]),

  company('sable-biologics', 'Sable Biologics', 'Biotech', 'public', 'Boston', [
    {
      title: 'Manufacturing Operations Manager',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Run a GMP suite producing clinical-grade biologics. Batch record review and deviation management.',
    },
    {
      title: 'Process Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Scale up upstream bioprocesses from 50L to 2000L. Tech transfer and process characterization.',
    },
  ]),

  company('fernleaf-bio', 'Fernleaf Bio', 'Biotech', 'early-stage', 'San Francisco', [
    {
      title: 'BizOps Associate',
      function: 'BizOps',
      screenerVerdict: 'neutral',
      description:
        'Financial modeling and operations support for a 25-person therapeutics startup. Reports to the CFO.',
    },
    {
      title: 'Lab Automation Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Program and maintain liquid handling robots for our high-throughput screening line.',
    },
  ]),
]

// ============================================================================
// GENERAL — 8 companies. Two Denver companies carry marketing roles, which
// (with Basalt Machines and Alder Genomics) makes "Marketing + Denver" = 4.
// ============================================================================

const general = [
  company('kettle-and-co', 'Kettle & Co', 'General', 'growth', 'Denver', [
    {
      title: 'Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'neutral',
      description:
        'Own paid and lifecycle marketing for a direct-to-consumer coffee subscription. Reports to the founder.',
    },
    {
      title: 'Operations Coordinator',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Coordinate roasting schedules, fulfillment, and customer service escalations.',
    },
  ]),

  company('blue-line-logistics', 'Blue Line Logistics', 'General', 'public', 'Denver', [
    {
      title: 'Director of Marketing',
      function: 'Marketing',
      screenerVerdict: 'neutral',
      description:
        'Lead a team of six across brand, demand generation, and communications for a regional freight brokerage.',
    },
    {
      title: 'Finance Analyst',
      function: 'Finance',
      screenerVerdict: 'neutral',
      description:
        'Lane-level profitability analysis and monthly close support.',
    },
  ]),

  company('fathom-data-group', 'Fathom Data Group', 'General', 'growth', 'Austin', [
    {
      title: 'Business Operations Manager',
      function: 'BizOps',
      screenerVerdict: 'neutral',
      description:
        'Own planning and analytics for a 90-person data consultancy. Utilization modeling and pricing.',
    },
    {
      title: 'Product Manager',
      function: 'Product',
      screenerVerdict: 'neutral',
      description:
        'Own the internal tooling our consultants use to deliver engagements.',
    },
  ]),

  company('granite-financial', 'Granite Financial', 'General', 'public', 'New York', [
    {
      title: 'Finance Manager',
      function: 'Finance',
      screenerVerdict: 'neutral',
      description:
        'FP&A for the wealth management division. Forecasting, variance analysis, and expense management.',
    },
    {
      title: 'Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'neutral',
      description:
        'Own advisor-facing marketing programs and compliance-reviewed content.',
    },
  ]),

  company('toolbelt-software', 'Toolbelt Software', 'General', 'early-stage', 'Seattle', [
    {
      title: 'Software Engineer',
      function: 'Engineering',
      screenerVerdict: 'neutral',
      description:
        'Full-stack work on scheduling software for trade contractors. Small team, wide ownership.',
    },
    {
      title: 'Product Manager',
      function: 'Product',
      screenerVerdict: 'neutral',
      description:
        'Own the mobile experience used by field crews. Heavy customer ride-along research.',
    },
  ]),

  company('harbor-health-systems', 'Harbor Health Systems', 'General', 'public', 'Boston', [
    {
      title: 'Operations Manager',
      function: 'Operations',
      screenerVerdict: 'neutral',
      description:
        'Run patient access operations across four ambulatory clinics.',
    },
    {
      title: 'People Operations Partner',
      function: 'People',
      screenerVerdict: 'neutral',
      description:
        'HR business partner supporting 600 clinical staff. Employee relations and workforce planning.',
    },
  ]),

  company('sunbelt-retail-group', 'Sunbelt Retail Group', 'General', 'public', 'Los Angeles', [
    {
      title: 'Marketing Manager',
      function: 'Marketing',
      screenerVerdict: 'neutral',
      description:
        'Own regional campaign calendar and store-level promotional planning for 140 locations.',
    },
    {
      title: 'Account Executive',
      function: 'Sales',
      screenerVerdict: 'neutral',
      description:
        'Sell our wholesale program into independent retailers. Quota-carrying, 30% travel.',
    },
  ]),

  company('ridgeway-consulting', 'Ridgeway Consulting', 'General', 'growth', 'Denver', [
    {
      title: 'Business Operations Consultant',
      function: 'BizOps',
      screenerVerdict: 'neutral',
      description:
        'Client-facing operations improvement work for mid-market manufacturers. 40% travel.',
    },
    {
      title: 'Finance Associate',
      function: 'Finance',
      screenerVerdict: 'neutral',
      description:
        'Support engagement economics and client billing.',
    },
  ]),
]

export const COMPANIES = [...space, ...robotics, ...biotech, ...general]

/** Flat list of every role, with its company attached. */
export const ROLES = COMPANIES.flatMap((c) => c.roles.map((r) => ({ ...r, company: c })))
