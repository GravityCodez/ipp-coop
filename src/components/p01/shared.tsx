import { useEffect, useState, type ReactNode } from "react";
import { getOpenListings, getSkills } from "@/lib/db";
import {
  DEMO_DATA,
  mapListings,
  mapProfiles,
  mapVocabulary,
  matchStudent,
  verdict,
  whyLines,
  type Listing,
  type VocabTerm,
} from "@/lib/p05";
import {
  STATUS_LABEL,
  toFeedRow,
  type MatchLine,
  type ProfileStatus,
  type ProfileVersion,
  type SkillEntry,
  type Term,
} from "@/lib/p01";

export const fmt = (iso: string | null): string => {
  if (!iso) return "not given";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
};
export const now = () => new Date().toISOString();

const TONE: Record<ProfileStatus, string> = {
  draft: "bg-muted text-foreground",
  submitted: "bg-sent text-sent-foreground",
  clarification_requested: "bg-warn text-warn-foreground",
  reviewed: "bg-status text-status-foreground",
};

export function StatusChip({ status }: { status: ProfileStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Panel({
  id,
  title,
  note,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={`min-w-0 rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6 ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold text-heading">{title}</h2>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function SkillBadge({ skill, name }: { skill: SkillEntry; name: string }) {
  const reviewed = skill.source === "reviewed";
  return (
    <span className="min-w-0">
      <span className="block font-medium">
        {name}{" "}
        <span className="font-mono text-xs font-normal text-muted-foreground">
          {skill.skill_id}
        </span>
      </span>
      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        <span
          className={`rounded-full px-2 py-0.5 font-semibold ${reviewed ? "bg-status text-status-foreground" : "bg-warn text-warn-foreground"}`}
        >
          {reviewed ? "Reviewed" : "Self-declared"}
        </span>
        {reviewed ? (
          <span>
            {skill.evidence_id} · {skill.reviewer ?? "P06 reviewer"}, {fmt(skill.review_date)}
          </span>
        ) : skill.evidence_id ? (
          <span>{skill.evidence_id} attached, waiting for review</span>
        ) : (
          <span>no evidence yet</span>
        )}
      </span>
    </span>
  );
}

const FALLBACK_VOCAB: Term[] = DEMO_DATA.vocabulary.map((t) => ({
  skill_id: t.skill_id,
  label: t.label,
  synonyms: t.synonyms,
}));

/** The shared skill vocabulary from the class database; a built-in copy if it cannot be reached. */
export function useVocabulary(): { vocab: Term[]; live: boolean } {
  const [state, setState] = useState<{ vocab: Term[]; live: boolean }>({
    vocab: FALLBACK_VOCAB,
    live: false,
  });
  useEffect(() => {
    let on = true;
    getSkills()
      .then((rows) => {
        if (on && rows.length)
          setState({
            vocab: rows.map(({ skill_id, label, synonyms }) => ({
              skill_id,
              label,
              synonyms: synonyms ?? [],
            })),
            live: true,
          });
      })
      .catch(() => {
        /* keeps the built-in copy */
      });
    return () => {
      on = false;
    };
  }, []);
  return state;
}

export const skillName = (vocab: readonly Term[], id: string) =>
  vocab.find((t) => t.skill_id === id)?.label ?? id;

/** Open listings from the shared database (P03), or P05's demo listings. */
export function useListings(): { listings: Listing[]; live: boolean } {
  const [state, setState] = useState<{ listings: Listing[]; live: boolean }>({
    listings: DEMO_DATA.listings,
    live: false,
  });
  useEffect(() => {
    let on = true;
    getOpenListings()
      .then((rows) => {
        if (on && rows.length) setState({ listings: mapListings(rows), live: true });
      })
      .catch(() => {
        /* keeps the demo listings */
      });
    return () => {
      on = false;
    };
  }, []);
  return state;
}

export interface MatchRow extends MatchLine {
  tone: "go" | "todo" | "no";
}

/** Runs P05's rules engine on one P01 profile version, through the hand-off contract. */
export function matchVersion(
  v: ProfileVersion,
  listings: Listing[],
  vocab: readonly Term[],
): MatchRow[] {
  const row = toFeedRow(
    v.status === "submitted" || v.status === "reviewed" ? v : { ...v, status: "submitted" },
  );
  const terms: VocabTerm[] = mapVocabulary(vocab.map((t) => ({ ...t, category: "" })));
  const result = matchStudent(
    { vocabulary: terms, profiles: mapProfiles([row]), listings, evidence: [], ai: null },
    v.student_id,
    "rules",
  );
  return (result?.records ?? [])
    .filter((r) => r.status !== "excluded")
    .map((r) => {
      const call = verdict(r);
      return {
        tone: call.tone,
        title: r.listing?.title ?? r.opportunity_id,
        employer: r.listing?.employer ?? "",
        opportunity_id: r.opportunity_id,
        result: call.label,
        why:
          whyLines(r, terms).slice(0, 2).join(" ") ||
          "Open to you, but it shares little with your profile.",
      };
    });
}

const MATCH_TONE = {
  go: "bg-status text-status-foreground",
  todo: "bg-warn text-warn-foreground",
  no: "bg-danger text-danger-foreground",
} as const;
export const MatchChip = ({ row }: { row: MatchRow }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${MATCH_TONE[row.tone]}`}
  >
    {row.result}
  </span>
);

/** The binder's demo listing. */
export const THREAD_LISTING = "OP-028";
