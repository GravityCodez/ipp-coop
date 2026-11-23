import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button, Label, StatCard, TextInput, Toaster, timeAgo, toast, useNow } from '@/lib/p03/desk-ui';
import { deskAdmin, getDeskState, type AdminAction, type DeskCase, type DeskState } from '@/lib/p03/desk-client';

const fieldCls =
  'w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm';

function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={`inline-flex rounded-full bg-warn px-2.5 py-0.5 text-xs text-warn-foreground ${urgency === 'High' ? 'font-bold ring-2 ring-warn-foreground' : 'font-medium'}`}>
      {urgency} urgency
    </span>
  );
}

function CaseItem({ c, now, onResolve }: { c: DeskCase; now: number; onResolve: (id: string, note: string) => Promise<boolean> }) {
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [heardStudent, setHeardStudent] = useState(false);
  const [heardSupervisor, setHeardSupervisor] = useState(false);
  const [cause, setCause] = useState('');
  const nid = `note-${c.case_id}`;
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) {
      setErr('Write a short note before resolving.');
      return;
    }
    if (!heardStudent || !heardSupervisor) {
      setErr('Hear from both the student and the supervisor before closing the case.');
      return;
    }
    setBusy(true);
    setErr('');
    const full = `${note.trim()} | Heard from both sides${cause.trim() ? ` | Root cause: ${cause.trim()}` : ''}`;
    if (!(await onResolve(c.case_id, full.slice(0, 400)))) setBusy(false);
  }
  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <UrgencyBadge urgency={c.urgency} />
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">{c.role}</span>
        <span className="text-xs text-muted-foreground">{timeAgo(c.created_at, now)}</span>
      </div>
      <p className="mt-2 text-sm font-medium">{c.question}</p>
      {c.summary && <p className="mt-1 text-sm text-muted-foreground">Summary: {c.summary}</p>}
      {c.section && <p className="mt-1 text-xs text-muted-foreground">Guide section: {c.section}</p>}
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <legend className="mb-1 text-xs font-medium text-muted-foreground">Act as the middle person: hear both sides first</legend>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={heardStudent} onChange={(e) => { setHeardStudent(e.target.checked); setErr(''); }} /> Heard from the student</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={heardSupervisor} onChange={(e) => { setHeardSupervisor(e.target.checked); setErr(''); }} /> Heard from the supervisor</label>
        </fieldset>
        <Label htmlFor={`cause-${c.case_id}`}>Root cause</Label>
        <TextInput id={`cause-${c.case_id}`} value={cause} onChange={(e) => setCause(e.target.value)} placeholder="What actually caused it, e.g. sick days not recorded" />
        <Label htmlFor={nid}>Resolution note</Label>
        <TextInput id={nid} value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }} placeholder="What was done to fix it, in one line" />
        {err && <p role="alert" className="text-xs text-destructive">{err}</p>}
        <Button type="submit" variant="outline" disabled={busy} className="w-fit">Mark resolved</Button>
      </form>
    </li>
  );
}

export function DeskAdmin() {
  const now = useNow();
  const [state, setState] = useState<DeskState | null>(null);
  const [error, setError] = useState('');
  const [section, setSection] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [escalate, setEscalate] = useState(false);
  const [formErr, setFormErr] = useState('');

  const refresh = useCallback(async () => {
    try {
      setState(await getDeskState());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The desk server is not reachable.');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function run(a: AdminAction): Promise<boolean> {
    try {
      setState(await deskAdmin(a));
      setError('');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'The desk server is not reachable.';
      setError(msg);
      toast('Not saved', msg);
      return false;
    }
  }

  const open = (state?.cases ?? [])
    .filter((c) => c.status === 'Open')
    .sort((a, b) => (a.urgency === b.urgency ? Date.parse(b.created_at) - Date.parse(a.created_at) : a.urgency === 'High' ? -1 : 1));
  const resolved = (state?.cases ?? []).filter((c) => c.status === 'Resolved').sort((a, b) => Date.parse(b.resolved_at ?? '') - Date.parse(a.resolved_at ?? ''));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!section.trim() || !question.trim() || !answer.trim()) {
      setFormErr('Fill in the section, the question and the answer.');
      return;
    }
    setFormErr('');
    if (await run({ action: 'add_entry', section: section.trim(), question: question.trim(), answer: answer.trim(), escalate })) {
      toast('Entry saved. The desk uses it from the next question.');
      setSection('');
      setQuestion('');
      setAnswer('');
      setEscalate(false);
    }
  }

  return (
    <section id="desk-admin" aria-labelledby="desk-admin-heading" className="mt-8 scroll-mt-6">
      <h2 id="desk-admin-heading" className="mb-1 text-xl font-semibold text-primary">Internship desk (during placement)</h2>
      <p className="mb-4 text-sm text-muted-foreground">Questions from students and supervisors during an internship. This list refreshes every 5 seconds.</p>
      <div role="status" aria-live="polite">
        {error && <p className="mb-3 rounded-xl bg-danger p-3 text-sm text-danger-foreground">{error}</p>}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open cases" value={state ? open.length : '-'} tone={open.length > 0 ? 'warn' : 'default'} />
        <StatCard label="Not in the guide yet" value={state ? state.unanswered.length : '-'} />
        <StatCard label="Policy entries" value={state ? state.policy.length : '-'} />
      </div>

      <div className="space-y-4">
        <section aria-labelledby="needs-you-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 id="needs-you-heading" className="mb-3 text-lg font-semibold text-primary">Needs you</h3>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open cases.</p>
          ) : (
            <ul className="space-y-3">
              {open.map((c) => (
                <CaseItem key={c.case_id} c={c} now={now} onResolve={(id, note) => run({ action: 'resolve', case_id: id, note })} />
              ))}
            </ul>
          )}
          {resolved.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Resolved cases ({resolved.length})</summary>
              <ul className="mt-2 divide-y divide-border">
                {resolved.map((c) => (
                  <li key={c.case_id} className="py-2.5 text-sm">
                    <p className="font-medium">{c.question}</p>
                    <p className="text-muted-foreground">Note: {c.note}</p>
                    <p className="text-xs text-muted-foreground">Resolved {timeAgo(c.resolved_at, now)}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section aria-labelledby="unanswered-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 id="unanswered-heading" className="mb-3 text-lg font-semibold text-primary">Not in the guide yet</h3>
          {!state || state.unanswered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing yet. Questions the guide cannot answer appear here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {state.unanswered.map((u) => (
                <li key={u.question} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{u.question}</p>
                    <p className="text-xs text-muted-foreground">Asked {u.count} {u.count === 1 ? 'time' : 'times'} · last {timeAgo(u.last_at, now)}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setQuestion(u.question);
                      document.getElementById('entry-section')?.focus();
                    }}
                  >
                    Write an entry
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="add-entry-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 id="add-entry-heading" className="mb-3 text-lg font-semibold text-primary">Add a policy entry</h3>
          <form onSubmit={save} className="flex flex-col gap-2">
            <Label htmlFor="entry-section">Section</Label>
            <TextInput id="entry-section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="For example: Weekly hours" />
            <Label htmlFor="entry-question">Question</Label>
            <TextInput id="entry-question" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <Label htmlFor="entry-answer">Answer</Label>
            <textarea id="entry-answer" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} className={fieldCls} />
            <label className="mt-1 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={escalate} onChange={(e) => setEscalate(e.target.checked)} className="h-4 w-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              Always send this to Career Services
            </label>
            {formErr && <p role="alert" className="text-xs text-destructive">{formErr}</p>}
            <Button type="submit" className="mt-1 w-fit">Save</Button>
          </form>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{state ? `${state.policy.length} policy ${state.policy.length === 1 ? 'entry' : 'entries'}` : ''}</span>
          <Button
            variant="outline"
            className="h-8 px-3 text-xs"
            onClick={() => {
              if (window.confirm('Reset the desk demo? All desk cases, unanswered questions and added entries will be replaced with the original data.')) void run({ action: 'reset' });
            }}
          >
            Reset desk demo
          </Button>
        </div>
      </div>
      <Toaster />
    </section>
  );
}
