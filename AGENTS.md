<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- This is the common repository for all teams (ipp-coop-2026/ipp-coop). It is not connected to Lovable; the Lovable note above applies only to Team 1's working repository. Changes reach main through pull requests (CONTRIBUTING.md).

- Merging this app with other teams' apps or the shared co-op database: read `INTEGRATION.md` first (ownership by team, code map, deploy, record and skill mappings, merge order).
- All IPP demo records live in browser localStorage under one key via `src/lib/ipp-store.ts`; why: demo step forbids backend/auth, and records must persist across simulated role switches.
- Each persona view is its own route (/student, /employer, /admin, /faculty) wrapped in `AppShell`; `/` redirects to /student.
- Student search, application submission and profile validation use pure shared-store helpers; application and faculty-review creation are persisted in one save so role views read a consistent handoff.
- Persona views that only inspect records build their screen from a pure join helper in the shared store (e.g. `facultyApplicationRecords`) and expose no mutating control; why: the Faculty increment is read-only and every view must show the same linked IDs.
