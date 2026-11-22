// Sprint 2 knowledge base and matching fixtures.
// Everything here is synthetic classroom data. None of it is official university policy
// and none of it describes a real student or employer.

/** Version label shown wherever the approved FAQ is used. */
export const FAQ_VERSION = "FAQ v1 (17 Nov 2026)";

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  /** Where the answer comes from: the app's own rules or the course brief. */
  source: string;
  /** Extra words a student might use for the same question (used by the offline lookup). */
  keywords: string[];
}

/**
 * The approved knowledge base. The chatbot may only answer from these entries
 * (plus the student's synthetic profile and the matching output).
 */
export const FAQ: FaqEntry[] = [
  {
    id: "FAQ-01",
    category: "Eligibility",
    question: "Who can apply for an internship through IPP?",
    answer:
      "Any student whose IPP profile shows the status Eligible can apply to approved opportunities. Eligibility is checked by the co-op office, not by the app or the chatbot. If your profile does not show Eligible, contact the co-op office.",
    source: "IPP demo rules (Student view) and course brief P01",
    keywords: ["eligible", "eligibility", "who", "can", "allowed", "qualify", "requirements"],
  },
  {
    id: "FAQ-02",
    category: "Applying",
    question: "How do I apply to an opportunity?",
    answer:
      "Open Student, go to Opportunities, choose View & apply on an approved opportunity and press Confirm application. IPP creates an application ID (for example APP-028) with status Submitted. You can apply to each opportunity once.",
    source: "IPP demo rules (Student view, acceptance tests STU-01 to STU-04)",
    keywords: ["apply", "application", "submit", "how", "steps", "confirm"],
  },
  {
    id: "FAQ-03",
    category: "Placement",
    question: "Does submitting an application mean I have a placement?",
    answer:
      "No. Submitting an application does not approve a placement. Your placement status stays Not placed until the university records a confirmed placement. Official placements are always approved by people.",
    source: "IPP demo rules (placement status) and course brief synthetic thread",
    keywords: ["placed", "placement", "accepted", "confirmed", "offer", "guarantee", "approve"],
  },
  {
    id: "FAQ-04",
    category: "Opportunities",
    question: "Why can't I see some opportunities?",
    answer:
      "Students only see opportunities that a University Administrator has approved. New employer submissions stay Pending Review and are hidden until they are approved.",
    source: "IPP demo rules (University Administrator approval)",
    keywords: [
      "see",
      "visible",
      "missing",
      "hidden",
      "pending",
      "listings",
      "opportunities",
      "where",
    ],
  },
  {
    id: "FAQ-05",
    category: "Recommendations",
    question: "How are recommended internships chosen?",
    answer:
      "The matching engine compares your skills, interests and work preferences with each approved listing and shows the top three with reasons and skill gaps. Skills you declared yourself count less until evidence is reviewed. Eligibility is checked separately and is not part of the ranking. A recommendation is advice, not a placement.",
    source: "Sprint 2 matching rules (docs/sprint-2/matching-rules.md)",
    keywords: [
      "recommend",
      "recommended",
      "recommendation",
      "match",
      "matching",
      "ranked",
      "ranking",
      "chosen",
      "score",
      "why",
    ],
  },
  {
    id: "FAQ-06",
    category: "After applying",
    question: "What happens after I apply?",
    answer:
      "Your application appears to the Faculty Reviewer with the review status Available for review. You can follow it under My applications. Employer responses and placement confirmation come later and are recorded by people.",
    source: "IPP demo rules (Faculty Reviewer view)",
    keywords: ["after", "next", "review", "reviewer", "faculty", "status", "track", "follow"],
  },
  {
    id: "FAQ-07",
    category: "Profile and skills",
    question: "How do my skills get verified?",
    answer:
      "Skills you add yourself are marked self-declared. A skill becomes reviewed only after a reviewer checks your evidence, for example Jira skill SK-JIRA-01 with evidence E-JIRA-01. Until then it counts less in recommendations.",
    source: "Course brief synthetic thread (SK-JIRA-01, E-JIRA-01) and P06 handoff",
    keywords: [
      "skills",
      "skill",
      "verify",
      "verified",
      "evidence",
      "jira",
      "self-declared",
      "profile",
      "update",
    ],
  },
  {
    id: "FAQ-08",
    category: "Help",
    question: "Who do I contact if my question is not answered here?",
    answer:
      "Contact the co-op office. The chatbot only answers from this approved FAQ and does not guess about policy, pay, visas, grades or deadlines.",
    source: "Sprint 2 chatbot safeguard (human handoff)",
    keywords: ["contact", "help", "office", "human", "person", "support", "question"],
  },
];

/** Shared skill vocabulary: canonical skill IDs and the terms that mean the same skill. */
export interface SkillTerm {
  id: string;
  label: string;
  synonyms: string[];
}

export const SKILL_VOCABULARY: SkillTerm[] = [
  {
    id: "SK-PY-01",
    label: "Python",
    synonyms: ["python", "python programming", "python 3", "pandas"],
  },
  {
    id: "SK-SQL-01",
    label: "SQL",
    synonyms: ["sql", "mysql", "postgresql", "postgres", "database queries"],
  },
  {
    id: "SK-EXCEL-01",
    label: "Spreadsheets",
    synonyms: ["excel", "microsoft excel", "spreadsheets", "google sheets"],
  },
  {
    id: "SK-VIZ-01",
    label: "Data visualization",
    synonyms: [
      "data visualization",
      "data visualisation",
      "dashboards",
      "dashboard",
      "tableau",
      "power bi",
      "powerbi",
    ],
  },
  { id: "SK-JIRA-01", label: "Jira", synonyms: ["jira", "jira software"] },
  {
    id: "SK-ML-01",
    label: "Machine learning",
    synonyms: ["machine learning", "scikit-learn", "sklearn"],
  },
  { id: "SK-STAT-01", label: "Statistics", synonyms: ["statistics", "statistical analysis"] },
  {
    id: "SK-UXR-01",
    label: "User research",
    synonyms: ["user research", "ux research", "usability testing"],
  },
  {
    id: "SK-PROTO-01",
    label: "Prototyping",
    synonyms: ["prototyping", "prototype", "wireframing", "wireframes"],
  },
  { id: "SK-FIGMA-01", label: "Figma", synonyms: ["figma"] },
  { id: "SK-JS-01", label: "JavaScript", synonyms: ["javascript", "typescript", "react"] },
  {
    id: "SK-TEST-01",
    label: "Software testing",
    synonyms: [
      "software testing",
      "unit testing",
      "test automation",
      "quality assurance",
      "qa testing",
    ],
  },
  { id: "SK-GIT-01", label: "Git", synonyms: ["git", "github", "version control"] },
  {
    id: "SK-COMM-01",
    label: "Communication",
    synonyms: [
      "communication",
      "presentation",
      "presentations",
      "public speaking",
      "report writing",
    ],
  },
];

export type SkillStatus = "Reviewed" | "Self-declared";

export interface ProfileSkill {
  /** The skill as the student typed it (before data preparation). */
  raw: string;
  status: SkillStatus;
  evidence_id?: string;
}

export type WorkModePref = "On-site" | "Hybrid" | "Remote";

/** Synthetic student profile used by the matching engine (Sprint 2 fixture). */
export interface MatchProfile {
  student_id: string;
  display_name: string;
  profile_version: number;
  program: string;
  goals: string;
  interests: string[];
  availability: string | null;
  preferred_work_mode: WorkModePref | null;
  preferred_location: string | null;
  skills: ProfileSkill[];
  eligibility_status: "Eligible" | "Not recorded";
}

export const SAMPLE_PROFILES: MatchProfile[] = [
  {
    student_id: "COOP-B001",
    display_name: "Layla Hassan",
    profile_version: 1,
    program: "BSc Business Analytics (synthetic)",
    goals: "An aviation analytics placement in Dubai",
    interests: ["Data & analytics", "Aviation"],
    availability: "Summer 2027, 12 weeks",
    preferred_work_mode: "On-site",
    preferred_location: "Dubai",
    skills: [
      { raw: "Python programming", status: "Reviewed" },
      { raw: "SQL", status: "Reviewed" },
      { raw: "Tableau", status: "Self-declared" },
      { raw: "Jira", status: "Self-declared", evidence_id: "E-JIRA-01" },
    ],
    eligibility_status: "Eligible",
  },
  {
    student_id: "COOP-S201",
    display_name: "Noah Petrov",
    profile_version: 1,
    program: "BSc Computer Science (synthetic)",
    goals: "A user experience role where I can run research and design screens",
    interests: ["Design / UX"],
    availability: "Summer 2027, 10 weeks",
    preferred_work_mode: "Remote",
    preferred_location: null,
    skills: [
      { raw: "UX research", status: "Reviewed" },
      { raw: "Wireframing", status: "Self-declared" },
      { raw: "Figma", status: "Reviewed" },
      { raw: "Public speaking", status: "Self-declared" },
    ],
    eligibility_status: "Eligible",
  },
  {
    student_id: "COOP-S202",
    display_name: "Mei Tanaka",
    profile_version: 1,
    program: "BSc Computer Science (synthetic)",
    goals: "Software engineering experience on a product team",
    interests: ["Software"],
    availability: null,
    preferred_work_mode: null,
    preferred_location: null,
    skills: [
      { raw: "JavaScript", status: "Reviewed" },
      { raw: "Unit testing", status: "Self-declared" },
      { raw: "GitHub", status: "Reviewed" },
      { raw: "Jira software", status: "Self-declared" },
    ],
    eligibility_status: "Eligible",
  },
  {
    student_id: "COOP-S203",
    display_name: "Omar Haddad",
    profile_version: 1,
    program: "BSc Business (synthetic)",
    goals: "A marketing or communications internship",
    interests: ["Marketing"],
    availability: "Summer 2027, 8 weeks",
    preferred_work_mode: "Hybrid",
    preferred_location: "Dubai",
    skills: [
      { raw: "Presentations", status: "Self-declared" },
      { raw: "Google Sheets", status: "Self-declared" },
      { raw: "Social media", status: "Self-declared" },
    ],
    eligibility_status: "Not recorded",
  },
];

/** Structured requirements for a listing (the employer's skills and field). */
export interface RequirementProfile {
  field: string;
  sector?: string;
  required: string[];
  desirable: string[];
}

/** Requirement profiles for the listings that exist in the IPP store. */
export const STORE_REQUIREMENTS: Record<string, RequirementProfile> = {
  "OP-026": {
    field: "Design / UX",
    required: ["SK-UXR-01", "SK-PROTO-01"],
    desirable: ["SK-FIGMA-01", "SK-COMM-01"],
  },
  "OP-027": {
    field: "Data & analytics",
    required: ["SK-SQL-01", "SK-EXCEL-01"],
    desirable: ["SK-VIZ-01", "SK-PY-01"],
  },
  "OP-028": {
    field: "Data & analytics",
    sector: "Aviation",
    required: ["SK-PY-01", "SK-SQL-01"],
    desirable: ["SK-JIRA-01", "SK-VIZ-01"],
  },
};

/** A listing the matching engine can rank. */
export interface MatchListing {
  opportunity_id: string;
  title: string;
  organization_name: string;
  location: string;
  work_mode: WorkModePref;
  duration: string;
  requirements: RequirementProfile;
  /** "store": approved in IPP and open for applications; "sample": Sprint 2 matching dataset only. */
  origin: "store" | "sample";
  /** True when requirements were inferred from the listing text because the employer gave none. */
  requirements_inferred: boolean;
}

/** Extra synthetic listings so the engine has enough to rank (not open for applications). */
export const SAMPLE_LISTINGS: MatchListing[] = [
  {
    opportunity_id: "OP-S01",
    title: "Operations Analyst Intern",
    organization_name: "Sandline Logistics (synthetic)",
    location: "Abu Dhabi",
    work_mode: "Hybrid",
    duration: "10 weeks",
    requirements: {
      field: "Data & analytics",
      sector: "Logistics",
      required: ["SK-EXCEL-01", "SK-SQL-01"],
      desirable: ["SK-JIRA-01"],
    },
    origin: "sample",
    requirements_inferred: false,
  },
  {
    opportunity_id: "OP-S02",
    title: "Software QA Intern",
    organization_name: "Falconbyte Apps (synthetic)",
    location: "Dubai",
    work_mode: "Remote",
    duration: "8 weeks",
    requirements: {
      field: "Software",
      required: ["SK-TEST-01", "SK-JS-01"],
      desirable: ["SK-GIT-01", "SK-JIRA-01"],
    },
    origin: "sample",
    requirements_inferred: false,
  },
  {
    opportunity_id: "OP-S03",
    title: "Machine Learning Intern",
    organization_name: "Dune AI Lab (synthetic)",
    location: "Abu Dhabi",
    work_mode: "On-site",
    duration: "12 weeks",
    requirements: {
      field: "AI / ML",
      required: ["SK-PY-01", "SK-ML-01"],
      desirable: ["SK-STAT-01"],
    },
    origin: "sample",
    requirements_inferred: false,
  },
  {
    opportunity_id: "OP-S04",
    title: "Marketing Insights Intern",
    organization_name: "Palmgrove Retail (synthetic)",
    location: "Dubai",
    work_mode: "Hybrid",
    duration: "8 weeks",
    requirements: {
      field: "Marketing",
      required: ["SK-COMM-01", "SK-EXCEL-01"],
      desirable: ["SK-VIZ-01"],
    },
    origin: "sample",
    requirements_inferred: false,
  },
  {
    opportunity_id: "OP-S05",
    title: "UX Research Intern",
    organization_name: "Bluewing Travel (synthetic)",
    location: "Remote",
    work_mode: "Remote",
    duration: "10 weeks",
    requirements: {
      field: "Design / UX",
      sector: "Aviation",
      required: ["SK-UXR-01"],
      desirable: ["SK-FIGMA-01", "SK-PROTO-01"],
    },
    origin: "sample",
    requirements_inferred: false,
  },
];

/** Questions used in the Sprint 2 chatbot test (shown as suggestions in the chat panel). */
export const SUGGESTED_QUESTIONS = [
  "Who can apply for an internship?",
  "How do I apply to an opportunity?",
  "If I apply, am I placed?",
  "Why can't I see some opportunities?",
  "Which internships do you recommend for me?",
  "What is the minimum GPA for a co-op?",
];
