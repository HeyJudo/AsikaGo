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
| Environments | One hosted Supabase project, `asikago-dev`, serves local dev and the deployed app. No separate prod project. | Academic project with no real users. No Docker required on team laptops. Migrations run only through CI (`migrate-db` job) after a merge to `main`; never run `dotnet ef database update` by hand. |
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
| D8 | MVP scope is Pasig City only. The `cities` table and `city_id` columns stay; only Pasig is seeded, and the QC/Manila seed rows are removed by a new migration (ScopeToPasig). The assessment form has no City field; the backend sets Pasig. Non-Pasig users see a landing-page scope notice and are not blocked. | Narrower research load for Sprint 2, one LGU's rules to verify, and expansion is seed-data only. |
| D9 | `roadmap_rules` gets a nullable `business_type` column (null = any type). Step 1A (DTI) applies to Sole Proprietorship. Step 1B (SEC) applies to Partnership, Corporation, and One Person Corporation. | The first step depends on the business type, and rules can't express that today. |
| D10 | **Replaced by D16.** `GET /api/roadmap` builds and saves the roadmap the first time it is called. Saving the business profile with a **different business type or category** deletes the saved roadmap, and the next `GET` builds a new one. Revisit this in Sprint 4, when step progress exists. | No extra button or endpoint. Nothing is lost yet, because progress tracking (US-011) is Sprint 4. |
| D11 | The US-002 preview is the guest's real roadmap, shown with a "Save your progress with Google" prompt. There is no separate preview endpoint. | Guests already have a real account (anonymous sign-in). |
| D12 | **Line replaced by D20.** Registration status (`Planning` / `Started`) does not change the steps. `Started` users see one line on the roadmap: "Already done some steps? You'll be able to mark them as done soon." | Marking steps done is US-011 (Sprint 4). |
| D13 | `registration_steps` gets `actions` (text, what to do, one action per line) and `condition_note` (text, nullable, for example "Only if your place is newly built or renovated"). Conditional steps (Step 3 mall / Ortigas, Step 4 FSIC for Occupancy) use `condition_note`. **No new assessment fields.** | US-006 needs "actions". Conditions are shown to the user instead of asked. |
| D14 | Only the step list is saved in the roadmap (`roadmap_progress`). Requirements are worked out when the step is opened, from the saved steps and the current rules. | Requirement progress is Sprint 4 (`requirement_progress`). |
| D15 | Keep the 3 categories. No category migration (RS-002-04). Line-of-business clearances are shown as "If your business is a ...:" requirements under the user's category. | Category doesn't change the step list. More categories wouldn't fix line-specific rules. |
| D16 | Replaces D10. Changing business type or category no longer deletes the roadmap. The backend rebuilds the step list in place: steps still in the new roadmap keep their status, removed steps are dropped, new steps start as `NotStarted`. `requirement_progress` rows are kept. | Progress exists now. Most steps survive a category change, so wiping them loses real work. |
| D17 | The user marks a step done or not done. Only `NotStarted` and `Completed` are stored. "In progress" is worked out: at least one document is checked and the step is not done. Checking every document does **not** finish the step. | A step is done when the office visit is done, not when papers are ready. D4: don't store derived data. |
| D18 | Progress percentage = completed steps ÷ total steps, rounded down. The "next step" is the first step that is not done. Both are computed, never stored. | One clear number. D4. |
| D19 | A checked document only counts if the requirement is still in the user's roadmap under the current rules (D14). Rows for requirements that no longer apply are ignored, not deleted. | Seed updates can't produce wrong counts, and nothing needs a cleanup job. |
| D20 | D12's line becomes "Already done some steps? Open a step and mark it as done." Guests see the existing Save with Google banner on every screen where they can check something. | The feature now exists. A guest's checkmarks are lost if they never link Google. |
| — | `users` becomes `profiles`, keyed by `auth.users.id`; `auth_provider` dropped (Supabase stores it). | Supabase Auth owns identities. |
| — | `roadmap_progress` rows are a snapshot of the generated roadmap. | Research updates don't silently change a user's existing roadmap. |

## Doc drift to fix

Backlog v1.1 moved US-002 (Preview) to Should Have and US-014 (Offices) to
Could Have; the PRD still lists the old priorities. The backlog wins.

The PRD, Tech Architecture, DB Design Spec, Backlog and README were updated in
place for D8 (Pasig-only MVP).
