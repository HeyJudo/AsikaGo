# AsikaGo Sprint 2 Ticket Breakdown v1.0

## Document Information

**Project:** AsikaGo
**Sprint:** Sprint 2 (September 21 - October 2, 2026)
**Prepared:** September 29, 2026
**Owner:** Product Owner
**Purpose:** Split the remaining Sprint 2 stories into tasks that one person
can finish, each with acceptance criteria, dependencies, and an estimate.
Every ticket below can be copied straight into Azure Boards.

**Related documents:** Sprint 2 Execution Board v1.0, Product Backlog v1.1,
PRD v1.0, Database Design Specification v1.0, `docs/decisions.md`

---

## 1. How to read this document

### Ticket ID format

`<Parent story>-<Discipline>-<Number>`. For example, `US-001-FE-02` is the
second Frontend task under US-001. Work that is not tied to one story uses `S2`
as its parent.

| Code | Discipline |
|---|---|
| PM | Product / decisions |
| UI | UI/UX design (wireframes, specs) |
| FE | Frontend implementation (React) |
| BE | Backend implementation (ASP.NET Core) |
| RS | Research |
| QA | Testing and verification |

### Fields

- **Assignee:** `[TBD]` placeholder. The suggested role is only a hint. Assign
  people in the meeting.
- **Estimate:** ideal hours of focused work. Story points stay on the parent story.
- **Priority:**
  - **Must:** the sprint fails without it.
  - **Should:** plan to do it, but it can be dropped if time runs out.
  - **Could:** only if there's time left.
- **Depends on:** tickets that must be finished before this one can start.
- **Blocks:** tickets that are waiting on this one.

### Definition of Ready (before anyone starts a ticket)

- The ticket has an assignee, and they understand the acceptance criteria.
- Every ticket listed in "Depends on" is Done, or the dependency is only on an
  agreed contract (for example, a mock is allowed).

### Definition of Done (for every ticket)

- All acceptance criteria pass.
- Code is merged to `main` through a PR with green CI and 1 review. Research
  and design work is committed to `docs/`.
- The commit or PR references the Azure Boards ticket (`AB#<id>`).
- The board is updated.

---

## 2. Current state (what already exists)

The scope below builds on this. Don't build these again:

| Already exists | Where |
|---|---|
| React app with Supabase sign-in (Google + guest) | `frontend/src/features/auth/HomePage.tsx` |
| `GET /api/me` creates or updates the user's profile | `backend/src/AsikaGo.Api/Features/Me/` |
| `business_profiles` table with the columns `business_name` (optional), `business_type`, `category_id`, `city_id`, `registration_status` (`Planning` / `Started`) | `Data/Entities/BusinessProfile.cs` |
| **Cities:** the schema stays multi-city, but the MVP scope is **Pasig City only** (decision of 2026-09-29). Only Pasig is seeded. A new migration removes the Quezon City and Manila seed rows. | `AppDbContext.cs` (`HasData`) + new migration |
| **Categories already seeded:** Food and Beverage, Retail, Services | `AppDbContext.cs` (`HasData`) |
| Button component only (shadcn) | `frontend/src/components/ui/` |
| API client that attaches the login token | `frontend/src/lib/api.ts` |

The dropdown data already exists, so the form is **not** blocked by research.
There is **no City field** on the form: the MVP covers Pasig City only, and the
backend sets `city_id` to Pasig automatically.
The research tickets decide whether that data is **correct and complete**.

---

## 3. Board decisions (make these in today's meeting)

### S2-PM-01: Close TE-005 and decide on US-004

| Field | Value |
|---|---|
| Type | Product / Decision |
| Assignee | `[TBD]` (suggested: Product Owner + Scrum Master) |
| Priority | Must |
| Estimate | 0.5 h (in the meeting) |
| Due | Sep 29 |
| Depends on | None |
| Blocks | None |

**Description.** The backlog puts two stories in Sprint 2 that are not on the
Sprint 2 board:

- **TE-005 Authentication Setup.** It is already delivered: Supabase Auth,
  backend token validation, and `/api/me`.
- **US-004 Create Business Profile.** It is almost the same as the "save"
  half of US-001.

**Recommendation.**

- Mark TE-005 **Done** and link it to US-003.
- **Merge US-004 into US-001.** The tickets in this document (US-001-BE-03,
  US-001-BE-04, US-003-FE-02) fully deliver a saved, viewable business profile.

**Acceptance criteria.**

- [ ] The decision on TE-005 is recorded in the meeting notes and on Azure Boards.
- [ ] The decision on US-004 is recorded. If it is merged, it is closed on the
      board with a link to US-001.

---

### US-001-PM-01: Finalize the assessment field definitions

| Field | Value |
|---|---|
| Type | Product / Decision |
| Assignee | `[TBD]` (suggested: Product Owner) |
| Priority | **Must. This is the first ticket, and the design and backend tickets wait on it.** |
| Estimate | 1 h |
| Due | **Sep 29 (end of day)** |
| Depends on | None |
| Blocks | US-001-UI-01, US-001-BE-01 |

**Description.** US-001 asks for "business category, business type, location,
and registration status", but "business type" is not defined anywhere.
Before anyone builds the form, the Product Owner locks down the exact fields,
options, and rules.

**The open question: what does "business type" mean?**

- **Option A (recommended):** the legal structure. The choices are Sole
  Proprietorship, Partnership, Corporation, and One Person Corporation. This
  decides whether the roadmap starts at **DTI** (sole proprietorship) or at
  **SEC** (everything else), so the roadmap engine needs it.
- **Option B:** a free-text description, like "milk tea stall". This is useful
  for the AI in Sprint 5, but the roadmap engine can't use it.

**Proposed field specification** (the Product Owner confirms or edits it). There
is **no City field**: the MVP scope is Pasig City only, and the backend sets
`city_id` to Pasig on save.

| Field | Input | Required | Options / rules |
|---|---|---|---|
| Business name | Text | No | Max 100 characters. Trim the spaces at both ends. |
| Business type | Radio / select | Yes | Sole Proprietorship, Partnership, Corporation, One Person Corporation |
| Business category | Select | Yes | From `business_categories` (currently 3) |
| Registration status | Radio | Yes | `Planning` = "I haven't started registering yet"; `Started` = "I've already started some steps" |

**Acceptance criteria.**

- [ ] The table above is final, and its final version is written in
      `docs/decisions.md` under a new "Assessment fields" heading.
- [ ] The meaning of business type is chosen (A or B), with one line explaining why.
- [ ] The user-facing labels and help text for each field are written in plain,
      simple English.

---

## 4. US-001 Provide Business Information (5 pts)

**Story:** As an aspiring micro-entrepreneur, I want to provide my business
details, location, and registration status, so that AsikaGo can understand my
business situation and provide relevant guidance.

**Story-level acceptance criteria** (from the Sprint 2 Execution Board):

- **AC-001-01:** the entered category, type, location, and status are saved.
- **AC-001-02:** missing required fields show validation messages.
- **AC-001-03:** the saved data can be used later to generate the roadmap.

### Suggested API contract

US-001-BE-01 makes this contract final. It is written here so the frontend and
backend can work at the same time.

```http
GET /api/assessment/options
200 OK
{
  "categories":           [{ "id": "uuid", "name": "Food and Beverage", "description": "..." }],
  "businessTypes":        ["Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation"],
  "registrationStatuses": ["Planning", "Started"]
}

GET /api/business-profile
200 OK  -> BusinessProfileResponse
404     -> the user has not completed the assessment yet

PUT /api/business-profile            (create or replace; one profile per user, see D7)
Request:  { "businessName": "string|null", "businessType": "string",
            "categoryId": "uuid", "registrationStatus": "Planning|Started" }
200 OK  -> BusinessProfileResponse
400     -> ValidationProblem: { "errors": { "categoryId": ["Please choose a business category."] } }
401     -> not signed in

The request has no `cityId`. The backend sets `city_id` = Pasig on create and update.

BusinessProfileResponse:
{ "id", "businessName", "businessType", "categoryId", "categoryName",
  "cityId", "cityName", "registrationStatus", "createdAt" }
```

---

### UI design

#### US-001-UI-01: Wireframe the Business Assessment form

| Field | Value |
|---|---|
| Type | UI/UX Design |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Must |
| Estimate | 3 h |
| Due | Sep 30 (midday) |
| Depends on | US-001-PM-01 |
| Blocks | US-001-FE-01 |

**Description.** Design the screen where the user answers the assessment. The
target user is a first-time micro-entrepreneur, probably on a phone, who may
feel intimidated by government processes. The screen must feel short and safe.

**The design must cover:**

1. **Layout:** one page with all 4 fields (no City field; the MVP is Pasig City only). Keep it to a single page, with no
   multi-step wizard for 4 fields.
2. **Header copy:** a title plus one supporting sentence. Example: "Tell us
   about your business. We'll use this to build your registration roadmap."
3. **Every field:** its label, help text (where it helps), placeholder, and an
   "optional" marker on business name.
4. **Business type help:** a short explanation of each choice (for example,
   "Sole Proprietorship: you own the business alone. Most small businesses start here.").
5. **Five states:** empty, filled, field error (message shown under the field),
   submitting (the button is disabled and shows a spinner), and save failed
   (a banner with a retry option).
6. **Button:** a primary "Save and continue" button.
7. **Responsive:** a mobile layout at **360 px** wide and a desktop layout at
   **1280 px** wide.

**Acceptance criteria.**

- [ ] Mobile (360 px) and desktop (1280 px) frames exist for all 5 states, and the form has no City field.
- [ ] Every label, help text, and error message is written out. No lorem ipsum.
- [ ] Only shadcn/ui components are used (Card, Input, Label, Select,
      RadioGroup, Button, Alert), so the design can be built without custom
      components.
- [ ] The design is exported or linked in `docs/design/` (an image or a
      Figma/Pencil link), and the frontend developer reviews it.
- [ ] Accessibility: every input has a visible label, errors are not shown by
      color alone, and touch targets are at least 44 px.

---

### Backend

#### US-001-BE-01: Define the API contract and publish the types

| Field | Value |
|---|---|
| Type | Backend |
| Assignee | `[TBD]` (suggested: Backend Developer) |
| Priority | Must |
| Estimate | 2 h |
| Due | **Sep 30 (morning)** |
| Depends on | US-001-PM-01 |
| Blocks | US-001-BE-02, US-001-BE-03, US-001-BE-04, US-001-FE-02, US-003-FE-02 |

**Description.** Create the request and response records and register the
three endpoints in `Features/Assessment/`. For now each endpoint returns
placeholder data. Regenerate the OpenAPI file and the frontend types so the
frontend can build against the real types right away while the logic is still
being written.

**Acceptance criteria.**

- [ ] The records `AssessmentOptionsResponse`, `SaveBusinessProfileRequest`,
      and `BusinessProfileResponse` exist and match the contract in Section 4.
      Any difference from the contract is written in the PR description.
- [ ] The endpoints are mapped under `/api` and require login.
- [ ] `backend/openapi/AsikaGo.Api.json` and `frontend/src/lib/api-types.ts`
      are regenerated and committed, and CI is green.
- [ ] The frontend developer is told in the team chat that the types are ready.

---

#### US-001-BE-02: Build `GET /api/assessment/options`

| Field | Value |
|---|---|
| Type | Backend |
| Assignee | `[TBD]` (suggested: Backend Developer) |
| Priority | Must |
| Estimate | 1.5 h |
| Due | Sep 30 |
| Depends on | US-001-BE-01 |
| Blocks | US-001-FE-01 (real data) |

**Description.** Return the dropdown data. Categories come from the
database. There is no `cities` list, because the MVP covers Pasig City only. Business types and
registration statuses come from the list confirmed in US-001-PM-01.

**Acceptance criteria.**

- [ ] The endpoint returns the 3 seeded categories, sorted by name, and no cities.
- [ ] `registrationStatuses` comes from the `RegistrationStatus` enum, so
      adding a new value to the enum updates the response automatically.
- [ ] An anonymous (guest) user can call it. They count as signed in.
- [ ] A test checks that the response contains the 3 categories and has no `cities` field.

---

#### US-001-BE-03: Build `PUT /api/business-profile` with validation

| Field | Value |
|---|---|
| Type | Backend |
| Assignee | `[TBD]` (suggested: Backend Developer) |
| Priority | Must |
| Estimate | 4 h |
| Due | Oct 1 (midday) |
| Depends on | US-001-BE-01 |
| Blocks | US-001-FE-03, US-001-QA-02 |

**Description.** Save the user's business profile. There is **one profile per
user** (decision D7):

- If the user has no profile yet, create one.
- If they already have one, update it. Never create a second profile.

The user id always comes from the login token, **never from the request body**.
The request has **no `cityId`**: the backend sets `city_id` to the Pasig city id
on every create and update (the MVP scope is Pasig City only).

**Validation rules** (return a 400 ValidationProblem with a message for each field):

| Field | Rule | Message |
|---|---|---|
| businessType | Required, and must be one of the allowed values | "Please choose a business type." |
| categoryId | Required, and must exist in `business_categories` | "Please choose a business category." |
| registrationStatus | Required, and must be `Planning` or `Started` | "Please tell us where you are in the process." |
| businessName | Optional, at most 100 characters after trimming | "Business name must be 100 characters or less." |

**Acceptance criteria.**

- [ ] A valid request from a user with no profile creates one row and returns 200.
- [ ] A second valid request from the same user **updates** that row. The
      user still has exactly 1 row.
- [ ] Every rule in the table returns 400, with the error listed under the
      right field name.
- [ ] A request without a login token returns 401.
- [ ] One user can never change another user's profile, because the user id
      only comes from the token.
- [ ] `city_id` is set to Pasig automatically on create and update, and the
      request DTO has no `cityId`. A `cityId` sent in the body is ignored.
- [ ] The response includes `categoryName` and `cityName` (always "Pasig"), so
      the frontend doesn't need a second call to show them.

---

#### US-001-BE-04: Build `GET /api/business-profile`

| Field | Value |
|---|---|
| Type | Backend |
| Assignee | `[TBD]` (suggested: Backend Developer) |
| Priority | Must |
| Estimate | 1 h |
| Due | Oct 1 (midday) |
| Depends on | US-001-BE-01 |
| Blocks | US-003-FE-02, SH-FE-01 (the redirect logic) |

**Description.** Return the signed-in user's saved business profile. It is used
to show the "My Business" screen and to decide whether to send a user to the
assessment page or to the summary page.

**Acceptance criteria.**

- [ ] It returns 200 with a `BusinessProfileResponse` when a profile exists.
- [ ] It returns **404** (not an empty 200) when the user hasn't done the
      assessment yet.
- [ ] It only ever returns the calling user's own profile.

---

#### US-001-BE-05: Backend tests for the business profile endpoints

| Field | Value |
|---|---|
| Type | Backend / Test |
| Assignee | `[TBD]` (suggested: Backend Developer) |
| Priority | Must |
| Estimate | 2.5 h |
| Due | Oct 1 |
| Depends on | US-001-BE-03, US-001-BE-04 |
| Blocks | None |

**Description.** Add tests next to the existing `HealthAndAuthTests` in
`backend/tests/AsikaGo.Tests/`.

**Acceptance criteria.**

- [ ] **Create then read:** a PUT followed by a GET returns the same data.
- [ ] **Upsert:** two PUTs still leave only 1 row.
- [ ] **Validation:** there is at least one test for each validation rule.
- [ ] **No login:** a request without a token returns 401.
- [ ] **No profile yet:** a GET with no profile returns 404.
- [ ] `dotnet test` passes locally and in CI.

---

### Frontend

#### US-001-FE-01: Build the assessment form UI

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Must |
| Estimate | 4 h |
| Due | Oct 1 (morning) |
| Depends on | US-001-UI-01. Can start before BE-02 by using hardcoded options. |
| Blocks | US-001-FE-02, US-001-FE-03 |

**Description.** Build the design from US-001-UI-01 as
`src/features/assessment/AssessmentPage.tsx` at the route `/assessment`. Add
the shadcn components it needs with
`npx shadcn add card input label select radio-group alert`. Load the dropdown
options from `GET /api/assessment/options` using TanStack Query.

**Acceptance criteria.**

- [ ] It matches the wireframe at 360 px and 1280 px.
- [ ] The form has **no City field**. The category dropdown shows the data from
      the API (3 categories). The options are never hardcoded in the final PR.
- [ ] A loading state shows while the options load, and an error message with a
      Retry button shows if they fail.
- [ ] You can fill in the whole form using only the keyboard.
- [ ] `npm run lint` and `npm run build` pass.

---

#### US-001-FE-02: Form validation and server error messages

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Must (this covers AC-001-02) |
| Estimate | 2.5 h |
| Due | Oct 1 |
| Depends on | US-001-FE-01, US-001-BE-01 |
| Blocks | US-001-QA-02 |

**Description.** Check the form in the browser before submitting, and also
show the backend's 400 errors under the matching fields. The backend is the
real source of truth; the browser checks only make the form faster to use.

**Acceptance criteria.**

- [ ] Clicking "Save and continue" with required fields empty shows a message
      under each missing field and sends **no** request.
- [ ] The error messages are the same wording as in US-001-BE-03.
- [ ] A 400 from the backend shows each error under its field, using the
      `errors` object (`categoryId` → the Category field).
- [ ] After a failed submit, the first field with an error gets focus.
- [ ] Each error clears as soon as the user fixes that field.

---

#### US-001-FE-03: Save the form, and prefill it when editing

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Product Owner / Full Stack) |
| Priority | Must (this covers AC-001-01) |
| Estimate | 3 h |
| Due | Oct 1 (end of day) |
| Depends on | US-001-FE-01, US-001-BE-03, US-001-BE-04 |
| Blocks | US-001-QA-02, US-003-FE-02 |

**Description.** Send the form with a TanStack Query mutation to
`PUT /api/business-profile`. When it succeeds, go to `/my-business`. If the
user already has a profile, the form opens **already filled in** with their
saved answers, so the same page works for both "create" and "edit".

**Acceptance criteria.**

- [ ] A valid submit saves the data (check the row in Supabase) and goes to `/my-business`.
- [ ] The button is disabled while saving, so you can't submit twice.
- [ ] A network or 500 error shows an error banner with Retry, and the user's
      answers are **not** cleared.
- [ ] Going back to `/assessment` shows the saved answers already filled in.
- [ ] After saving, the `business-profile` query is refreshed, so `/my-business`
      shows the new data without reloading the page.

---

## 5. US-003 Create User Account (the rest of it)

**Remaining gap:** AC-003-02 says "after logging in, the user can see their
saved info". Today the signed-in page only shows the debug values
`id` / `email` / `isAnonymous`.

### US-003-UI-01: Redesign the landing and sign-in screen

| Field | Value |
|---|---|
| Type | UI/UX Design |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Should |
| Estimate | 2 h |
| Due | Sep 30 |
| Depends on | None |
| Blocks | US-003-FE-01 |

**Description.** Redesign the screen a new visitor sees first. Today it has
only a title and two buttons. It needs to tell the user what AsikaGo does and
what "guest" means.

**The design must cover:**

1. **Value statement:** a headline plus one line. Example: "Register your
   business step by step, made for Pasig City."
2. **Scope notice:** a visible line that says "Currently for Pasig City
   businesses." Users outside Pasig are **not** blocked; they can still sign in.
3. **Sign-in buttons:** keep the **Continue with Google** button (it must follow
   Google's branding rules) and the **Continue as guest** button.
4. **Guest note:** a small line under the guest button. Example: "Your answers
   are saved. Sign in with Google later to keep them on any device."
5. **Responsive:** mobile (360 px) and desktop (1280 px) frames.

**Acceptance criteria.**

- [ ] Mobile and desktop frames are in `docs/design/`.
- [ ] All the copy is final, including the notice "Currently for Pasig City
      businesses."
- [ ] The Google button follows Google's sign-in branding guidelines.

---

### US-003-UI-02: Wireframe the "My Business" summary screen

| Field | Value |
|---|---|
| Type | UI/UX Design |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Must |
| Estimate | 2 h |
| Due | Sep 30 |
| Depends on | US-001-PM-01 |
| Blocks | US-003-FE-02 |

**Description.** Design the screen a signed-in user sees after saving the
assessment, and every time they come back. It shows their saved business and
is where the Sprint 3 roadmap will appear later.

**The design must cover:**

1. **Summary card:** business name (or "Unnamed business"), type, category,
   city (always Pasig), and registration status.
2. **Edit button:** an "Edit details" button that goes to `/assessment`.
3. **Roadmap placeholder:** a card that says "Your registration roadmap is
   coming soon". This is where US-005 will go in Sprint 3.
4. **Guest banner:** a prompt that says "Sign in with Google to keep your
   progress."
5. **Responsive:** mobile and desktop frames.

**Acceptance criteria.**

- [ ] Mobile and desktop frames are in `docs/design/`.
- [ ] Both versions are designed: the guest version (with the banner) and the
      Google user version.
- [ ] The design is reviewed by the Product Owner.

---

### US-003-FE-01: Build the new landing page and remove the debug output

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Should |
| Estimate | 2 h |
| Due | Oct 1 |
| Depends on | US-003-UI-01, SH-FE-01 |
| Blocks | None |

**Description.** Update `features/auth/HomePage.tsx` to match US-003-UI-01, including the Pasig
scope notice. Take
out the debug `<dl>` (id / email / isAnonymous). Once a user is signed in, this
page should never show; SH-FE-01 redirects them instead.

**Acceptance criteria.**

- [ ] It matches the design at 360 px and 1280 px.
- [ ] The debug values no longer appear anywhere in the app.
- [ ] The Pasig scope notice shows on the page, and it does not block sign-in.
- [ ] Google sign-in and guest sign-in both still work.

---

### US-003-FE-02: Build the "My Business" screen

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Product Owner / Full Stack) |
| Priority | Must (this completes AC-003-02) |
| Estimate | 3 h |
| Due | Oct 1 (end of day) |
| Depends on | US-003-UI-02, US-001-BE-04, SH-FE-01 |
| Blocks | US-001-QA-02 |

**Description.** Build `/my-business` in `src/features/assessment/`. It loads
`GET /api/business-profile` and shows the summary from US-003-UI-02.

**Acceptance criteria.**

- [ ] It shows all the saved fields, using names (not IDs) for the category and city.
- [ ] The "Edit details" button opens `/assessment` with the answers filled in.
- [ ] Guests see the "Sign in with Google" banner. Clicking it links Google to
      the **same** account (Supabase `linkIdentity`), so the data stays.
- [ ] If the API returns 404 (no profile yet), the user is sent to `/assessment`.
- [ ] Signing out and back in with Google shows the same saved data. **This is
      the proof for AC-003-02.**

---

## 6. Shared app shell

### S2-UI-01: Design the app shell (header and shared states)

| Field | Value |
|---|---|
| Type | UI/UX Design |
| Assignee | `[TBD]` (suggested: Frontend / UI-UX Lead) |
| Priority | Should |
| Estimate | 1.5 h |
| Due | Sep 30 |
| Depends on | None |
| Blocks | SH-FE-01 |

**Description.** Design the parts that appear on every page, so each screen
doesn't make up its own.

**The design must cover:**

1. **Header:** the AsikaGo logo on the left; on the right, "Guest" or the
   user's email, plus a Sign out link.
2. **Loading state:** a full-page loader.
3. **Error state:** a full-page error message with a Retry button.
4. **404 page:** a "Page not found" message.

**Acceptance criteria.**

- [ ] The header has mobile and desktop frames.
- [ ] The loading, error, and 404 patterns are defined, and the other UI
      tickets reuse them.

---

### SH-FE-01: Build the app shell, routes, and redirects

| Field | Value |
|---|---|
| Type | Frontend |
| Assignee | `[TBD]` (suggested: Product Owner / Full Stack) |
| Priority | Must |
| Estimate | 3 h |
| Due | Sep 30 (end of day) |
| Depends on | S2-UI-01 (a basic header is fine while waiting for it) |
| Blocks | US-003-FE-01, US-003-FE-02 |

**Description.** Add the shared header layout and the routes to
`src/app/router.tsx`.

**Routes and who can see them:**

| Route | Who can see it | Behavior |
|---|---|---|
| `/` | Everyone | Signed-in users are redirected: to `/my-business` if they have a profile, otherwise to `/assessment` |
| `/assessment` | Signed-in users only | Signed-out users go to `/` |
| `/my-business` | Signed-in users only | Signed-out users go to `/`. Users with no profile go to `/assessment` |
| `*` | Everyone | 404 page |

**Acceptance criteria.**

- [ ] Every row in the routing table works as described.
- [ ] Opening `/my-business` while signed out goes to `/`.
- [ ] Refreshing the page on any route keeps the user signed in and on the same page.
- [ ] Sign out works from the header on every page and goes back to `/`.
- [ ] Vercel serves the routes correctly on refresh (check `vercel.json`).

---

## 7. Research

### RS-001-01: Write the registration workflow document

| Field | Value |
|---|---|
| Scope | **Pasig City only** |
| Type | Research |
| Assignee | `[TBD]` (suggested: Research + AI Engineer) |
| Priority | Must |
| Estimate | 5 h |
| Due | Oct 1 |
| Depends on | None |
| Blocks | RS-001-02, and Sprint 3 TE-004 (the roadmap rule engine) |

**Description.** Write down the full registration process for a new micro
business in Pasig City, in order (scope: Pasig City only). Save it as
`docs/research/registration-workflow.md`.

**For each step, record:**

| Column | Example |
|---|---|
| Order | 1 |
| Step | Business Name Registration |
| Agency | DTI (Sole Proprietorship) or SEC (Partnership, Corporation, OPC) |
| Applies to | Which business types need this step |
| Output | DTI Certificate of Business Name Registration |
| Where | Online (BNRS) or in person |
| Fee (if known) | ₱ amount + the date it was checked |
| Processing time (if known) | Around 1 day |
| Source | An official URL + the date it was accessed |

**Steps to cover, at least:** DTI or SEC registration → Barangay Business
Clearance → Mayor's / Business Permit → BIR registration (Form 1901 or 1903,
Certificate of Registration, books of accounts, receipts). Also cover common
add-ons that depend on the business category, such as the Sanitary Permit and
Fire Safety Inspection Certificate. Say which ones apply to which category.

**Acceptance criteria.**

- [ ] Every step has at least one source from an **official government**
      website (dti.gov.ph, sec.gov.ph, bir.gov.ph, or the LGU site). Blogs can
      only be secondary sources.
- [ ] Where the path is different for DTI (sole proprietorship) and SEC (the
      other types), that is clearly shown.
- [ ] Anything that couldn't be confirmed is marked **"Unverified"**, not left out.
- [ ] The step names match what will go into `registration_steps`.

---

### RS-001-02: Team review of the workflow document

| Field | Value |
|---|---|
| Scope | **Pasig City only** |
| Type | Research / Review |
| Assignee | `[TBD]` (suggested: Product Owner + Scrum Master) |
| Priority | Must |
| Estimate | 1 h |
| Due | Oct 2 |
| Depends on | RS-001-01 |
| Blocks | Closing RS-001 |

**Acceptance criteria.**

- [ ] Two reviewers read the document and leave comments on the PR.
- [ ] Every comment is either fixed or answered.
- [ ] RS-001 meets AC-RS001-01 ("the team has a documented registration
      flow") and is moved to Done.

---

### RS-002-01, RS-002-02: DROPPED (Quezon City and Manila)

**Descoped on 2026-09-29.** The MVP covers Pasig City only, so the Quezon City
(RS-002-01) and Manila (RS-002-02) research tickets are removed. Do not start
them. The IDs are not reused. Adding more cities is a later-sprint decision.

---

### RS-002-03: Pasig City requirements (deep dive)

| Field | Value |
|---|---|
| Type | Research |
| Scope | **Pasig City only** |
| Assignee | `[TBD]` (suggested: Research + AI Engineer) |
| Priority | **Must** (raised from Should; it is now the only city ticket) |
| Estimate | 5 h |
| Due | Oct 2 |
| Depends on | RS-001-01 (the step list). You can start collecting sources before it's done. |
| Blocks | Closing RS-002, and the Sprint 3 seed data for `requirements` |

**Description.** Scope: **Pasig City only.** Research the local registration
requirements in depth and save them as `docs/research/requirements-pasig.md`.
It must cover three areas:

1. **Pasig BPLO process and online portal:** the steps of the Business Permits
   and Licensing Office, how to apply for a new permit, the online portal (if
   any), special forms, and office locations.
2. **Barangay clearance differences across Pasig barangays:** where the
   requirements, fees, or forms differ from barangay to barangay, and where
   they are the same.
3. **Per-business-category requirements in Pasig:** what changes for Food and
   Beverage, Retail, and Services (for example, the Sanitary Permit and Fire
   Safety Inspection Certificate).

**For each requirement, record:**

- The step it belongs to (using the RS-001 step names)
- The document name
- Whether it applies to every category or only some (such as Food and
  Beverage only)
- Whether it is the same in every Pasig barangay or differs (name the barangay)
- Notes (number of copies, needs notarizing, and so on)
- The source URL and the date it was accessed

**Acceptance criteria.**

- [ ] The document states at the top that its scope is Pasig City.
- [ ] The Pasig BPLO process is written step by step, and the online portal
      (or the fact that there is none) is recorded with its URL.
- [ ] Barangay clearance is documented for Pasig, and the barangays that differ
      are listed by name. At least 5 barangays are checked, or it is stated why
      fewer were found.
- [ ] Requirements for each of the 3 categories (Food and Beverage, Retail,
      Services) are tagged with the category name used in the database.
- [ ] Every requirement has an official source link (the Pasig City government
      website or its official Facebook page). Unconfirmed ones are marked
      **"Unverified"**.
- [ ] Every requirement uses the step names from RS-001.
- [ ] The document is committed to `docs/research/`, and RS-002 meets
      AC-RS002-01.

---

### RS-002-04: Check that the business categories list is enough

| Field | Value |
|---|---|
| Scope | **Pasig City only** |
| Type | Research |
| Assignee | `[TBD]` (suggested: Research + AI Engineer) |
| Priority | Could |
| Estimate | 1 h |
| Due | Oct 1 |
| Depends on | None |
| Blocks | None this sprint. It feeds into RS-003 in Sprint 3. |

**Description.** Scope: Pasig City only. The database has only 3 categories: Food and Beverage, Retail,
and Services. Check whether they are enough for the MVP, based on how the
permit requirements in Pasig City actually change between types of business.

**Acceptance criteria.**

- [ ] There is a written recommendation (keep the 3, or add or split some),
      with a reason for each change.
- [ ] If changes are needed, a Sprint 3 ticket is created for the backend to
      add them through a migration. **Don't edit the database by hand.**

---

## 8. QA and review

### US-001-QA-01: Write the Sprint 2 test cases

| Field | Value |
|---|---|
| Type | QA |
| Assignee | `[TBD]` (suggested: Scrum Master + QA Lead) |
| Priority | Must |
| Estimate | 2 h |
| Due | Sep 30 |
| Depends on | US-001-PM-01 |
| Blocks | US-001-QA-02 |

**Description.** Turn every acceptance criterion into test cases the QA lead
can run by hand. Save them in `docs/qa/sprint2-test-cases.md`.

**Each test case has:**

- ID (for example, TC-001)
- The acceptance criterion it covers
- Preconditions
- Steps
- Expected result
- Pass/Fail (filled in during QA-02)

**It must cover:**

- AC-001-01, AC-001-02 (a test for each field rule), AC-001-03
- AC-003-01, AC-003-02
- The route redirects in SH-FE-01
- Guest → Google linking keeps the data
- The form has no City field, a saved profile always has `city_id` = Pasig, and
  a `cityId` in the request body is ignored
- The landing page shows "Currently for Pasig City businesses.", and a user
  outside Pasig can still sign in
- Mobile layout at 360 px

**Acceptance criteria.**

- [ ] Every Sprint 2 acceptance criterion has at least 1 test case, and each
      field rule has its own case.
- [ ] The Product Owner reviews them.

---

### US-001-QA-02: Run the tests end to end and log bugs

| Field | Value |
|---|---|
| Type | QA |
| Assignee | `[TBD]` (suggested: Scrum Master + QA Lead) |
| Priority | Must |
| Estimate | 3 h |
| Due | **Oct 2 (morning, before the review)** |
| Depends on | US-001-FE-02, US-001-FE-03, US-003-FE-02, US-001-QA-01 |
| Blocks | Closing US-001 and US-003 |

**Description.** Run every test case on `main`, locally, and on the Vercel
deployment if it's live. Log each failure as a Bug ticket on Azure Boards with
the steps to reproduce it and a screenshot.

**Acceptance criteria.**

- [ ] Every test case has Pass or Fail recorded in `sprint2-test-cases.md`.
- [ ] Every failure has a bug ticket linked to the story it affects.
- [ ] US-001 and US-003 move to Done only when **no critical bug is still open**
      (this follows the Definition of Done).

---

### S2-QA-01: Every member runs the app locally, and the team reviews TE-001 and TE-002

| Field | Value |
|---|---|
| Type | QA / Review |
| Assignee | **Each member** (tracked by the Scrum Master) |
| Priority | Must |
| Estimate | 1 h per person |
| Due | Sep 30 |
| Depends on | None |
| Blocks | Closing TE-001 and TE-002 |

**Description.** TE-001 and TE-002 can't be marked Done until the team has
reviewed them. The Definition of Done requires that the work is reviewed by
the team.

**Acceptance criteria.**

- [ ] Each member follows `README.md` → First-time setup → Run, then signs in
      as a guest and sees the app working.
- [ ] Each member has read `docs/decisions.md`. Any objection is raised as a
      comment by Sep 30, or the decisions are considered accepted.
- [ ] Setup problems are fixed in the README (docs PR), not only in chat.
- [ ] The Scrum Master checks off each member, then moves TE-001 and TE-002 to Done.

---

## 9. Ticket summary

| ID | Title | Type | Priority | Est. | Due | Depends on |
|---|---|---|---|---|---|---|
| S2-PM-01 | Close TE-005 and decide on US-004 | PM | Must | 0.5 h | Sep 29 | None |
| US-001-PM-01 | Finalize the assessment field definitions | PM | Must | 1 h | Sep 29 | None |
| S2-QA-01 | Everyone runs the app; review TE-001/002 | QA | Must | 1 h each | Sep 30 | None |
| US-001-UI-01 | Assessment form wireframe | UI | Must | 3 h | Sep 30 | PM-01 |
| US-003-UI-01 | Landing / sign-in redesign | UI | Should | 2 h | Sep 30 | None |
| US-003-UI-02 | "My Business" screen wireframe | UI | Must | 2 h | Sep 30 | PM-01 |
| S2-UI-01 | App shell and shared states design | UI | Should | 1.5 h | Sep 30 | None |
| US-001-BE-01 | API contract and published types | BE | Must | 2 h | Sep 30 | PM-01 |
| US-001-BE-02 | `GET /api/assessment/options` | BE | Must | 1.5 h | Sep 30 | BE-01 |
| US-001-BE-03 | `PUT /api/business-profile` + validation | BE | Must | 4 h | Oct 1 | BE-01 |
| US-001-BE-04 | `GET /api/business-profile` | BE | Must | 1 h | Oct 1 | BE-01 |
| US-001-BE-05 | Backend tests | BE | Must | 2.5 h | Oct 1 | BE-03, BE-04 |
| SH-FE-01 | App shell, routes, redirects | FE | Must | 3 h | Sep 30 | S2-UI-01 |
| US-001-FE-01 | Assessment form UI | FE | Must | 4 h | Oct 1 | UI-01 |
| US-001-FE-02 | Validation and server error messages | FE | Must | 2.5 h | Oct 1 | FE-01, BE-01 |
| US-001-FE-03 | Save the form + prefill for editing | FE | Must | 3 h | Oct 1 | FE-01, BE-03, BE-04 |
| US-003-FE-01 | Build the landing page, remove debug output | FE | Should | 2 h | Oct 1 | US-003-UI-01, SH-FE-01 |
| US-003-FE-02 | "My Business" screen | FE | Must | 3 h | Oct 1 | US-003-UI-02, BE-04, SH-FE-01 |
| RS-001-01 | Registration workflow document | RS | Must | 5 h | Oct 1 | None |
| RS-001-02 | Review the workflow document | RS | Must | 1 h | Oct 2 | RS-001-01 |
| ~~RS-002-01~~ | ~~Quezon City requirements~~ (dropped) | RS | n/a | 0 h | n/a | n/a |
| ~~RS-002-02~~ | ~~Manila requirements~~ (dropped) | RS | n/a | 0 h | n/a | n/a |
| RS-002-03 | Pasig City requirements (deep dive) | RS | Must | 5 h | Oct 2 | RS-001-01 (step names) |
| RS-002-04 | Check the categories list | RS | Could | 1 h | Oct 1 | None |
| US-001-QA-01 | Write the test cases | QA | Must | 2 h | Sep 30 | PM-01 |
| US-001-QA-02 | Run the tests end to end, log bugs | QA | Must | 3 h | Oct 2 | FE-02, FE-03, US-003-FE-02, QA-01 |

**Total:** 24 tickets (RS-002-01 and RS-002-02 were dropped), about 59 hours (plus 1 h per member for S2-QA-01).
Over 4 days with 5 people this is **tight but doable**, as long as no one waits
for someone else.

---

## 10. Dependency flow (what has to happen first)

```
Sep 29  US-001-PM-01 (fields) ──┬──► US-001-BE-01 (contract) ──┬──► BE-02 options
        S2-PM-01 (board)        │                              ├──► BE-03 save ──┐
                                │                              └──► BE-04 read ──┼──► BE-05 tests
                                ├──► US-001-UI-01 ──► US-001-FE-01 ──► FE-02     │
                                │                                   └──► FE-03 ◄─┘
                                ├──► US-003-UI-02 ──► US-003-FE-02 ◄── BE-04, SH-FE-01
                                └──► US-001-QA-01 ─────────────┐
        S2-UI-01 ──► SH-FE-01                                   ▼
                                                  Oct 2  US-001-QA-02 ──► Sprint Review

        RS-001-01 ──► RS-001-02
             └──(step names)──► RS-002-03 Pasig City
```

**Critical path:** PM-01 → BE-01 → BE-03 → FE-03 → QA-02. If any of these
slips by more than half a day, the Scrum Master raises it at the next standup
and the team decides what to cut.

---

## 11. Suggested workload by role (assign real names in the meeting)

| Role | Tickets | Est. |
|---|---|---|
| Product Owner / Full Stack | S2-PM-01, US-001-PM-01, SH-FE-01, US-001-FE-03, US-003-FE-02, RS-001-02 | ≈ 11.5 h |
| Scrum Master / QA Lead | S2-PM-01, US-001-QA-01, US-001-QA-02, RS-001-02, tracks S2-QA-01 | ≈ 6.5 h |
| Backend Developer | US-001-BE-01 → BE-05 | ≈ 11 h |
| Frontend / UI-UX Lead | US-001-UI-01, US-003-UI-01, US-003-UI-02, S2-UI-01, US-001-FE-01, US-001-FE-02, US-003-FE-01 | ≈ 17 h ⚠️ |
| Research + AI Engineer | RS-001-01, RS-002-03, RS-002-04 | ≈ 11 h |

⚠️ **One person is overloaded (Frontend / UI-UX Lead). Rebalance in the meeting:**

- Move **US-003-UI-01** and **S2-UI-01** (the Should tickets) to Sprint 3, or
  give US-003-FE-01 to the Product Owner.

The Research + AI Engineer is no longer overloaded: the Pasig-only scope
(2026-09-29) dropped RS-002-01 and RS-002-02, cutting their load from ≈ 15 h to
≈ 11 h. Keep RS-002-03 (Pasig, Must) with them.

---

## 12. Out of scope for Sprint 2

These are listed so nobody starts building them early:

- Roadmap generation and the rule engine (US-005, TE-004), which are Sprint 3
- Adding more cities (Quezon City, Manila, and others) and their research. The
  schema is already multi-city, so this can be scaled later
- Loading the researched requirements into the `requirements` and
  `roadmap_rules` tables, which is Sprint 3 and comes from the RS-001 and
  RS-002 output
- AI extraction of business info from a text description (US-012), which is Sprint 5
- Supporting more than one business per user (D7 keeps it at one for the MVP)
- Filipino or Taglish UI text (the Taglish AI assistant is Sprint 5)
