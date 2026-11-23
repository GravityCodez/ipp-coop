// Browser side of the P03 AI reviewer. The API key never reaches the browser: this calls
// /api/ai-review on our own server, which calls the model.
import type { Opportunity } from "@/lib/ipp-store";
import type { CheckKey } from "./review";

export type AiStatus = "ok" | "problem" | "judgement";
export interface AiReview {
  checks: Record<CheckKey, { status: AiStatus; note: string }>;
  rule_flags: string[];
  summary: string;
  draft_reason: string;
  model?: string;
}

export async function requestAiReview(
  o: Opportunity,
  organization: string,
  rules: string[],
): Promise<AiReview> {
  const res = await fetch("/api/ai-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submission: {
        organization,
        title: o.title,
        description: o.description,
        location: o.location,
        work_mode: o.work_mode,
        duration: o.duration,
      },
      rules,
    }),
  });
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("json"))
    throw new Error(
      "The AI reviewer is not available on this host. The rule-based hints still work.",
    );
  const body = (await res.json()) as Partial<AiReview> & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `The AI reviewer failed (${res.status}).`);
  if (!body.checks) throw new Error("The AI reviewer sent an answer we could not read.");
  return body as AiReview;
}
