import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FAQ_VERSION, SAMPLE_PROFILES, SUGGESTED_QUESTIONS } from "@/lib/ai/knowledge";
import { clearPendingQuestion, setChatOpen, setProfileId, useAiState } from "@/lib/ai/ui-state";
import { useIppData } from "@/lib/ipp-store";
import type { ChatReply } from "@/lib/ai/chat";

interface Turn {
  role: "user" | "assistant";
  content: string;
  reply?: ChatReply;
}

const WELCOME =
  "Hi! I answer questions about IPP from the approved FAQ and suggest internships for the selected synthetic profile. I don't decide eligibility or placements; people do.";

export function ChatWidget() {
  const { chatOpen, profileId, pendingQuestion } = useAiState();
  const data = useIppData();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, busy]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const history = [...turns, { role: "user" as const, content: q }];
    setTurns(history);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile_id: profileId,
          messages: history.map(({ role, content }) => ({ role, content })),
          data: data ? { opportunities: data.opportunities, employers: data.employers } : null,
        }),
      });
      const reply = (await res.json()) as ChatReply & { error?: string };
      if (!res.ok || reply.error) throw new Error(reply.error ?? "The chatbot could not answer.");
      setTurns((t) => [...t, { role: "assistant", content: reply.answer, reply }]);
    } catch (error) {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: `${error instanceof Error ? error.message : "The chatbot could not answer."} Please try again, or read the FAQ page.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (chatOpen && pendingQuestion) {
      clearPendingQuestion();
      void ask(pendingQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, pendingQuestion]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-16 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle aria-hidden="true" className="h-5 w-5" /> Ask IPP
      </button>
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border p-4 text-left">
            <SheetTitle className="text-primary">IPP Help chatbot</SheetTitle>
            <SheetDescription>
              Answers come only from the approved FAQ ({FAQ_VERSION}) and the synthetic profile
              below. Eligibility and placements are decided by people.
            </SheetDescription>
            <div className="mt-2">
              <label htmlFor="chat-profile" className="text-xs font-medium text-muted-foreground">
                Synthetic student profile
              </label>
              <select
                id="chat-profile"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {SAMPLE_PROFILES.map((p) => (
                  <option key={p.student_id} value={p.student_id}>
                    {p.display_name} · {p.student_id}
                  </option>
                ))}
              </select>
            </div>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <div className="rounded-2xl bg-muted p-3 text-sm">{WELCOME}</div>
            {turns.length === 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void ask(q)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((t, i) => (
              <div
                key={i}
                className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl p-3 text-sm ${
                    t.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card"
                  }`}
                >
                  {t.content}
                  {t.reply && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      {t.reply.sources.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-status px-2 py-0.5 font-medium text-status-foreground"
                        >
                          {s === "MATCHING" ? "Matching engine" : s}
                        </span>
                      ))}
                      <span>
                        {t.reply.mode === "ai"
                          ? `AI answer (${t.reply.model ?? "Groq"})`
                          : "FAQ lookup (AI offline)"}
                        {t.reply.kind === "unknown" ? " · handed to a person" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <p role="status" className="text-sm text-muted-foreground">
                Checking the approved FAQ…
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <Input
                id="chat-input"
                value={draft}
                maxLength={800}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about applying, placements or recommendations"
                autoComplete="off"
              />
              <Button type="submit" disabled={busy || !draft.trim()} aria-label="Send question">
                <Send aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Synthetic demo data only. Don't enter real personal information. Questions outside
                the FAQ go to the co-op office.{" "}
                <Link
                  to="/faq"
                  onClick={() => setChatOpen(false)}
                  className="underline underline-offset-2"
                >
                  Read the FAQ
                </Link>
              </span>
            </p>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
