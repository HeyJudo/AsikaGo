# AsikaGo Sprint 6-7 Ticket Breakdown v1.0

## Document Information

**Project:** AsikaGo
**Window:** Sprint 6 (November 16 - 27, 2026) and Sprint 7 (November 30 - December 11, 2026)
**Goal:** Feature-complete MVP. Every story in the backlog is built by **December 4**.
Sprint 7's second week is testing and fixes. Sprint 8 (December 14 - 16) is the
final demo and any extras outside the MVP.
**Prepared:** November 17, 2026
**Owner:** Product Owner
**Status:** Approved by PO on Nov 17, 2026. Tickets created in Azure Boards (AB#134 to AB#149).
**Purpose:** Merge the unfinished Sprint 5 work with the Sprint 6 stories into
one plan, and split the four stories that have no tasks yet (US-010, US-015,
US-016, US-017).

**Related documents:** Sprint 5 Ticket Breakdown v1.0 (acceptance criteria for
every carried-over ticket), `docs/decisions.md`,
`docs/superpowers/specs/2026-10-27-openai-migration-design.md` (US-016, US-017)

---

## 1. Why this plan exists

Sprint 5 planned about 71 h and finished about 15 h. Nothing merged to `main`
after November 10. The cause was deadlines from other subjects, and late
November and December bring more of them. So the plan does not put every story
on November 29. It keeps every story and moves the three riskiest ones to the
first week of Sprint 7.

Ticket IDs, fields, Definition of Ready, Definition of Done, and the writing
rules for user-facing text are the same as Sprint 3 Ticket Breakdown, Section 1.
Work not tied to one story uses `S6` or `S7` as its parent.

### Scope

| Part | Stories | Done by |
|---|---|---|
| A. Sprint 5 carry-over | US-012 AI description, US-013 AI chat, US-014A office cards (17 open tickets) | **Nov 29** |
| A. Added | US-015 map, the two voice pre-checks (AB#132, AB#133) | **Nov 29** |
| B. Sprint 7 week 1 | US-010 photo upload, US-017 voice description, US-016 talk mode | **Dec 4** |
| C. Sprint 7 week 2 | End-to-end pass, user test, bug fixes, docs | Dec 11 |
| D. Sprint 8 | Final demo, extras outside the MVP | Dec 16 |

**Nothing is cut.** Only one rule can shrink a story, and it was agreed before
this plan: if the GPT-Live check (AB#132) is a no-go, US-016 keeps the mic and
read-aloud parts and drops talk mode.

### Checkpoint: Monday, November 23

If `POST /api/assistant/ask` (AB#117) is not merged by the end of Nov 23,
US-016 talk mode (US-016-BE-01, US-016-FE-02) moves to Sprint 7 week 2, and the
user test runs without it. Decided now so nobody argues it on the day.

### Takeover rule

If a ticket's owner has no PR open by its due date, Jude takes it. Jude has no
fixed ticket on the critical path after Nov 23, so he has room for this.

---

## 2. Current state (what already exists on `main`)

| Already exists | Where |
|---|---|
| Everything in Sprint 5 Ticket Breakdown, Section 2 | |
| Ask contract with a placeholder stream (AB#115) | `Features/Assistant/AssistantEndpoints.cs` |
| Describe screen and "Not sure" designs (AB#125) | `docs/design/US-012-UI-01-describe-and-not-sure.html` |
| Chat sheet and office card designs (AB#128) | `docs/design/US-013-UI-01-chat-and-offices.html` |
| All documents screen (AB#102) | `frontend/src/features/progress/` |
| Guest save prompt on step detail and All documents (AB#100) | merged in #67 |

**Not there yet:** `offices` table, `features/assistant/` (empty), fake mode,
any AI on screen, file storage, any voice code.

---

## 3. Sprint 6 board cleanup

### S6-PM-01: Sync Azure Boards and Notion

| Field | Value |
|---|---|
| AB# | AB#134 |
| Parent | US-013A (AB#38) |
| Type | Product |
| Assignee | Jude |
| Priority | **Must. First ticket.** |
| Estimate | 2 h |
| Due | **Nov 18** |

**Acceptance criteria.**

- [ ] Closed, since the work is merged: AB#100 (#67), AB#108 (#60).
- [ ] Closed, since all their tasks are closed: US-008 (AB#34), US-009A (AB#35), US-009B (AB#53), US-011A (AB#36).
- [ ] The 17 open Sprint 5 tasks moved to `AsikaGo\Sprint 6`, with the owners and due dates in Section 8.
- [ ] AB#109 moved to `AsikaGo\Sprint 7`.
- [ ] US-010 (AB#39), US-016 (AB#110), US-017 (AB#111) moved to `AsikaGo\Sprint 7`. US-015 (AB#41) stays in Sprint 6.
- [ ] Every new task in this document created under its parent, with the AB# filled in here.
- [ ] Notion: Sprint 5 closed, Sprint 6 active with Section 1's scope.
- [ ] The team is told in the group chat, with the checkpoint and the takeover rule.

---

## 4. Part A: Sprint 5 carry-over (due by Nov 29)

Acceptance criteria are unchanged from Sprint 5 Ticket Breakdown, Sections 5-8.
Only owners and dates change. Dependencies are the same as its Section 12.

| ID | AB# | Title | Owner | Est. | New due |
|---|---|---|---|---|---|
| US-012-AI-01 | AB#121 | "Not sure" helper text | Michelle | 1 h | Nov 19 |
| US-012-AI-02 | AB#122 | Extraction prompt fix (rerun after AB#123) | Michelle | 2 h | Nov 19 / Nov 24 |
| US-014-BE-01 | AB#130 | Offices table, seed, offices on step detail | Krystelle | 4 h | **Nov 19** |
| US-013-AI-01 | AB#114 | Q&A prompt and test set | Michelle | 3 h | **Nov 20** |
| US-013-BE-02 | AB#116 | Roadmap context builder | Krystelle | 3 h | **Nov 20** |
| US-012-BE-01 | AB#123 | Fake mode, Production key check, new prompt | Krystelle | 2 h | Nov 20 |
| S5-BE-01 | AB#124 | Faster assessment steps | Jude | 3 h | Nov 20 |
| US-013-BE-03 | AB#117 | Ask endpoint | Jude | 6 h | **Nov 23 (checkpoint)** |
| US-012-FE-01 | AB#126 | Description screen | Seth | 5 h | Nov 23 |
| US-012-FE-02 | AB#127 | "Not sure" helper | Keisuke | 3 h | Nov 25 |
| US-014-FE-01 | AB#131 | Office card | **Keisuke** (was Seth) | 3 h | Nov 24 |
| US-013-BE-04 | AB#118 | Ask API integration tests | Krystelle | 3 h | Nov 25 |
| S5-OPS-01 | AB#120 | AI on the deployed app | Jude | 1 h | Nov 24 |
| US-013-FE-01 | AB#129 | Chat sheet | Seth | 6 h | **Nov 26** |
| US-013-AI-02 | AB#119 | Run the Q&A test set | Michelle | 3 h | Nov 27 |
| US-016-AI-01 | AB#132 | GPT-Live Taglish check | Michelle | 1 h | **Nov 24** |
| US-017-AI-01 | AB#133 | Transcribe Taglish samples | Michelle | 2 h | **Nov 24** |

**Changes from Sprint 5.**

- AB#131 moves from Seth to Keisuke, so Seth can focus on the chat sheet. Keisuke also builds the map (US-015-FE-01) in the same component, so one person owns those files.
- S5-OPS-01 runs as soon as AB#117 merges, not at the end. Render buffering the stream is the risk it checks.
- The voice pre-checks are due Nov 24, so Part B tickets can be confirmed or reduced before Sprint 7 starts.
- AB#109 (S4-QA-01) moves to Sprint 7 week 2. See Part C.

**Critical path:** AB#130 (Nov 19) → AB#116 (Nov 20) → AB#117 (Nov 23) →
AB#129 (Nov 26) → AB#119 (Nov 27).

---

## 5. Part A: US-015 View Map Location (5 pts, due Nov 29)

**Story-level acceptance criteria:** Map displays office location. User can tap
to open in an external maps app. Location is linked to the registration step.

The office card (AB#131) already gives the "Open in Google Maps" link. This
story adds the map itself.

### US-015-FE-01: Embedded map in the office card

| Field | Value |
|---|---|
| AB# | AB#135 |
| Parent | US-015 (AB#41) |
| Type | Frontend |
| Assignee | Keisuke |
| Priority | Could |
| Estimate | 3 h |
| Due | Nov 27 |
| Depends on | US-014-FE-01 (AB#131), same component |
| Blocks | AB#109 |

**Acceptance criteria.**

- [ ] Each in-person office with an address shows a small embedded map under its address, built from the address text. Online offices and offices with no real address ("The barangay where the business is located") show no map.
- [ ] The map loads only when the user taps "Show map", so step detail stays fast on mobile data.
- [ ] Tapping the map or "Open in Google Maps" opens the office's `mapsUrl` in a new tab (the phone's maps app on mobile).
- [ ] The map has a text title for screen readers (the office name). Readable at 360 px.
- [ ] No new npm package. No map API key in the frontend unless the check in Section 12 says one is needed.

---

## 6. Part B: Sprint 7 week 1 (due Dec 4)

### S7-PM-01: Record decisions D24-D26

| Field | Value |
|---|---|
| AB# | AB#136 |
| Parent | US-010 (AB#39) |
| Type | Product / Decision |
| Assignee | Jude |
| Priority | **Must. Before any Part B code.** |
| Estimate | 1 h |
| Due | **Nov 25** (so designs and backend can start on time) |

| Ref | Decision | Why |
|---|---|---|
| D24 | D21's "one model for every task" covers text. Transcription uses `OpenAI:TranscribeModel` and talk mode uses `OpenAI:VoiceModel`, both in config next to `OpenAI:Model`. Same key, same guardrails, same `store: false` where the API offers it. | Text models can't transcribe or speak. One key and one place for model names stays true. |
| D25 | Talk mode (US-016) is the first direct browser-to-OpenAI connection. The backend creates a short-lived client secret for each session with the instructions, the US-013-BE-02 context and the session limits already set. The browser connects over WebRTC with that secret only. The real key never reaches the browser. Checking a document from voice goes through the existing US-009 endpoint, never directly. | The design doc requires its own entry. The client secret is the only way to give the browser voice without the key. |
| D26 | Document photos (US-010) are stored in a private Supabase Storage bucket, `document-photos`. Only the backend talks to Storage, using the service role key (Render env var, user-secrets locally). New table `document_photos (id, roadmap_id, requirement_id, storage_path, content_type, size_bytes, created_at)`. The browser gets short-lived signed URLs to show photos. JPEG, PNG or WebP, 5 MB at most per photo, up to 5 photos per document. Google users only: guests see "Sign in with Google to save photos." | Keeps "all data goes through the ASP.NET API" (decisions, Data access). Supabase Storage is already in the stack, with no new service or bill. Some documents have several pages (a lease contract), so one photo isn't enough. A guest's photos would be lost if they never link Google, and their files would take up storage. |

**Acceptance criteria.**

- [ ] D24, D25 and D26 are in `docs/decisions.md`.
- [ ] The service role key is set on Render and shared privately. It never appears in the repo or the chat.

### US-010 Upload Document Evidence (5 pts)

**Story-level acceptance criteria:** The user can take or choose a photo of a
document they have prepared, see it next to that document, and delete it. Photos
are private to the user.

#### US-010-UI-01: Design the photo on a document row

| Field | Value |
|---|---|
| AB# | AB#137 |
| Parent | US-010 (AB#39) |
| Type | UI/UX |
| Assignee | Keisuke |
| Estimate | 2 h |
| Due | **Nov 26** |
| Blocks | US-010-FE-01 |

- [ ] `docs/design/US-010-UI-01-document-photos.html` covers: "Add photo" on a document row (step detail and All documents), uploading, the thumbnail, full view, delete with confirm, too-large, wrong-type and fifth-photo-reached messages, and the guest message ("Sign in with Google to save photos").
- [ ] 360 px and desktop. Touch targets at least 44 px. Jude approves it in the PR.

#### US-010-BE-01: Photo storage and endpoints

| Field | Value |
|---|---|
| AB# | AB#139 |
| Parent | US-010 (AB#39) |
| Type | Backend |
| Assignee | Jude |
| Estimate | 5 h |
| Due | Dec 1 |
| Depends on | S7-PM-01 |
| Blocks | US-010-BE-02, US-010-FE-01 |

- [ ] `DocumentPhoto` entity and migration per D26.
- [ ] `POST /api/roadmap/documents/{requirementId}/photos` (multipart) checks type by content, not file name, and size, then uploads to the bucket under the user's id. 400 for wrong type, too large, or a sixth photo on one document. 403 for guests. 404 for a requirement not in the user's roadmap (D19).
- [ ] `GET /api/roadmap/documents` and step detail include each document's photos with a signed URL that expires in 10 minutes.
- [ ] `DELETE /api/roadmap/documents/photos/{id}` removes the row and the file.
- [ ] OpenAPI doc and `api-types.ts` regenerated. Unit tests use a fake storage client.

#### US-010-BE-02: Photo integration tests

| Field | Value |
|---|---|
| AB# | AB#140 |
| Parent | US-010 (AB#39) |
| Type | Backend / QA |
| Assignee | Krystelle |
| Estimate | 2 h |
| Due | Dec 2 |
| Depends on | US-010-BE-01 |

- [ ] Another user can't list, view or delete someone's photo (404, not 403).
- [ ] Wrong type, too large, and a sixth photo on one document return 400. A guest gets 403.
- [ ] Deleting removes the storage file, checked against the fake storage client.

#### US-010-FE-01: Photos on document rows

| Field | Value |
|---|---|
| AB# | AB#141 |
| Parent | US-010 (AB#39) |
| Type | Frontend |
| Assignee | Keisuke |
| Estimate | 4 h |
| Due | Dec 3 |
| Depends on | US-010-UI-01, US-010-BE-01 |
| Blocks | AB#109 |

- [ ] Matches US-010-UI-01 on step detail and All documents.
- [ ] "Add photo" opens the phone's picker so the user can take or choose a photo: `<input type="file" accept="image/jpeg,image/png,image/webp">`, no `capture` (it hides the gallery). Before upload, the browser shrinks the photo to at most 2000 px on the long side, JPEG 0.85 (`canvas.toBlob`). No new npm package.
- [ ] Shows upload progress, and refreshes the list without a full reload.
- [ ] A photo does not check the document. Checking stays the user's choice (D17).

### US-017 Speak My Business Description (3 pts)

Acceptance criteria from the OpenAI design doc, Section 5. Tickets are confirmed
by US-017-AI-01's result on Nov 24.

#### US-017-BE-01: `POST /api/assistant/transcribe`

| Field | Value |
|---|---|
| AB# | AB#142 |
| Parent | US-017 (AB#111) |
| Type | Backend / AI |
| Assignee | Krystelle |
| Estimate | 3 h |
| Due | Dec 1 |
| Depends on | S7-PM-01, US-012-BE-01 (fake mode) |
| Blocks | US-017-FE-01, US-016-FE-01 |

- [ ] Takes one audio file (multipart, 60 seconds at most, 2 MB at most) as `audio/webm` (Chrome, Android) or `audio/mp4` (Safari, iOS), what `MediaRecorder` produces, and returns `{ "text": "..." }` from `OpenAI:TranscribeModel` (D24). The key stays on the server.
- [ ] Per-user cap of 10 audio minutes per day, on top of the existing `/api/assistant` rate limits. 429 over the cap.
- [ ] A transcript over 1000 characters is cut at 1000.
- [ ] Fake mode returns a fixed Taglish transcript when no key is set in Development.
- [ ] 503 on OpenAI error or 15 s timeout, never a 500. The audio is not stored or logged.
- [ ] Tests use the fake HTTP handler.

#### US-017-FE-01: Mic on the description step

| Field | Value |
|---|---|
| AB# | AB#143 |
| Parent | US-017 (AB#111) |
| Type | Frontend |
| Assignee | Seth |
| Estimate | 3 h |
| Due | Dec 2 |
| Depends on | US-017-BE-01, US-016-UI-01 (mic states) |

- [ ] A mic button on the `describe` step records with `MediaRecorder` and stops itself at 60 seconds.
- [ ] The transcript fills the text box. The user can edit it, then continues through US-012 unchanged.
- [ ] Mic permission denied, no mic, 429 or 503: one quiet line, and typing still works.
- [ ] The button has a text label and shows "Recording..." while it records.

### US-016 Talk Mode in the Assistant (5 pts)

Acceptance criteria from the OpenAI design doc, Section 5. If AB#132 is a no-go,
US-016-BE-01 and US-016-FE-02 are removed, and the story is done with
US-016-FE-01 alone.

#### US-016-UI-01: Design mic, read aloud and talk mode

| Field | Value |
|---|---|
| AB# | AB#138 |
| Parent | US-016 (AB#110) |
| Type | UI/UX |
| Assignee | Keisuke |
| Estimate | 2 h |
| Due | **Nov 26** |
| Blocks | US-016-FE-01, US-016-FE-02, US-017-FE-01 |

- [ ] `docs/design/US-016-UI-01-voice.html` covers: the mic button and its states (in the chat and on the describe step), the editable transcript, read aloud on an answer, the talk mode toggle, connecting, talking, the session timer, and auto-close. Guests don't see the Talk switch.
- [ ] 360 px and desktop. Jude and Seth approve it in the PR.

#### US-016-FE-01: Mic and read aloud in the chat

| Field | Value |
|---|---|
| AB# | AB#144 |
| Parent | US-016 (AB#110) |
| Type | Frontend |
| Assignee | Seth |
| Estimate | 3 h |
| Due | Dec 3 |
| Depends on | US-013-FE-01, US-017-BE-01, US-016-UI-01 |

- [ ] The chat sheet's mic button records a question through US-017-BE-01. The transcript goes into the input to edit before sending.
- [ ] Each answer has "Read aloud" using `speechSynthesis`, with a Filipino voice when the browser has one. No OpenAI call.
- [ ] Both work for guests and Google users.

#### US-016-BE-01: Voice session endpoint

| Field | Value |
|---|---|
| AB# | AB#145 |
| Parent | US-016 (AB#110) |
| Type | Backend / AI |
| Assignee | Krystelle |
| Estimate | 5 h |
| Due | Dec 2 |
| Depends on | S7-PM-01, US-013-BE-02, AB#132 go |
| Blocks | US-016-FE-02 |

- [ ] `POST /api/assistant/voice-session` returns a short-lived client secret for `OpenAI:VoiceModel` (D25), with the instructions and the US-013-BE-02 context set on the session. Same grounding as the text chat.
- [ ] The session has one tool, `check_document(requirementId)`. The backend lists only the user's own requirements in the tool description.
- [ ] Google users only: guests get 403. 3 sessions per user per day: 429 over it. Config flag `OpenAI:VoiceEnabled`, off by default: 404 when off.
- [ ] 3-minute session cap set on the session, if the API allows it. Otherwise the frontend enforces it.
- [ ] `GET /api/me` returns `voiceEnabled` (the `OpenAI:VoiceEnabled` flag) so the frontend knows whether to show the Talk switch.
- [ ] Tests use the fake HTTP handler, and check that the context matches the text chat for the same user.

#### US-016-FE-02: Talk mode

| Field | Value |
|---|---|
| AB# | AB#146 |
| Parent | US-016 (AB#110) |
| Type | Frontend |
| Assignee | Seth (Jude pairs) |
| Estimate | 5 h |
| Due | Dec 4 |
| Depends on | US-016-BE-01, US-016-UI-01 |
| Blocks | AB#109 |

- [ ] A talk mode toggle in the chat sheet, shown only to Google users when the flag is on. The flag comes from `GET /api/me`.
- [ ] Connects over WebRTC with the client secret. The user can interrupt. A timer shows the 3 minutes. A "Still there?" warning shows after 10 s of silence, before the session closes at 15 s.
- [ ] When the model calls `check_document`, the frontend calls the existing US-009 endpoint, and the checklist updates.
- [ ] Mic denied, connection failed, or 429: one friendly line, and the text chat still works.

#### US-016-AI-02: Voice test run

| Field | Value |
|---|---|
| AB# | AB#147 |
| Parent | US-016 (AB#110) |
| Type | AI / QA |
| Assignee | Michelle |
| Estimate | 2 h |
| Due | Dec 4 |
| Depends on | US-016-FE-02 (or US-016-FE-01 on a no-go) |

- [ ] 5 questions from `docs/qa/ai-qa-cases.md` asked by voice, results in `docs/qa/voice-prechecks.md`: pass or fail, invented requirements, cost.
- [ ] 3 descriptions spoken through US-017, checked against US-012 extraction.
- [ ] Bar: zero invented requirements.

---

## 7. Part C: Sprint 7 week 2 (Dec 7-11)

### S4-QA-01 (AB#109): End-to-end pass and user test, widened again

| Field | Value |
|---|---|
| Assignee | Keisuke (Michelle runs the user sessions with him) |
| Estimate | 6 h |
| Due | **Dec 9** |

Same two parts as Sprint 5 Ticket Breakdown, Section 9, with these user tasks
added:

- "Find the business permit office on a map."
- "Take a photo of your barangay clearance and save it."
- "Describe your business by speaking."
- "Ask the app what you still need, by voice." (if talk mode shipped)

Acceptance criteria as Sprint 5, with results in `docs/qa/final-test-results.md`.

### S7-FIX: Bug fixes

Every Bug from AB#109 gets an owner at the Dec 9 standup and a due date of
Dec 11. About 3 h per person is held free for this.

### S7-PM-02: Final docs and board sync

| Field | Value |
|---|---|
| AB# | AB#149 |
| Assignee | Jude |
| Estimate | 2 h |
| Due | Dec 11 |

- [ ] Backlog v1.1 stories marked done. The PRD drift in `decisions.md` ("Doc drift to fix") fixed.
- [ ] README covers the new secrets (service role key, voice flag) and the voice config.
- [ ] Every story and task closed on Azure Boards, Sprint 7 closed in Notion.

### S7-OPS-01: Production config for Part B

| Field | Value |
|---|---|
| AB# | AB#148 |
| Assignee | Jude |
| Estimate | 1 h |
| Due | Dec 7 |

- [ ] Render has the service role key and `OpenAI:VoiceEnabled` = true for the demo.
- [ ] On the live URL: one photo uploaded and deleted, one spoken description, one talk mode session.

---

## 8. Ticket summary

| ID | Title | Owner | Est. | Due | Part |
|---|---|---|---|---|---|
| S6-PM-01 (AB#134) | Azure / Notion sync | Jude | 2 h | Nov 18 | A |
| AB#121 | "Not sure" helper text | Michelle | 1 h | Nov 19 | A |
| AB#122 | Extraction prompt + rerun | Michelle | 2 h | Nov 19 / 24 | A |
| AB#130 | Offices table + seed | Krystelle | 4 h | Nov 19 | A |
| AB#114 | Q&A prompt + test set | Michelle | 3 h | Nov 20 | A |
| AB#116 | Roadmap context builder | Krystelle | 3 h | Nov 20 | A |
| AB#123 | Fake mode + key check | Krystelle | 2 h | Nov 20 | A |
| AB#124 | Faster assessment steps | Jude | 3 h | Nov 20 | A |
| AB#117 | Ask endpoint | Jude | 6 h | Nov 23 | A |
| AB#126 | Description screen | Seth | 5 h | Nov 23 | A |
| AB#131 | Office card | Keisuke | 3 h | Nov 24 | A |
| AB#120 | AI on the deployed app | Jude | 1 h | Nov 24 | A |
| AB#132 | GPT-Live check | Michelle | 1 h | Nov 24 | A |
| AB#133 | Transcribe check | Michelle | 2 h | Nov 24 | A |
| AB#127 | "Not sure" helper | Keisuke | 3 h | Nov 25 | A |
| AB#118 | Ask API tests | Krystelle | 3 h | Nov 25 | A |
| S7-PM-01 (AB#136) | Decisions D24-D26 | Jude | 1 h | Nov 25 | B |
| AB#129 | Chat sheet | Seth | 6 h | Nov 26 | A |
| US-010-UI-01 (AB#137) | Photo design | Keisuke | 2 h | Nov 26 | B |
| US-016-UI-01 (AB#138) | Voice design | Keisuke | 2 h | Nov 26 | B |
| AB#119 | Run Q&A test set | Michelle | 3 h | Nov 27 | A |
| US-015-FE-01 (AB#135) | Embedded map | Keisuke | 3 h | Nov 27 | A |
| US-010-BE-01 (AB#139) | Photo storage + endpoints | Jude | 5 h | Dec 1 | B |
| US-017-BE-01 (AB#142) | Transcribe endpoint | Krystelle | 3 h | Dec 1 | B |
| US-010-BE-02 (AB#140) | Photo tests | Krystelle | 2 h | Dec 2 | B |
| US-016-BE-01 (AB#145) | Voice session endpoint | Krystelle | 5 h | Dec 2 | B |
| US-017-FE-01 (AB#143) | Mic on describe step | Seth | 3 h | Dec 2 | B |
| US-010-FE-01 (AB#141) | Photos on document rows | Keisuke | 4 h | Dec 3 | B |
| US-016-FE-01 (AB#144) | Mic + read aloud in chat | Seth | 3 h | Dec 3 | B |
| US-016-FE-02 (AB#146) | Talk mode | Seth (Jude pairs) | 5 h | Dec 4 | B |
| US-016-AI-02 (AB#147) | Voice test run | Michelle | 2 h | Dec 4 | B |
| S7-OPS-01 (AB#148) | Production config | Jude | 1 h | Dec 7 | C |
| AB#109 | End-to-end + user test | Keisuke | 6 h | Dec 9 | C |
| S7-PM-02 (AB#149) | Final docs + board | Jude | 2 h | Dec 11 | C |

---

## 9. Dependency flow

```
Nov 18  S6-PM-01
Nov 19  AB#130 offices ─┬─► AB#116 context (Nov 20) ─► AB#117 ask (Nov 23) ─┬─► AB#129 chat (Nov 26) ─► AB#119 (Nov 27)
                        │                         ▲                         ├─► AB#118 tests (Nov 25)
                        │   AB#114 prompt (Nov 20)┘                         └─► AB#120 live (Nov 24)
                        └─► AB#131 office card (Nov 24) ─► US-015-FE-01 map (Nov 27)
        AB#122 prompt ─► AB#123 fake mode (Nov 20) ─┬─► AB#126 describe (Nov 23) ─► AB#127 not sure (Nov 25)
                                                    └─► AB#117
Nov 24  AB#132, AB#133 voice checks ─► go / no-go for Part B
Nov 25  S7-PM-01 decisions ─► Part B backend
Nov 26  US-010-UI-01, US-016-UI-01 ─► Part B frontend

Dec 1   US-010-BE-01 ─► US-010-BE-02, US-010-FE-01 (Dec 3)
        US-017-BE-01 ─► US-017-FE-01 (Dec 2), US-016-FE-01 (Dec 3)
Dec 2   US-016-BE-01 ─► US-016-FE-02 (Dec 4) ─► US-016-AI-02 (Dec 4)
Dec 7-11  S7-OPS-01 ─► AB#109 ─► bug fixes ─► S7-PM-02
```

**No overlapping files:** Krystelle owns `Features/Assistant/` except
`AssistantEndpoints.cs`'s ask handler, which is Jude's for AB#117. Her fake
mode (AB#123) touches the same file, so it merges first (Nov 20) and Jude
rebases on it. In Part B
she adds the transcribe and voice-session handlers after AB#117 merges. Jude
owns `Features/Progress/` photo code. Seth owns `features/assistant/` and the
describe step. Keisuke owns the type step, the office card component (map
included), and the document rows for photos. Keisuke's document-row work starts
after Jude's photo endpoints merge. Michelle works only in `docs/`.

---

## 10. Workload

| Person | Part A (by Nov 29) | Part B (by Dec 4) | Part C | Total |
|---|---|---|---|---|
| Jude | S6-PM-01, AB#124, AB#117, AB#120, S7-PM-01 ≈ 13 h | US-010-BE-01, pairs on US-016-FE-02 ≈ 7 h | S7-OPS-01, S7-PM-02, fixes ≈ 6 h | ≈ 26 h + takeovers |
| Krystelle | AB#130, AB#116, AB#123, AB#118 ≈ 12 h | US-017-BE-01, US-010-BE-02, US-016-BE-01 ≈ 10 h | fixes ≈ 3 h | ≈ 25 h |
| Seth | AB#126, AB#129 ≈ 11 h | US-017-FE-01, US-016-FE-01, US-016-FE-02 ≈ 11 h | fixes ≈ 3 h | ≈ 25 h |
| Keisuke | AB#127, AB#131, US-015-FE-01, US-010-UI-01, US-016-UI-01 ≈ 13 h | US-010-FE-01 ≈ 4 h | AB#109, fixes ≈ 9 h | ≈ 26 h |
| Michelle | AB#121, AB#122, AB#114, AB#119, AB#132, AB#133 ≈ 12 h | US-016-AI-02 ≈ 2 h | AB#109 sessions, fixes ≈ 5 h | ≈ 19 h |

About 120 h over four weeks, about 6 h per person per week. Jude's fixed load is
kept close to everyone else's on purpose: his heavier share is the takeover rule
and reviews, so the critical path doesn't wait on one person.

---

## 11. Out of scope

- Saved chat history, or chat that survives a refresh (D22).
- The assistant taking actions other than checking a document (US-016's tool).
- Text recognition (OCR) on document photos. The photo is a record only.
- More cities, more categories, a line-of-business field.
- PDF generation and renewal reminders (PRD "Won't Have" list). Sprint 8 extras if there's time.

---

## 12. Risks and unverified items

| Risk | Impact | What we do |
|---|---|---|
| Other subjects' deadlines again | Part A slips past Nov 29 | Nov 23 checkpoint, takeover rule, Part B already holds the risky stories |
| AB#117 late | Chat, tests and live check all wait | Seth builds on the placeholder stream until it merges. Checkpoint moves talk mode out |
| The assistant invents a requirement | Users go to the wrong office | AB#119 and US-016-AI-02 bar: zero invented requirements |
| GPT-Live no-go on Nov 24 | Talk mode dropped | Agreed rule: mic and read aloud stay, story is still done |
| Voice spend | Credits run out | Google users only, 3 sessions a day, 3-minute cap, flag off by default |
| Render asleep at the demo | Demo hangs | Open the app 2 minutes before |

**Checked at the start of the ticket that needs it:**

- US-015-FE-01: whether a Google Maps embed works from the address text without an API key. If a key is needed, use the free Maps Embed API key, restricted to the Vercel domain, and add it to `.env.example`.
- US-016-BE-01: the exact client-secret endpoint and session options (tools, session cap) for `OpenAI:VoiceModel`.
- US-017-BE-01: the transcription model name and per-minute price (from AB#133).
- US-010-BE-01: Supabase Storage .NET client or plain HTTP calls. Plain HTTP if the client adds a large dependency.

