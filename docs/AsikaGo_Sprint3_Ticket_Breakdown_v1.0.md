# AsikaGo Sprint 3 Ticket Breakdown v1.0

## Document Information

**Project:** AsikaGo
**Sprint:** Sprint 3 (October 5 - October 16, 2026)
**Sprint goal:** Roadmap Core. A Pasig business owner answers the assessment and
gets a correct, ordered registration roadmap, with clear details for every step.
**Prepared:** October 5, 2026
**Owner:** Product Owner
**Status:** Approved by PO on Oct 5, 2026. Tickets created in Azure Boards (AB#69 to AB#89).
**Purpose:** Split the Sprint 3 stories into tasks that one person can finish,
each with acceptance criteria, dependencies, and an estimate. Every ticket below
can be copied straight into Azure Boards as a Task under its parent story.

**Related documents:** Product Backlog v1.1, `docs/decisions.md`,
`docs/research/registration-workflow.md` (RS-001),
`docs/research/requirements-pasig.md` (RS-002), Sprint 2 Ticket Breakdown v1.0

---

## 1. How to read this document

### Ticket ID format

`<Parent story>-<Discipline>-<Number>`. For example, `US-006-FE-01` is the first
Frontend task under US-006. Work that is not tied to one story uses `S3` as its
parent.

| Code | Discipline |
|---|---|
| PM | Product / decisions |
| UI | UI/UX design (wireframes, copy) |
| FE | Frontend implementation (React) |
| BE | Backend implementation (ASP.NET Core) |
| RS | Research and seed content |
| QA | Testing and verification |

### Fields

- **Assignee:** the person who owns the ticket. One owner per ticket.
- **Estimate:** ideal hours of focused work. Story points stay on the parent story.
- **Priority:**
  - **Must:** the sprint fails without it.
  - **Should:** plan to do it, but it can be dropped if time runs out.
  - **Could:** only if there's time left.
- **Depends on:** tickets that must be finished before this one can start.
- **Blocks:** tickets that are waiting on this one. If you own a blocking ticket
  and it will be late, say so at standup the same day.
- **AB#:** the Azure Boards ID. Filled in after the tickets are created.

### Definition of Ready (before anyone starts a ticket)

- The ticket has an assignee, and they understand the acceptance criteria.
- Every ticket in "Depends on" is Done, or the dependency is only on an agreed
  contract (the API contract in Section 4 counts, and mock data is allowed).

### Definition of Done (for every ticket)

- All acceptance criteria pass.
- Code is merged to `main` through a PR with green CI and 1 review. Research,
  design, and QA work is committed to `docs/`.
- The commit or PR references the Azure Boards ticket (`AB#<id>`).
- The ticket is moved to Done on the board.

### Writing rules for anything a user will read

Our users are first-time micro-entrepreneurs, many of them not comfortable with
technology. Every screen, step text, and error message follows these rules:

1. Plain English at about a grade-6 reading level. Short sentences. No jargon.
2. Spell out every agency the first time it appears on a screen, for example
   "BPLD (Business Permits and Licensing Department)".
3. One main action per screen. The main button says exactly what happens
   ("See step 2", not "Continue").
4. Steps are numbered. Documents are listed as "What to bring".
5. Never guess. If the research marks something Unverified, the text says
   "Confirm this at the office" instead of stating it as fact.
6. Text must stay readable at 360 px wide. Touch targets are at least 44 px.

---

## 2. Current state (what already exists)

Don't build these again:

| Already exists | Where |
|---|---|
| Sign-in with Google or as a guest. A guest can link Google later and keep the same account | `frontend/src/features/auth/`, `MyBusinessPage.tsx` (`supabase.auth.linkIdentity`) |
| Assessment flow (multi-step) that saves the business profile, then goes to `/my-business` | `frontend/src/features/assessment/AssessmentPage.tsx` (line 292) |
| My Business summary screen | `frontend/src/features/assessment/MyBusinessPage.tsx` |
| App shell, routes, protected routes, shared loading / error / empty states | `frontend/src/app/router.tsx`, `components/ProtectedRoute.tsx`, `components/PageStates.tsx` |
| shadcn components: alert, button, card, input, label, radio-group, select | `frontend/src/components/ui/` |
| `GET /api/assessment/options`, `GET /api/business-profile`, `PUT /api/business-profile` | `backend/src/AsikaGo.Api/Features/Assessment/` |
| Business types: Sole Proprietorship, Partnership, Corporation, One Person Corporation | `AssessmentEndpoints.cs` |
| Pasig City and the 3 categories (Food and Beverage, Retail, Services) are seeded with fixed IDs | `Data/AppDbContext.cs` (`HasData`) |
| Empty knowledge-base tables: `registration_steps`, `requirements`, `source_references`, `roadmap_rules`, `user_roadmaps`, `roadmap_progress` | `Data/Entities/`, migration `InitialSchema` |
| Research for all 10 Pasig steps, the requirements, and the line-of-business clearances | `docs/research/` (**not committed yet**, see RS-001-02) |
| Backend tests with an in-memory database and a fake signed-in user | `backend/tests/AsikaGo.Tests/` |

**Not there yet:** `Features/Roadmap/` is empty, `database/seed/` is empty, there
is no roadmap screen, and there is no roadmap or step-detail design.

---

## 3. Sprint 3 decisions

### S3-PM-01: Record the Sprint 3 decisions (D9-D15)

| Field | Value |
|---|---|
| AB# | AB#69 |
| Parent | US-005 Roadmap Generation |
| Type | Product / Decision |
| Assignee | Jude |
| Priority | **Must. This is the first ticket.** |
| Estimate | 1 h |
| Due | **Oct 5 (end of day)** |
| Depends on | None |
| Blocks | TE-004-BE-01, US-005-BE-01, US-005-UI-01, US-006-UI-01 |

**Description.** The PO agreed these decisions on Oct 5. Write them into
`docs/decisions.md` so everyone builds against the same rules.

| Ref | Decision | Why |
|---|---|---|
| D9 | `roadmap_rules` gets a nullable `business_type` column (null = any type). Step 1A (DTI) applies to Sole Proprietorship. Step 1B (SEC) applies to Partnership, Corporation, and One Person Corporation. | The first step depends on the business type, and rules can't express that today. |
| D10 | `GET /api/roadmap` builds and saves the roadmap the first time it is called. Saving the business profile with a **different business type or category** deletes the saved roadmap, and the next `GET` builds a new one. Revisit this in Sprint 4, when step progress exists. | No extra button or endpoint. Nothing is lost yet, because progress tracking (US-011) is Sprint 4. |
| D11 | The US-002 preview is the guest's real roadmap, shown with a "Save your progress with Google" prompt. There is no separate preview endpoint. | Guests already have a real account (anonymous sign-in). |
| D12 | Registration status (`Planning` / `Started`) does not change the steps. `Started` users see one line on the roadmap: "Already done some steps? You'll be able to mark them as done soon." | Marking steps done is US-011 (Sprint 4). |
| D13 | `registration_steps` gets `actions` (text, what to do, one action per line) and `condition_note` (text, nullable, for example "Only if your place is newly built or renovated"). Conditional steps (Step 3 mall / Ortigas, Step 4 FSIC for Occupancy) use `condition_note`. **No new assessment fields.** | US-006 needs "actions". Conditions are shown to the user instead of asked. |
| D14 | Only the step list is saved in the roadmap (`roadmap_progress`). Requirements are worked out when the step is opened, from the saved steps and the current rules. | Requirement progress is Sprint 4 (`requirement_progress`). |
| D15 | Keep the 3 categories. No category migration (RS-002-04). Line-of-business clearances are shown as "If your business is a ...:" requirements under the user's category. | Category doesn't change the step list. More categories wouldn't fix line-specific rules. |

**Acceptance criteria.**

- [ ] D9-D15 are added to `docs/decisions.md` in the existing table format.
- [ ] The team is told in the group chat that the decisions are final.

---

## 4. API contract (final after US-005-BE-01)

This contract lets the frontend and backend work at the same time. US-005-BE-01
publishes it with placeholder data on Oct 6. Any change after that is posted in
the group chat and written in the PR description.

```http
GET /api/roadmap
200 OK  -> RoadmapResponse
401     -> not signed in
404     -> ProblemDetails, the user has no business profile yet
           (the frontend sends them to /assessment)

RoadmapResponse:
{
  "roadmapId": "uuid",
  "createdAt": "2026-10-12T08:00:00Z",
  "businessType": "Sole Proprietorship",
  "categoryName": "Food and Beverage",
  "cityName": "Pasig",
  "registrationStatus": "Planning",
  "steps": [
    {
      "number": 1,                      // 1..N, the order the user does them in
      "stepId": "uuid",
      "name": "DTI Business Name Registration",
      "agency": "DTI (Department of Trade and Industry)",
      "conditionNote": null,            // or "Only if your place is newly built or renovated"
      "requirementCount": 3
    }
  ]
}

GET /api/roadmap/steps/{number}
200 OK  -> StepDetailResponse
401     -> not signed in
404     -> ProblemDetails, no business profile, or the number is not in the roadmap

StepDetailResponse:
{
  "number": 2,
  "totalSteps": 10,
  "stepId": "uuid",
  "name": "Barangay Business Clearance",
  "agency": "Barangay hall of your business address",
  "description": "Why you need this step, in plain words.",
  "actions": ["Go to your barangay hall.", "Fill up the application form.", "..."],
  "conditionNote": null,
  "requirements": [
    {
      "id": "uuid",
      "name": "Valid government ID",
      "description": "Plain-language note, or null",
      "appliesTo": null,                // or "Food and Beverage" when only one category needs it
      "source": { "name": "Pasig BPLD Citizen's Charter 2025", "url": "https://...", "dateVerified": "2026-10-05" }
    }
  ],
  "previousNumber": 1,                  // null on the first step
  "nextNumber": 3                       // null on the last step
}
```

**Rules behind the contract**

- `number` is the position in the user's roadmap. A Sole Proprietorship gets Step
  1A as number 1. A Corporation gets Step 1B as number 1. Every user sees steps
  numbered 1 to N with no gaps.
- `actions` is stored as text with one action per line. The API splits it into a
  list.
- `appliesTo` is the category name when the matching requirement rule has a
  `category_id`, and null when the rule applies to every category.
- The request never sends a city. The roadmap uses the city on the business
  profile (always Pasig in the MVP).

---

## 5. TE-004 Roadmap Rule Engine (8 pts)

**Story:** Build the backend rule-based roadmap engine that generates personalized
registration roadmaps based on the business profile (category, city, business
type).

**Story-level acceptance criteria:**

- The engine gives the correct roadmap for every supported profile (4 business
  types × 3 categories, Pasig City).
- The roadmap matches the research knowledge base.

### Engine rules (how a rule matches)

A rule **matches** a business profile when all three are true:

- `category_id` is null, or equals the profile's category.
- `city_id` is null, or equals the profile's city.
- `business_type` is null, or equals the profile's business type.

Then:

- A **step** is in the roadmap if at least one matching `Include` rule exists for
  it with `requirement_id` = null, and no matching `Exclude` rule exists for it
  with `requirement_id` = null.
- A **requirement** is in the step if its step is in the roadmap, at least one
  matching `Include` rule exists for that requirement, and no matching `Exclude`
  rule exists for it.
- Steps are ordered by the `sort_order` of their step-level rule. Requirements
  are ordered by the `sort_order` of their requirement rule.

### TE-004-BE-01: Migration for business type, actions, and condition notes

| Field | Value |
|---|---|
| AB# | AB#70 |
| Parent | TE-004 Roadmap Rule Engine |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 2 h |
| Due | **Oct 6** |
| Depends on | S3-PM-01 |
| Blocks | TE-004-BE-02, TE-004-BE-03 |

**Description.** Add the columns from D9 and D13 with one EF migration
(`AddRoadmapRuleBusinessTypeAndStepText`).

**Acceptance criteria.**

- [ ] `RoadmapRule.BusinessType` (`string?`) exists, with a comment `// null = any business type`.
- [ ] `RegistrationStep.Actions` (`string`, one action per line) and
      `RegistrationStep.ConditionNote` (`string?`) exist.
- [ ] One migration adds the three columns. `dotnet ef database update` runs
      cleanly on a fresh database and on `asikago-dev` (apply from `main` only).
- [ ] Existing tests still pass.

---

### TE-004-BE-02: Build the roadmap engine as a pure class, with unit tests

| Field | Value |
|---|---|
| AB# | AB#71 |
| Parent | TE-004 Roadmap Rule Engine |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 6 h |
| Due | Oct 9 |
| Depends on | TE-004-BE-01, S3-QA-01 (golden cases) |
| Blocks | US-005-BE-02, US-006-BE-01 |

**Description.** Create `Features/Roadmap/RoadmapEngine.cs`. It has no database
or HTTP code (README rule), so it can be unit tested on its own.

- **Input:** the profile (`businessType`, `categoryId`, `cityId`) and the lists of
  rules, steps, and requirements.
- **Output:** the ordered list of included steps, each with its ordered list of
  included requirements and, for each requirement, the category of the rule that
  included it (for `appliesTo`).
- It follows the engine rules above exactly.

**Acceptance criteria.**

- [ ] `RoadmapEngine` lives in `Features/Roadmap/` and has no `DbContext` or HTTP dependency.
- [ ] Unit tests cover the matching rules: null means any, category / city / type
      filters, `Exclude` wins over `Include`, and ordering by `sort_order`.
- [ ] Unit tests cover the 12 golden cases from S3-QA-01 (4 business types × 3
      categories), using rule fixtures written in the test file.
- [ ] A Sole Proprietorship never gets Step 1B. A Partnership, Corporation, or
      OPC never gets Step 1A.
- [ ] Every test passes in CI.

---

### TE-004-BE-03: Write the Pasig seed SQL and apply it through an EF migration

| Field | Value |
|---|---|
| AB# | AB#72 |
| Parent | TE-004 Roadmap Rule Engine |
| Type | Backend |
| Assignee | Jude |
| Priority | **Must. This is on the critical path.** |
| Estimate | 5 h |
| Due | **Oct 12** |
| Depends on | TE-004-BE-01, RS-003-01, RS-003-02 |
| Blocks | US-005-BE-02 (real data), US-007-BE-01, S3-QA-02 |

**Description.** Turn the approved seed content sheet (RS-003-01) into SQL in
`database/seed/001_pasig_knowledge_base.sql` (decision D6). An EF migration
(`SeedPasigKnowledgeBase`) applies the file. Copy the text exactly as the sheet
has it. Do not rewrite the wording, because it was reviewed for clarity.

What the SQL inserts:

1. `source_references`: every source in the sheet, with `date_verified`.
2. `registration_steps`: the 11 seed steps (1A, 1B, 2 to 10), with `name`,
   `agency`, `description`, `actions`, and `condition_note`.
3. `requirements`: every requirement row in the sheet, linked to its step and source.
4. `roadmap_rules`:
   - Step 1A: one `Include` rule with `business_type` = `Sole Proprietorship`, `sort_order` 1.
   - Step 1B: three `Include` rules, one each for `Partnership`, `Corporation`,
     and `One Person Corporation`, `sort_order` 1.
   - Steps 2 to 10: one `Include` rule each with every filter null, `sort_order` 2 to 10.
   - Requirements: one `Include` rule per requirement. Use `category_id` and / or
     `business_type` when the sheet says the requirement only applies to some
     businesses. Put line-of-business requirements last in their step.

**Acceptance criteria.**

- [ ] Every row uses a fixed UUID written in the SQL, so rules can reference
      steps and requirements, and the seed gives the same IDs on every database.
- [ ] Categories use the existing IDs from `AppDbContext.cs`
      (`22222222-2222-2222-2222-222222222201` to `...203`). City rules are not
      needed, because Pasig is the only city (city filter = null).
- [ ] The migration's `Down` deletes exactly the rows the seed added.
- [ ] Only rows that the sheet marks **Verified** or **Confirmed by researcher**
      are in the SQL.
- [ ] After the migration is applied to `asikago-dev`, these counts match the
      sheet: steps, requirements, sources, rules. The counts are written in the PR.
- [ ] The SQL file is the only place the seed data lives. No `HasData` for knowledge-base rows.

---

## 6. RS-003 Business Category Variations Research (5 pts) and seed content

**Story:** Research and document the registration requirement variations between
Food and Beverage, Retail, and Services in Pasig City, and turn the research into
seed content the app can show.

**Story-level acceptance criteria:**

- Category-specific requirements are documented, with sources.
- Differences from the standard workflow are identified.

### RS-001-02: Commit the research documents through a reviewed PR

| Field | Value |
|---|---|
| AB# | AB#73 |
| Parent | RS-003 (RS-001 is already Closed on the board) |
| Type | Research |
| Assignee | Mich (reviewers: Jude and Seth) |
| Priority | **Must** |
| Estimate | 1.5 h (1 h for Mich, 0.25 h per reviewer) |
| Due | **Oct 6** |
| Depends on | None |
| Blocks | RS-003-01, S3-QA-01 |

**Description.** `docs/research/registration-workflow.md` and
`docs/research/requirements-pasig.md` exist on Mich's machine but are not in
git. The seed and the golden cases are built from them, so they must be on `main`
first.

**Acceptance criteria.**

- [ ] One PR adds both files under `docs/research/`, with `AB#` in the title.
- [ ] Jude and Seth each review it. Every review comment is answered or fixed.
- [ ] The PR is merged to `main` by Oct 6.

---

### RS-003-01: Write the seed content sheet in plain language

| Field | Value |
|---|---|
| AB# | AB#74 |
| Parent | RS-003 |
| Type | Research / Content |
| Assignee | Mich |
| Priority | **Must. This is on the critical path.** |
| Estimate | 6 h |
| Due | **Oct 8 (end of day)** |
| Depends on | RS-001-02 |
| Blocks | RS-003-02, TE-004-BE-03 |

**Description.** Create `docs/research/seed-content-pasig.md`. This is what users
will read on the roadmap, so it has to be correct **and** easy to understand.
Use only the two research documents. Do not add anything that is not in them.

The sheet has four tables:

**1. Sources**

| Key | Name | URL | Date verified |
|---|---|---|---|
| bplo-charter-2025 | Pasig BPLD Citizen's Charter 2025 | https://... | 2026-10-05 |

**2. Steps** (11 rows: 1A, 1B, 2 to 10)

| Order | Seed name | Agency (spelled out) | Description (why you need this) | Actions (one per line) | Condition note |
|---|---|---|---|---|---|

**3. Requirements**

| Step | Name | Description (plain words) | Business type | Category | Source key | Status |
|---|---|---|---|---|---|---|

**4. Line-of-business requirements** (go under Step 5, where they are submitted with the UBAF)

| Category | Name ("If your business is a ...: ...") | Source key | MVP |
|---|---|---|---|

**Rules for the sheet.**

- Use the **Seed name** column of `registration-workflow.md` for step names.
- Put a row in only if its research status is **Verified** or **Confirmed by
  researcher**. Leave out Unverified rows, or turn them into "Confirm this at the
  office" text in the step description.
- Business type and Category columns: leave blank for "All". Use the exact
  database names (Food and Beverage, Retail, Services; Sole Proprietorship,
  Partnership, Corporation, One Person Corporation).
- Line-of-business rows: only lines marked MVP **Yes** or **Partial**. For
  Partial, name only the small variants (for example, "restobar or beer house").
- Step 2 (Barangay): the description ends with "Confirm the exact list at your
  barangay hall." Only Barangay San Antonio is documented.
- Step 3 (Certificate of Conformance): `condition_note` = "If your business is
  inside a mall or in the Ortigas Center, ask CPDO if you still need this." The
  exemption is Unverified, so it must not say the step is skipped.
- Step 4 (FSIC for Occupancy): `condition_note` = "Only if your place is newly
  built or renovated." The requirement list is Unverified, so show the fee
  (Verified) and say "Ask BFP Pasig for the full list."
- Health Certificate tests (Step 8): follow the research table. Add "If you sell
  food, ask the City Health Department which tests you need." to the Retail
  requirement, because the sari-sari store question is still open.
- Every requirement needs a source with a URL. If a "Confirmed by researcher" row
  has no URL, use the office's official page as the URL and write
  "(confirmed by AsikaGo research, Oct 5, 2026)" in the source name.
- Follow the writing rules in Section 1.

**Acceptance criteria.**

- [ ] All four tables exist, and every row has every column filled in (except
      the blank "All" columns and empty condition notes).
- [ ] Every row traces back to a row in `registration-workflow.md` or
      `requirements-pasig.md` with status Verified or Confirmed by researcher.
- [ ] Every step has a description and at least 2 actions.
- [ ] Step 3 and Step 4 have the condition notes above.
- [ ] The sheet is merged to `main` through a PR with `AB#`.

---

### RS-003-02: Clarity review of the seed content

| Field | Value |
|---|---|
| AB# | AB#75 |
| Parent | RS-003 |
| Type | Content review |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 1 h |
| Due | **Oct 9 (morning)** |
| Depends on | RS-003-01 |
| Blocks | TE-004-BE-03 |

**Description.** Read the seed sheet as a first-time business owner would. Fix
wording that is long, technical, or unclear. Don't change facts. If a fact looks
wrong, ask Mich in the PR.

**Acceptance criteria.**

- [ ] Every description and action follows the writing rules in Section 1.
- [ ] Every agency name is spelled out.
- [ ] Changes are made as suggestions on Mich's PR, and Mich accepts or answers each one.

---

### S3-QA-01: Write the golden roadmap cases

| Field | Value |
|---|---|
| AB# | AB#76 |
| Parent | TE-004 Roadmap Rule Engine |
| Type | QA |
| Assignee | Mich |
| Priority | **Must** |
| Estimate | 3 h |
| Due | **Oct 8** |
| Depends on | RS-001-02 |
| Blocks | TE-004-BE-02 (tests), US-007-BE-01, S3-QA-02 |

**Description.** Create `docs/qa/roadmap-golden-cases.md`. For each of the 12
profiles (4 business types × 3 categories, Pasig City), write down what the
roadmap must show. The engine tests and the final check both use this as the
expected answer.

For each case:

- The expected steps, in order, with their numbers (1 to N).
- The category-specific requirements that must appear, and those that must **not**
  appear. For example, Food and Beverage gets the pest control contract, and
  Retail does not.
- The Step 1 and Step 10 requirements that depend on business type (DTI vs SEC,
  BIR Form 1901 vs 1903).

**Acceptance criteria.**

- [ ] 12 cases are written, each with a case ID (`G-01` to `G-12`).
- [ ] Every expected requirement matches a Verified row in the research.
- [ ] Krystelle confirms she can turn every case into a unit test.

---

## 7. US-005 Generate Registration Roadmap (8 pts)

**Story:** As an aspiring micro-entrepreneur, I want to receive a personalized
registration roadmap, so that I know exactly what steps to complete for my
specific business.

**Story-level acceptance criteria:**

- The roadmap is generated from the business profile.
- Steps are ordered by registration sequence.
- The roadmap reflects Pasig City and category-specific requirements.

### US-005-UI-01: Design the roadmap screen (`/roadmap`)

| Field | Value |
|---|---|
| AB# | AB#77 |
| Parent | US-005 |
| Type | UI/UX Design |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 4 h |
| Due | **Oct 7** |
| Depends on | S3-PM-01 |
| Blocks | US-005-FE-01, US-002-FE-01 |

**Description.** Design the screen that shows the user's whole route from A to Biz.
Use the Sample UI branding (blue and yellow, the dotted route line, the "Point A ...
Biz - Registered" style) so it feels like the landing and My Business screens.

**The design must cover:**

1. **Header:** "Your registration roadmap" plus one line, for example "10 steps
   to register your Food and Beverage business in Pasig City."
2. **Step list as a route:** each step shows its number, name, and agency.
   Steps with a `conditionNote` show it as a short tag, for example "Only if newly
   built or renovated". Each step is one big tap target that opens its detail page.
3. **Guest prompt (US-002):** a banner at the top for guests: "This is your
   roadmap preview. Save it with Google so you don't lose it." The button is
   "Save with Google". It's not shown to Google users.
4. **Started hint (D12):** for `Started` users, one line: "Already done some
   steps? You'll be able to mark them as done soon."
5. **States:** loading, no business profile ("Answer a few questions first" with
   a button to the assessment), error with a "Try again" button, and the normal list.
6. **Responsive:** mobile at 360 px and desktop at 1280 px.

**Acceptance criteria.**

- [ ] Mobile and desktop frames exist for every state, plus the guest and
      Started variants.
- [ ] Every piece of text is written out. No lorem ipsum.
- [ ] Only existing shadcn components plus simple Tailwind are used.
- [ ] It follows the writing rules in Section 1, and touch targets are at least 44 px.
- [ ] The design is exported or linked in `docs/design/`, and Seth reviews it.

---

### US-005-BE-01: Publish the roadmap API contract and types

| Field | Value |
|---|---|
| AB# | AB#78 |
| Parent | US-005 |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must** |
| Estimate | 2 h |
| Due | **Oct 6** |
| Depends on | S3-PM-01 |
| Blocks | US-005-FE-01, US-002-FE-01, US-006-FE-01, US-005-BE-02, US-006-BE-01 |

**Description.** Create the records `RoadmapResponse`, `RoadmapStepResponse`,
`StepDetailResponse`, `RequirementResponse`, and `SourceResponse` in
`Features/Roadmap/`. Map `GET /api/roadmap` and `GET /api/roadmap/steps/{number}`,
returning placeholder data that follows the contract in Section 4 (use 3 fake
steps). Regenerate the OpenAPI file and the frontend types.

**Acceptance criteria.**

- [ ] The records match Section 4. Any difference is written in the PR description.
- [ ] Both endpoints are under `/api` and require sign-in.
- [ ] `backend/openapi/AsikaGo.Api.json` and `frontend/src/lib/api-types.ts`
      are regenerated and committed, and CI is green.
- [ ] Seth and Kesh are told in the group chat that the types are ready.

---

### US-005-BE-02: Build `GET /api/roadmap` (generate and save)

| Field | Value |
|---|---|
| AB# | AB#79 |
| Parent | US-005 |
| Type | Backend |
| Assignee | Krystelle |
| Priority | **Must. This is on the critical path.** |
| Estimate | 4 h |
| Due | **Oct 13** |
| Depends on | TE-004-BE-02, US-005-BE-01, TE-004-BE-03 (for real data) |
| Blocks | US-005-BE-03, TE-006-BE-01, S3-QA-02 |

**Description.** Replace the placeholder with the real logic:

1. Load the user's business profile. If there is none, return `404` ProblemDetails.
2. If the business already has a `user_roadmaps` row, return it with its saved steps.
3. If not, load the rules, steps, and requirements, run `RoadmapEngine`, and save
   one `user_roadmaps` row plus one `roadmap_progress` row per step (copy
   `sort_order`, status `NotStarted`). Return it.

**Acceptance criteria.**

- [ ] The first call creates exactly one roadmap. A second call returns the same
      `roadmapId` and creates nothing new.
- [ ] Steps come back numbered 1 to N in `sort_order` order.
- [ ] `requirementCount` is the number of requirements the engine includes for that step.
- [ ] No business profile returns `404`. Not signed in returns `401`.
- [ ] Two quick calls in a row don't create two roadmaps (save in one transaction,
      and re-check before inserting).

---

### US-005-BE-03: Rebuild the roadmap when the business type or category changes

| Field | Value |
|---|---|
| AB# | AB#80 |
| Parent | US-005 |
| Type | Backend |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 2 h |
| Due | Oct 13 |
| Depends on | US-005-BE-02 |
| Blocks | TE-006-BE-01 |

**Description.** In `PUT /api/business-profile`, when an existing profile's
`businessType` or `categoryId` changes, delete that business's `user_roadmaps` row
(its `roadmap_progress` rows go with it). The next `GET /api/roadmap` builds a new
one (D10). Changing only the business name or registration status keeps the roadmap.

**Acceptance criteria.**

- [ ] Changing the business type deletes the old roadmap and its progress rows.
- [ ] Changing the category does the same.
- [ ] Changing only the name or the registration status keeps the same `roadmapId`.
- [ ] The delete happens in the same transaction as the profile save.
- [ ] Tests cover all three cases.

---

### US-005-FE-01: Build the roadmap screen

| Field | Value |
|---|---|
| AB# | AB#81 |
| Parent | US-005 |
| Type | Frontend |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 5 h |
| Due | Oct 12 |
| Depends on | US-005-UI-01, US-005-BE-01 |
| Blocks | US-002-FE-01 (shares the page), S3-QA-02 |

**Description.** Build `/roadmap` from Kesh's design in
`src/features/roadmap/RoadmapPage.tsx`. Add a `useRoadmap` query in
`src/lib/queries.ts`. Add the route as a protected route in `router.tsx`. Use the
placeholder API until US-005-BE-02 is merged.

**Acceptance criteria.**

- [ ] The screen matches the design at 360 px and 1280 px.
- [ ] Loading, error ("Try again" refetches), and no-profile (404, a button to
      `/assessment`) states use `components/PageStates.tsx`.
- [ ] Each step opens `/roadmap/steps/<number>`.
- [ ] Condition notes show as tags. The Started hint shows only for `Started` users.
- [ ] The "Your roadmap" item on My Business links to `/roadmap`.
- [ ] `npm run lint` and `npm run build` pass.

---

## 8. US-002 View Registration Preview (3 pts, Should Have)

**Story:** As an aspiring micro-entrepreneur, I want to view a preview of my
registration journey before creating an account, so that I can understand what
is involved before committing.

**Story-level acceptance criteria:**

- The user sees a summary roadmap preview right after the assessment.
- The preview reflects the business input.
- The option to save with Google is shown to guests.

### US-002-FE-01: Guest preview banner and the redirect after the assessment

| Field | Value |
|---|---|
| AB# | AB#82 |
| Parent | US-002 |
| Type | Frontend |
| Assignee | Kesh |
| Priority | Should |
| Estimate | 3 h |
| Due | Oct 13 |
| Depends on | US-005-UI-01, US-005-BE-01, US-005-FE-01 |
| Blocks | S3-QA-02 |

**Description.** Two small changes:

1. After the assessment saves, go to `/roadmap` instead of `/my-business`
   (`AssessmentPage.tsx`, line 292). The roadmap is the preview (D11).
2. On `/roadmap`, show the guest banner from the design to anonymous users only.
   "Save with Google" uses the same Google linking that My Business already uses
   (`supabase.auth.linkIdentity` in `MyBusinessPage.tsx`). Move that code into one
   shared hook, for example `src/features/auth/useLinkGoogle.ts`, and use it on both
   screens. Don't copy it.

**Acceptance criteria.**

- [ ] Finishing the assessment opens `/roadmap`.
- [ ] Guests see the banner. Google users don't.
- [ ] Linking Google from the banner keeps the same account and the same roadmap
      (the `roadmapId` does not change).
- [ ] My Business linking still works after the move to the shared hook.
- [ ] `npm run lint` and `npm run build` pass.

---

## 9. US-006 View Registration Step Details (5 pts)

**Story:** As an aspiring micro-entrepreneur, I want to view detailed information
for each registration step, so that I understand what I need to do and why.

**Story-level acceptance criteria:**

- Each step shows its purpose, requirements, actions, and reference information.
- The user can move between steps.

### US-006-UI-01: Design the step detail screen (`/roadmap/steps/:number`)

| Field | Value |
|---|---|
| AB# | AB#83 |
| Parent | US-006 |
| Type | UI/UX Design |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 4 h |
| Due | **Oct 8** |
| Depends on | S3-PM-01 |
| Blocks | US-006-FE-01 |

**Description.** Design one step's page. A user should be able to read it at the
government office counter on a phone.

**The design must cover, in this order:**

1. **"Step 2 of 10"** and the step name.
2. **Condition note** (when there is one) as a highlighted box near the top.
3. **"Why you need this"**: the description.
4. **"What to do"**: the numbered actions.
5. **"What to bring"**: the requirements as a list. Category-only items show a
   small label, for example "For Food and Beverage businesses". "If your business
   is a ...:" items come last.
6. **"Where to go"**: the agency, spelled out.
7. **Sources:** a small line under each requirement: "Source: Pasig BPLD
   Citizen's Charter 2025 (checked Oct 5, 2026)", opening in a new tab.
8. **Navigation:** "Previous step" and "Next step" buttons, plus "Back to my
   roadmap". The first step has no Previous. The last step's Next is "Back to my roadmap".
9. **States:** loading, step not found, and error with "Try again".
10. **Responsive:** mobile at 360 px and desktop at 1280 px.

**Acceptance criteria.**

- [ ] Mobile and desktop frames exist for a normal step, a step with a condition
      note, the first step, the last step, and every state.
- [ ] Real text from the research is used for at least one full step (Step 2
      Barangay is a good example). No lorem ipsum.
- [ ] It follows the writing rules in Section 1, and touch targets are at least 44 px.
- [ ] The design is exported or linked in `docs/design/`, and Seth reviews it.

---

### US-006-BE-01: Build `GET /api/roadmap/steps/{number}`

| Field | Value |
|---|---|
| AB# | AB#84 |
| Parent | US-006 |
| Type | Backend |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 3 h |
| Due | Oct 13 |
| Depends on | TE-004-BE-02, US-005-BE-01 |
| Blocks | TE-006-BE-01, S3-QA-02 |

**Description.** Return one step of the user's saved roadmap. Find the step by its
position (`number`) in the saved `roadmap_progress` rows. Work out its
requirements with `RoadmapEngine` for the current profile (D14). Split `actions`
into a list.

**Acceptance criteria.**

- [ ] The response matches `StepDetailResponse` in Section 4.
- [ ] `previousNumber` is null on step 1, and `nextNumber` is null on the last step.
- [ ] `appliesTo` is the category name only for category-specific requirements.
- [ ] Each requirement has its source (name, URL, date verified), or `source` = null when it has none.
- [ ] A number below 1 or above the step count returns `404`. No business profile returns `404`.
- [ ] If the user has no saved roadmap yet, the endpoint builds it first (same as `GET /api/roadmap`).

---

### US-006-FE-01: Build the step detail screen with Previous / Next

| Field | Value |
|---|---|
| AB# | AB#85 |
| Parent | US-006 |
| Type | Frontend |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 5 h |
| Due | Oct 13 |
| Depends on | US-006-UI-01, US-005-BE-01 |
| Blocks | US-007-FE-01, S3-QA-02 |

**Description.** Build `/roadmap/steps/:number` from Kesh's design in
`src/features/roadmap/StepDetailPage.tsx`, with a `useRoadmapStep(number)` query
in `src/lib/queries.ts`. Add the protected route in `router.tsx`.

**Acceptance criteria.**

- [ ] The screen matches the design at 360 px and 1280 px.
- [ ] The sections appear in the design's order. Actions are a numbered list, and
      requirements are a list.
- [ ] Previous / Next / "Back to my roadmap" work, and the browser Back button
      also works.
- [ ] Source links open in a new tab with `rel="noopener noreferrer"`.
- [ ] A step that doesn't exist shows the not-found state, not a crash.
- [ ] `npm run lint` and `npm run build` pass.

---

## 10. US-007 Receive Category-Specific Requirements (5 pts)

**Story:** As an aspiring micro-entrepreneur, I want to receive requirements
specific to my business category, so that I do not prepare irrelevant documents.

**Story-level acceptance criteria:**

- The roadmap adapts to the business category (Food and Beverage, Retail, Services).
- Category-specific requirements are shown.
- Requirements that don't apply are left out.

The engine rules (TE-004-BE-02) and the seed rules (TE-004-BE-03) do most of this
story. These two tickets prove it and show it clearly.

### US-007-BE-01: Check the seeded category rules against the golden cases

| Field | Value |
|---|---|
| AB# | AB#86 |
| Parent | US-007 |
| Type | Backend / Verification |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 3 h |
| Due | Oct 14 |
| Depends on | TE-004-BE-03, US-005-BE-02, US-006-BE-01, S3-QA-01 |
| Blocks | S3-QA-02 |

**Description.** The backend tests use an in-memory database, so they can't load
the SQL seed. Check the real seed on `asikago-dev` instead. For each of the 12
golden cases, use a test business profile, call `GET /api/roadmap` and each step,
and compare the result with `docs/qa/roadmap-golden-cases.md`. Follow
`.claude/skills/e2e-testing/SKILL.md` to keep test users apart from teammates'
data and delete them afterwards.

**Acceptance criteria.**

- [ ] All 12 cases are checked. The results (pass, or the differences) are added
      to the golden cases file.
- [ ] Every difference is fixed in the seed (TE-004-BE-03) or logged as a Bug on
      Azure Boards linked to US-007.
- [ ] All test users and their data are removed from `asikago-dev`.

---

### US-007-FE-01: Show category labels on requirements

| Field | Value |
|---|---|
| AB# | AB#87 |
| Parent | US-007 |
| Type | Frontend |
| Assignee | Seth |
| Priority | **Must** |
| Estimate | 2 h |
| Due | Oct 14 |
| Depends on | US-006-FE-01 |
| Blocks | S3-QA-02 |

**Description.** On the step detail page, show the `appliesTo` label for
category-specific requirements, as the design shows. Add one line above the list
when any label is present: "Some items only apply to certain businesses. The ones
for yours are marked."

**Acceptance criteria.**

- [ ] Requirements with `appliesTo` show the label, for example "For Food and
      Beverage businesses".
- [ ] Requirements for every category show no label.
- [ ] The intro line shows only when at least one label is present.
- [ ] `npm run lint` and `npm run build` pass.

---

## 11. TE-006 API Development (8 pts)

**Story:** Develop the ASP.NET Core REST API endpoints for the React frontend,
including business profile, roadmap generation, and step details.

**Story-level acceptance criteria:**

- All required API endpoints work, and the frontend can use them.
- API responses are correctly structured and validated.

The roadmap endpoints are built in US-005 and US-006. This ticket proves the
whole API with tests.

### TE-006-BE-01: Integration tests for the roadmap API

| Field | Value |
|---|---|
| AB# | AB#88 |
| Parent | TE-006 |
| Type | Backend / Tests |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 3 h |
| Due | Oct 14 |
| Depends on | US-005-BE-02, US-005-BE-03, US-006-BE-01 |
| Blocks | S3-QA-02 |

**Description.** Add `backend/tests/AsikaGo.Tests/RoadmapTests.cs`, using
`CustomWebApplicationFactory` and `TestAuthHandler`, with a small set of rules
added to the in-memory database in the test.

**Acceptance criteria.**

- [ ] Not signed in: both endpoints return `401`.
- [ ] No business profile: both endpoints return `404` ProblemDetails.
- [ ] First `GET /api/roadmap` creates the roadmap. The second returns the same `roadmapId`.
- [ ] A Sole Proprietorship gets the DTI step as number 1. A Corporation gets the SEC step as number 1.
- [ ] Step detail: step 0 and step N+1 return `404`. The first and last steps
      have the right `previousNumber` / `nextNumber`.
- [ ] Changing the business type through `PUT /api/business-profile` gives a new
      `roadmapId` on the next `GET`.
- [ ] CI is green, including the OpenAPI and frontend types check.

---

## 12. QA and review

### S3-QA-02: End-to-end pass and a test with non-technical users

| Field | Value |
|---|---|
| AB# | AB#89 |
| Parent | US-005 |
| Type | QA |
| Assignee | Kesh |
| Priority | **Must** |
| Estimate | 4 h |
| Due | **Oct 15** |
| Depends on | Every BE and FE ticket above |
| Blocks | Sprint Review (Oct 16) |

**Description.** Two parts:

1. **End-to-end pass:** on the running app with `asikago-dev`, follow
   `.claude/skills/e2e-testing/SKILL.md`. Try a guest and a Google user, at least
   one Sole Proprietorship and one Corporation, and all 3 categories. Go through
   the assessment, the roadmap, every step's detail, Previous / Next, and linking
   Google from the guest banner.
2. **Non-technical user test:** ask 2-3 people who are not in tech (family,
   friends, a small business owner) to try it on a phone. Give them tasks, not
   instructions:
   - "Find out what you need to bring to the barangay."
   - "Find out which office you go to after the barangay."
   - "Save your roadmap so you don't lose it."

   Write down where each person got stuck or confused, in their own words.

**Acceptance criteria.**

- [ ] The end-to-end results are written in `docs/qa/sprint3-test-results.md`
      (pass / fail per item).
- [ ] The user test notes are in the same file: who tried it (first name or
      role only), each task, and where they got stuck.
- [ ] Every failure or confusion point is a Bug on Azure Boards, linked to its
      story, with steps to reproduce.
- [ ] Test users are removed from `asikago-dev`.
- [ ] The top 3 issues are presented at the Sprint Review.

---

## 13. Ticket summary

| ID | Title | Parent | Assignee | Priority | Est. | Due | AB# |
|---|---|---|---|---|---|---|---|
| S3-PM-01 | Record decisions D9-D15 | US-005 (AB#31) | Jude | Must | 1 h | Oct 5 | AB#69 |
| RS-001-02 | Commit research docs through a reviewed PR | RS-003 (AB#60) | Mich | Must | 1.5 h | Oct 6 | AB#73 |
| TE-004-BE-01 | Migration: business type, actions, condition note | TE-004 (AB#64) | Krystelle | Must | 2 h | Oct 6 | AB#70 |
| US-005-BE-01 | Roadmap API contract and types | US-005 (AB#31) | Krystelle | Must | 2 h | Oct 6 | AB#78 |
| US-005-UI-01 | Design the roadmap screen | US-005 (AB#31) | Kesh | Must | 4 h | Oct 7 | AB#77 |
| US-006-UI-01 | Design the step detail screen | US-006 (AB#32) | Kesh | Must | 4 h | Oct 8 | AB#83 |
| RS-003-01 | Seed content sheet in plain language | RS-003 (AB#60) | Mich | Must | 6 h | Oct 8 | AB#74 |
| S3-QA-01 | Golden roadmap cases | TE-004 (AB#64) | Mich | Must | 3 h | Oct 8 | AB#76 |
| RS-003-02 | Clarity review of the seed content | RS-003 (AB#60) | Seth | Must | 1 h | Oct 9 | AB#75 |
| TE-004-BE-02 | Roadmap engine and unit tests | TE-004 (AB#64) | Krystelle | Must | 6 h | Oct 9 | AB#71 |
| TE-004-BE-03 | Pasig seed SQL and migration | TE-004 (AB#64) | Jude | Must | 5 h | Oct 12 | AB#72 |
| US-005-FE-01 | Build the roadmap screen | US-005 (AB#31) | Seth | Must | 5 h | Oct 12 | AB#81 |
| US-005-BE-02 | `GET /api/roadmap` | US-005 (AB#31) | Krystelle | Must | 4 h | Oct 13 | AB#79 |
| US-005-BE-03 | Rebuild roadmap on type or category change | US-005 (AB#31) | Jude | Must | 2 h | Oct 13 | AB#80 |
| US-006-BE-01 | `GET /api/roadmap/steps/{number}` | US-006 (AB#32) | Jude | Must | 3 h | Oct 13 | AB#84 |
| US-006-FE-01 | Build the step detail screen | US-006 (AB#32) | Seth | Must | 5 h | Oct 13 | AB#85 |
| US-002-FE-01 | Guest preview banner and redirect | US-002 (AB#30) | Kesh | Should | 3 h | Oct 13 | AB#82 |
| US-007-BE-01 | Check seeded category rules | US-007 (AB#33) | Jude | Must | 3 h | Oct 14 | AB#86 |
| US-007-FE-01 | Category labels on requirements | US-007 (AB#33) | Seth | Must | 2 h | Oct 14 | AB#87 |
| TE-006-BE-01 | Roadmap API integration tests | TE-006 (AB#66) | Jude | Must | 3 h | Oct 14 | AB#88 |
| S3-QA-02 | End-to-end pass and non-technical user test | US-005 (AB#31) | Kesh | Must | 4 h | Oct 15 | AB#89 |

**21 tickets, ≈ 69.5 h.**

---

## 14. Dependency flow (what has to happen first)

```
Oct 5   S3-PM-01 (decisions) ─┬─► TE-004-BE-01 (migration) ──┬─► TE-004-BE-02 (engine) ◄── S3-QA-01 (golden cases)
                              │                              │         │
                              │                              └─► TE-004-BE-03 (seed SQL) ◄── RS-003-02 ◄── RS-003-01 ◄── RS-001-02
                              │                                        │
                              ├─► US-005-BE-01 (contract) ──► US-005-BE-02 (GET roadmap) ◄─┘
                              │        │                         │
                              │        │                         ├─► US-005-BE-03 (rebuild on change)
                              │        │                         └─► US-006-BE-01 (GET step)
                              │        │
                              ├─► US-005-UI-01 ──► US-005-FE-01 ──► US-002-FE-01
                              └─► US-006-UI-01 ──► US-006-FE-01 ──► US-007-FE-01

Oct 14  US-007-BE-01 (seed check), TE-006-BE-01 (API tests)
Oct 15  S3-QA-02 (end-to-end + user test) ──► Oct 16 Sprint Review

```

**Critical path:** S3-PM-01 → RS-001-02 → RS-003-01 → RS-003-02 →
TE-004-BE-03 → US-005-BE-02 → S3-QA-02. Mich's seed sheet (due Oct 8) and Jude's
seed SQL (due Oct 12) have no slack. If either slips by more than half a day, the
Scrum Master raises it at the next standup and the team decides what to cut.

**What can run in parallel from day 2:** the frontend builds against the
placeholder API (US-005-BE-01), and the engine is tested against rule fixtures
(TE-004-BE-02). Neither waits on the real seed.

---

## 15. Workload

| Person | Role this sprint | Tickets | Est. |
|---|---|---|---|
| Jude | PO + Full Stack | S3-PM-01, RS-001-02 review, TE-004-BE-03, US-005-BE-03, US-006-BE-01, US-007-BE-01, TE-006-BE-01 | ≈ 17.5 h ⚠️ |
| Krystelle | Backend | TE-004-BE-01, TE-004-BE-02, US-005-BE-01, US-005-BE-02 | ≈ 14 h |
| Kesh | Scrum Master + QA + UI/UX (+1 frontend ticket) | US-005-UI-01, US-006-UI-01, US-002-FE-01, S3-QA-02 | ≈ 15 h |
| Seth | Frontend | US-005-FE-01, US-006-FE-01, US-007-FE-01, RS-003-02, RS-001-02 review | ≈ 13.5 h |
| Mich | Research + AI | RS-001-02, RS-003-01, S3-QA-01 | ≈ 10 h |

⚠️ **Jude is above the ≈ 15 h line.** The PO accepted this on Oct 5. If Jude
falls behind, move TE-006-BE-01 (3 h) to Krystelle.

---

## 16. Out of scope for Sprint 3

These are listed so nobody starts building them early:

- Marking steps or documents as done, and the progress percentage (US-008,
  US-009, US-011). These are Sprint 4.
- A "line of business" field on the assessment.
- More cities. The schema stays multi-city, and only Pasig is seeded.
- Government office addresses and maps (US-014, US-015). These are Sprint 6.
- The AI assistant (US-012, US-013, TE-003). This is Sprint 5.
- Filipino or Taglish screen text. English only, following the writing rules.
- Changing the 3 categories (D15).

---

## 17. Risks

| Risk | Impact | What we do |
|---|---|---|
| The seed sheet (RS-003-01) is late | Seed SQL, the real roadmap, and QA all slip | Mich starts on Oct 6, right after RS-001-02. Jude can start the SQL for steps 1A to 4 while the rest is reviewed. |
| An open question changes a seeded requirement | Wrong advice shown to users | Unverified items say "Confirm at the office". Answers after Oct 12 go into a Sprint 4 seed update. |
| `docs/research/` is never committed | The seed is built from files only one person has | RS-001-02 is due Oct 6 and blocks the seed. |
| Users find the step text confusing | The app fails its main promise | The writing rules, Seth's clarity review (RS-003-02), and the non-technical user test (S3-QA-02). |
| Render is asleep during the Sprint Review | The demo hangs | Open the app 2 minutes before the review to wake the API. |
