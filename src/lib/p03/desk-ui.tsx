// Small UI helpers used by the P03 Internship Desk pages (ported from Team 3's app).
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed h-9 px-4 py-2";

export function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }) {
  const v =
    variant === "outline"
      ? "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
      : "bg-primary text-primary-foreground shadow hover:bg-primary/90";
  return <button type="button" className={`${base} ${v} ${className}`} {...props} />;
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
      {...props}
    />
  );
}

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
      {children}
    </label>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-3xl font-semibold tabular-nums tracking-tight ${tone === "warn" ? "text-warn-foreground" : "text-primary"}`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function timeAgo(iso?: string, now = Date.now()): string {
  if (!iso) return "";
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Re-render every `ms` so relative times stay fresh. */
export function useNow(ms = 30000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

// ---------- Toasts ----------
type Toast = { id: number; title: string; body?: string | undefined };
let toasts: Toast[] = [];
let toastSeq = 0;
const toastListeners = new Set<() => void>();
export function toast(title: string, body?: string) {
  const t = { id: ++toastSeq, title, body };
  toasts = [...toasts, t].slice(-3);
  toastListeners.forEach((l) => l());
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    toastListeners.forEach((l) => l());
  }, 5000);
}

export function Toaster() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    toastListeners.add(l);
    return () => {
      toastListeners.delete(l);
    };
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-50 flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast pointer-events-auto rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur"
        >
          <p className="text-sm font-semibold text-primary">{t.title}</p>
          {t.body && <p className="mt-0.5 text-sm text-muted-foreground">{t.body}</p>}
        </div>
      ))}
    </div>
  );
}
