# AsikaGo Sprint 5 Ticket Breakdown v1.0

## Document Information

**Project:** AsikaGo
**Sprint:** Sprint 5 (November 2 - November 13, 2026)
**Sprint goal:** Help. A Pasig business owner can describe their business in
their own words instead of filling the form, ask questions about their own
roadmap and get answers from it, and see where each office is and when it's
open. The AI is a convenience: it is always optional and never blocks anything.
**Prepared:** November 3, 2026
**Owner:** Product Owner
**Status:** Approved by PO on Nov 3, 2026. Tickets created in Azure Boards (AB#112 to AB#133).
**Purpose:** Split the Sprint 5 stories into tasks that one person can finish,
each with acceptance criteria, dependencies, and an estimate. Every ticket below
is a Task in Azure Boards under its parent story.

**Related documents:** Product Backlog v1.1, `docs/decisions.md`, Sprint 4
Ticket Breakdown v1.0, `docs/superpowers/specs/2026-10-27-openai-migration-design.md`

---

## 1. How to read this document

Ticket IDs, fields, Definition of Ready, Definition of Done, and the writing
rules for user-facing text are the same as Sprint 3 Ticket Breakdown, Section 1.
Work not tied to one story uses `S5` as its parent. New discipline code: `OPS`
(deployment and configuration).

### Sprint scope

| Story | Pts | Why it is in Sprint 5 |
|---|---|---|
| US-012 Extract Business Information Using AI | 8 | Planned (Should Have). TE-003 proved extraction works (19 of 20 correct) |
| US-013 Ask Registration Questions | 8 | Planned (Should Have). Widened by D22 to the whole roadmap |
| US-014A Government Office Info (screen half) | 5 | Pulled from Sprint 6. The research (US-014B) is done, and the assistant needs office data to answer "where" and "what time" |
| Sprint 4 leftovers | — | AB#100, AB#102, AB#109 move to Sprint 5. Their points were counted in Sprint 4 |
| **Total** | **21** | Sprint 4 planned 23 |

---

## 2. Current state (what already exists)

Don't build these again:

| Already exists | Where |
|---|---|
| OpenAI client, `POST /api/assistant/extract`, D21 guardrails | `Features/Assistant/AssistantEndpoints.cs`, `OpenAIClient.cs` |
| Rate limits on every `/api/assistant/*` route (20/min, 200/day per user, 60/min per IP). A new route under `/api/assistant` gets them for free | `AssistantEndpoints.AddAssistant` |
| Extraction prompt and 20-case test set with results | `docs/qa/ai-extraction-cases.md` |
| Assessment steps `intro, name, type, category, status, review` | `frontend/src/features/assessment/AssessmentPage.tsx` (line 39) |
| Roadmap, step detail, progress and documents endpoints | `Features/Roadmap/RoadmapEndpoints.cs` |
| `GET /api/roadmap/documents` (US-008-BE-01) | `RoadmapEndpoints.cs` |
| Guest "Save with Google" banner on the roadmap screen | `RoadmapPage.tsx` (`GuestBanner`) |
| Office research for every step, 16 Verified and 2 Unverified rows | `docs/research/offices-pasig.md` |

**Not there yet:** any AI on screen, `features/assistant/` (empty), an
`offices` table, `Features/KnowledgeBase/` endpoints, fake mode for local AI work.

---

## 3. Sprint 5 decisions

### S5-PM-01: Record the Sprint 5 decisions (D22, D23)

| Field | Value |
|---|---|
| AB# | AB#112 |
| Parent | US-013A (AB#38) |
| Type | Product / Decision |
| Assignee | Jude |
| Priority | **Must. This is the first ticket.** |
| Estimate | 1 h |
| Due | **Nov 4** |
| Depends on | None |
| Blocks | US-013-BE-01, US-013-AI-01, US-014-BE-01 |

**Description.** The PO agreed these decisions on Nov 3. Write them into
`docs/decisions.md`.

| Ref | Decision | Why |
|---|---|---|
| D22 | The assistant (US-013) is one chat, opened from the roadmap, step pages and My Business. Each question sends the user's whole roadmap (steps, documents, conditions, offices), their progress, and the step they opened it from, if any. Answers come only from those rows. Otherwise the assistant says it doesn't know and points to the office. Prompt order, most fixed first: instructions, roadmap, progress, current step, chat history, question. `prompt_cache_key` is the user id. The chat remembers the open conversation only: the browser sends the last 6 messages, the backend stores nothing, and OpenAI stores nothing (`store: false`, no `previous_response_id`). Guests can use it, with the D21 limits. | Questions span steps ("Which step needs a barangay clearance?") and come up anywhere, including in line at the office. Follow-ups ("Saan yun?") need the last messages. A history table would keep personal questions for no user gain. A question costs about $0.003, and guests are the people deciding whether to sign up. |
| D23 | New `offices` table: `step_id`, `city_id?` (null = any city, as D1), `name`, `access` (`Online` / `InPerson`), `address?`, `website?`, `hours?`, `phone?`, `email?`, `maps_url?`, `source`, `is_verified`, `checked_on`. A step can have several offices (Step 5 has 4 BPLD branches). Seeded from `docs/research/offices-pasig.md` as SQL through an EF migration (D6). Unverified rows are seeded and shown with "Confirm before you go." Step detail returns the step's offices. The embedded map stays US-015 (Sprint 6). The Google Maps link covers it for now. | The research is done. The assistant needs office data to answer "Where?" and "What time?". A note on unverified rows beats hiding them. |

**Acceptance criteria.**

- [ ] D22 and D23 are in `docs/decisions.md`.
- [ ] The team is told in the group chat that the decisions are final.

### S5-PM-02: Sync Azure Boards and Notion

| Field | Value |
|---|---|
| AB# | AB#113 |
| Parent | US-013A (AB#38) |
| Type | Product |
| Assignee | Jude |
| Priority | Must |
| Estimate | 2 h |
| Due | **Nov 4** |
| Depends on | This document approved |
| Blocks | None |

**Acceptance criteria.**

- [ ] Azure: every task below exists under its parent in `AsikaGo\Sprint 5`, assigned, with AB# filled into this doc.
- [ ] Azure: AB#100, AB#102, AB#109 moved to Sprint 5. AB#102 reassigned to Jude.
- [ ] Azure: US-012B (AB#55) and US-013B (AB#56) reassigned to Seth. US-014A (AB#40) moved to Sprint 5.
- [ ] Azure: TE-003 (AB#63) and US-014B (AB#57) closed, since all their tasks are done.
- [ ] Notion: Sprint 4 Complete, Sprint 5 active with the scope in Section 1. Backlog sprint fields for US-014 updated.

---

## 4. API contracts (published by Nov 4)

US-013-BE-01 publishes the ask endpoint with a placeholder answer so Seth can
start. US-014-BE-01 adds `offices` to step detail. Changes after that go in the
group chat and the PR description.

```http
POST /api/assistant/ask
body:
{
  "question": "Saan kukunin yung cedula?",     // 1-1000 characters
  "stepNumber": 2,                              // null when opened outside a step page
  "history": [                                  // last 6 messages at most, oldest first
    { "role": "user", "text": "Ano yung cedula?" },
    { "role": "assistant", "text": "..." }      // each text 2000 characters at most
  ]
}

200 text/event-stream
event: delta   data: { "text": "Sa barangay hall " }   // repeated
event: done    data: { "incomplete": false }            // true when cut off by max_output_tokens
event: error   data: { "message": "..." }               // the call failed after the stream started

400 -> empty or too-long question, more than 6 history items, bad role, too-long history text
401 -> not signed in
404 -> no business profile, or stepNumber is not in the roadmap
429 -> rate limit (D21)
503 -> OpenAI error or timeout before the stream started (D21)
```

A flagged question gets a polite refusal as normal `delta` text, then `done`.
`openapi-typescript` can't type the event stream, so the frontend declares the
three event shapes by hand in `features/assistant/`.

```http
GET /api/roadmap/steps/{number}        (field added to StepDetailResponse)
{
  ...existing fields,
  "offices": [
    {
      "name": "BPLD, Annex 1",
      "access": "InPerson",                     // "Online" | "InPerson"
      "address": "3rd Floor, Ayala Malls The 30th, Meralco Ave., Brgy. Ugong, Pasig City",
      "website": null,
      "hours": "Mon-Fri, 8:00 AM-6:00 PM",
      "phone": "(02) 8643-1111 local 1158",
      "email": "bpld.annex1@pasigcity.gov.ph",
      "mapsUrl": "https://maps.app.goo.gl/57Xn2rwdErBwe13X8",
      "isVerified": true
    }
  ]
}
```

---

## 5. US-012 Extract Business Information Using AI (8 pts)

**Story-level acceptance criteria:** AI extracts business type and category
from the user's text. The AI suggests and the user confirms: the form opens
pre-filled and nothing is saved without confirmation. A null field or a failed
call (429 / 503) leaves the field empty, and onboarding is never blocked. The
type step has a "Not sure" helper. Locally, with no key, a fake answer is
returned. In Production, a missing key stops the app at startup.

### US-012-AI-01: Write the "Not sure" helper text

| Field | Value |
|---|---|
| AB# | AB#121 |
| Parent | US-012A (AB#37) |
| Type | AI / Content |
| Assignee | Michelle |
| Priority | Should |
| Estimate | 1 h |
| Due | Nov 5 |
| Depends on | None |
| Blocks | US-012-FE-02 |

**Acceptance criteria.**

- [ ] `docs/qa/business-type-helper.md` has the question "Ikaw lang ba ang may-ari?" ("Are you the only owner?") and the text for each answer.
- [ ] Yes: suggests Sole Proprietorship (registered with DTI) with one reason, plus one line that a One Person Corporation also has one owner, is registered with SEC, and limits personal liability.
- [ ] No: one or two plain sentences each for Partnership and Corporation, both registered with SEC.
- [ ] Each fact names its source (DTI or SEC page). Taglish-friendly, no legal terms without a plain explanation.
- [ ] Jude approves it in the PR.

### US-012-AI-02: Tighten the extraction prompt and rerun the test set

| Field | Value |
|---|---|
| AB# | AB#122 |
| Parent | US-012A (AB#37) |
| Type | AI / QA |
| Assignee | Michelle |
| Priority | Should |
| Estimate | 2 h |
| Due | Nov 6 (prompt), Nov 10 (rerun) |
| Depends on | US-012-BE-01 for the rerun |
| Blocks | US-012-BE-01 (prompt text) |

**Description.** Case 16 ("online seller") came back as Retail where null was
expected. US-012 puts extraction in front of real users, so fix the vague case
before launch.

**Acceptance criteria.**

- [ ] By Nov 6: `docs/qa/ai-extraction-cases.md` has the revised instruction text and 5 new cases (cases 21-25) that name only how the business sells or a vague word ("online", "reseller", "side hustle"), expected null category.
- [ ] After US-012-BE-01 merges: all 25 cases rerun through the local API. The Sprint 4 results stay, and the new results are added as a second run with time and tokens.
- [ ] At least 22 of 25 correct, and cases 1-15 still correct. Otherwise Michelle and Krystelle agree on one more change and rerun once.

### US-012-BE-01: Fake mode, Production key check, and the new prompt

| Field | Value |
|---|---|
| AB# | AB#123 |
| Parent | US-012A (AB#37) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | Should |
| Estimate | 2 h |
| Due | Nov 9 |
| Depends on | US-012-AI-02 (prompt text) |
| Blocks | US-012-FE-01 (real data), US-012-AI-02 (rerun), US-013-BE-03 (fake mode) |

**Acceptance criteria.**

- [ ] In Development with no `OpenAI:ApiKey`, `POST /api/assistant/extract` returns a fixed answer (Sole Proprietorship, Retail's `categoryId`) without calling OpenAI, and logs one line saying fake mode is on.
- [ ] In Production with no `OpenAI:ApiKey`, the app fails at startup with a clear message.
- [ ] The extraction prompt matches the revised text from US-012-AI-02.
- [ ] Tests cover fake mode and the Production check. Existing tests pass.

### US-012-UI-01: Design the description screen and the "Not sure" helper

| Field | Value |
|---|---|
| AB# | AB#125 |
| Parent | US-012B (AB#55) |
| Type | UI/UX |
| Assignee | Keisuke |
| Priority | Should |
| Estimate | 2 h |
| Due | **Nov 5** |
| Depends on | None |
| Blocks | US-012-FE-01, US-012-FE-02 |

**Acceptance criteria.**

- [ ] `docs/design/US-012-UI-01-describe-and-not-sure.html` covers: the description screen (text box, character counter, "Continue" and "Skip, I'll choose myself"), its loading state, the pre-filled type and category steps with a "Suggested from your description" hint, the quiet fallback line, and the "Not sure" helper with both answers.
- [ ] 360 px and desktop. Copy follows the writing rules. Touch targets are at least 44 px.
- [ ] Seth and Jude approve it in the PR.

### US-012-FE-01: Description screen in the assessment

| Field | Value |
|---|---|
| AB# | AB#126 |
| Parent | US-012B (AB#55) |
| Type | Frontend |
| Assignee | Seth |
| Priority | Should |
| Estimate | 5 h |
| Due | Nov 9 |
| Depends on | US-012-UI-01, US-012-BE-01 (fake mode for local work) |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] A new `describe` step comes after `intro` for users with no business profile. Editing an existing profile skips it.
- [ ] The text box has a 1000-character limit with a counter. "Skip, I'll choose myself" goes to the next step with nothing filled.
- [ ] While the call runs, the screen shows "Binabasa ang description mo..." and the button is disabled.
- [ ] A returned type or category pre-selects that choice on its step, with the "Suggested from your description" hint. The user can change it. Nothing is saved until the normal review step.
- [ ] A null field, a 429, a 503 or a network error moves on with the field empty and one quiet line ("We couldn't tell from your description. Please choose below."). No error screen.
- [ ] The description is not sent anywhere except `/api/assistant/extract`, and is not saved.

### US-012-FE-02: "Not sure" helper on the type step

| Field | Value |
|---|---|
| AB# | AB#127 |
| Parent | US-012B (AB#55) |
| Type | Frontend |
| Assignee | Keisuke |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 10 |
| Depends on | US-012-UI-01, US-012-AI-01 |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] The type step has a "Not sure" choice. When the AI returned a null type, the step shows a link to the same helper.
- [ ] The helper asks "Ikaw lang ba ang may-ari?" with Yes / No, and shows the US-012-AI-01 text for the answer.
- [ ] Yes pre-selects Sole Proprietorship with its reason and the OPC line. No shows Partnership and Corporation side by side. The user still picks and can choose any of the 4 types.
- [ ] "Not sure" is never saved as a business type. The step can't continue until a real type is picked.

---

## 6. US-013 Ask Registration Questions (8 pts)

**Story-level acceptance criteria:** Per D22. The user can ask questions from
the roadmap, step pages and My Business. Answers come only from the user's
roadmap data. When that data doesn't answer, the assistant says so and points
to the office. Answers are Taglish-friendly and stream in. Flagged questions get
a polite refusal. An incomplete answer is shown with a "Try asking a shorter
question" note. D21 limits, cap, `store: false` and 503 handling apply.

### US-013-AI-01: Write the Q&A prompt and test set

| Field | Value |
|---|---|
| AB# | AB#114 |
| Parent | US-013A (AB#38) |
| Type | AI |
| Assignee | Michelle |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 6 |
| Depends on | S5-PM-01 |
| Blocks | US-013-BE-03 (prompt), US-013-AI-02 |

**Acceptance criteria.**

- [ ] `docs/qa/ai-qa-cases.md` has 20 questions for one fixed test roadmap (Sole Proprietorship, Retail), each with the expected behavior ("must mention barangay hall", "must say it doesn't know and name the office").
- [ ] The set covers: 4 about one step, 3 across steps, 2 about progress ("Ano pa kulang ko?"), 3 about offices (where, hours, phone), 2 follow-up pairs ("Saan yun?"), 3 out of scope (tax amount, "corporation ba dapat ako?", unrelated topic), 1 prompt injection, 1 that should be flagged. At least half in Taglish.
- [ ] The same file has a draft of the instruction text in plain English: answer only from the rows given, say "I don't know, ask [office]" otherwise, match the user's language, keep answers short.

### US-013-BE-01: Publish the ask API contract

| Field | Value |
|---|---|
| AB# | AB#115 |
| Parent | US-013A (AB#38) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | Should |
| Estimate | 1 h |
| Due | **Nov 4** |
| Depends on | S5-PM-01 |
| Blocks | US-013-BE-02, US-013-BE-03, US-013-FE-01 |

**Acceptance criteria.**

- [ ] `POST /api/assistant/ask` exists per Section 4, with validation (400) and a placeholder answer streamed as 3 `delta` events and a `done`.
- [ ] `backend/openapi/AsikaGo.Api.json` and `frontend/src/lib/api-types.ts` are regenerated and committed.
- [ ] Existing tests pass.

### US-013-BE-02: Build the roadmap context for the prompt

| Field | Value |
|---|---|
| AB# | AB#116 |
| Parent | US-013A (AB#38) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 6 |
| Depends on | US-013-BE-01, US-014-BE-01 |
| Blocks | US-013-BE-03 |

**Description.** A plain class in `Features/Assistant/` that turns the user's
loaded roadmap into prompt text. No HTTP or OpenAI code, so it can be unit-tested.

**Acceptance criteria.**

- [ ] Loads data the same way as step detail (reuse the roadmap loading in `RoadmapEndpoints.cs`, no second copy of the rules).
- [ ] Output has two parts, in D22 order. The roadmap part: steps in order with name, agency, actions, condition note, requirements and offices. The progress part: each step's status and which documents are checked (D17, D19). When a step number is given, a third part names the current step.
- [ ] The same roadmap gives exactly the same roadmap text every time, and checking a document changes only the progress part. This keeps the cached prefix (D22).
- [ ] Unit tests cover order, a document checked, a requirement that no longer applies (D19), and the current-step part.

### US-013-BE-03: Build `POST /api/assistant/ask`

| Field | Value |
|---|---|
| AB# | AB#117 |
| Parent | US-013A (AB#38) |
| Type | Backend / AI |
| Assignee | Jude (Krystelle reviews) |
| Priority | Should |
| Estimate | 6 h |
| Due | Nov 9 |
| Depends on | US-013-BE-01, US-013-BE-02, US-013-AI-01, US-012-BE-01 (fake mode) |
| Blocks | US-013-BE-04, US-013-AI-02, US-013-FE-01 (real data), S5-OPS-01 |

**Acceptance criteria.**

- [ ] Replaces the placeholder with a streamed Responses API call. Instructions from US-013-AI-01, then the US-013-BE-02 context, then the history, then the question in its own user message (D22).
- [ ] Every call sets `store: false`, `stream: true`, `prompt_cache_key` = user id, and a `max_output_tokens` high enough that normal answers are never cut off. A cut-off answer ends with `done` `{ "incomplete": true }`.
- [ ] Flagged questions get a polite refusal (mechanism per Section 16).
- [ ] D21: 15 s timeout before the first token returns 503. OpenAI errors before the stream starts return 503, after it starts an `error` event. Never a 500. Same one-retry rule as extract.
- [ ] One log line per call with input, output and cached tokens and elapsed ms. The question, history and key are never logged.
- [ ] Fake mode (from US-012-BE-01) streams a fixed answer when no key is set in Development.
- [ ] Unit tests use the fake HTTP handler. No test calls the real API.

### US-013-BE-04: Integration tests for the ask API

| Field | Value |
|---|---|
| AB# | AB#118 |
| Parent | US-013A (AB#38) |
| Type | Backend / QA |
| Assignee | Krystelle |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 10 |
| Depends on | US-013-BE-03 |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] Tests cover: a guest gets 200, no token gets 401, no business profile gets 404, a step number outside the roadmap gets 404, and every 400 case in Section 4.
- [ ] The request sent to the fake handler contains the caller's roadmap and **none of another user's** steps, documents or progress.
- [ ] The request sets `store: false` and `prompt_cache_key`, and has no `previous_response_id`.
- [ ] The current step appears in the prompt only when `stepNumber` is sent.

### US-013-UI-01: Design the chat sheet and the office card

| Field | Value |
|---|---|
| AB# | AB#128 |
| Parent | US-013B (AB#56) |
| Type | UI/UX |
| Assignee | Keisuke |
| Priority | Should |
| Estimate | 3 h |
| Due | **Nov 5** |
| Depends on | None |
| Blocks | US-013-FE-01, US-014-FE-01 |

**Acceptance criteria.**

- [ ] `docs/design/US-013-UI-01-chat-and-offices.html` covers: the chat button on roadmap, step detail and My Business, the open sheet (empty state with 3 example questions, an answer streaming in, a refusal, the incomplete note, 429 and 503 messages), and the office card on step detail (in person, online, several offices, unverified note).
- [ ] 360 px and desktop. The sheet doesn't cover the guest banner's button. Touch targets are at least 44 px.
- [ ] Seth and Jude approve it in the PR.

### US-013-FE-01: Chat sheet

| Field | Value |
|---|---|
| AB# | AB#129 |
| Parent | US-013B (AB#56) |
| Type | Frontend |
| Assignee | Seth |
| Priority | Should |
| Estimate | 6 h |
| Due | Nov 11 |
| Depends on | US-013-UI-01, US-013-BE-01 (placeholder), US-013-BE-03 (real answers) |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] Code in `src/features/assistant/`. The chat button shows on the roadmap, step detail and My Business, for guests and Google users.
- [ ] On a step page, `stepNumber` is sent. Elsewhere it is null.
- [ ] The conversation lives in component state. Each request sends the last 6 messages. Closing the sheet or refreshing clears it.
- [ ] Answers render as they stream (`fetch` with a readable stream, since the request is a POST with the auth header). Input is disabled while an answer streams.
- [ ] `done` with `incomplete: true` shows "Try asking a shorter question." 429 and 503 show friendly messages that say the roadmap still works. An `error` event keeps the partial answer and shows a retry button.
- [ ] 1000-character counter. Esc closes the sheet, focus returns to the button, and new answer text is announced to screen readers (`aria-live`).

### US-013-AI-02: Run the Q&A test set against the real API

| Field | Value |
|---|---|
| AB# | AB#119 |
| Parent | US-013A (AB#38) |
| Type | AI / QA |
| Assignee | Michelle |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 11 |
| Depends on | US-013-BE-03 |
| Blocks | Sprint Review |

**Description.** Run each of the 20 questions once against a local API with a
real key, signed in as a test guest with the fixed test roadmap. No code changes.

**Acceptance criteria.**

- [ ] `docs/qa/ai-qa-cases.md` has a result per question: pass or fail against the expected behavior, the answer, time to the full answer (ms), and tokens (input, output, cached) from the API log line.
- [ ] A summary at the top: passes, any answer that invents a requirement or office, average time, total cost.
- [ ] Bar: at least 16 of 20 pass and **zero invented requirements**. Otherwise Michelle and Jude agree on one prompt change and rerun once. Both results are kept.

---

## 7. US-014A Government Office Info, screen half (5 pts, pulled from Sprint 6)

**Story-level acceptance criteria:** Step detail shows where to go for the step:
office name, address or website, hours, phone and email, with a Google Maps
link. Unverified offices are marked.

### US-014-BE-01: `offices` table, seed, and offices on step detail

| Field | Value |
|---|---|
| AB# | AB#130 |
| Parent | US-014A (AB#40) |
| Type | Backend |
| Assignee | Krystelle |
| Priority | Could |
| Estimate | 4 h |
| Due | Nov 6 |
| Depends on | S5-PM-01 |
| Blocks | US-013-BE-02, US-014-FE-01 |

**Acceptance criteria.**

- [ ] `Office` entity and migration per D23. Seed SQL in `database/seed/002_pasig_offices.sql`, applied through the migration (D6).
- [ ] Every row of `docs/research/offices-pasig.md` is seeded against its step, using the "Seed name" mapping in `registration-workflow.md`. "See Step 5" rows are copied out in full. Local numbers are stored dialable ("(02) 8643-1111 local 1158").
- [ ] `GET /api/roadmap/steps/{number}` returns `offices` per Section 4, in research order.
- [ ] OpenAPI doc and `api-types.ts` regenerated. A test checks Step 5 returns 4 offices and Step 2 is unverified.

### US-014-FE-01: Office card on step detail

| Field | Value |
|---|---|
| AB# | AB#131 |
| Parent | US-014A (AB#40) |
| Type | Frontend |
| Assignee | Seth |
| Priority | Could |
| Estimate | 3 h |
| Due | Nov 10 |
| Depends on | US-013-UI-01, US-014-BE-01 |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] Step detail has a "Where to go" section with one card per office, matching US-013-UI-01.
- [ ] In-person offices show address, hours, a `tel:` link, a `mailto:` link and "Open in Google Maps" (new tab). Online offices show the website link instead of an address.
- [ ] Unverified offices show "Confirm before you go."
- [ ] Missing fields are hidden, not shown as "N/A". Readable at 360 px.

---

## 8. Speed and deployment

### S5-BE-01: Speed up assessment step transitions

| Field | Value |
|---|---|
| AB# | AB#124 |
| Parent | US-012A (AB#37) |
| Type | Backend / Frontend |
| Assignee | Jude |
| Priority | Should |
| Estimate | 3 h |
| Due | Nov 10 |
| Depends on | None |
| Blocks | AB#109 |

**Description.** Moving between assessment steps takes about 2-3 s. The
description screen adds about 2 s for extraction, so the rest of the flow must
be quick. Find the cause before changing anything.

**Acceptance criteria.**

- [ ] The PR names the cause, with before and after timings from the browser's network tab.
- [ ] Moving between steps (excluding the extract call) takes under 500 ms locally.
- [ ] Existing tests pass.

### S5-OPS-01: Turn on AI in the deployed app

| Field | Value |
|---|---|
| AB# | AB#120 |
| Parent | US-013A (AB#38) |
| Type | OPS |
| Assignee | Jude |
| Priority | **Must** |
| Estimate | 1 h |
| Due | Nov 11 |
| Depends on | US-013-BE-03 merged |
| Blocks | Sprint Review |

**Acceptance criteria.**

- [ ] `OpenAI__ApiKey` is set on Render. The key never appears in the repo or chat.
- [ ] The OpenAI project has a $10 / month limit, if the dashboard allows it.
- [ ] On the live URL, as a guest: one description is extracted, and one question streams an answer word by word, not all at once at the end.
- [ ] The result is posted in the group chat.

---

## 9. Sprint 4 leftovers

Acceptance criteria as in Sprint 4 Ticket Breakdown, Sections 6, 7 and 12, with
the changes below.

| Ticket | AB# | Change |
|---|---|---|
| US-009-FE-02 Guest save prompt | AB#100 | Keisuke. Due Nov 6 for step detail, and the All documents screen gets the banner once AB#102 merges |
| US-008-FE-01 All documents screen | AB#102 | **Reassigned to Jude.** Due Nov 10. Criteria unchanged |
| S4-QA-01 End-to-end and user test | AB#109 | Keisuke. Due **Nov 12**. Widened below |

### AB#109 widened: S4-QA-01 covers Sprint 5 too

Same two parts, following `.claude/skills/e2e-testing/SKILL.md`. User tasks, the
4 from Sprint 4 plus:

- "Start over and describe your business in your own words."
- "You're not sure if you're a sole proprietor. Find out in the app."
- "Ask the app which documents you still need."
- "Find out where to go for the business permit, and when it's open."

**Acceptance criteria.**

- [ ] Results in `docs/qa/sprint5-test-results.md` (pass / fail per item, user notes by first name or role).
- [ ] Every failure is a Bug on Azure Boards linked to its story.
- [ ] Test users are removed from `asikago-dev`.
- [ ] The top 3 issues are presented at the Sprint Review.

---

## 10. Sprint 6 pre-checks

The OpenAI design doc (section 5) requires these before US-016 and US-017 get
tickets at Sprint 6 planning.

### US-016-AI-01: GPT-Live Taglish voice check

| Field | Value |
|---|---|
| AB# | AB#132 |
| Parent | US-016 (AB#110) |
| Type | AI |
| Assignee | Michelle |
| Priority | Could |
| Estimate | 1 h |
| Due | Nov 12 |
| Depends on | None |
| Blocks | Sprint 6 planning for US-016 |

**Acceptance criteria.**

- [ ] About 10 minutes of Taglish conversation with GPT-Live in the OpenAI playground, using 5 questions from `docs/qa/ai-qa-cases.md`.
- [ ] `docs/qa/voice-prechecks.md` records: does it understand Taglish, does its Filipino sound natural, does it handle interruptions, and the cost of the session.
- [ ] A clear go / no-go for talk mode. No-go keeps only the mic and read-aloud parts of US-016.

### US-017-AI-01: Transcribe Taglish voice samples

| Field | Value |
|---|---|
| AB# | AB#133 |
| Parent | US-017 (AB#111) |
| Type | AI |
| Assignee | Michelle |
| Priority | Could |
| Estimate | 2 h |
| Due | Nov 12 |
| Depends on | None |
| Blocks | Sprint 6 planning for US-017 |

**Acceptance criteria.**

- [ ] 5-10 recorded business descriptions (2-3 people, Taglish, some with background noise) transcribed with GPT Transcribe in the playground.
- [ ] `docs/qa/voice-prechecks.md` records each transcript next to what was said, and whether US-012 extraction would still get it right.
- [ ] The per-minute price is confirmed from OpenAI's pricing page, with an estimate per description.
- [ ] Audio files are not committed.

---

## 11. Ticket summary

| ID | Title | Parent | Assignee | Priority | Est. | Due | AB# |
|---|---|---|---|---|---|---|---|
| S5-PM-01 | Decisions D22, D23 | US-013A (AB#38) | Jude | Must | 1 h | Nov 4 | AB#112 |
| S5-PM-02 | Azure / Notion sync | US-013A (AB#38) | Jude | Must | 2 h | Nov 4 | AB#113 |
| US-013-BE-01 | Ask API contract | US-013A (AB#38) | Krystelle | Should | 1 h | Nov 4 | AB#115 |
| US-012-AI-01 | "Not sure" helper text | US-012A (AB#37) | Michelle | Should | 1 h | Nov 5 | AB#121 |
| US-012-UI-01 | Description + helper designs | US-012B (AB#55) | Keisuke | Should | 2 h | Nov 5 | AB#125 |
| US-013-UI-01 | Chat + office card designs | US-013B (AB#56) | Keisuke | Should | 3 h | Nov 5 | AB#128 |
| US-012-AI-02 | Extraction prompt fix + rerun | US-012A (AB#37) | Michelle | Should | 2 h | Nov 6 / Nov 10 | AB#122 |
| US-013-AI-01 | Q&A prompt + test set | US-013A (AB#38) | Michelle | Should | 3 h | Nov 6 | AB#114 |
| US-014-BE-01 | Offices table + seed | US-014A (AB#40) | Krystelle | Could | 4 h | Nov 6 | AB#130 |
| US-013-BE-02 | Roadmap context builder | US-013A (AB#38) | Krystelle | Should | 3 h | Nov 6 | AB#116 |
| US-009-FE-02 | Guest save prompt | US-009B (AB#53) | Keisuke | Should | 2 h | Nov 6 | AB#100 |
| US-012-BE-01 | Fake mode + key check + prompt | US-012A (AB#37) | Krystelle | Should | 2 h | Nov 9 | AB#123 |
| US-012-FE-01 | Description screen | US-012B (AB#55) | Seth | Should | 5 h | Nov 9 | AB#126 |
| US-013-BE-03 | Ask endpoint | US-013A (AB#38) | Jude | Should | 6 h | Nov 9 | AB#117 |
| US-012-FE-02 | "Not sure" helper | US-012B (AB#55) | Keisuke | Should | 3 h | Nov 10 | AB#127 |
| US-013-BE-04 | Ask API tests | US-013A (AB#38) | Krystelle | Should | 3 h | Nov 10 | AB#118 |
| US-014-FE-01 | Office card | US-014A (AB#40) | Seth | Could | 3 h | Nov 10 | AB#131 |
| S5-BE-01 | Faster assessment steps | US-012A (AB#37) | Jude | Should | 3 h | Nov 10 | AB#124 |
| US-008-FE-01 | All documents screen | US-008 (AB#34) | Jude | Must | 4 h | Nov 10 | AB#102 |
| US-013-FE-01 | Chat sheet | US-013B (AB#56) | Seth | Should | 6 h | Nov 11 | AB#129 |
| US-013-AI-02 | Run Q&A test set | US-013A (AB#38) | Michelle | Should | 3 h | Nov 11 | AB#119 |
| S5-OPS-01 | AI on the deployed app | US-013A (AB#38) | Jude | Must | 1 h | Nov 11 | AB#120 |
| S4-QA-01 | End-to-end + user test | US-011B (AB#54) | Keisuke | Must | 5 h | Nov 12 | AB#109 |
| US-016-AI-01 | GPT-Live Taglish check | US-016 (AB#110) | Michelle | Could | 1 h | Nov 12 | AB#132 |
| US-017-AI-01 | Transcribe Taglish samples | US-017 (AB#111) | Michelle | Could | 2 h | Nov 12 | AB#133 |

---

## 12. Dependency flow

```
Nov 4  S5-PM-01 ─┬─► US-013-BE-01 (contract) ──────────────┬─► US-013-FE-01 (placeholder first)
                 ├─► US-014-BE-01 (offices) ─┬─► US-013-BE-02 ─► US-013-BE-03 ─┬─► US-013-BE-04
                 │                           └─► US-014-FE-01                  ├─► US-013-AI-02
                 └─► US-013-AI-01 (prompt) ──────────────────► US-013-BE-03    └─► S5-OPS-01

       US-012-AI-02 (prompt) ─► US-012-BE-01 (fake mode) ─┬─► US-012-FE-01
                                                          ├─► US-013-BE-03
                                                          └─► US-012-AI-02 (rerun)
       US-012-AI-01 ─► US-012-FE-02
       US-012-UI-01 / US-013-UI-01 (Nov 5) ─► every FE ticket

Independent:  S5-BE-01, AB#100, AB#102 (Jude), US-016-AI-01, US-017-AI-01 (Michelle)

Nov 12  AB#109 (everything above except the pre-checks) ──► Nov 13 Sprint Review
```

**Critical path:** S5-PM-01 → US-014-BE-01 → US-013-BE-02 → US-013-BE-03 →
US-013-FE-01 → AB#109. Krystelle's Nov 6 tickets and Jude's Nov 9 endpoint gate
the chat. If either slips by half a day, raise it at standup.

**No overlapping files:** Krystelle publishes the contract in
`AssistantEndpoints.cs` first, then Jude owns that file for US-013-BE-03. The
context builder is its own file. US-014-BE-01 touches `RoadmapRecords.cs` and
`RoadmapEndpoints.cs` (step detail), and nobody else changes them. Jude's
S5-BE-01 and AB#102 stay in the assessment and documents screens. Seth owns
`features/assistant/` and the step detail office section. Keisuke owns the type
step for US-012-FE-02, after Seth's `describe` step merges. Michelle works only
in `docs/`.

---

## 13. Workload

| Person | Role this sprint | Tickets | Est. |
|---|---|---|---|
| Jude | Technical PO + Backend + AI | S5-PM-01, S5-PM-02, US-013-BE-03, S5-BE-01, AB#102, S5-OPS-01 | ≈ 17 h ⚠️ |
| Krystelle | Backend | US-013-BE-01, US-014-BE-01, US-013-BE-02, US-012-BE-01, US-013-BE-04 | ≈ 13 h |
| Keisuke | Scrum Master + QA + UI/UX + Frontend | US-012-UI-01, US-013-UI-01, US-012-FE-02, AB#100, AB#109 | ≈ 15 h |
| Seth | Frontend | US-012-FE-01, US-013-FE-01, US-014-FE-01 | ≈ 14 h |
| Michelle | Research + AI | US-012-AI-01, US-012-AI-02, US-013-AI-01, US-013-AI-02, US-016-AI-01, US-017-AI-01 | ≈ 12 h |

⚠️ **Jude is 2 h above the ≈ 15 h line, by his choice.** If he falls behind,
AB#102 (4 h) goes back to Keisuke.

---

## 14. Out of scope for Sprint 5

- Building voice input or talk mode (US-016, US-017). Only the pre-checks are in.
- The embedded map (US-015). Sprint 6.
- Saved chat history, or chat that survives a refresh (D22).
- The assistant on the assessment screens, or the assistant taking actions such as checking documents.
- Document photo upload (US-010). Sprint 6.
- More cities, more categories, a line-of-business field.

---

## 15. Risks

| Risk | Impact | What we do |
|---|---|---|
| The assistant invents a requirement or office | Users go to the wrong place, the one thing the PRD forbids | Answers only from the user's rows (D22), US-013-AI-02's zero-invention bar, and "ask the office" when unsure |
| Render buffers the event stream | Answers appear all at once after a long wait | S5-OPS-01 checks streaming on the live URL. Jude tries it as soon as US-013-BE-03 merges, not on Nov 11 |
| Jude is over capacity | The ask endpoint slips and the chat waits | AB#102 goes back to Keisuke first. Seth builds on the placeholder until then |
| Contract (Nov 4) or designs (Nov 5) are late | Every frontend ticket waits | Seth starts on the placeholder. Keisuke shares rough screens in the group chat by Nov 4 |
| OpenAI spend | Credits run out | $10 / month limit, per-user and per-IP limits, usage log lines. A question costs about $0.003 |
| Render is asleep during the review | The demo hangs | Open the app 2 minutes before the review |

---

## 16. Unverified (checked at the start of the ticket that needs it)

- How the Responses API flags a question for moderation in the same call (the `moderation` object in the US-013 criteria). Checked at the start of US-013-BE-03. If it needs a separate moderation call, that call is made first, and the cost stays negligible.
- `prompt_cache_key` support on `gpt-6.1-terra`. Checked at the start of US-013-BE-03. If unsupported, it is left out. Prefix caching still works by prompt order.
- GPT-Live and GPT Transcribe Taglish quality and price (US-016-AI-01, US-017-AI-01).
