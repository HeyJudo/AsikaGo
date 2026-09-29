# AsikaGo Sprint 2 Team Meeting Agenda

**Date:** September 29, 2026
**Sprint:** Sprint 2 (September 21 - October 2, 2026). **4 days left**, including today.
**Facilitator:** Product Owner (Member 1)
**Note taker / board keeper:** Scrum Master + QA Lead (Member 2)
**Length:** about 60 minutes

**Meeting goals**

1. Everyone knows what is already done in the repo.
2. Every remaining Sprint 2 item has one owner and a due date before October 2.
3. Blockers are named and have someone assigned to clear them.

---

## Agenda at a glance

| # | Topic | Time | Lead |
|---|---|---|---|
| 1 | Opening and sprint goal recap | 5 min | Member 1 |
| 2 | Progress update: what is done | 15 min | Member 1 |
| 3 | Round table: each member's status | 10 min | Everyone |
| 4 | Assigning the remaining work | 15 min | Member 1 + Member 2 |
| 5 | Team rules and setup check | 5 min | Member 2 |
| 6 | Blockers, risks, questions | 5 min | Member 2 |
| 7 | Recap and next steps | 5 min | Member 1 |

---

## 1. Opening and sprint goal recap (5 min)

Read the Sprint 2 goal out loud:

> **Foundation and Research Sprint.** Set up the technical and research
> foundation for AsikaGo: architecture, database, business profile
> foundation, the first registration knowledge base, and the core user stories.

Remind the team that Sprint 2 ends on **Friday, October 2**. Anything that won't
be done by then gets discussed today, not on Friday.

---

## 2. Progress update: what is done (15 min)

Walk through each item. Show the repo or run the app if you can
(`README.md` → **Run**).

### Board status as of today

| ID | Story | Pts | Owner | Status |
|---|---|---|---|---|
| TE-001 | Project Architecture Setup | 3 | Member 1 + Member 3 | ✅ Done, needs team review |
| TE-002 | Database Design | 5 | Member 3 | ✅ Done, needs team review |
| US-003 | Create User Account | 5 | Member 3 | 🟡 Mostly done (see note) |
| US-001 | Provide Business Information | 5 | Member 1 + Member 4 | ⬜ Not started |
| RS-001 | Research Registration Workflow | 5 | Member 5 | ❓ Ask Member 5 |
| RS-002 | Research City Requirements | 5 | Member 5 | ❓ Ask Member 5 |

**Points:** 13 of 28 are built (46%). US-001 (5) and the two research stories (10) are left.

### TE-001: Project Architecture Setup ✅

What exists now:

- **Monorepo on GitHub** with `frontend/`, `backend/`, `database/`, `docs/`.
- **Frontend:** React + Vite + TypeScript, Tailwind + shadcn/ui, React Router,
  TanStack Query. Deploys to Vercel.
- **Backend:** ASP.NET Core (.NET 10) Minimal API, split into feature folders
  (Assessment, Roadmap, Progress, Assistant, KnowledgeBase). Dockerfile ready
  for Render.
- **API types are generated.** The backend publishes an OpenAPI file and the
  frontend generates TypeScript types from it. If someone changes an endpoint
  without regenerating, the build breaks right away and not in production.
- **CI (GitHub Actions)** builds and tests both sides on every PR.
- **README.md** covers setup, run, and daily workflow commands.
- **docs/decisions.md** lists the architecture decisions we agreed on.

Acceptance criterion AC-TE001-01 is met: the React and ASP.NET Core foundations exist.

### TE-002: Database Design ✅

- Schema is built as **EF Core migrations** (`InitialSchema`) on Supabase Postgres.
- Tables: `profiles`, `business_profiles`, `business_categories`, `cities`,
  `registration_steps`, `requirements`, `roadmap_rules`, `user_roadmaps`,
  `roadmap_progress`, `requirement_progress`, `source_references`.
- Table names were fixed to match the Database Design Specification.
- **Changes from the spec doc** (D1 to D7 in `docs/decisions.md`). Point out the
  important ones:
  - `business_type` was added to `business_profiles` because US-001 collects it.
  - `roadmap_rules` is structured (category / city / step / effect) instead of free text.
  - The progress percentage is calculated when needed and not stored.
  - `users` is now `profiles`, because Supabase Auth manages the accounts.

AC-TE002-01 is met: tables and relationships are documented in the spec and in decisions.md.

**Ask the team:** has everyone read decisions.md? Does anyone object to a change?

### US-003: Create User Account 🟡

- Sign in with **Google** or **continue as guest** (Supabase anonymous sign-in).
- A guest who later links Google **keeps the same account**, so their
  assessment answers are not lost.
- The backend checks the Supabase login token. `GET /api/me` creates or updates
  the user's profile row.
- Backend tests cover health and auth (`HealthAndAuthTests`).

| AC | Status |
|---|---|
| AC-003-01: account is created | ✅ Met |
| AC-003-02: after logging in, the user can see saved info | 🟡 Only the profile works so far. Fully met once US-001 saves the business profile. |

> Note: TE-005 (Authentication Setup) is also marked Sprint 2 in the backlog
> but isn't on the board. It is covered by this work. **Decision needed:**
> mark TE-005 done with US-003?

---

## 3. Round table (10 min)

About 2 minutes per person. Everyone answers the same three questions:

1. What did I finish since the sprint started?
2. What am I working on now?
3. Is anything blocking me?

**Member 5 (Research + AI):** this is the most important round because the repo
has no research output yet (`database/seed/` is empty). Ask:

- Where does the registration workflow document (RS-001) stand?
- Which cities are done for RS-002: QC, Manila, Pasig?
- Do we have the source links (official LGU / DTI / BIR pages) for each requirement?

---

## 4. Assigning the remaining work (15 min)

> The full ticket list, with acceptance criteria, dependencies, and estimates, is in
> `docs/AsikaGo_Sprint2_Ticket_Breakdown_v1.0.md`. The tables below are the short version.

### US-001: Provide Business Information (the main build task left)

US-001 needs the backend, the frontend, and the research data, so split it up:

| Task | Owner | Due |
|---|---|---|
| Confirm the assessment fields: what "business type" means, and the options (see US-001-PM-01) | Member 1 | Sep 29 |
| Backend: `GET /api/assessment/options`, `PUT` and `GET /api/business-profile` in `Features/Assessment/`. Save and load the business profile, validate required fields, and write tests. | Member 3 | Oct 1 |
| Frontend: assessment form in `src/features/assessment/` with category, type, location, and registration status fields, plus validation messages | Member 4 | Oct 1 |
| User flow: sign in → assessment → saved. Connect the frontend to the API and regenerate API types. | Member 1 | Oct 1 |
| QA: test against AC-001-01, 02, and 03, and retest AC-003-02 | Member 2 | Oct 2 |

Acceptance criteria to meet:

- **AC-001-01:** the entered category, type, location, and status are saved.
- **AC-001-02:** missing fields show validation messages.
- **AC-001-03:** the saved data can later be used to generate the roadmap.

> Note: US-004 (Create Business Profile, Sprint 2 in the backlog) is not on
> the board. It overlaps a lot with US-001. **Decision needed:** combine it
> with US-001 or move it to Sprint 3?

### RS-001 and RS-002: Research

| Task | Owner | Due |
|---|---|---|
| RS-001: registration flow document (steps in order: DTI/SEC → Barangay → Mayor's Permit → BIR, etc.) in `docs/` | Member 5 | Oct 1 |
| RS-002: requirements per city with a source link for each | Member 5 | Oct 2 |
| Review research for completeness | Member 1 + Member 2 | Oct 2 |

If Member 5 is overloaded, **decide today** who helps. Don't wait until Friday.

### Team review of done items

| Task | Owner | Due |
|---|---|---|
| Everyone runs the app locally using the README | All | Sep 30 |
| Review and approve TE-001 and TE-002 (read decisions.md) | All | Sep 30 |
| Move items on the board (To Do / In Progress / Done) | Member 2 | Ongoing |

---

## 5. Team rules and setup check (5 min)

Go through these quickly and confirm everyone can follow them:

- [ ] Everyone has access to the GitHub repo, the Supabase `asikago-dev` project, and Azure Boards.
- [ ] Everyone has **.NET 10 SDK** and **Node.js 24** installed.
- [ ] **Never push to `main`.** Branch as `feature/123-short-name`, open a PR,
      wait for green CI, and get 1 review.
- [ ] Put the ticket in commits and PRs: `AB#123`.
- [ ] Changed an endpoint? Run `dotnet build`, then `npm run gen:api`, and commit both files.
- [ ] Never commit passwords or keys. Use `dotnet user-secrets` and `.env.local`.
- [ ] Only apply database migrations from `main`.

---

## 6. Blockers, risks, questions (5 min)

Risks to raise:

| Risk | Mitigation |
|---|---|
| US-001 is not started and there are only 4 days left | Split across 4 people (Section 4). Frontend and backend agree on the API shape today. |
| Research output is not in the repo yet | Cities and categories are already seeded, so the form is not blocked. Research must still land by Oct 2 for Sprint 3. |
| Render free tier goes to sleep after 15 minutes | Open the API a few minutes before any demo. |
| Some docs are out of date (the PRD priorities for US-002 and US-014) | The backlog wins. Update the PRD in Sprint 3. |

Write down any new blockers with an owner.

---

## 7. Recap and next steps (5 min)

The facilitator reads back:

1. Each person's tasks and due dates (from Section 4).
2. Decisions made today: TE-005, US-004, research help.
3. Next check-in: **Oct 1**, a quick standup to check US-001 integration.
4. Sprint 2 review / submission: **Oct 2**.

**After Sprint 2** (preview, don't plan it today): backlog refinement, then
Sprint 3 with US-005 Generate Roadmap, TE-004 Roadmap Rule Engine, TE-006 API
Development, and RS-003 Category Variations.

---

## Meeting notes (fill in during the meeting)

**Attendees:**

**Decisions:**

- TE-005:
- US-004:
- Research help:

**Action items:**

| Action | Owner | Due |
|---|---|---|
| | | |

**Blockers raised:**
