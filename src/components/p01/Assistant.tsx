import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  askPerson,
  describePatch,
  rulesReply,
  STARTERS,
  updateP01,
  type AssistantFacts,
  type AssistantReply,
  type ProfilePatch,
  type Term,
} from "@/lib/p01";
import { now } from "./shared";

interface Turn {
  role: "user" | "assistant";
  content: string;
  reply?: AssistantReply;
  done?: string;
}

/** Conversational profile assistant. It explains and proposes; the student applies, and people decide. */
export function Assistant({
  facts,
  vocab,
  onApply,
}: {
  facts: AssistantFacts;
  vocab: Term[];
  onApply: (p: ProfilePatch) => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: q }];
    setTurns(history);
    setText("");
    setBusy(true);
    let reply: AssistantReply;
    try {
      const res = await fetch("/api/p01/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          turns: history.map((t) => ({
            role: t.role,
            content: t.reply?.patch
              ? `${t.content} (proposed: ${describePatch(t.reply.patch).join("; ")})`
              : t.content,
          })),
          facts,
          vocab,
        }),
      });
      if (!res.ok) throw new Error("offline");
      reply = (await res.json()) as AssistantReply;
    } catch {
      reply = rulesReply(q, facts, vocab);
    }
    setTurns((t) => [...t, { role: "assistant", content: reply.answer, reply }]);
    setBusy(false);
  };
  const finish = (i: number, done: string) =>
    setTurns((t) => t.map((x, j) => (j === i ? { ...x, done } : x)));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(text);
  };

  return (
    <section
      aria-label="Profile assistant"
      className="flex h-[30rem] min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <header className="border-b border-border px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
          <Bot aria-hidden="true" className="h-5 w-5 text-primary" />
          Profile assistant
        </h2>
        <p className="text-xs text-muted-foreground">
          Knows your profile and the approved FAQ. It proposes changes; you apply them, and people
          review.
        </p>
      </header>
      <div ref={log} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        <div className="rounded-2xl bg-muted p-3 text-sm">
          Hi {facts.student.split(" ")[0]}! Ask me about version {facts.version}, or tell me what to
          change, for example “I’m free from 1 February to 30 June 2027 and I also know Tableau”.
        </div>
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[90%] whitespace-pre-line break-words rounded-2xl p-3 text-sm ${t.role === "user" ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              {t.content}
              {t.reply?.patch && (
                <>
                  <ul className="mt-2 space-y-0.5 rounded-xl bg-muted p-2.5 text-xs">
                    {describePatch(t.reply.patch).map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  {t.done ? (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">{t.done}</p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        disabled={!facts.editable}
                        onClick={() => {
                          onApply(t.reply!.patch!);
                          finish(i, "Applied to the form. Save or submit when you are ready.");
                        }}
                      >
                        Apply to draft
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => finish(i, "Ignored.")}>
                        Ignore
                      </Button>
                    </div>
                  )}
                </>
              )}
              {t.reply?.kind === "handoff" &&
                (t.done ? (
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">{t.done}</p>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      updateP01((s) => askPerson(s, turns[i - 1]?.content ?? "", now()));
                      finish(i, "Sent to the co-op office.");
                    }}
                  >
                    Send to the co-op office
                  </Button>
                ))}
              {t.reply && (
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  {t.reply.sources.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-status px-2 py-0.5 font-medium text-status-foreground"
                    >
                      {s}
                    </span>
                  ))}
                  <span>
                    {t.reply.mode === "ai"
                      ? `AI answer (${t.reply.model})`
                      : "Rules answer (AI offline)"}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <p role="status" className="text-sm text-muted-foreground">
            Reading your profile…
          </p>
        )}
      </div>
      <form onSubmit={onSubmit} className="border-t border-border p-3">
        <div className="flex gap-2">
          <label htmlFor="p01-ask" className="sr-only">
            Message to the profile assistant
          </label>
          <Input
            id="p01-ask"
            value={text}
            maxLength={500}
            autoComplete="off"
            placeholder="Ask or tell me what to change"
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" disabled={busy || !text.trim()} aria-label="Send message">
            <Send aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
