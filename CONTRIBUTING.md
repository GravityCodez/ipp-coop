# Contributing

This is the common app for every BUS 2010 Co-op team. One person per team (the team's integrator) sends that team's work as pull requests.

## Workflow

1. **Branch** in this repository if you are in your team's GitHub team, or **fork** it otherwise. Name branches `p0X/<short-topic>`, e.g. `p02/employer-form`, `p05/supabase-client` (full rules in [docs/WORKFLOW.md](docs/WORKFLOW.md)).
2. **Stay in your module.** Write in `src/lib/p0X/`, `src/components/p0X/`, `src/routes/p0X.*` and `src/test/p0X-*`. Shared-core files need a maintainer review; see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
3. **Check locally** before opening the pull request:
   ```bash
   npx -y bun@1.4.0 x tsc --noEmit
   npx -y bun@1.4.0 run test
   npx -y bun@1.4.0 run build
   ```
4. **Open a pull request into `main`.** Fill in the template. CI runs the same three checks; a maintainer reviews and merges.
5. **Document your part** in [INTEGRATION.md](INTEGRATION.md): one numbered section per team covering what you added, environment variables, and any shared-database tables you use.

## Rules for `main`

- Changes reach `main` only through a pull request with 1 approval and passing CI. Never approve your own pull request.
- No force-pushes and no branch deletion. Pull requests are squash-merged.
- Shared fields, IDs and statuses change only after agreement at the Scrum of Scrums (log it in [docs/decisions.md](docs/decisions.md)).

## Style

- TypeScript, React 19, Tailwind 4, shadcn/ui components. Follow the existing look so the app stays unified.
- Plain, short UI text in sentence case. Errors say what happened and how to fix it.
- Synthetic data only. Never real names, emails or student IDs.
- Add or update tests in `src/test/` for logic you change.

## Keys and secrets

Never commit keys, tokens or `.env` files. Server keys go in `.env.local` (gitignored) or in the host's settings. See [SECURITY.md](SECURITY.md).
