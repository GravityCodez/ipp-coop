# Contributing

This is the common app for every BUS 2010 Co-op team. One person per team (the team's integrator) sends that team's work as pull requests.

## Workflow

1. **Fork** the repository (or, if you are an org member, create a branch). Name branches after your team and part: `team2-employer-form`, `team5-supabase`.
2. **Stay in your lane.** Keep changes to your own pages and to `src/lib/<your-part>/` where you can. If you must change a shared file (`src/lib/ipp-store.ts`, `src/components/AppShell.tsx`, `src/styles.css`), say so in the pull request.
3. **Check locally** before opening the pull request:
   ```bash
   npx -y bun@1.4.0 x tsc --noEmit
   npx -y bun@1.4.0 run test
   npx -y bun@1.4.0 run build
   ```
4. **Open a pull request into `main`.** Fill in the template. CI runs the same three checks; a maintainer reviews and merges.
5. **Document your part** in [INTEGRATION.md](INTEGRATION.md): one numbered section per team covering what you added, environment variables, and any shared-database tables you use.

## Rules for `main`

- Changes reach `main` only through a pull request with passing CI.
- No force-pushes and no branch deletion.
- Shared fields, IDs and statuses change only after agreement at the Scrum of Scrums (log it in [docs/decisions.md](docs/decisions.md)).

## Style

- TypeScript, React 19, Tailwind 4, shadcn/ui components. Follow the existing look so the app stays unified.
- Plain, short UI text in sentence case. Errors say what happened and how to fix it.
- Synthetic data only. Never real names, emails or student IDs.
- Add or update tests in `src/test/` for logic you change.

## Keys and secrets

Never commit keys, tokens or `.env` files. Server keys go in `.env.local` (gitignored) or in the host's settings. See [SECURITY.md](SECURITY.md).
