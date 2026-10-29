export interface DomainDefinition {
  id: string;
  name: string;
  category: 'it' | 'non-it';
  icon: string;
  badgeColor: string;
  description: string;
  sampleJobTitles: string[];
  keyShortlistMetrics: string[];
  sampleBullet: {
    role: string;
    before: string;
    after: string;
    rationale: string;
  };
  sampleJobDescription: {
    title: string;
    description: string;
  };
}

export const DOMAINS: DomainDefinition[] = [
  {
    id: 'it-software',
    name: 'IT & Software Engineering',
    category: 'it',
    icon: 'Code',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Software development, web/mobile apps, DevOps, cloud architecture, and data engineering.',
    sampleJobTitles: [
      'Frontend / Full-Stack Developer',
      'Backend Engineer',
      'DevOps / Cloud Engineer',
      'Mobile App Developer (iOS/Android)',
      'Data Engineer / Scientist',
      'QA & Automation Engineer'
    ],
    keyShortlistMetrics: [
      'Core Web Vitals & page load latency (ms/sec)',
      'System uptime & defect reduction %',
      'Deployment frequency & CI/CD pipeline speed',
      'Scale: requests per second, database query optimization'
    ],
    sampleBullet: {
      role: 'Frontend Engineer',
      before: 'Built a web application for user authentication and dashboards.',
      after: 'Architected and shipped a responsive React/TypeScript customer dashboard for 45,000 MAUs, reducing initial page load latency by 42% and slashing bug ticket volume by 28%.',
      rationale: 'Specifies tech stack, user scale (45k MAU), latency reduction (42%), and defect drop (28%).'
    },
    sampleJobDescription: {
      title: 'Full-Stack Software Engineer (React / Node / TypeScript)',
      description: `Responsibilities:
- Build and maintain scalable full-stack web applications using React, TypeScript, Node.js, and PostgreSQL.
- Design modular REST and GraphQL APIs with robust error handling and automated test coverage (Jest, Cypress).
- Collaborate in Agile sprints, conducting code reviews and optimizing cloud infrastructure on AWS.
Qualifications:
- 2+ years experience building production web applications with React and TypeScript.
- Strong knowledge of state management, responsive UI design, CI/CD, and relational database schemas.`
    }
  },
  {
    id: 'sales-bd',
    name: 'Sales & Business Development',
    category: 'non-it',
    icon: 'TrendingUp',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Enterprise B2B sales, account management, SDR/BDR outbound, pipeline generation, and revenue closing.',
    sampleJobTitles: [
      'Enterprise Account Executive (AE)',
      'Business Development Representative (BDR)',
      'Sales Director / VP of Sales',
      'Key Account Manager',
      'Customer Relationship Manager'
    ],
    keyShortlistMetrics: [
      'Quota attainment % (e.g. 140% of annual plan)',
      'Total ARR / Revenue closed ($1.2M+)',
      'Average deal size & sales cycle velocity (days)',
      'Outbound pipeline generated & win rate %'
    ],
    sampleBullet: {
      role: 'Senior Account Executive',
      before: 'Responsible for selling SaaS software to mid-market companies and doing demos.',
      after: 'Closed $1.45M in new ARR across 38 mid-market enterprise deals, exceeding annual sales quota by 132% and reducing average sales cycle from 75 to 48 days via consultative value selling.',
      rationale: 'Highlights quota attainment (132%), exact revenue ($1.45M), deal volume (38), and sales cycle velocity.'
    },
    sampleJobDescription: {
      title: 'Enterprise Account Executive (B2B SaaS)',
      description: `Responsibilities:
- Drive end-to-end B2B sales cycles from discovery through proposal and contract execution for mid-market and enterprise accounts ($50k-$200k ACV).
- Consistently meet or exceed quarterly and annual quota targets ($1M+ ARR).
- Partner with Solution Architects and Customer Success to ensure seamless onboarding and account expansion.
Qualifications:
- 3+ years quota-carrying SaaS sales experience with verifiable track record of achieving >100% of plan.
- Expertise in Salesforce, MEDDPICC/Challenger sales methodologies, and executive C-suite presentations.`
    }
  },
  {
    id: 'healthcare-nursing',
    name: 'Healthcare & Clinical Nursing',
    category: 'non-it',
    icon: 'HeartPulse',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Registered nurses, clinical care specialists, patient triage, hospital administration, and healthcare compliance.',
    sampleJobTitles: [
      'Registered Nurse (RN) - ICU / ER',
      'Nurse Practitioner (NP)',
      'Clinical Care Coordinator',
      'Healthcare Administrator',
      'Medical Assistant / Telehealth Specialist'
    ],
    keyShortlistMetrics: [
      'Patient load & nurse-to-patient ratios managed',
      'Medication error reduction & safety compliance %',
      'Patient satisfaction (HCAHPS) scores',
      'Emergency response time & triage accuracy'
    ],
    sampleBullet: {
      role: 'Staff Registered Nurse (ICU)',
      before: 'Administered medications and took care of intensive care patients.',
      after: 'Managed high-acuity care for 4-6 critical ICU patients per shift, administering IV infusions and continuous telemetry with zero medication administration errors across 18 months, boosting unit HCAHPS satisfaction by 16%.',
      rationale: 'Shows acuity level, nurse-to-patient ratio, safety perfection (zero errors), and measurable patient satisfaction.'
    },
    sampleJobDescription: {
      title: 'Registered Nurse (RN) - Emergency & Acute Care',
      description: `Responsibilities:
- Provide high-quality emergency and acute nursing care, assessing vital signs, triaging incoming trauma cases, and executing rapid physician care plans.
- Document clinical notes in Epic EHR with 100% regulatory and HIPAA compliance.
- Educate patients and families on post-discharge management and medication adherence.
Qualifications:
- Active RN license in good standing (BSN preferred); BLS, ACLS, and PALS certified.
- 1-3 years clinical experience in emergency, critical care, or acute hospital settings.`
    }
  },
  {
    id: 'finance-accounting',
    name: 'Finance, Banking & Accounting',
    category: 'non-it',
    icon: 'DollarSign',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Financial analysis, corporate accounting, budgeting, P&L management, audit, tax, and investment planning.',
    sampleJobTitles: [
      'Financial Analyst / FP&A Manager',
      'Corporate Controller / Senior Accountant',
      'Investment Banking Analyst',
      'Internal Auditor / Tax Specialist',
      'Finance Operations Lead'
    ],
    keyShortlistMetrics: [
      'Budget size managed ($5M - $100M+)',
      'Cost reduction & operational expense savings ($ and %)',
      'Month-end close cycle time reduction (e.g. from 10 to 4 days)',
      'Forecast variance accuracy (within 2-3%)'
    ],
    sampleBullet: {
      role: 'Senior Financial Analyst',
      before: 'Helped prepare monthly budgets and financial forecasts in Excel.',
      after: 'Spearheaded corporate FP&A modeling for a $48M operating budget, identifying $1.8M in redundant vendor spend and reducing monthly close cycle time from 10 business days to 5 days.',
      rationale: 'Quantifies budget scale ($48M), concrete cost savings ($1.8M), and 50% speedup in month-end close.'
    },
    sampleJobDescription: {
      title: 'Senior Financial Analyst (FP&A & Corporate Modeling)',
      description: `Responsibilities:
- Build dynamic multi-year financial models, cash flow forecasts, and variance analyses for senior executive leadership.
- Partner with department heads to manage the $35M annual departmental budget and track CapEx/OpEx.
- Automate recurring monthly financial reporting packages using Advanced Excel, Power BI, and NetSuite/SAP.
Qualifications:
- Bachelor's in Finance, Accounting, or Economics (CPA or CFA in progress preferred).
- 3+ years experience in corporate FP&A or public accounting with strong GAAP comprehension.`
    }
  },
  {
    id: 'marketing-communications',
    name: 'Marketing, Growth & Brand',
    category: 'non-it',
    icon: 'Megaphone',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Demand generation, digital advertising, content strategy, brand communications, SEO, and product marketing.',
    sampleJobTitles: [
      'Growth Marketing Manager',
      'Digital Ads / PPC Specialist (Google & Meta)',
      'Content Marketing / SEO Strategist',
      'Brand & Communications Manager',
      'Product Marketing Manager (PMM)'
    ],
    keyShortlistMetrics: [
      'Customer Acquisition Cost (CAC) reduction %',
      'Return on Ad Spend (ROAS, e.g. 4.2x)',
      'Marketing Qualified Leads (MQLs) generated',
      'Organic search traffic & conversion rate gains'
    ],
    sampleBullet: {
      role: 'Growth Marketing Manager',
      before: 'Ran Google Ads and social media campaigns to get more leads.',
      after: 'Managed $650K annual paid acquisition budget across Google Ads and LinkedIn, generating 4,200+ qualified MQLs while lowering Customer Acquisition Cost (CAC) by 27% and scaling ROAS to 4.1x.',
      rationale: 'Includes exact budget ($650k), lead count (4,200), CAC efficiency (-27%), and ROAS metric (4.1x).'
    },
    sampleJobDescription: {
      title: 'Senior Growth Marketing Manager (B2B Demand Gen)',
      description: `Responsibilities:
- Own multi-channel acquisition strategy across paid search, paid social, SEO, and email lifecycle automation.
- Partner with Sales to optimize lead scoring, conversion funnels, and pipeline attribution in HubSpot and Salesforce.
- Execute systematic A/B testing on landing pages and ad copy to maximize conversion efficiency.
Qualifications:
- 3+ years proven experience managing $500k+ digital marketing budgets with demonstrable ROI.
- Deep expertise in Google Ads, GA4, Meta Ads Manager, HubSpot, and SEMrush.`
    }
  },
  {
    id: 'operations-supply-chain',
    name: 'Operations, Logistics & Supply Chain',
    category: 'non-it',
    icon: 'Package',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Supply chain management, warehouse operations, procurement, vendor relations, and process optimization.',
    sampleJobTitles: [
      'Operations Manager / Director of Ops',
      'Supply Chain Analyst / Planner',
      'Logistics & Fulfillment Coordinator',
      'Procurement & Sourcing Specialist',
      'Continuous Improvement / Lean Six Sigma Lead'
    ],
    keyShortlistMetrics: [
      'Order fulfillment speed & on-time delivery rate (OTD %)',
      'Inventory turnover & holding cost reduction',
      'Vendor cost savings negotiated ($)',
      'Process cycle time reduction via Lean/Six Sigma'
    ],
    sampleBullet: {
      role: 'Operations & Logistics Manager',
      before: 'Managed warehouse inventory and handled vendor shipping schedules.',
      after: 'Restructured regional warehouse fulfillment workflows across 3 distribution hubs, raising On-Time In-Full (OTIF) delivery from 88% to 98.4% and cutting annual freight overhead by $420,000.',
      rationale: 'Shows scope (3 hubs), delivery benchmark (88% to 98.4%), and concrete dollar savings ($420k).'
    },
    sampleJobDescription: {
      title: 'Operations & Supply Chain Manager',
      description: `Responsibilities:
- Oversee end-to-end supply chain planning, procurement, and warehouse inventory management across regional distribution centers.
- Implement Kaizen/Lean Six Sigma initiatives to reduce fulfillment lead time and eliminate shipment bottlenecks.
- Negotiate 3PL vendor contracts and monitor vendor SLAs and KPI scorecards.
Qualifications:
- 3-5 years experience in supply chain, logistics, or plant operations.
- Strong knowledge of ERP systems (SAP, Oracle, NetSuite), Lean principles, and advanced inventory modeling.`
    }
  },
  {
    id: 'hr-talent',
    name: 'Human Resources & Talent Acquisition',
    category: 'non-it',
    icon: 'Users',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Recruitment, employee relations, talent development, HR operations, total rewards, and company culture.',
    sampleJobTitles: [
      'Senior Talent Acquisition Partner / Recruiter',
      'HR Business Partner (HRBP)',
      'People Operations Specialist',
      'Compensation & Benefits Analyst',
      'Learning & Organizational Development Manager'
    ],
    keyShortlistMetrics: [
      'Time-to-hire reduction (e.g. from 55 to 28 days)',
      'Annual hires placed & offer acceptance rate (92%+)',
      'Employee turnover reduction & retention gains',
      'eNPS & employee engagement survey improvements'
    ],
    sampleBullet: {
      role: 'Senior Talent Acquisition Lead',
      before: 'Recruited candidates for various open roles and did phone screens.',
      after: 'Headed full-cycle recruiting for 70+ technical and corporate positions across 4 departments, decreasing average time-to-hire from 52 to 31 days and achieving a 94% offer acceptance rate.',
      rationale: 'Shows hire volume (70+), dramatic time-to-fill reduction (40%), and outstanding acceptance rate (94%).'
    },
    sampleJobDescription: {
      title: 'Senior Talent Acquisition Partner / HR Specialist',
      description: `Responsibilities:
- Drive full-lifecycle recruiting across commercial, corporate, and specialized technical departments.
- Partner with hiring executives to define role specs, salary bands, and structured competency interview scorecards.
- Implement proactive candidate sourcing strategies that expand diversity pipelines by 30%.
Qualifications:
- 3+ years full-cycle recruitment experience in corporate or high-growth environments.
- Proficiency in Greenhouse/Workday/Lever ATS, LinkedIn Recruiter, and structured behavioral interview frameworks.`
    }
  },
  {
    id: 'customer-success',
    name: 'Customer Success & Client Support',
    category: 'non-it',
    icon: 'Headphones',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Client onboarding, CSAT/NPS optimization, churn mitigation, account renewals, and technical customer support.',
    sampleJobTitles: [
      'Customer Success Manager (CSM)',
      'Client Onboarding Specialist',
      'Customer Support Team Lead',
      'Account Retention Specialist',
      'Director of Client Experience'
    ],
    keyShortlistMetrics: [
      'Net Revenue Retention (NRR, e.g. 115%)',
      'Gross customer churn reduction %',
      'CSAT (Customer Satisfaction) & NPS scores (96%+)',
      'First Response Time (FRT) & Resolution Time'
    ],
    sampleBullet: {
      role: 'Customer Success Manager',
      before: 'Assisted clients with questions and tried to keep them happy.',
      after: 'Managed a $4.2M ARR portfolio of 65 enterprise clients, delivering a 118% Net Revenue Retention (NRR) rate and reducing quarterly gross logo churn from 8.2% to 2.4% through proactive health scoring.',
      rationale: 'States book of business ($4.2M ARR), NRR (118%), and huge churn drop (8.2% to 2.4%).'
    },
    sampleJobDescription: {
      title: 'Enterprise Customer Success Manager',
      description: `Responsibilities:
- Manage customer lifecycle from post-sales kickoff, onboarding, and adoption to annual renewal and account upsell.
- Drive product adoption metrics, conducting quarterly business reviews (QBRs) with C-level customer champions.
- Identify at-risk accounts early and implement targeted turnaround playbooks.
Qualifications:
- 2+ years experience in B2B Customer Success or Account Management.
- Track record of achieving >100% NRR and deep experience with Gainsight, Salesforce, and Zendesk.`
    }
  },
  {
    id: 'education-teaching',
    name: 'Education, Teaching & Academic',
    category: 'non-it',
    icon: 'GraduationCap',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Instructional design, classroom leadership, curriculum development, student achievement, and academic coaching.',
    sampleJobTitles: [
      'High School / Middle School Educator',
      'Instructional Designer & Curriculum Specialist',
      'University Lecturer / Adjunct Professor',
      'Academic Advisor / College Counselor',
      'Corporate Training & Development Specialist'
    ],
    keyShortlistMetrics: [
      'Student pass rates & standardized test score gains %',
      'Curriculum adoption across classrooms or districts',
      'Student retention & graduation rates',
      'Parent/student satisfaction & engagement metrics'
    ],
    sampleBullet: {
      role: 'Secondary Department Lead & Educator',
      before: 'Taught classes and made lesson plans for students.',
      after: 'Designed and implemented an inquiry-based STEM curriculum for 140+ students across 5 classes, elevating state exam proficiency pass rates from 72% to 89% and mentoring 4 junior educators.',
      rationale: 'Shows student volume (140+), proficiency score jump (+17%), and leadership/mentorship role.'
    },
    sampleJobDescription: {
      title: 'Curriculum Specialist & Lead Instructor',
      description: `Responsibilities:
- Develop differentiated lesson plans and student-centered curriculum aligned with state/national academic benchmarks.
- Analyze standardized assessment data to tailor remedial interventions and accelerated learning programs.
- Foster parent-teacher collaboration and lead quarterly professional development workshops for instructional staff.
Qualifications:
- Bachelor's or Master's in Education or specialized field; valid state teaching certification.
- 2+ years instructional classroom experience with demonstrated record of student academic growth.`
    }
  },
  {
    id: 'legal-compliance',
    name: 'Legal, Compliance & Risk Management',
    category: 'non-it',
    icon: 'Shield',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Contract negotiation, regulatory compliance, corporate governance, intellectual property, and enterprise risk management.',
    sampleJobTitles: [
      'Corporate Counsel / Legal Associate',
      'Compliance & Regulatory Officer',
      'Contract Manager / Specialist',
      'Risk Management Analyst',
      'Paralegal / Legal Operations Lead'
    ],
    keyShortlistMetrics: [
      'Contract turnaround cycle time reduction (days)',
      'Regulatory audit pass rate (100% clean findings)',
      'Enterprise legal risk mitigation & cost avoidance ($)',
      'Volume of commercial agreements reviewed & negotiated'
    ],
    sampleBullet: {
      role: 'Corporate Contracts Specialist',
      before: 'Reviewed commercial contracts and assisted the legal department.',
      after: 'Negotiated and executed 240+ commercial vendor and SaaS agreements valued at $65M+, standardizing redline templates to cut contract review turnaround from 14 to 4 business days with zero compliance breaches.',
      rationale: 'Quantifies contract count (240+), deal value ($65M+), 70% cycle time reduction, and pristine risk record.'
    },
    sampleJobDescription: {
      title: 'Corporate Legal & Compliance Specialist',
      description: `Responsibilities:
- Draft, review, and negotiate master service agreements (MSAs), statements of work (SOWs), and NDAs with enterprise partners.
- Ensure corporate adherence to industry regulations (GDPR, CCPA, SOX) and maintain audit documentation.
- Implement contract lifecycle management (CLM) software to streamline stakeholder approval workflows.
Qualifications:
- J.D. or Bachelor's in Legal Studies / Business; paralegal or contract certification.
- 2-4 years corporate legal or contract negotiation experience.`
    }
  }
];

export function getDomainById(id: string): DomainDefinition {
  return DOMAINS.find((d) => d.id === id) || DOMAINS[0];
}

export function detectDomainFromResumeText(text: string): DomainDefinition {
  const lower = text.toLowerCase();

  // Scoring per domain based on keywords
  const scores: Record<string, number> = {
    'it-software': 0,
    'sales-bd': 0,
    'healthcare-nursing': 0,
    'finance-accounting': 0,
    'marketing-communications': 0,
    'operations-supply-chain': 0,
    'hr-talent': 0,
    'customer-success': 0,
    'education-teaching': 0,
    'legal-compliance': 0
  };

  // IT keywords
  if (/\b(javascript|react|python|java|c\+\+|node|frontend|backend|fullstack|developer|software engineer|github|api|docker|kubernetes|aws|css|html|sql|database|devops)\b/i.test(lower)) {
    const matches = lower.match(/\b(javascript|react|python|java|node|frontend|backend|fullstack|developer|software engineer|github|api|docker|kubernetes|css|html|sql)\b/gi) || [];
    scores['it-software'] += matches.length * 2;
  }

  // Sales keywords
  if (/\b(quota|pipeline|b2b|arr|mrr|prospecting|cold calling|salesforce|closing|deal size|account executive|sdr|bdr|outbound|commission|revenue generation)\b/i.test(lower)) {
    const matches = lower.match(/\b(quota|pipeline|b2b|arr|salesforce|closing|deal|account executive|sdr|bdr|outbound|sales)\b/gi) || [];
    scores['sales-bd'] += matches.length * 3;
  }

  // Healthcare keywords
  if (/\b(rn|registered nurse|patient|clinical|icu|er|hospital|triage|medication|vital signs|hcahps|bls|acls|ehr|emr|epic|nursing|healthcare|physician)\b/i.test(lower)) {
    const matches = lower.match(/\b(rn|nurse|patient|clinical|icu|er|hospital|triage|medication|vital signs|nursing|healthcare)\b/gi) || [];
    scores['healthcare-nursing'] += matches.length * 3;
  }

  // Finance keywords
  if (/\b(fp&a|financial modeling|p&l|ebitda|gaap|cpa|audit|tax|forecast|budget|cash flow|balance sheet|reconciliation|gl|ledger|valuation)\b/i.test(lower)) {
    const matches = lower.match(/\b(financial|p&l|ebitda|gaap|cpa|audit|tax|forecast|budget|cash flow|accounting|ledger)\b/gi) || [];
    scores['finance-accounting'] += matches.length * 3;
  }

  // Marketing keywords
  if (/\b(seo|sem|roas|cac|google ads|meta ads|campaign|mql|sql|content marketing|growth marketing|branding|hubspot|copywriting|ctr|conversion rate)\b/i.test(lower)) {
    const matches = lower.match(/\b(seo|sem|roas|cac|google ads|meta ads|campaign|mql|content marketing|growth marketing|branding|hubspot)\b/gi) || [];
    scores['marketing-communications'] += matches.length * 3;
  }

  // Operations keywords
  if (/\b(supply chain|logistics|warehouse|procurement|inventory|fulfillment|3pl|lean six sigma|kaizen|vendor management|freight|distribution)\b/i.test(lower)) {
    const matches = lower.match(/\b(supply chain|logistics|warehouse|procurement|inventory|fulfillment|3pl|lean six sigma|vendor)\b/gi) || [];
    scores['operations-supply-chain'] += matches.length * 3;
  }

  // HR keywords
  if (/\b(recruiting|recruiter|talent acquisition|onboarding|enps|time-to-hire|turnover|retention|human resources|hrbp|workday|greenhouse|shrm|employee relations)\b/i.test(lower)) {
    const matches = lower.match(/\b(recruiting|recruiter|talent acquisition|onboarding|time-to-hire|turnover|retention|human resources|hrbp|workday)\b/gi) || [];
    scores['hr-talent'] += matches.length * 3;
  }

  // Customer Success keywords
  if (/\b(csat|nps|churn|net revenue retention|nrr|customer success|client success|zendesk|onboarding|support tickets|resolution time|qbr)\b/i.test(lower)) {
    const matches = lower.match(/\b(csat|nps|churn|net revenue retention|nrr|customer success|client success|zendesk|qbr)\b/gi) || [];
    scores['customer-success'] += matches.length * 3;
  }

  // Education keywords
  if (/\b(curriculum|instructional|classroom|students|teaching|pedagogy|lesson plans|educator|teacher|academic|higher education|grading|school)\b/i.test(lower)) {
    const matches = lower.match(/\b(curriculum|instructional|classroom|students|teaching|educator|teacher|academic|lesson)\b/gi) || [];
    scores['education-teaching'] += matches.length * 3;
  }

  // Legal keywords
  if (/\b(contract|compliance|regulatory|paralegal|counsel|nda|msa|sow|gdpr|ccpa|litigation|statutory|risk mitigation|attorney|juris)\b/i.test(lower)) {
    const matches = lower.match(/\b(contract|compliance|regulatory|paralegal|counsel|nda|msa|gdpr|litigation|risk mitigation)\b/gi) || [];
    scores['legal-compliance'] += matches.length * 3;
  }

  let bestDomain = 'it-software';
  let highestScore = 0;

  for (const [domainId, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestDomain = domainId;
    }
  }

  return getDomainById(bestDomain);
}
