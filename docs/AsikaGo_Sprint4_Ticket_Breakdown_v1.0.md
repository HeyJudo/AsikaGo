# AsikaGo Sprint 4 Ticket Breakdown v1.0

## Document Information

**Project:** AsikaGo
**Sprint:** Sprint 4 (October 19 - October 30, 2026)
**Sprint goal:** Tracking. A Pasig business owner can check off the documents
they have prepared and the steps they have finished, see how far along they are
and what to do next, and never lose that progress.
**Prepared:** October 19, 2026
**Owner:** Product Owner
**Status:** Approved by PO on Oct 19, 2026. Tickets created in Azure Boards (AB#90 to AB#109).
**Purpose:** Split the Sprint 4 stories into tasks that one person can finish,
each with acceptance criteria, dependencies, and an estimate. Every ticket below
is a Task in Azure Boards under its parent story.

**Related documents:** Product Backlog v1.1, `docs/decisions.md`, Sprint 3
Ticket Breakdown v1.0

---

## 1. How to read this document

Ticket IDs, fields, Definition of Ready, Definition of Done, and the writing
rules for user-facing text are the same as Sprint 3 Ticket Breakdown, Section 1.
Work not tied to one story uses `S4` as its parent. New discipline code: `AI`
(AI prompt and evaluation work).

### Sprint scope

| Story | Pts | Why it is in Sprint 4 |
|---|---|---|
| US-008 View Required Documents | 5 | Planned (Must Have) |
| US-009 Track Document Completion | 3 | Planned (Must Have) |
| US-011 Track Registration Progress | 5 | Planned (Must Have) |
| TE-003 AI Integration Setup | 5 | Pulled from Sprint 5. Proves Gemini works before US-012 and US-013 depend on it |
| US-014B Government Office Info (research half) | 5 | Pulled from Sprint 6. Office research takes days of waiting on replies. The screen (US-014A) stays in Sprint 6 |
| **Total** | **23** | Sprint 3 delivered 42. The gap is on purpose: Sprint 4 closes the last Must Haves |

---

## 2. Current state (what already exists)

Don't build these again:

| Already exists | Where |
|---|---|
| `roadmap_progress` rows per saved step, with `Status` (`NotStarted` / `InProgress` / `Completed`) and `CompletedAt`. Nothing writes them yet | `Data/Entities/RoadmapProgress.cs` |
| `requirement_progress (roadmap_id, requirement_id, is_prepared, updated_at)` table (D2). Nothing writes it yet | `Data/Entities/RequirementProgress.cs` |
| Both progress tables cascade-delete with the roadmap | `Data/AppDbContext.cs` |
| `GET /api/roadmap` and `GET /api/roadmap/steps/{number}` | `Features/Roadmap/RoadmapEndpoints.cs` |
| Saving the profile with a new type or category deletes the roadmap (D10) | `Features/Assessment/AssessmentEndpoints.cs` (line 120) |
| Step detail lists each step's documents under "What to bring" | `frontend/src/features/roadmap/StepDetailPage.tsx` |
| Guest banner "Save with Google" on the roadmap screen | `RoadmapPage.tsx` (`GuestBanner`), `features/auth/useLinkGoogle.ts` |
| D12 placeholder line for `Started` users | `RoadmapPage.tsx` (line 138) |
| Static "Your route progress" panel | `features/assessment/MyBusinessPage.tsx` (line 122) |
| Query hooks `useRoadmap`, `useRoadmapStep` | `frontend/src/lib/queries.ts` |
| Roadmap API integration tests with a fake signed-in user | `backend/tests/AsikaGo.Tests/RoadmapTests.cs` |

**Not there yet:** any write endpoint for progress, a whole-roadmap document
list, `features/progress/` (empty), `features/assistant/` (empty), any Gemini
code, and any office research.

---

## 3. Sprint 4 decisions

### S4-PM-01: Record the Sprint 4 decisions (D16-D20)

| Field | Value |
|---|---|
| AB# | AB#90 |
| Parent | US-011A (AB#36) |
| Type | Product / Decision |
| Assignee | Jude |
| Priority | **Must. This is the first ticket.** |
| Estimate | 1 h |
| Due | **Oct 19** |
| Depends on | None |
| Blocks | US-011-BE-01, US-011-UI-01, US-011-BE-03 |

**Description.** The PO agreed these decisions on Oct 19. Write them into
`docs/decisions.md` so everyone builds against the same rules.

| Ref | Decision | Why |
|---|---|---|
| D16 | Replaces D10. Changing business type or category no longer deletes the roadmap. The backend rebuilds the step list in place: steps still in the new roadmap keep their status, removed steps are dropped, new steps start as `NotStarted`. `requirement_progress` rows are kept. | Progress exists now. Most steps survive a category change, so wiping them loses real work. |
| D17 | The user marks a step done or not done. Only `NotStarted` and `Completed` are stored. "In progress" is worked out: at least one document is checked and the step is not done. Checking every document does **not** finish the step. | A step is done when the office visit is done, not when papers are ready. D4: don't store derived data. |
| D18 | Progress percentage = completed steps ÷ total steps, rounded down. The "next step" is the first step that is not done. Both are computed, never stored. | One clear number. D4. |
| D19 | A checked document only counts if the requirement is still in the user's roadmap under the current rules (D14). Rows for requirements that no longer apply are ignored, not deleted. | Seed updates can't produce wrong counts, and nothing needs a cleanup job. |
| D20 | D12's line becomes "Already done some steps? Open a step and mark it as done." Guests see the existing Save with Google banner on every screen where they can check something. | The feature now exists. A guest's checkmarks are lost if they never link Google. |

**Acceptance criteria.**

- [ ] D16-D20 are in `docs/decisions.md`, and D10 and D12 are marked as replaced.
- [ ] The team is told in the group chat that the decisions are final.

### S4-PM-02: Sync Notion and Azure Boards

| Field | Value |
|---|---|
| AB# | AB#91 |
| Parent | US-011A (AB#36) |
| Type | Product |
| Assignee | Jude |
| Priority | Must |
| Estimate | 2 h |
| Due | **Oct 19** |
| Depends on | This document approved |
| Blocks | None |

**Acceptance criteria.**

- [ ] Notion Sprint Planning: Sprint 3 Complete (42 pts), Sprint 4 active with the scope in Section 1.
- [ ] Notion Backlog: Sprint 3 items Done. TE-003 and US-014 sprint fields updated.
- [ ] Notion Current Sprint Board shows Sprint 4.
- [ ] Azure: TE-003 (AB#63) and US-014B (AB#57) moved to Sprint 4, AB#35 and AB#53 moved under the Document Management feature, all tasks below created with AB# filled into this doc.

---

## 4. API contract (final after US-011-BE-01)

US-011-BE-01 publishes this with placeholder values on Oct 20 so the frontend can
start. Changes after that go in the group chat and the PR description.

```http
GET /api/roadmap                       (fields added to RoadmapResponse)
{
  ...existing fields,
  "completedSteps": 3,
  "progressPercent": 30,                // D18
  "nextStepNumber": 4,                  // null when every step is done
  "steps": [
    {
      ...existing fields,
      "status": "InProgress",           // "NotStarted" | "InProgress" | "Completed" (D17)
      "preparedCount": 2                // checked documents that still apply (D19)
    }
  ]
}

GET /api/roadmap/steps/{number}        (fields added to StepDetailResponse)
{
  ...existing fields,
  "status": "NotStarted",
  "completedAt": null,                  // set when the step is marked done
  "requirements": [ { ...existing fields, "isPrepared": true } ]
}

PUT /api/roadmap/steps/{number}/status
body: { "completed": true }
204     -> saved
401     -> not signed in
404     -> no business profile, or the number is not in the roadmap

PUT /api/roadmap/requirements/{requirementId}
body: { "isPrepared": true }
204     -> saved
401     -> not signed in
404     -> no business profile, or the requirement is not in the user's roadmap

GET /api/roadmap/documents
200 OK -> DocumentsResponse
401 / 404 as GET /api/roadmap

DocumentsResponse:
{
  "totalCount": 18,
  "preparedCount": 7,
  "steps": [
    { "number": 1, "name": "DTI Business Name Registration", "status": "Completed",
      "requirements": [ RequirementResponse with isPrepared ] }
  ]
}
```

After every PUT the frontend invalidates `['roadmap']`, `['roadmap-step', n]`
and `['roadmap-documents']`.

---

## 5. US-011 Track Registration Progress (5 pts)

**Story-level acceptance criteria:** The user can mark steps as complete.
Overall progress is shown. Status is saved per user.

### US-011-UI-01: Design the progress and checklist screens

| Field | Value |
|---|---|
| AB# | AB#92 |
| Parent | US-011B (AB#54) |
| Type | UI/UX |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 4 h |
| Due | **Oct 21** |
| Depends on | S4-PM-01 |
| Blocks | US-009-FE-01, US-011-FE-01, US-011-FE-02, US-008-FE-01 |

**Description.** One HTML mockup file in `docs/design/`, in the style of
`US-006-UI-01-step-detail-screen.html`, covering:

1. Roadmap screen: progress bar with "3 of 10 steps done", a status mark on each
   step, and a "Next: Step 4" button.
2. Step detail: a checkbox per document, a "Mark this step as done" button, and
   its done state with an undo option.
3. New "All documents" screen (`/roadmap/documents`): every document grouped by
   step, with a "7 of 18 ready" count.
4. My Business: the real progress panel.

**Acceptance criteria.**

- [ ] `docs/design/US-011-UI-01-progress-screens.html` covers all 4 screens at 360 px and desktop.
- [ ] All copy follows the writing rules. Buttons say what happens.
- [ ] Touch targets (checkboxes included) are at least 44 px.
- [ ] Seth and Jude approve it in the PR.

### US-011-BE-01: Publish the progress API contract and types

| Field | Value |
|---|---|
| AB# | AB#93 |
| Parent | US-011A (AB#36) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 2 h |
| Due | **Oct 20** |
| Depends on | S4-PM-01 |
| Blocks | US-011-BE-02, US-009-BE-01, US-008-BE-01, every FE ticket |

**Acceptance criteria.**

- [ ] The Section 4 fields and the 3 new endpoints exist with placeholder values (status `NotStarted`, counts 0, PUTs return 204).
- [ ] `backend/openapi/AsikaGo.Api.json` and `frontend/src/lib/api-types.ts` are regenerated and committed.
- [ ] Existing tests pass.

### US-011-BE-02: Mark a step done and compute progress

| Field | Value |
|---|---|
| AB# | AB#94 |
| Parent | US-011A (AB#36) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 4 h |
| Due | Oct 22 |
| Depends on | US-011-BE-01 |
| Blocks | US-011-FE-01, TE-006-BE-02 |

**Acceptance criteria.**

- [ ] `PUT /api/roadmap/steps/{number}/status` sets `Completed` + `CompletedAt`, or `NotStarted` + null.
- [ ] `status` follows D17, using `preparedCount` from US-009-BE-01 (until that merges, `InProgress` is never returned).
- [ ] `completedSteps`, `progressPercent`, and `nextStepNumber` follow D18.
- [ ] A user can only change their own roadmap. A step number outside the roadmap returns 404.

### US-011-BE-03: Keep progress when the roadmap is rebuilt

| Field | Value |
|---|---|
| AB# | AB#95 |
| Parent | US-011A (AB#36) |
| Type | Backend |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 4 h |
| Due | Oct 23 |
| Depends on | S4-PM-01 |
| Blocks | S4-QA-01 |

**Description.** Replace the D10 delete in `AssessmentEndpoints.cs` with the
D16 rebuild in place. Use `RoadmapEngine.GenerateRoadmap` for the new step list.

**Acceptance criteria.**

- [ ] Changing category keeps the status of steps in both roadmaps, removes steps no longer included, and adds new steps as `NotStarted`.
- [ ] `sort_order` of kept steps is updated to the new order.
- [ ] The roadmap id stays the same. `requirement_progress` rows are not deleted.
- [ ] Saving with the same type and category changes nothing.
- [ ] US-005-BE-03's tests are updated to the new behavior, and a new test covers a Retail → Food and Beverage change with a done step.

### US-011-FE-01: Progress on the roadmap and "mark as done" on step detail

| Field | Value |
|---|---|
| AB# | AB#96 |
| Parent | US-011B (AB#54) |
| Type | Frontend |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 5 h |
| Due | Oct 27 |
| Depends on | US-011-UI-01, US-011-BE-01 (build on placeholders), US-011-BE-02 (real data) |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] The roadmap shows the progress bar, "X of N steps done", a status mark per step, and a "Next: Step N" button (hidden when all steps are done, with a short "You're done" message).
- [ ] Step detail has "Mark this step as done" and an undo, matching US-011-UI-01.
- [ ] The D12 line is replaced with the D20 text.
- [ ] The button is disabled while saving, and a failed save shows an error without changing the screen.

### US-011-FE-02: Real progress on My Business

| Field | Value |
|---|---|
| AB# | AB#97 |
| Parent | US-011B (AB#54) |
| Type | Frontend |
| Assignee | Seth |
| Priority | Should |
| Estimate | 3 h |
| Due | Oct 28 |
| Depends on | US-011-UI-01, US-011-BE-02 |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] "Your route progress" uses `useRoadmap()` data: percentage, steps done, and the next step with a link to it.
- [ ] A user with no roadmap yet sees a link to their roadmap instead.

---

## 6. US-009 Track Document Completion (3 pts)

### US-009-BE-01: Save checked documents

| Field | Value |
|---|---|
| AB# | AB#98 |
| Parent | US-009A (AB#35) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 4 h |
| Due | Oct 23 |
| Depends on | US-011-BE-01 |
| Blocks | US-009-FE-01, US-008-BE-01, TE-006-BE-02 |

**Acceptance criteria.**

- [ ] `PUT /api/roadmap/requirements/{requirementId}` upserts `requirement_progress` with `UpdatedAt`.
- [ ] A requirement not in the user's current roadmap returns 404 (D19).
- [ ] `isPrepared` on step detail and `preparedCount` on the roadmap are real, counting only requirements that still apply.

### US-009-FE-01: Document checkboxes on step detail

| Field | Value |
|---|---|
| AB# | AB#99 |
| Parent | US-009B (AB#53) |
| Type | Frontend |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 4 h |
| Due | Oct 26 |
| Depends on | US-011-UI-01, US-009-BE-01 |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] Every "What to bring" item has a checkbox with a 44 px target and a label you can tap.
- [ ] Checking updates the screen at once and rolls back with an error if the save fails.
- [ ] The step status on the roadmap changes to "In progress" after the first check.

### US-009-FE-02: Save-with-Google prompt where guests track progress

| Field | Value |
|---|---|
| AB# | AB#100 |
| Parent | US-009B (AB#53) |
| Type | Frontend |
| Assignee | Kesh |
| Priority | Should |
| Estimate | 2 h |
| Due | Oct 27 |
| Depends on | US-009-FE-01 |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] The existing `GuestBanner` is moved to a shared component and shown on step detail and All documents for anonymous users (D20).
- [ ] Linking Google returns the user to the page they were on, with their checkmarks still there.

---

## 7. US-008 View Required Documents (5 pts)

Per-step documents already show on step detail. This story adds the
whole-roadmap list.

### US-008-BE-01: Build `GET /api/roadmap/documents`

| Field | Value |
|---|---|
| AB# | AB#101 |
| Parent | US-008 (AB#34) |
| Type | Backend |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 3 h |
| Due | Oct 26 |
| Depends on | US-009-BE-01 |
| Blocks | US-008-FE-01 |

**Acceptance criteria.**

- [ ] Returns the Section 4 `DocumentsResponse` from the same data as step detail (reuse `LoadRoadmap`, no second copy of the rules).
- [ ] Counts match the sum of the per-step counts.
- [ ] Integration test: a roadmap with 2 checked documents returns `preparedCount` 2.

### US-008-FE-01: Build the All documents screen

| Field | Value |
|---|---|
| AB# | AB#102 |
| Parent | US-008 (AB#34) |
| Type | Frontend |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 4 h |
| Due | Oct 28 |
| Depends on | US-011-UI-01, US-008-BE-01 (placeholder from US-011-BE-01 until then) |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] `/roadmap/documents` is a protected route with loading, error, and empty states from `PageStates.tsx`.
- [ ] Documents are grouped by step with the step number and name, and checkboxes save as on step detail.
- [ ] The roadmap screen links to it ("See all documents to bring").
- [ ] Readable at 360 px.

---

## 8. TE-006 API tests for progress

### TE-006-BE-02: Integration tests for the progress API

| Field | Value |
|---|---|
| AB# | AB#103 |
| Parent | US-011A (AB#36) |
| Type | Backend / QA |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 3 h |
| Due | Oct 27 |
| Depends on | US-011-BE-02, US-009-BE-01 |
| Blocks | S4-QA-01 |

**Acceptance criteria.**

- [ ] Tests in `RoadmapTests.cs` cover every acceptance criterion of US-011-BE-02 and US-009-BE-01: 204, 401, 404, another user's roadmap, D17 status, D18 percentage and next step, D19 ignored rows.

---

## 9. TE-003 AI Integration Setup (5 pts, pulled from Sprint 5)

**Story-level acceptance criteria:** Gemini Flash is connected. A business
description returns structured extraction output. Output is limited to values
the knowledge base knows.

**Scope cut.** Backend only. No screen. Extraction only, because its output can
be checked against fixed values. Q&A answers are US-013 (Sprint 5).

### TE-003-AI-01: Write the extraction test set

| Field | Value |
|---|---|
| AB# | AB#104 |
| Parent | TE-003 (AB#63) |
| Type | AI |
| Assignee | Mich |
| Priority | **Must** |
| Estimate | 2 h |
| Due | **Oct 21** |
| Depends on | None |
| Blocks | TE-003-BE-01 |

**Acceptance criteria.**

- [ ] `docs/qa/ai-extraction-cases.md` has 20 business descriptions written as real users would (English, Taglish, short, misspelled), each with the expected business type and category, or "unclear".
- [ ] At least 4 cases are unclear on purpose (for example "online seller", no structure given).
- [ ] The same file has a draft of the instruction text for Gemini in plain English: what to pick from, and to answer null when unsure.

### TE-003-BE-01: Gemini client and `POST /api/assistant/extract`

| Field | Value |
|---|---|
| AB# | AB#105 |
| Parent | TE-003 (AB#63) |
| Type | Backend / AI |
| Assignee | Jude (Krystelle reviews) |
| Priority | **Must** |
| Estimate | 5 h |
| Due | Oct 27 |
| Depends on | TE-003-AI-01 |
| Blocks | TE-003-AI-02, US-012 and US-013 (Sprint 5) |

**Description.** Code in `Features/Assistant/`. The API key is read from
configuration `Gemini:ApiKey` (user-secrets locally, Render environment variable
when deployed). It is never committed. The model name is configuration too.
The prompt text comes from Mich's draft in `docs/qa/ai-extraction-cases.md`.

**Acceptance criteria.**

- [ ] `POST /api/assistant/extract` (signed-in users only) takes `{ "description": "..." }` and returns `{ "businessType": string | null, "categoryId": uuid | null }`.
- [ ] Gemini is asked for structured JSON output limited to the 4 business types and the 3 seeded categories. Anything else comes back as null.
- [ ] A Gemini error or timeout returns 503 with a ProblemDetails message, never a 500.
- [ ] Unit tests use a fake HTTP handler. No test calls the real API.
- [ ] The endpoint shows in the OpenAPI doc so Mich can call it from Swagger for TE-003-AI-02.

### TE-003-AI-02: Run the test set against the real API and record results

| Field | Value |
|---|---|
| AB# | AB#106 |
| Parent | TE-003 (AB#63) |
| Type | AI / QA |
| Assignee | Mich |
| Priority | **Must** |
| Estimate | 2 h |
| Due | Oct 29 |
| Depends on | TE-003-BE-01 |
| Blocks | US-012 and US-013 (Sprint 5) |

**Description.** Run each of the 20 cases once through `POST /api/assistant/extract`
on a local API with a real key. No code changes.

**Acceptance criteria.**

- [ ] `docs/qa/ai-extraction-cases.md` has a result per case: correct, wrong, or null, with the actual output.
- [ ] A short summary at the top: how many correct, and which kinds of description fail.
- [ ] If fewer than 15 of 20 are correct, Mich and Jude agree on a prompt change and rerun once. Both results are kept.

---

## 10. US-014B Government Office Info, research half (pulled from Sprint 6)

### US-014-RS-01: Research the Pasig office for every step

| Field | Value |
|---|---|
| AB# | AB#107 |
| Parent | US-014B (AB#57) |
| Type | Research |
| Assignee | Mich |
| Priority | Should |
| Estimate | 7 h |
| Due | Oct 28 |
| Depends on | None |
| Blocks | US-014A (Sprint 6) |

**Description.** This is the heaviest research ticket, because contact details
need calls or emails to offices. Start on Oct 19 so replies arrive in time.

**Acceptance criteria.**

- [ ] `docs/research/offices-pasig.md` lists, for each step in `registration-workflow.md`: office name, full address with floor or room, opening hours, phone or email, a Google Maps link, the source, and the date checked.
- [ ] Online-only steps (DTI BNRS, SEC eSPARC) give the website instead of an address.
- [ ] Each row is marked Verified or Unverified, as in RS-002.
- [ ] Reviewed in a PR by 1 teammate.

---

## 11. Seed update

### S4-BE-01: Update the barangay clearance text in the seed

| Field | Value |
|---|---|
| AB# | AB#108 |
| Parent | US-008 (AB#34) |
| Type | Backend |
| Assignee | Jude |
| Priority | Should |
| Estimate | 1 h |
| Due | Oct 22 |
| Depends on | None |
| Blocks | S4-QA-01 |

**Description.** The researcher confirmed every Pasig barangay asks for the same
Barangay Business Clearance documents (`docs/research/seed-content-pasig.md`,
Section 5). Step 2's description still says "Confirm the exact list at your
barangay hall." Remove that sentence in `seed-content-pasig.md` and
`database/seed/001_pasig_knowledge_base.sql`, and apply it with a new EF migration
(D6). The fee rows keep "Confirm the exact amount", because fees were checked in
one barangay only.

**Acceptance criteria.**

- [ ] A new migration updates only the Step 2 description. Existing roadmaps are unaffected (D14).
- [ ] The seed SQL file and the seed content sheet match the migration.
- [ ] `SeedPasigKnowledgeBaseMigrationTests` still pass, and a test checks the new Step 2 text.

---

## 12. QA and review

### S4-QA-01: End-to-end pass and a test with non-technical users

| Field | Value |
|---|---|
| AB# | AB#109 |
| Parent | US-011B (AB#54) |
| Type | QA |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 5 h |
| Due | **Oct 29** |
| Depends on | Every BE and FE ticket above |
| Blocks | Sprint Review (Oct 30) |

**Description.** Same two parts as S3-QA-02, following
`.claude/skills/e2e-testing/SKILL.md`. User tasks:

- "Tick off the papers you already have for the barangay."
- "You just finished the DTI step. Show that in the app."
- "How far along are you? What do you do next?"
- "Change your business to Food and Beverage. Did you lose anything?"

**Acceptance criteria.**

- [ ] Results in `docs/qa/sprint4-test-results.md` (pass / fail per item, user notes by first name or role).
- [ ] Every failure is a Bug on Azure Boards linked to its story.
- [ ] Test users are removed from `asikago-dev`.
- [ ] The top 3 issues are presented at the Sprint Review.

---

## 13. Ticket summary

| ID | Title | Parent | Assignee | Priority | Est. | Due | AB# |
|---|---|---|---|---|---|---|---|
| S4-PM-01 | Decisions D16-D20 | US-011A (AB#36) | Jude | Must | 1 h | Oct 19 | AB#90 |
| S4-PM-02 | Notion / Azure sync | US-011A (AB#36) | Jude | Must | 2 h | Oct 19 | AB#91 |
| US-011-BE-01 | Progress API contract | US-011A (AB#36) | Krystelle | Must | 2 h | Oct 20 | AB#93 |
| US-011-UI-01 | Progress screen designs | US-011B (AB#54) | Kesh | Must | 4 h | Oct 21 | AB#92 |
| TE-003-AI-01 | Extraction test set | TE-003 (AB#63) | Mich | Must | 2 h | Oct 21 | AB#104 |
| US-011-BE-02 | Mark step done + progress | US-011A (AB#36) | Krystelle | Must | 4 h | Oct 22 | AB#94 |
| S4-BE-01 | Barangay text seed update | US-008 (AB#34) | Jude | Should | 1 h | Oct 22 | AB#108 |
| US-009-BE-01 | Save checked documents | US-009A (AB#35) | Krystelle | Must | 4 h | Oct 23 | AB#98 |
| US-011-BE-03 | Keep progress on rebuild | US-011A (AB#36) | Jude | Must | 4 h | Oct 23 | AB#95 |
| US-008-BE-01 | Documents endpoint | US-008 (AB#34) | Jude | Must | 3 h | Oct 26 | AB#101 |
| US-009-FE-01 | Document checkboxes | US-009B (AB#53) | Seth | Must | 4 h | Oct 26 | AB#99 |
| TE-006-BE-02 | Progress API tests | US-011A (AB#36) | Krystelle | Must | 3 h | Oct 27 | AB#103 |
| TE-003-BE-01 | Gemini extract endpoint | TE-003 (AB#63) | Jude | Must | 5 h | Oct 27 | AB#105 |
| US-011-FE-01 | Roadmap progress + mark done | US-011B (AB#54) | Seth | Must | 5 h | Oct 27 | AB#96 |
| US-009-FE-02 | Guest save prompt | US-009B (AB#53) | Kesh | Should | 2 h | Oct 27 | AB#100 |
| US-011-FE-02 | My Business progress | US-011B (AB#54) | Seth | Should | 3 h | Oct 28 | AB#97 |
| US-008-FE-01 | All documents screen | US-008 (AB#34) | Kesh | Must | 4 h | Oct 28 | AB#102 |
| US-014-RS-01 | Pasig office research | US-014B (AB#57) | Mich | Should | 7 h | Oct 28 | AB#107 |
| S4-QA-01 | End-to-end + user test | US-011B (AB#54) | Kesh | Must | 5 h | Oct 29 | AB#109 |
| TE-003-AI-02 | Run test set, record results | TE-003 (AB#63) | Mich | Must | 2 h | Oct 29 | AB#106 |

---

## 14. Dependency flow

```
Oct 19  S4-PM-01 ─┬─► US-011-BE-01 (contract, Oct 20) ─┬─► US-011-BE-02 ─┬─► TE-006-BE-02
                  │                                    ├─► US-009-BE-01 ─┼─► US-008-BE-01
                  │                                    │                 │
                  ├─► US-011-UI-01 (Oct 21) ───────────┴─► US-009-FE-01 ─┴─► US-009-FE-02
                  │                                        US-011-FE-01, US-011-FE-02, US-008-FE-01
                  └─► US-011-BE-03 (rebuild in place)

Independent:  TE-003-AI-01 (Mich) ─► TE-003-BE-01 (Jude) ─► TE-003-AI-02 (Mich)
              US-014-RS-01 (Mich, starts Oct 19)      S4-BE-01 (Jude)

Oct 29  S4-QA-01 (everything above except TE-003 and US-014) ──► Oct 30 Sprint Review
```

**Critical path:** S4-PM-01 → US-011-BE-01 → US-009-BE-01 → US-009-FE-01 →
S4-QA-01. The contract on Oct 20 and the designs on Oct 21 unblock every
frontend ticket. If either slips by half a day, raise it at standup.

**No overlapping files:** Krystelle owns `RoadmapEndpoints.cs` changes. Jude's
US-011-BE-03 touches `AssessmentEndpoints.cs`, and US-008-BE-01 starts only after
US-009-BE-01 merges, and TE-003-BE-01 lives in `Features/Assistant/`. Mich
works only in `docs/`.

---

## 15. Workload

| Person | Role this sprint | Tickets | Est. |
|---|---|---|---|
| Jude | Technical PO + Backend + AI | S4-PM-01, S4-PM-02, US-011-BE-03, US-008-BE-01, TE-003-BE-01, S4-BE-01 | ≈ 16 h ⚠️ |
| Krystelle | Backend | US-011-BE-01, US-011-BE-02, US-009-BE-01, TE-006-BE-02 | ≈ 13 h |
| Kesh | Scrum Master + QA + UI/UX + Frontend | US-011-UI-01, US-008-FE-01, US-009-FE-02, S4-QA-01 | ≈ 15 h |
| Seth | Frontend | US-009-FE-01, US-011-FE-01, US-011-FE-02 | ≈ 12 h |
| Mich | Research + AI | TE-003-AI-01, US-014-RS-01, TE-003-AI-02 | ≈ 11 h |

⚠️ **Jude is 1 h above the ≈ 15 h line.** If he falls behind, US-008-BE-01
(3 h) moves to Krystelle. Mich is lighter because US-014-RS-01
involves waiting on office replies. If the team finishes early, US-014A (office
screen) is next.

---

## 16. Out of scope for Sprint 4

- AI Q&A and the assessment "describe your business" screen (US-012, US-013). Sprint 5.
- The office info screen and maps (US-014A, US-015). Sprint 6.
- Document photo upload (US-010). Sprint 6.
- Auto-finishing a step when every document is checked (D17).
- Undo history or a log of progress changes.
- More cities, more categories, a line-of-business field.
- Seed updates for the 3 open research questions in
  `docs/research/seed-content-pasig.md`, Section 5. Only the barangay answer (S4-BE-01) is in.

---

## 17. Risks

| Risk | Impact | What we do |
|---|---|---|
| Contract (Oct 20) or designs (Oct 21) are late | Every frontend ticket waits | Seth starts on placeholders. Kesh shares rough screens in the group chat by Oct 20. |
| Gemini free tier, key, or quota problems | TE-003 slips into Sprint 5 | Jude creates the key on Oct 19 and shares it privately with Mich for TE-003-AI-02. TE-003 does not block any Sprint 4 Must Have. |
| D16 rebuild has an edge case that loses progress | The thing this sprint promises breaks | US-011-BE-03 tests plus the "change your business" task in S4-QA-01. |
| Office replies are slow | US-014-RS-01 incomplete | Unverified rows are allowed. It's Should, not Must. |
| Render is asleep during the review | The demo hangs | Open the app 2 minutes before the review. |
