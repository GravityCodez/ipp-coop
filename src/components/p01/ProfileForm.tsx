import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { suggestSkillsLive, type SkillSuggestion } from "@/lib/db";
import {
  addSkills,
  ARRANGEMENTS,
  GOALS_MAX,
  mapSkill,
  type FieldErrors,
  type ProfileContent,
  type Term,
} from "@/lib/p01";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillBadge, skillName } from "./shared";

const FieldError = ({ id, text }: { id: string; text: string | undefined }) =>
  text ? (
    <p id={id} className="mt-1 text-sm text-destructive">
      {text}
    </p>
  ) : null;

function Chips({
  label,
  hint,
  values,
  error,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  error: string | undefined;
  disabled: boolean;
  onChange: (v: string[]) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim().slice(0, 60);
    if (t && !values.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...values, t]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
          >
            {v}
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${v}`}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        ))}
        {!values.length && disabled && <span className="text-sm text-muted-foreground">none</span>}
      </div>
      {!disabled && (
        <div className="mt-2 flex gap-2">
          <Input
            id={id}
            value={text}
            placeholder={hint}
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            onBlur={add}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Add to ${label.toLowerCase()}`}
            onClick={add}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      )}
      <FieldError id={`${id}-error`} text={error} />
    </div>
  );
}

function Skills({
  value,
  vocab,
  error,
  disabled,
  onChange,
}: {
  value: ProfileContent;
  vocab: Term[];
  error: string | undefined;
  disabled: boolean;
  onChange: (c: ProfileContent) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [hints, setHints] = useState<{ phrase: string; list: SkillSuggestion[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const add = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    setHints(null);
    onChange(addSkills(value, [t], vocab));
    if (mapSkill(t, vocab)) return;
    // Not in the shared list: ask P05's live model for the nearest terms. A person still decides.
    setBusy(true);
    try {
      const list = (await suggestSkillsLive(t)).filter((s) => s.suggested);
      setHints({ phrase: t, list });
    } catch {
      setHints({ phrase: t, list: [] });
    } finally {
      setBusy(false);
    }
  };
  const use = (s: SkillSuggestion, phrase: string) => {
    const without = {
      ...value,
      unmapped_skills: value.unmapped_skills.filter(
        (x) => x.toLowerCase() !== phrase.toLowerCase(),
      ),
    };
    onChange(addSkills(without, [s.skill_id], vocab));
    setHints(null);
  };
  return (
    <div>
      <Label htmlFor={id}>Skills</Label>
      <ul className="mt-2 divide-y divide-border rounded-2xl border border-border">
        {value.skills.map((s) => (
          <li
            key={s.skill_id}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <SkillBadge skill={s} name={skillName(vocab, s.skill_id)} />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove ${skillName(vocab, s.skill_id)}`}
                onClick={() =>
                  onChange({
                    ...value,
                    skills: value.skills.filter((x) => x.skill_id !== s.skill_id),
                  })
                }
              >
                Remove
              </Button>
            )}
          </li>
        ))}
        {value.unmapped_skills.map((u) => (
          <li key={u} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span>
              <span className="block font-medium">{u}</span>
              <span className="text-xs text-muted-foreground">
                Not in the shared list. Kept for a person to map, never matched silently.
              </span>
            </span>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove ${u}`}
                onClick={() =>
                  onChange({
                    ...value,
                    unmapped_skills: value.unmapped_skills.filter((x) => x !== u),
                  })
                }
              >
                Remove
              </Button>
            )}
          </li>
        ))}
        {!value.skills.length && !value.unmapped_skills.length && (
          <li className="px-4 py-3 text-sm text-muted-foreground">No skills yet.</li>
        )}
      </ul>
      {!disabled && (
        <div className="mt-2 flex gap-2">
          <Input
            id={id}
            value={text}
            list={`${id}-list`}
            placeholder="Add a skill, for example Tableau"
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void add();
              }
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <datalist id={`${id}-list`}>
            {vocab.map((t) => (
              <option key={t.skill_id} value={t.label} />
            ))}
          </datalist>
          <Button type="button" variant="outline" onClick={() => void add()}>
            Add
          </Button>
        </div>
      )}
      {busy && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Looking for the nearest shared skill…
        </p>
      )}
      {hints && !disabled && (
        <p role="status" className="mt-2 text-sm">
          {hints.list.length ? (
            <>
              “{hints.phrase}” is not in the shared list. Did you mean{" "}
              {hints.list.map((s) => (
                <button
                  key={s.skill_id}
                  type="button"
                  className="mr-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => use(s, hints.phrase)}
                >
                  {s.label} ({Math.round(s.similarity * 100)}%)
                </button>
              ))}
            </>
          ) : (
            <>“{hints.phrase}” is kept as written for a coordinator to map.</>
          )}
        </p>
      )}
      <FieldError id={`${id}-error`} text={error} />
    </div>
  );
}

const Row = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-5 sm:grid-cols-2">{children}</div>
);

export function ProfileForm({
  value,
  errors,
  vocab,
  disabled,
  onChange,
}: {
  value: ProfileContent;
  errors: FieldErrors;
  vocab: Term[];
  disabled: boolean;
  onChange: (c: ProfileContent) => void;
}) {
  const set = <K extends keyof ProfileContent>(k: K, v: ProfileContent[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="p01-goals">What I want to learn</Label>
        <Textarea
          id="p01-goals"
          rows={3}
          className="mt-2"
          value={value.goals}
          disabled={disabled}
          maxLength={GOALS_MAX + 50}
          onChange={(e) => set("goals", e.target.value)}
          aria-invalid={!!errors.goals}
          aria-describedby={errors.goals ? "p01-goals-error" : undefined}
        />
        <FieldError id="p01-goals-error" text={errors.goals} />
      </div>
      <Row>
        <Chips
          label="Sectors"
          hint="For example aviation"
          values={value.sectors}
          error={errors.sectors}
          disabled={disabled}
          onChange={(v) => set("sectors", v)}
        />
        <Chips
          label="Roles"
          hint="For example data analyst"
          values={value.roles}
          error={errors.roles}
          disabled={disabled}
          onChange={(v) => set("roles", v)}
        />
      </Row>
      <Row>
        <Chips
          label="Locations"
          hint="For example Dubai"
          values={value.locations}
          error={errors.locations}
          disabled={disabled}
          onChange={(v) => set("locations", v)}
        />
        <fieldset>
          <legend className="text-sm font-medium">Ways of working</legend>
          <div className="mt-2 flex flex-wrap gap-4 pt-1.5">
            {ARRANGEMENTS.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={value.work_arrangements.includes(a)}
                  disabled={disabled}
                  onChange={(e) =>
                    set(
                      "work_arrangements",
                      e.target.checked
                        ? [...value.work_arrangements, a]
                        : value.work_arrangements.filter((x) => x !== a),
                    )
                  }
                />
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </label>
            ))}
          </div>
          <FieldError id="p01-arr-error" text={errors.work_arrangements} />
        </fieldset>
      </Row>
      <Row>
        {(
          [
            ["available_from", "Available from"],
            ["available_to", "Available to"],
          ] as const
        ).map(([k, label]) => (
          <div key={k}>
            <Label htmlFor={`p01-${k}`}>{label}</Label>
            <Input
              id={`p01-${k}`}
              type="date"
              className="mt-2"
              value={value[k] ?? ""}
              disabled={disabled}
              onChange={(e) => set(k, e.target.value || null)}
              aria-invalid={!!errors[k]}
              aria-describedby={errors[k] ? `p01-${k}-error` : undefined}
            />
            <FieldError id={`p01-${k}-error`} text={errors[k]} />
          </div>
        ))}
      </Row>
      <Skills
        value={value}
        vocab={vocab}
        error={errors.skills}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}
