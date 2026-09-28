# AsikaGo Architecture Decisions

Agreed during TE-001 (Project Architecture Setup). Where this conflicts with
the Technical Architecture or Database Design docs, this file wins until those
docs are updated.

## Stack and platform

| Area | Decision | Why |
|---|---|---|
| Auth | Supabase Auth (Google OAuth + anonymous sign-in). ASP.NET only validates the Supabase JWT (ES256, via OIDC discovery). | No OAuth code in .NET. Anonymous sign-in gives guests a real user id for the pre-login assessment (FR-001); linking Google later keeps the same id. |
| Data access | Frontend uses `supabase-js` for auth only. All data goes through the ASP.NET API. | Business logic belongs in the backend (Architecture Principle #1). One door to validate. |
| ORM / schema | EF Core + Npgsql. EF migrations are the only schema owner. Connect via the Supabase **session pooler (port 5432)**. | Typed, idiomatic, one tool. The transaction pooler (6543) breaks prepared statements. |
| Backend layout | .NET 10, Minimal APIs, vertical feature slices. Two projects: `AsikaGo.Api` + `AsikaGo.Tests`. | One backlog story = one feature folder. The roadmap engine is a pure class, unit-testable without DB/HTTP. |
| Frontend | Vite + TypeScript, React Router, TanStack Query, Tailwind + shadcn/ui. API types generated from the backend OpenAPI doc with `openapi-typescript`. | DTO changes break the frontend build, not production. |
| Environments | Shared hosted Supabase project `asikago-dev`; `asikago-prod` at deploy time. | No Docker required on team laptops. Migrations are applied only from `main`. |
| Hosting | Frontend on Vercel, API on Render (Docker). | Free tiers, auto-deploy from GitHub. Render sleeps after 15 min idle; warm it up before demos. |
| Repo / process | GitHub monorepo, Azure Boards for tickets, GitHub Actions CI, GitHub Flow. | Install the Azure Boards GitHub app; `AB#123` in commits/PRs links the ticket. |

## Branching

- `main` is protected: PRs only, CI must pass, 1 review.
- Branches: `feature/123-short-name` (no `#` in branch names).
- Commit / PR messages reference the ticket: `AB#123`.

## Database changes vs. Database Design Specification v1.0

| Ref | Change | Reason |
|---|---|---|
| D1 | `roadmap_rules` is structured: `category_id?`, `city_id?`, `step_id`, `requirement_id?`, `effect` (include/exclude), `sort_order`. Null = applies to any. | Free-text condition/action would need a string parser. |
| D2 | New `requirement_progress (roadmap_id, requirement_id, is_prepared, updated_at)`. | US-009 had no table. |
| D3 | `business_profiles.business_type` added. | PRD and US-001 collect it. |
| D4 | `user_roadmaps.progress_percentage` removed; computed. | Stored derived data drifts. |
| D5 | Step order lives on `roadmap_rules.sort_order` (copied to `roadmap_progress.sort_order`), not `registration_steps`. | Order can differ per city. |
| D6 | Knowledge-base data is authored as SQL in `database/seed/` and applied through EF migrations. | Reviewed, versioned, reproducible. |
| D7 | `business_profiles` is 1:M in the schema; 1:1 enforced in the app for the MVP. | Multi-business later needs no migration. |
| — | `users` becomes `profiles`, keyed by `auth.users.id`; `auth_provider` dropped (Supabase stores it). | Supabase Auth owns identities. |
| — | `roadmap_progress` rows are a snapshot of the generated roadmap. | Research updates don't silently change a user's existing roadmap. |

## Doc drift to fix

Backlog v1.1 moved US-002 (Preview) to Should Have and US-014 (Offices) to
Could Have; the PRD still lists the old priorities. The backlog wins.
