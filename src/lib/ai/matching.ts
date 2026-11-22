// Sprint 2 matching engine: an editable, rules-based baseline.
// It ranks approved listings for one synthetic profile and explains every rank.
// Eligibility is never part of the score; it is reported separately for a person to check.
import type { IppData } from "@/lib/ipp-store";
import {
  SAMPLE_LISTINGS,
  SKILL_VOCABULARY,
  STORE_REQUIREMENTS,
  type MatchListing,
  type MatchProfile,
  type RequirementProfile,
  type SkillStatus,
  type WorkModePref,
} from "./knowledge";

/** Scoring weights, kept in one place so the team can change them and rerun the tests. */
export const WEIGHTS = {
  requiredReviewed: 3,
  requiredSelfDeclared: 2,
  desirableReviewed: 1,
  desirableSelfDeclared: 0.5,
  fieldInterest: 2,
  sectorInterest: 1,
  workMode: 1,
  location: 1,
} as const;

/** Below this score a recommendation is labelled a weak match. */
export const WEAK_MATCH_BELOW = 35;

export interface NormalizedSkill {
  id: string;
  label: string;
  status: SkillStatus;
  raw: string;
  evidence_id?: string;
}

const skillLabel = (id: string) => SKILL_VOCABULARY.find((s) => s.id === id)?.label ?? id;

function clean(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim()} `;
}

/** Data preparation: map a typed skill ("Python programming") to its canonical ID ("SK-PY-01"). */
export function normalizeSkill(raw: string): string | null {
  const text = clean(raw);
  for (const term of SKILL_VOCABULARY) {
    if (term.synonyms.some((syn) => text.includes(clean(syn)))) return term.id;
  }
  return null;
}

/** Normalizes every profile skill; unmapped free text is returned separately so nothing is lost. */
export function normalizeProfileSkills(profile: MatchProfile): {
  skills: NormalizedSkill[];
  unmapped: string[];
} {
  const skills: NormalizedSkill[] = [];
  const unmapped: string[] = [];
  for (const s of profile.skills) {
    const id = normalizeSkill(s.raw);
    if (!id) {
      unmapped.push(s.raw);
      continue;
    }
    const existing = skills.find((k) => k.id === id);
    // Keep the strongest status if the same skill was typed twice.
    if (existing) {
      if (existing.status === "Self-declared" && s.status === "Reviewed")
        existing.status = "Reviewed";
      continue;
    }
    skills.push({
      id,
      label: skillLabel(id),
      status: s.status,
      raw: s.raw,
      ...(s.evidence_id ? { evidence_id: s.evidence_id } : {}),
    });
  }
  return { skills, unmapped };
}

/** Fields of profile data the engine needs but the student has not supplied. */
export function missingProfileInfo(profile: MatchProfile): string[] {
  const missing: string[] = [];
  if (!profile.availability) missing.push("availability");
  if (!profile.preferred_work_mode) missing.push("preferred work mode");
  if (!profile.preferred_location) missing.push("preferred location");
  if (profile.skills.length === 0) missing.push("skills");
  return missing;
}

const FIELD_KEYWORDS: { field: string; words: string[] }[] = [
  { field: "Data & analytics", words: ["analytics", "analyst", "data", "dashboard"] },
  { field: "Design / UX", words: ["design", "ux", "user research", "prototyp"] },
  { field: "Software", words: ["software", "developer", "engineering", "qa", "test"] },
  { field: "AI / ML", words: ["machine learning", "ai ", "model"] },
  { field: "Marketing", words: ["marketing", "brand", "social media", "communications"] },
];

/** For listings without structured requirements: infer skills and field from the listing text. */
export function inferRequirements(title: string, description: string): RequirementProfile {
  const text = clean(`${title} ${description}`);
  const required = SKILL_VOCABULARY.filter((t) =>
    t.synonyms.some((syn) => text.includes(clean(syn))),
  ).map((t) => t.id);
  const field =
    FIELD_KEYWORDS.find((f) => f.words.some((w) => text.includes(w)))?.field ?? "General";
  return { field, required, desirable: [] };
}

/** Builds the listings to rank: approved IPP opportunities plus the Sprint 2 sample listings. */
export function buildListings(
  data: Pick<IppData, "opportunities" | "employers"> | null,
): MatchListing[] {
  const fromStore: MatchListing[] = (data?.opportunities ?? [])
    .filter((o) => o.approval_status === "Approved")
    .map((o) => {
      const known = STORE_REQUIREMENTS[o.opportunity_id];
      return {
        opportunity_id: o.opportunity_id,
        title: o.title,
        organization_name:
          data?.employers.find((e) => e.employer_id === o.employer_id)?.organization_name ??
          o.employer_id,
        location: o.location,
        work_mode: o.work_mode,
        duration: o.duration,
        requirements: known ?? inferRequirements(o.title, o.description),
        origin: "store" as const,
        requirements_inferred: !known,
      };
    });
  const storeIds = new Set(fromStore.map((l) => l.opportunity_id));
  return [...fromStore, ...SAMPLE_LISTINGS.filter((l) => !storeIds.has(l.opportunity_id))];
}

export interface Recommendation {
  rank: number;
  listing: MatchListing;
  /** 0-100. */
  score: number;
  weak: boolean;
  reasons: string[];
  gaps: string[];
  /** Separate from ranking: shown for a person to confirm. */
  eligibility: string;
}

function sameText(a: string | null | undefined, b: string | null | undefined) {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

function describeSkill(s: NormalizedSkill): string {
  if (s.status === "Reviewed") return `${s.label} (reviewed)`;
  return `${s.label} (self-declared${s.evidence_id ? `, evidence ${s.evidence_id} not yet reviewed` : ""})`;
}

/** Scores one listing for one profile and explains the score. Pure. */
export function scoreListing(profile: MatchProfile, listing: MatchListing) {
  const { skills } = normalizeProfileSkills(profile);
  const has = (id: string) => skills.find((s) => s.id === id);
  const req = listing.requirements;
  let points = 0;
  const max =
    req.required.length * WEIGHTS.requiredReviewed +
    req.desirable.length * WEIGHTS.desirableReviewed +
    WEIGHTS.fieldInterest +
    (req.sector ? WEIGHTS.sectorInterest : 0) +
    WEIGHTS.workMode +
    WEIGHTS.location;
  const reasons: string[] = [];
  const gaps: string[] = [];

  const reqMatched: NormalizedSkill[] = [];
  for (const id of req.required) {
    const s = has(id);
    if (s) {
      points += s.status === "Reviewed" ? WEIGHTS.requiredReviewed : WEIGHTS.requiredSelfDeclared;
      reqMatched.push(s);
    } else gaps.push(`Required skill missing: ${skillLabel(id)}`);
  }
  if (reqMatched.length)
    reasons.push(`Required skills you have: ${reqMatched.map(describeSkill).join(", ")}`);

  const desMatched: NormalizedSkill[] = [];
  for (const id of req.desirable) {
    const s = has(id);
    if (s) {
      points += s.status === "Reviewed" ? WEIGHTS.desirableReviewed : WEIGHTS.desirableSelfDeclared;
      desMatched.push(s);
    } else gaps.push(`Desirable skill to build: ${skillLabel(id)}`);
  }
  if (desMatched.length)
    reasons.push(`Desirable skills you have: ${desMatched.map(describeSkill).join(", ")}`);
  for (const s of [...reqMatched, ...desMatched]) {
    if (s.status === "Self-declared" && s.evidence_id)
      gaps.push(`${s.label} counts at a lower weight until evidence ${s.evidence_id} is reviewed`);
  }

  if (profile.interests.some((i) => sameText(i, req.field))) {
    points += WEIGHTS.fieldInterest;
    reasons.push(`Matches your interest in ${req.field}`);
  }
  if (req.sector && profile.interests.some((i) => sameText(i, req.sector))) {
    points += WEIGHTS.sectorInterest;
    reasons.push(`In a sector you chose: ${req.sector}`);
  }
  if (profile.preferred_work_mode && profile.preferred_work_mode === listing.work_mode) {
    points += WEIGHTS.workMode;
    reasons.push(`${listing.work_mode} matches your preferred work mode`);
  }
  if (sameText(profile.preferred_location, listing.location)) {
    points += WEIGHTS.location;
    reasons.push(`Located in your preferred city, ${listing.location}`);
  }
  if (listing.requirements_inferred)
    gaps.push(
      "The employer gave no structured skills; requirements were inferred from the listing text",
    );

  const score = max > 0 ? Math.round((points / max) * 100) : 0;
  return { score, points, requiredMatched: reqMatched.length, reasons, gaps };
}

/** Ranks listings for a profile and returns the top three with reasons. Eligibility is not used. */
export function recommend(
  profile: MatchProfile,
  listings: MatchListing[],
  count = 3,
): Recommendation[] {
  return listings
    .map((listing) => ({ listing, ...scoreListing(profile, listing) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.requiredMatched - a.requiredMatched ||
        a.listing.opportunity_id.localeCompare(b.listing.opportunity_id),
    )
    .slice(0, count)
    .map((r, i) => ({
      rank: i + 1,
      listing: r.listing,
      score: r.score,
      weak: r.score < WEAK_MATCH_BELOW,
      reasons: r.reasons.length
        ? r.reasons
        : ["No skill or interest overlap; shown only to fill the top three"],
      gaps: r.gaps,
      eligibility: profile.eligibility_status,
    }));
}

export type { WorkModePref };
