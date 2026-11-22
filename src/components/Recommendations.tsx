import { useMemo } from "react";
import { AlertTriangle, MessageCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/AppShell";
import { SAMPLE_PROFILES } from "@/lib/ai/knowledge";
import {
  buildListings,
  missingProfileInfo,
  normalizeProfileSkills,
  recommend,
} from "@/lib/ai/matching";
import { askInChat, setProfileId, useAiState } from "@/lib/ai/ui-state";
import type { IppData } from "@/lib/ipp-store";

/** Student "Recommended" tab: three ranked listings with reasons for the selected synthetic profile. */
export function Recommendations({ data }: { data: IppData }) {
  const { profileId } = useAiState();
  const profile = SAMPLE_PROFILES.find((p) => p.student_id === profileId) ?? SAMPLE_PROFILES[0]!;
  const { skills, unmapped } = normalizeProfileSkills(profile);
  const missing = missingProfileInfo(profile);
  const recs = useMemo(() => recommend(profile, buildListings(data)), [profile, data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor="match-profile" className="text-sm font-medium">
            Synthetic profile used for matching
          </label>
          <select
            id="match-profile"
            value={profile.student_id}
            onChange={(e) => setProfileId(e.target.value)}
            className="mt-2 block w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {SAMPLE_PROFILES.map((p) => (
              <option key={p.student_id} value={p.student_id}>
                {p.display_name} · {p.student_id}
              </option>
            ))}
          </select>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Program</dt>
              <dd>{profile.program}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Interests</dt>
              <dd>{profile.interests.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Availability</dt>
              <dd>{profile.availability ?? <em>Not given</em>}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Preferences</dt>
              <dd>
                {profile.preferred_work_mode ?? <em>Work mode not given</em>} ·{" "}
                {profile.preferred_location ?? <em>location not given</em>}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">Skills after standardizing terms</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li key={s.id} className="rounded-full border border-border px-2.5 py-1 text-xs">
                {s.label}{" "}
                <span className="text-muted-foreground">
                  ({s.raw} → {s.id}, {s.status.toLowerCase()})
                </span>
              </li>
            ))}
            {unmapped.map((u) => (
              <li
                key={u}
                className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {u} (not in shared vocabulary, kept for review)
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> Missing
              information: {missing.join(", ")}. Matching uses only what is given.
            </p>
          )}
        </div>
        <div className="rounded-xl bg-muted p-4 text-sm lg:w-72">
          <p className="flex items-center gap-2 font-medium">
            <UserCheck aria-hidden="true" className="h-4 w-4" /> Eligibility, checked separately
          </p>
          <div className="mt-2">
            <Status>{profile.eligibility_status}</Status>
          </div>
          <p className="mt-2 text-muted-foreground">
            Recorded by the co-op office. It is not used to rank internships.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-primary">Top three recommended internships</h2>
      <ol className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {recs.map((r) => (
          <li
            key={r.listing.opportunity_id}
            className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                aria-label={`Rank ${r.rank}`}
              >
                {r.rank}
              </span>
              <span className="text-right text-sm font-semibold text-primary">
                {r.score}% match
                {r.weak && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    Weak match
                  </span>
                )}
              </span>
            </div>
            <p className="mt-3 break-words text-sm font-medium text-muted-foreground">
              {r.listing.organization_name}
            </p>
            <h3 className="break-words text-lg font-semibold text-primary">{r.listing.title}</h3>
            <p className="text-xs text-muted-foreground">
              {r.listing.opportunity_id} · {r.listing.location} · {r.listing.work_mode} ·{" "}
              {r.listing.duration}
            </p>
            <p className="mt-3 text-sm font-medium">Why it fits</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {r.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            {r.gaps.length > 0 && (
              <>
                <p className="mt-3 text-sm font-medium">Gaps and notes</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {r.gaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-auto pt-4 text-xs text-muted-foreground">
              {r.listing.origin === "store"
                ? "Open in IPP: apply from the Opportunities tab."
                : "Sample listing from the Sprint 2 matching dataset; not open for applications."}
            </p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-status p-4 text-sm text-status-foreground sm:flex-row sm:items-center">
        <p className="flex-1">
          A recommendation is decision support, not a placement. Eligibility is checked separately
          and every official placement is approved by people.
        </p>
        <Button
          variant="outline"
          onClick={() => askInChat("Which internships do you recommend for me, and why?")}
        >
          <MessageCircle aria-hidden="true" className="h-4 w-4" /> Ask the chatbot why
        </Button>
      </div>
    </div>
  );
}
