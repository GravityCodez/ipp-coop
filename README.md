# IPP – Master: Internship Practicum Platform

> **Common repository for all teams (BUS 2010, Fall 2026).** This is the shared IPP app for the cross-team merge, started from Team 1's app (their ipp-share snapshot, history kept) with Team 3's P03 review, publication and Internship Desk added. Live copy: https://coh-ipp-coop-26b134973f81406a.cohesivity.workers.dev (deploy with `node deploy/cohesivity.mjs`, see INTEGRATION.md section 12). Team 1's Render site (https://ipp-master.onrender.com) still deploys from their private repository. People are named by team role here.

## How teams contribute

1. Create a branch named after your team and part, e.g. `team2-employer`.
2. Keep your changes to your own pages and `src/lib/<your part>/` where you can; note any shared-file edits in the pull request.
3. Run `npx -y bun@1.4.0 run test` and `npx -y bun@1.4.0 run build` before opening a pull request into `main`.
4. Never commit keys. Supabase team keys, Groq and Anthropic keys go in environment variables only.
5. Record what your part adds in INTEGRATION.md (one numbered section per team).

One integrated demonstration app for a university internship practicum: Employer HR submits an opportunity, a University Administrator approves it, a Student applies, and a Faculty Reviewer sees the application and its status. All data is synthetic, role switching is simulated, and records are stored in the browser only.

Sprint 2 adds two AI features for students:

- **FAQ & help chatbot** (`/faq` and the "Ask IPP" button on every page): answers only from the approved FAQ (8 questions, `src/lib/ai/knowledge.ts`), cites the FAQ IDs it used, and hands anything else to the co-op office instead of guessing.
- **Recommended internships** (Student → Recommended): a rules-based matching engine ranks the top three approved listings for a synthetic profile and explains each rank (skills, interests, preferences, gaps). Eligibility is shown separately and is not part of the ranking. A recommendation is not a placement.

Built by four class teams in Sprint 1 (BUS 2010, Fall 2026):

| Team | Role view |
| --- | --- |
| Team 1 | Student |
| Team 2 | Employer HR |
| Team 3 | University Administrator |
| Team 4 | Faculty Reviewer |

## Links

| Item | Link | Access owner |
| --- | --- | --- |
| Lovable project (IPP - Master) | Private; editors only | Team 1 integrator (workspace owner) |
| Published app (GitHub deploy, chatbot with AI) | https://ipp-master.onrender.com (Render web service, deploys automatically from `main`; free plan, so the first visit after 15 idle minutes takes about a minute) | Team 1 integrator |
| Published app (Lovable) | https://ipp-master.lovable.app (anyone with the link; republish after each build). The chatbot runs in FAQ lookup mode here because the Groq key is set only on Render. | Team 1 integrator |
| GitHub repository | Working repository: GravityCodez/ipp-master (private), two-way sync with Lovable on `main`. Public snapshot: https://github.com/GravityCodez/ipp-share | Team 1 integrator (owner); collaborators added 3 Nov |
| Integrators | Team 1 integrator, with the data dictionary owner as backup. Other teams: to be named | Each team |

## How we work

- App changes go through `main` on GitHub or the Lovable project (they stay in sync), one integrator at a time (D-24). Keep `main` working: run the tests before pushing.
- Teams submit feature briefs and test evidence through Teams or GitHub issues.
- Shared fields and statuses change only through the Scrum of Scrums (docs/decisions.md).
- Never put credentials, tokens or real personal data in prompts, Teams or this repository.

## Documents

| File | Contents |
| --- | --- |
| INTEGRATION.md | Handoff for the cross-team merge: which team owns each part, code map, deploy, shared-database mapping, merge order |
| render.yaml | Render Blueprint with the live service's settings (secrets set in Render only) |
| docs/requirements.md | Product and Sprint 1 goals, shortlist, traceability |
| docs/data-dictionary.md | Common records, IDs, statuses, seed data, workflow |
| docs/decisions.md | Decision log |
| docs/test-cases.md | Acceptance tests and results |
| docs/prompt-log.md | Lovable prompts and resulting changes |
| sprint-1/ | Sprint board, feature briefs, staged prompts, Scrum of Scrums record |

## Running and editing the app

```bash
bun install --frozen-lockfile
bun run dev        # http://localhost:8080 (chatbot uses FAQ lookup unless GROQ_API_KEY is set)
bun run test       # unit tests, including matching and chatbot safeguards
```

The chatbot calls Groq (`openai/gpt-oss-120b`, backup `openai/gpt-oss-20b`) from the server route `src/routes/api/chat.ts`. Set `GROQ_API_KEY` only as a server environment variable (Render dashboard, or `.env.local` for local runs; both are outside git). Never put the key in code, prompts, Teams or this repository. Without a key, or when the model is rate limited, the route answers from the approved FAQ lookup.

Render build command: `npx -y bun@1.4.0 install --frozen-lockfile && NITRO_PRESET=node-server npx -y bun@1.4.0 run build`; start command: `node .output/server/index.mjs`.


- Edit the app in the Lovable project (editors only), one build slot at a time.
- The app is a TypeScript + Tailwind project synced from Lovable. Source is in `src/`; the shared data model and seed data are in `src/lib/ipp-store.ts`.
