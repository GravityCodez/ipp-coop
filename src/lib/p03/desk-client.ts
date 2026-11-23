// Client for the Internship Desk API served by the worker on the same origin.

export type DeskRole = "student" | "supervisor";
export type Outcome = "answered" | "escalate" | "unknown";
export type Urgency = "High" | "Normal";

export type AskReply = {
  outcome: Outcome;
  answer: string;
  section: string | null;
  urgency: Urgency | null;
  summary: string;
  source: "ai" | "match";
  model?: string;
  remaining: number;
  case_id?: string;
};

export type PolicyEntry = {
  id: string;
  section: string;
  question: string;
  answer: string;
  action: "answer" | "tell_sara";
};
export type DeskCase = {
  case_id: string;
  role: DeskRole;
  question: string;
  summary: string;
  urgency: Urgency;
  section: string | null;
  status: "Open" | "Resolved";
  created_at: string;
  resolved_at?: string;
  note?: string;
  source: string;
};
export type Unanswered = { question: string; count: number; last_at: string };
export type DeskState = {
  policy: PolicyEntry[];
  cases: DeskCase[];
  unanswered: Unanswered[];
  ai: { enabled: boolean };
};

export type AdminAction =
  | { action: "add_entry"; section: string; question: string; answer: string; escalate: boolean }
  | { action: "resolve"; case_id: string; note: string }
  | { action: "reset" };

export const UNREACHABLE = "The desk server is not reachable.";
export const SESSION_LIMIT = 10;

export class DeskError extends Error {
  remaining?: number | undefined;
  status: number;
  constructor(message: string, status: number, remaining?: number) {
    super(message);
    this.status = status;
    this.remaining = remaining;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new DeskError(UNREACHABLE, 0);
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // not JSON
  }
  const obj = (body && typeof body === "object" ? body : {}) as {
    error?: string;
    remaining?: number;
  };
  if (!res.ok) throw new DeskError(obj.error || UNREACHABLE, res.status, obj.remaining);
  if (!body) throw new DeskError(UNREACHABLE, res.status);
  return body as T;
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const askDesk = (role: DeskRole, question: string, session: string) =>
  call<AskReply>("/api/desk/ask", post({ role, question, session }));

export const getDeskState = () => call<DeskState>("/api/desk/state");

export const deskAdmin = (action: AdminAction) => call<DeskState>("/api/desk/admin", post(action));

const KEY = "desk-session";
function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
export function getSession(): string {
  try {
    let s = sessionStorage.getItem(KEY);
    if (!s) {
      s = newId();
      sessionStorage.setItem(KEY, s);
    }
    return s;
  } catch {
    return newId();
  }
}
export function newSession(): string {
  const s = newId();
  try {
    sessionStorage.setItem(KEY, s);
  } catch {
    // ignore
  }
  return s;
}
