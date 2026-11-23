import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyPatch,
  approvals,
  buildFacts,
  contentOf,
  currentReviewed,
  latest,
  RuleError,
  saveDraft,
  startRevision,
  submitProfile,
  updateP01,
  useP01,
  validateProfile,
  type FieldErrors,
  type P01State,
  type ProfileContent,
  type ProfilePatch,
  type Seen,
} from "@/lib/p01";
import { Assistant } from "./Assistant";
import { ProfileForm } from "./ProfileForm";
import {
  fmt,
  MatchChip,
  matchVersion,
  now,
  Panel,
  StatusChip,
  THREAD_LISTING,
  useListings,
  useVocabulary,
} from "./shared";

export function StudentProfile() {
  const state = useP01();
  return state ? <Workspace state={state} /> : <p role="status">Loading the profile…</p>;
}

const APPROVAL_ICON = { done: CheckCircle2, waiting: Clock3, later: Circle } as const;

function Workspace({ state }: { state: P01State }) {
  const v = latest(state);
  const key = `${v.profile_version}:${v.status}`;
  const [seen, setSeen] = useState<Seen>({ profile_version: v.profile_version, status: v.status });
  const [form, setForm] = useState<ProfileContent>(contentOf(v));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = useRef(false);
  const { vocab, live: vocabLive } = useVocabulary();
  const { listings, live } = useListings();

  // A new version or status replaces the form, unless the student has unsaved edits: then the version rule
  // refuses the save and says why.
  useEffect(() => {
    if (dirty.current) return;
    setSeen({ profile_version: v.profile_version, status: v.status });
    setForm(contentOf(v));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, state.versions]);

  const editable = v.status === "draft";
  const reviewed = currentReviewed(state);
  const matches = useMemo(
    () => matchVersion({ ...v, ...form }, listings, vocab),
    [v, form, listings, vocab],
  );
  const thread = matches.find((m) => m.opportunity_id === THREAD_LISTING);
  const facts = buildFacts(state, form, vocab, matches.slice(0, 3), now().slice(0, 10));

  const change = (c: ProfileContent) => {
    dirty.current = true;
    setForm(c);
    if (Object.keys(errors).length) setErrors(validateProfile(c, now().slice(0, 10)));
  };
  const run = (rule: (s: P01State) => P01State, ok: string) => {
    try {
      const next = updateP01(rule);
      dirty.current = false;
      const n = latest(next);
      setSeen({ profile_version: n.profile_version, status: n.status });
      setForm(contentOf(n));
      setErrors({});
      setMessage({ ok: true, text: ok });
    } catch (e) {
      if (!(e instanceof RuleError)) throw e;
      if (e.code === "invalid") setErrors(validateProfile(form, now().slice(0, 10)));
      setMessage({ ok: false, text: e.message });
    }
  };
  const reload = () => {
    dirty.current = false;
    setSeen({ profile_version: v.profile_version, status: v.status });
    setForm(contentOf(v));
    setErrors({});
    setMessage(null);
  };
  const apply = (p: ProfilePatch) => change(applyPatch(form, p, vocab));
  const stale = seen.profile_version !== v.profile_version || seen.status !== v.status;

  const next = {
    draft: "Finish the draft and submit it when it is ready.",
    submitted: "A coordinator is reviewing this version, so it is locked.",
    clarification_requested: "Read the comment, then start a new version to answer it.",
    reviewed: "Other teams can use this version. Start a new version if something changes.",
  }[v.status];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-panel p-6 text-panel-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm text-panel-muted">Student profile and internship interests</p>
          <h2 className="text-2xl font-bold text-panel-foreground">
            {v.full_name}{" "}
            <span className="font-mono text-sm font-normal text-panel-muted">
              {v.student_id} · version {v.profile_version}
            </span>
          </h2>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <StatusChip status={v.status} />
            <span className="text-panel-muted">{next}</span>
          </p>
        </div>
        {(v.status === "reviewed" || v.status === "clarification_requested") && (
          <Button
            variant="secondary"
            className="shrink-0"
            onClick={() =>
              run(
                (s) => startRevision(s, "student", seen, now()),
                `Version ${v.profile_version + 1} is open as a draft. Version ${v.profile_version} stays in the history.`,
              )
            }
          >
            Start version {v.profile_version + 1}
          </Button>
        )}
      </div>

      {v.coordinator_comment && v.status !== "reviewed" && (
        <p className="rounded-2xl bg-warn p-4 text-sm text-warn-foreground">
          <span className="font-semibold">Coordinator asked: </span>
          {v.coordinator_comment}
        </p>
      )}
      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded-2xl p-4 text-sm ${message.ok ? "bg-status text-status-foreground" : "bg-danger text-danger-foreground"}`}
        >
          {message.text}{" "}
          {stale && (
            <button
              type="button"
              className="font-semibold underline underline-offset-2"
              onClick={reload}
            >
              Load the newest version
            </button>
          )}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            title={editable ? `Edit version ${v.profile_version}` : `Version ${v.profile_version}`}
            note={`${vocab.length} shared skills${vocabLive ? ", live from the class database" : ", built-in copy"}`}
          >
            <ProfileForm
              value={form}
              errors={errors}
              vocab={vocab}
              disabled={!editable}
              onChange={change}
            />
            {editable && (
              <div className="mt-6 border-t border-border pt-5">
                <Label htmlFor="p01-note">What changed in this version</Label>
                <Input
                  id="p01-note"
                  className="mt-2"
                  value={note}
                  maxLength={160}
                  placeholder="For example: new dates and a clearer goal"
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      run(
                        (s) => submitProfile(s, "student", seen, form, note, now()),
                        `Version ${v.profile_version} was submitted. It is locked until a coordinator reviews it.`,
                      )
                    }
                  >
                    Submit for review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      run(
                        (s) => saveDraft(s, "student", seen, form, now()),
                        "Draft saved. Only you can see it.",
                      )
                    }
                  >
                    Save draft
                  </Button>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="What matching sees"
            note={
              live
                ? `P05 rules engine, ${listings.length} open listings from the class database`
                : "P05 rules engine, demo listings"
            }
          >
            <p className="mb-3 text-sm text-muted-foreground">
              {editable
                ? `Preview of draft version ${v.profile_version}. `
                : `Result for version ${v.profile_version}. `}
              {reviewed
                ? `Other teams use reviewed version ${reviewed.profile_version}.`
                : "No version has been reviewed yet, so other teams still use the shared database's copy."}
            </p>
            <ol>
              {matches.slice(0, 3).map((m, i) => (
                <li
                  key={m.opportunity_id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-t border-border py-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto]"
                >
                  <span aria-hidden="true" className="text-2xl font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{m.title}</p>
                    <p className="text-muted-foreground">
                      {m.employer} · <span className="font-mono text-xs">{m.opportunity_id}</span>
                    </p>
                    <p className="mt-1">{m.why}</p>
                  </div>
                  <span className="col-start-2 mt-2 sm:col-start-3 sm:mt-0">
                    <MatchChip row={m} />
                  </span>
                </li>
              ))}
            </ol>
            {thread && !matches.slice(0, 3).includes(thread) && (
              <p className="border-t border-border pt-3 text-sm">
                {thread.title} <span className="font-mono text-xs">{thread.opportunity_id}</span>:{" "}
                <MatchChip row={thread} />
              </p>
            )}
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              A match is a suggestion, not a placement. People approve applications and placements.
            </p>
          </Panel>

          <Panel title="Version history" note="Old versions never change">
            <ol>
              {[...state.versions].reverse().map((x) => (
                <li
                  key={x.profile_version}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border py-2.5 text-sm first:border-t-0"
                >
                  <span className="font-mono text-xs font-semibold">v{x.profile_version}</span>
                  <StatusChip status={x.status} />
                  <span className="min-w-0 flex-1">{x.change_note ?? "Not submitted yet"}</span>
                  <span className="text-xs text-muted-foreground">
                    {x.published_at ? fmt(x.published_at) : ""}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="min-w-0 space-y-5">
          <Assistant facts={facts} vocab={vocab} onApply={apply} />
          <Panel title="Who still decides">
            <ol className="space-y-3">
              {approvals(state).map((a) => {
                const Icon = APPROVAL_ICON[a.state];
                return (
                  <li
                    key={a.step}
                    className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2.5 text-sm"
                  >
                    <Icon
                      aria-hidden="true"
                      className={`mt-0.5 h-4 w-4 ${a.state === "done" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div>
                      <p className="font-semibold">
                        {a.step}{" "}
                        <span className="font-normal text-muted-foreground">· {a.who}</span>
                      </p>
                      <p className="text-muted-foreground">
                        {a.state === "done"
                          ? "Done. "
                          : a.state === "waiting"
                            ? "Waiting. "
                            : "Later. "}
                        {a.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
          {state.questions.length > 0 && (
            <Panel title="My questions to the co-op office">
              <ul className="space-y-3 text-sm">
                {state.questions.map((q) => (
                  <li key={q.id}>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-muted-foreground">
                      {q.answer ? `Answer: ${q.answer}` : "Waiting for a person to answer."}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
