// lib/default-content.ts
//
// The site as it ships. Every string here is editable at /admin — this file is
// the seed, not the source of truth, and it is also the fallback whenever
// Firestore is unreachable (including during `next build` on a machine with no
// FIREBASE_ADMIN_* credentials). Keep it complete and keep it good: if the
// database vanished tomorrow the site should still read as finished.

import type { SiteContent } from '@/types/site'

export const DEFAULT_CONTENT: SiteContent = {
  /* ------------------------------------------------------------- identity */
  meta: {
    name: 'Kiran Kumar G',
    descriptor: '0→1 operator — strategy, go-to-market and operations.',
    email: 'kiran.kumar2028@mastersunion.org',
    phone: '+91 9092112941',
    location: 'Gurgaon, India',
    linkedin: 'https://www.linkedin.com/in/iamkirankumarg/',
    resumeUrl: '',
  },

  /* --------------------------------------------------------- utility bar */
  utility: {
    status: 'open to product & strategy roles',
    timezoneLabel: 'Gurgaon',
    timezone: 'Asia/Kolkata',
  },

  /* ------------------------------------------------------------------ nav */
  nav: {
    brand: 'Kiran Kumar G',
    links: [
      { label: 'Services', href: '/services', newTab: false },
      { label: 'Ventures', href: '/#ventures', newTab: false },
      { label: 'Proof', href: '/#proof', newTab: false },
      { label: 'How I work', href: '/#how-i-work', newTab: false },
      { label: 'Writing', href: '/#writing', newTab: false },
      { label: 'About', href: '/#about', newTab: false },
    ],
    cta: { label: "Let's talk", href: '#contact', newTab: false },
  },

  /* ----------------------------------------------------------------- hero */
  hero: {
    eyebrow: '0→1 operator · strategy · GTM · AI',
    headlineBefore: 'Build it,',
    headlineHighlight: 'then prove it',
    headlineAfter: '.',
    subhead:
      'I take products from zero to paying users — and then show you the funnel, the cohort and the unit economics that got them there. Most recently: an EdTech SaaS from an empty Notion doc to a 12,000-member community and 600+ paying users.',
    primaryCta: { label: 'Work with me', href: '#contact' },
    secondaryCta: { label: 'See the ventures', href: '#ventures' },
    portrait: {
      src: '/media/kiran-portrait.jpg',
      alt: 'Kiran Kumar G',
      caption: 'still shipping',
      rotate: -3,
    },
    scribble: 'hi — I build things\nand then count them',
  },

  /* ---------------------------------------------------------------- creds */
  creds: {
    label: 'receipts',
    items: [
      { text: 'Silver Medal · BRICS Future Skills, international final', year: '2024' },
      { text: "Masters' Union — Young Leaders Cohort, merit scholarship", year: '2026' },
      { text: 'Patent filed — AI product size recognition', year: '2023' },
      { text: 'Best Paper · ICA6NT, LLM resource allocation for Beyond 5G', year: '2025' },
      { text: 'Top 160 of 3.42M+ on Unstop', year: '2024' },
      { text: 'McKinsey Forward Program', year: '2025' },
    ],
  },

  /* ---------------------------------------------------------------- proof */
  proof: {
    heading: 'Numbers I *actually moved*',
    metrics: [
      { value: '12K', label: 'member community', context: 'built from zero at rdfctest.in' },
      { value: '600+', label: 'paying users', context: 'at a 5% free-to-paid conversion' },
      { value: '1,100+', label: 'monthly active', context: 'held by activation & retention loops' },
      { value: '150+', label: 'AI datasets shipped', context: 'concurrent client projects, Alignerr' },
      { value: '700+', label: 'event participants', context: 'from 2,700+ registrations, Insight’X' },
      { value: '650+', label: 'people reached', context: 'Robin Hood Army, Bangalore' },
    ],
  },

  /* ------------------------------------------------------------ audiences */
  audiences: {
    eyebrow: 'who this is for',
    heading: 'Four kinds of people *email me*.',
    intro:
      'The work looks different for each of them, so here is the honest version of what you get.',
    items: [
      {
        key: 'founders',
        title: 'Founders at 0→1',
        bring: 'An idea with some pull, and no system underneath it yet.',
        outcomes: [
          'A GTM motion you can actually run next Monday',
          'Pricing and packaging tested against real users, not a spreadsheet',
          'Unit economics you can defend in a room',
        ],
        cta: { label: 'Tell me what you are building', href: '#contact' },
      },
      {
        key: 'teams',
        title: 'Product & growth teams',
        bring: 'Traffic, signups, and a roadmap nobody can rank.',
        outcomes: [
          'A funnel instrumented end to end, with the leak named',
          'Activation and retention loops, shipped and measured',
          'An operating cadence that survives after I leave',
        ],
        cta: { label: 'See how I work', href: '#how-i-work' },
      },
      {
        key: 'ai',
        title: 'AI & data teams',
        bring: 'Models that work in a notebook and nowhere else.',
        outcomes: [
          'A product wrapper around the model, scoped to one job',
          'Evaluation and QA standards that hold at volume',
          'The 150-dataset version of "we should get some data"',
        ],
        cta: { label: 'Look at the projects', href: '#projects' },
      },
      {
        key: 'students',
        title: 'Student builders',
        bring: 'Ambition, a laptop, and no idea where to start.',
        outcomes: [
          'A first hundred users instead of a first hundred slides',
          'Blunt feedback on the idea, free',
          'The playbook I wish someone had handed me in 2021',
        ],
        cta: { label: 'Ask me anything', href: '#contact' },
      },
    ],
  },

  /* ------------------------------------------------------------------ ways */
  ways: {
    eyebrow: 'ways to work with me',
    heading: 'Three shapes. *Pick the one that fits*.',
    items: [
      {
        number: '01',
        title: 'Build',
        body: 'I join as an operator and own an outcome end to end — usually 0→1 GTM, pricing, or the activation and retention loop. Founder-adjacent, hands in the product.',
        bullets: ['Full-time or embedded', 'Own a metric, not a task list', 'Weekly operating cadence'],
      },
      {
        number: '02',
        title: 'Advise',
        body: 'A short, sharp engagement: teardown of the funnel, the pricing, and the unit economics, ending in a written plan with a ranked list and the numbers behind the ranking.',
        bullets: ['2–6 week scope', 'Written deliverable, not a deck', 'One follow-up cycle included'],
      },
      {
        number: '03',
        title: 'Teach',
        body: 'Workshops and sessions for student builders and early teams on going from an idea to first paying users — the unglamorous parts that nobody puts in a case study.',
        bullets: ['Campuses and cohorts', 'Live teardowns', 'Free for student groups'],
      },
    ],
    workedLabel: 'Worked with',
    worked: [
      { name: 'rdfctest.in', note: 'Co-founder' },
      { name: 'The Bowl and Beyond', note: 'Co-founder' },
      { name: 'Alignerr (USA)', note: 'AI data' },
      { name: 'Sledding Technologies', note: 'Growth' },
      { name: 'Robin Hood Army', note: 'Volunteer' },
      { name: 'We The Leaders', note: 'Volunteer' },
    ],
  },

  /* -------------------------------------------------------------- ventures */
  ventures: {
    eyebrow: 'ventures',
    heading: 'Two companies I helped *start*.',
    intro: 'Both from zero. One scaled and closed, one is being built right now.',
    items: [
      {
        name: 'rdfctest.in',
        url: 'https://rdfctest.in',
        role: 'Co-Founder · Strategy & Growth',
        period: "Jul '24 — Dec '25",
        place: 'Remote',
        summary:
          'An exam-prep EdTech SaaS. I owned strategy end to end: the community that became the top of the funnel, the pricing that converted it, and the loops that kept people coming back.',
        outcomes: [
          'Built a 12,000-member community from zero and turned it into the acquisition channel',
          'Ran GTM and pricing experiments that converted 12K members into 600+ paid users at 5%',
          'Shipped activation and retention loops that held 1,100+ monthly actives and lifted 30-day retention',
          'Drove cross-functional execution across engineering, content and marketing on a weekly cadence',
          'Owned unit economics and budgets — every experiment had a cost and a payback number',
        ],
        metrics: [
          { value: '12K', label: 'community' },
          { value: '600+', label: 'paid users' },
          { value: '5%', label: 'conversion' },
          { value: '1,100+', label: 'MAU' },
        ],
        status: 'closed',
        tags: ['EdTech', 'SaaS', 'GTM', 'Pricing', 'Retention'],
      },
      {
        name: 'The Bowl and Beyond',
        url: '',
        role: 'Co-Founder',
        period: "Aug '26 — Present",
        place: 'Gurgaon',
        summary:
          'A purpose-led food brand built on a 1:5 community meal model — every bowl sold funds five meals. Currently in early operations.',
        outcomes: [
          'Took the brand 0→1: positioning, naming, and the 1:5 community meal model',
          'Validated demand through customer discovery before spending on inventory',
          'Structured early operations and supplier partnerships from scratch',
        ],
        metrics: [
          { value: '1:5', label: 'meal model' },
          { value: '0→1', label: 'stage' },
        ],
        status: 'building',
        tags: ['Consumer', 'Brand', 'Operations', 'Impact'],
      },
    ],
  },

  /* -------------------------------------------------------------- projects */
  projects: {
    eyebrow: 'projects & research',
    heading: 'Things I built to find out if they would work.',
    items: [
      {
        title: 'Customizable Security Automation System',
        kind: 'AI · Computer vision',
        period: "Jun '24 — Mar '25",
        body: 'An AI surveillance system that recognises 20+ object classes at 95%+ accuracy, with configurable automation and alert logic for residential, industrial and wildlife deployments.',
        highlights: ['95%+ accuracy', '20+ object classes', 'Configurable alert logic'],
        badge: '',
      },
      {
        title: 'LLM-based resource allocation for Beyond 5G',
        kind: 'Research',
        period: '2025',
        body: 'Research on using large language models to allocate network resources in Beyond-5G systems. Presented at ICA6NT 2025.',
        highlights: ['Best Paper Award', 'ICA6NT 2025'],
        badge: 'Best Paper · ICA6NT 2025',
      },
      {
        title: 'AI product size recognition',
        kind: 'Patent',
        period: '2023',
        body: 'A computer-vision system that infers product dimensions from imagery. Filed as a patent in India.',
        highlights: ['Filed', 'Computer vision'],
        badge: 'Patent E-2/583/2023-CHE',
      },
      {
        title: '360° Feedback Automation Software',
        kind: 'Internal tool',
        period: '2024',
        body: 'A feedback tool that automates multi-rater aggregation, cutting the manual tracking that made 360° reviews too expensive to run often.',
        highlights: ['Multi-rater aggregation', 'Manual tracking removed'],
        badge: '',
      },
    ],
  },

  /* --------------------------------------------------------- point of view */
  pov: {
    eyebrow: 'how i work',
    heading: 'The deck is the *smallest part*.',
    intro:
      'Six things I do on every engagement, in this order. None of them are impressive on their own. Together they are the difference between a product that grows and a product that has a good story.',
    items: [
      {
        number: '01',
        title: 'Write the contract first',
        body: 'Before anything ships, one page: what we are trying to make true, which number says it worked, and by when. If we cannot write it, we do not understand the problem yet.',
      },
      {
        number: '02',
        title: 'Set a cadence, not a deadline',
        body: 'A weekly loop — decide, ship, look at the number, decide again — beats a heroic quarter every time. The cadence is the thing that keeps working after I leave.',
      },
      {
        number: '03',
        title: 'Know the unit economics on day one',
        body: 'What one customer costs, what one customer returns, and how long the gap lasts. Every growth idea gets priced against that before it gets built.',
      },
      {
        number: '04',
        title: 'Instrument the whole funnel',
        body: 'Signups are a vanity number until you can see where the drop is. I instrument end to end so the argument about what to fix becomes a five-minute look at a chart.',
      },
      {
        number: '05',
        title: 'Build the retention loop early',
        body: 'Acquisition without retention is a bucket with a hole and a bigger tap. The loop — the reason someone comes back in week three — is a product decision, not a campaign.',
      },
      {
        number: '06',
        title: 'Own distribution yourself',
        body: 'The 12K community at rdfctest.in was not a marketing channel we rented. We built it, so the funnel started where we controlled it. That is the whole reason 5% conversion was possible.',
      },
    ],
    pullQuote:
      'Most teams do not have a strategy problem. They have a "nobody wrote down which number matters" problem.',
  },

  /* ------------------------------------------------------------- contrasts */
  contrasts: {
    eyebrow: 'what changes',
    heading: 'Before I show up → *after*.',
    items: [
      { before: 'Vanity signups', after: 'Paid conversion, tracked weekly' },
      { before: 'Gut-feel roadmap', after: 'Funnel and cohort data, ranked' },
      { before: 'Hero effort', after: 'An operating cadence anyone can run' },
      { before: 'Feature list', after: 'Unit economics you can defend' },
      { before: 'Rented distribution', after: 'A channel you own' },
    ],
  },

  /* --------------------------------------------------------------- gallery */
  gallery: {
    eyebrow: 'in the room',
    heading: 'Some of it happened offline.',
    photos: [],
  },

  /* --------------------------------------------------------------- writing */
  writing: {
    eyebrow: 'writing',
    heading: 'Notes from building.',
    intro:
      'Short pieces on going 0→1 — funnels, pricing, retention, and the parts of operating nobody writes case studies about.',
    posts: [],
    cta: { label: 'Follow along on LinkedIn', href: 'https://www.linkedin.com/in/iamkirankumarg/' },
  },

  /* -------------------------------------------------------------- one card */
  oneCard: {
    heading: 'Why me, on one card',
    bullets: [
      'I have done the 0→1 twice, with the numbers to show for it — 12K community, 600+ paying users, 5% conversion.',
      'I am equally comfortable in a pricing model and in a Python notebook, so I do not need a translator between strategy and engineering.',
      'I default to written clarity: one page, one metric, one date. Everything else is negotiable.',
      'I take ownership of the outcome, not the task list. If the number does not move, that is mine.',
    ],
    signature: 'Kiran',
  },

  /* --------------------------------------------------------------- closing */
  closing: {
    heading: "Let's build",
    body: 'If you are taking something from zero to one — or trying to work out why it stalled at one — I would like to hear about it. Short email, no deck required.',
    primaryCta: { label: 'kiran.kumar2028@mastersunion.org', href: 'mailto:kiran.kumar2028@mastersunion.org' },
    secondaryCta: { label: '+91 9092112941', href: 'tel:+919092112941' },
    note: 'I reply to everything within two days.',
  },

  /* ---------------------------------------------------------------- footer */
  footer: {
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/iamkirankumarg/' },
      { label: 'Email', href: 'mailto:kiran.kumar2028@mastersunion.org' },
    ],
    colophon: 'Built in Next.js. Set in Bricolage Grotesque and Inter.',
  },
}
