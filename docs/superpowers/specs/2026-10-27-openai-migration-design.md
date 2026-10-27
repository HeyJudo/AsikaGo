# Switch AsikaGo's AI from Gemini to OpenAI (suggested changes)

Status: **approved Oct 27, 2026 and applied.** Section 6 is in the docs. Section 7
is in Azure Boards (US-016 is AB#110, US-017 is AB#111, both under AB#42).

## 1. Intent

Jude has $50 of OpenAI API credits. The specs name Gemini Flash, but the PRD
says "subject to technical validation", so the provider is still open. OpenAI
gives AsikaGo:

- `gpt-6.1-terra` (released Oct 26, 2026): $1 / M input, $0.05 / M cached input, $5 / M output.
- No training on API data by default. Gemini's free tier uses prompts to train Google's models.
- Structured outputs, moderation, transcription (GPT Transcribe) and live voice (GPT-Live) under one key.
- Per-project hard spend limits, per-key usage, and key expiry, which make sharing a key with the team safe.

The AI must make the user experience better, never worse. Every guardrail
below is set so a normal user never notices it.

## 2. Goals, non-goals, anti-goals

**Goals**

- TE-003-BE-01 ships on OpenAI instead of Gemini, with the guardrails in section 4.
- US-012 and US-013 acceptance criteria name OpenAI and the user-experience rules in section 5.
- Two new Could Have stories: US-016 (live voice step companion) and US-017 (voice input for the business description).
- Total spend for the whole project stays well under $50 (budget in section 4.5).

**Non-goals**

- Model routing. One model (`gpt-6.1-terra`) for every task. It is cheap enough.
- The 12-hour prompt cache. Its writes cost 2.5x input, which only pays off at high traffic.
- Vector stores, file search, embeddings. The Pasig knowledge base is a few tables; the backend passes the user's rows in the prompt.
- The OpenAI web search tool. PRD §11: the AI does not determine requirements on its own.
- The Decisions API. Structured outputs on the Responses API cover extraction, and US-013 needs free text anyway. One API, one pattern.
- Agents API, Batch, image generation.

**Anti-goals (a failure even if it works)**

- The AI picks a business type or requirement the user can't see and confirm.
- An AI error blocks onboarding or the roadmap.
- A real API call from a test or CI.
- The API key in the browser, the repo, or a log line.

## 3. Decision D21 (to add to `docs/decisions.md`)

| Ref | Change | Reason |
|---|---|---|
| D21 | AI provider is OpenAI, not Gemini. One model for every task, set in config as `OpenAI:Model` (`gpt-6.1-terra`). Calls use the Responses API with `store: false`. Key in `OpenAI:ApiKey` (user-secrets locally, Render env var deployed). Guardrails: per-user and per-IP rate limits, 1000-character input cap, `max_output_tokens` on every call, 15 s timeout, one retry only on OpenAI's 503 overload, strict JSON schema for extraction, model output re-checked against the database. Tests use a fake HTTP handler. | $50 of OpenAI credits on hand. No training on API data. Structured outputs, transcription and live voice under one key. Spend limits per project and key. |

## 4. AI design

### 4.1 Request pipeline (every AI endpoint)

1. **Input guardrails:** signed-in user (Google or anonymous guest), rate limit, 1000-character cap (400 if over).
2. **Prompt builder:** fixed text first, user text last (4.3).
3. **OpenAI call:** Responses API, `store: false`, `max_output_tokens`, 15 s timeout.
4. **Output guardrails:** schema, then a database check.
5. **Errors:** OpenAI error or timeout → 503 ProblemDetails. Never a 500.

### 4.2 Guardrails

| Guardrail | Value | Notes |
|---|---|---|
| Rate limit, per user | 20 / minute, 200 / day | ASP.NET Core built-in rate limiter. No new package. 429 with a friendly message. Anonymous guests count as users, so this is needed. Counts live in memory and reset when Render restarts. That is accepted, because the $10 project spend limit is the real backstop. A database counter would only be worth adding if real traffic arrives. |
| Rate limit, per IP | 60 / minute | Stops one script creating many guest accounts |
| Input cap | 1000 characters | Room for a long Taglish description. 400 if over. |
| `max_output_tokens`, extraction | 200 | The real answer is about 30 tokens |
| Reasoning effort, extraction | Lowest the model supports | Faster replies. The exact value is the builder's call from the OpenAI docs. |
| Timeout | 15 s | Then 503 |
| Retry | One retry, only on 503 `server_is_overloaded`, only if `Retry-After` is 3 s or less | Rides out short outages without a retry loop. 429 is never retried. |
| `store: false` | Every call | OpenAI keeps nothing |
| Structured output | Strict JSON schema. `businessType` enum of the 4 types, `category` enum of the 3 category names, both nullable | The model cannot return an invalid value |
| Database check | Category name → seeded `categoryId`. No match → null. | Model output is untrusted input |
| Prompt injection | User text goes in its own user message, never pasted into the instructions. The model has no tools. | Worst case is wrong text, which the user reviews |
| Usage logging | One log line per call with `usage.input_tokens`, `usage.output_tokens`, `cached_tokens` and elapsed ms. Never log the description or the key. | Shows spending. Mich reads these lines from her local API console for TE-003-AI-02, so the response contract stays `{ businessType, categoryId }`. |

### 4.3 Prompt order (prefix caching)

OpenAI caches a prompt's opening automatically once it reaches 1024 tokens,
at no extra cost. Order every prompt from most fixed to least fixed:

1. Instructions (Mich's draft in `docs/qa/ai-extraction-cases.md`).
2. The allowed values.
3. Examples.
4. The user's text, last, in its own message.

The extraction prompt may stay under 1024 tokens and never cache. That's
fine, since it costs under $0.001. Q&A prompts (US-013) carry roadmap rows,
are longer, and benefit.

### 4.4 Configuration

| Key | Value | Where |
|---|---|---|
| `OpenAI:ApiKey` | secret | user-secrets locally, Render env var. Never committed. |
| `OpenAI:Model` | `gpt-6.1-terra` | `appsettings.json` |

### 4.5 Budget for the $50

| Use | Estimate |
|---|---|
| TE-003 development and the TE-003-AI-02 eval runs | under $1 |
| US-012 / US-013 development and testing | $2–5 |
| US-016 / US-017 development and demos (about $0.03 per GPT-Live question) | $2–5 |
| Panel demos | $1–2 |
| Untouched buffer | $35+ |

**Jude, in the OpenAI dashboard (not code):**

- One shared key for the team and Render (Jude's call). It is shared privately, never in the repo or the group chat history.
- If the dashboard allows it, a **$10 / month hard limit** on the project.
- Check usage weekly. If it burns fast, revoke the key and issue a new one. Note that revoking it also stops the deployed app until Render gets the new key.

## 5. Story changes

### TE-003-BE-01 (AB#105): OpenAI client and `POST /api/assistant/extract`

**Description.** Code in `Features/Assistant/`. Key in `OpenAI:ApiKey`, model
in `OpenAI:Model` (D21). Prompt from `docs/qa/ai-extraction-cases.md`. The
README setup section gets the `dotnet user-secrets set "OpenAI:ApiKey" ...` line.
Fake mode and the Production missing-key check are **not** in this ticket (they
are US-012). Tests swap in the fake HTTP handler, so CI needs no key.

**Acceptance criteria.**

- [ ] `POST /api/assistant/extract` (signed-in users, guests included) takes `{ "description": "..." }` and returns `{ "businessType": string | null, "categoryId": uuid | null }`.
- [ ] The Responses API is called with a strict JSON schema: `businessType` limited to the 4 types, `category` limited to the 3 seeded category names, both nullable. The backend maps the name to `categoryId`. No match → null.
- [ ] Descriptions over 1000 characters, or empty, return 400.
- [ ] Per-user (20/min, 200/day) and per-IP (60/min) rate limits return 429 with a ProblemDetails message.
- [ ] Every call sets `store: false`, `max_output_tokens: 200`, and a 15 s timeout.
- [ ] An OpenAI error or timeout returns 503 with a ProblemDetails message, never a 500. Only `server_is_overloaded` with `Retry-After` of 3 s or less is retried, once.
- [ ] Token usage is logged per call. The description and the key are never logged.
- [ ] Unit tests use a fake HTTP handler. No test calls the real API.
- [ ] The endpoint shows in the OpenAPI doc so Mich can call it from Swagger for TE-003-AI-02.

### TE-003-AI-02 (AB#106): run the test set

Add to the existing acceptance criteria:

- [ ] Each result row also records response time (ms) and tokens used.
- [ ] The summary at the top adds the average response time and the total cost of the run.

### TE-003 (AB#63): AI Integration Setup

- Description: "Integrate the OpenAI API (`gpt-6.1-terra`) into the ASP.NET Core backend for business information extraction and registration step explanation."
- Acceptance criteria: "OpenAI API is connected. Business description input returns structured extraction output. AI responses are constrained to knowledge base content. Guardrails per D21 are in place."

### US-012 (AB#37 backend, AB#55 frontend): Extract Business Information Using AI

Replace the acceptance criteria with:

- AI extracts business type and category from the user's text. (No location: D8 makes the MVP Pasig only.)
- The AI **suggests** and the user confirms. The assessment form opens pre-filled, and the user reviews and edits before saving. Nothing is saved without confirmation.
- If the AI returns null for a field, or the call fails (429 / 503), the field is left empty and the user picks from the normal choices. AI failure never blocks onboarding.
- **Business-type helper:** the type step gets a "Not sure" choice. Picking it, or a null type from the AI, asks one plain question, "Ikaw lang ba ang may-ari?" ("Are you the only owner?"). Yes suggests Sole Proprietorship (the usual choice, registered with DTI), with one line noting that a One Person Corporation also has one owner and is registered with SEC for limited liability. No shows short plain-language descriptions of Partnership and Corporation. It is always a suggestion with a reason, never decided for the user.
- **Fake mode:** locally, with no `OpenAI:ApiKey` set, the extract endpoint returns a fixed answer so frontend work spends nothing. In Production, a missing key stops the app at startup.

### US-013 (AB#38 backend, AB#56 frontend): Ask Registration Questions

Replace the acceptance criteria with:

- User can type questions about registration steps.
- The backend loads the user's step and requirements from the database and passes only those rows to the model. Answers come from those rows.
- When the rows don't answer the question, the AI says so and points the user to the office. It does not guess.
- Responses are in accessible Taglish-friendly language.
- The answer streams, so text appears as it is written.
- The request carries the `moderation` object, and flagged questions get a polite refusal.
- `max_output_tokens` is generous enough that normal answers are never cut off. An incomplete response is detected and shown with a "Try asking a shorter question" note, never silently cut.
- Same rate limits, input cap, `store: false` and 503 handling as D21.

### US-016 (new): Talk to the step companion (GPT-Live)

| Field | Value |
|---|---|
| Priority | Could Have |
| Sprint | 6 |
| Depends on | US-013 (reuses its grounding) |

**Story.** As an aspiring micro-entrepreneur at a government office, I want
to ask about my current step out loud and hear the answer, so that I can get
help with my hands full of documents.

**Acceptance criteria.**

- A "Talk to AsikaGo" button on the step screen starts a GPT-Live voice session.
- The session gets instructions plus the user's step and requirements from the database. Answers come from those rows.
- The user can say which documents they already have ("Dala ko na yung barangay clearance"). The AI calls a tool, and the frontend checks them off through the existing US-009 endpoint. Rules and auth stay in the backend.
- The browser connects to OpenAI over WebRTC with a short-lived token from the backend. The real key never reaches the browser. This is the first direct browser-to-OpenAI connection and gets its own decisions entry when built.
- Guardrails:
  - Signed-in Google users only, no anonymous guests.
  - 3 sessions per user per day.
  - Hard 3-minute session cap.
  - Auto-close after 15 s of silence.
  - Config flag, off by default.
- **Before writing tickets:** a Taglish voice test (about 10 minutes, a few cents) confirms GPT-Live understands and speaks Filipino well. If it doesn't, the story is dropped.

### US-017 (new): Speak my business description (GPT Transcribe)

| Field | Value |
|---|---|
| Priority | Could Have |
| Sprint | 6 |
| Depends on | US-012 |

**Story.** As an aspiring micro-entrepreneur who finds typing hard, I want to
describe my business by speaking, so that onboarding is easier.

**Acceptance criteria.**

- A mic button on the description step records audio with the browser's built-in `MediaRecorder`.
- `POST /api/assistant/transcribe` sends the audio to GPT Transcribe. The key stays on the server.
- The transcript fills the description box. The user can edit it before submitting, which then goes through US-012 unchanged.
- Guardrails:
  - 60-second audio cap.
  - Per-user limit on audio minutes per day.
  - The 1000-character cap applies to the transcript.
- **Before writing tickets:** transcribe 5–10 recorded Taglish samples to check quality and confirm the per-minute price.

## 6. Doc edits (applied after approval, edited in place like D8)

| File | Where | Change |
|---|---|---|
| `docs/decisions.md` | Database changes table | Add the D21 row (section 3) |
| `docs/AsikaGo_PRD_v1.0.md` | §11 "Proposed Technology" | "Gemini Flash (subject to technical validation)" → "OpenAI API, `gpt-6.1-terra` (D21)" |
| `docs/AsikaGo_PRD_v1.0.md` | FR-008 | Add: "Answers are built only from the user's roadmap data. Voice input (US-017) and a live voice companion (US-016) are Could Have." |
| `docs/AsikaGo_PRD_v1.0.md` | MoSCoW "Could Have" | Add "Voice input for the business description" and "Live voice step companion" |
| `docs/AsikaGo_PRD_v1.0.md` | §16 "AI Reliability" | Mitigation adds: "Strict output schema, database check of every AI answer, user confirms every suggestion." |
| `docs/AsikaGo_Technical_Architecture_v1.0.md` | Header "Technology Direction", §1 list, §2 diagram, §3 "Artificial Intelligence", §5 AI flow ("Step 2: Gemini Extraction", "Gemini explains"), deployment diagram ("Gemini API") | Gemini Flash / Gemini API → OpenAI API (`gpt-6.1-terra`). §3 adds a "Guardrails" line pointing to D21. |
| `docs/AsikaGo_Database_Design_Specification_v1.0.md` | §6 AI Data Flow | "Gemini Flash" → "OpenAI API" |
| `docs/AsikaGo_Product_Backlog_v1.1.md` | Product Stories Summary | Add rows: US-016 Talk to the Step Companion, 5 pts, Sprint 6, Could Have. US-017 Speak My Business Description, 3 pts, Sprint 6, Could Have. |
| `docs/AsikaGo_Sprint4_Ticket_Breakdown_v1.0.md` | Sprint scope row TE-003 | "Proves Gemini works" → "Proves the OpenAI integration works" |
| `docs/AsikaGo_Sprint4_Ticket_Breakdown_v1.0.md` | "Not there yet" list | "any Gemini code" → "any OpenAI code" |
| `docs/AsikaGo_Sprint4_Ticket_Breakdown_v1.0.md` | §9 TE-003 | Story criteria, TE-003-AI-01 third bullet, TE-003-BE-01 title, description and criteria, TE-003-AI-02 criteria, all per section 5 |
| `docs/AsikaGo_Sprint4_Ticket_Breakdown_v1.0.md` | Ticket table, AB#105 row | "Gemini extract endpoint" → "OpenAI extract endpoint" |
| `docs/AsikaGo_Sprint4_Ticket_Breakdown_v1.0.md` | §17 Risks | Gemini row → "OpenAI key, credits or spend limit problems \| TE-003 slips into Sprint 5 \| Jude shares one key privately with Mich, sets a $10 / month limit if the dashboard allows, and revokes the key if usage spikes. TE-003 does not block any Sprint 4 Must Have." |
| `docs/qa/ai-extraction-cases.md` | "How to read" line, "Draft instruction text for Gemini" heading, last rule | "Gemini" → "the model". Drop the "Answer only with JSON..." rule (the strict schema enforces it). Results table gets "Time (ms)" and "Tokens" columns. |

The PRD and Tech Architecture keep their file names (`_v1.0`), matching how D8 was applied.

## 7. Azure Boards changes (shown to Jude before sending)

| Item | Change |
|---|---|
| AB#105 | Title → "TE-003-BE-01 - OpenAI client and POST /api/assistant/extract". Description → section 5 text. |
| AB#106 | Description adds the two new criteria |
| AB#63 | Description and acceptance criteria per section 5 |
| AB#37, AB#55 | Acceptance criteria per section 5 (US-012) |
| AB#38, AB#56 | Acceptance criteria per section 5 (US-013) |
| New User Story | "US-016 - Talk to the Step Companion", Sprint 6, Could Have, section 5 text |
| New User Story | "US-017 - Speak My Business Description", Sprint 6, Could Have, section 5 text |

US-016 and US-017 are created as single stories. The team splits them into
A/B at Sprint 6 planning, as with the other stories.

## 8. Unverified (checked before the work that depends on it)

- `gpt-6.1-terra` supports strict structured outputs and a low reasoning effort. Checked in OpenAI's docs at the start of TE-003-BE-01. If it doesn't support strict outputs, `OpenAI:Model` is set to the cheapest current model that does, and D21 records that model. No code or acceptance criteria change. If it lacks a low reasoning effort, the parameter is left out.
- Whether GPT-Live bills while connected but silent. The 15 s auto-close covers either case.
- GPT Transcribe price and Taglish quality (US-017 pre-check).
- GPT-Live Filipino quality (US-016 pre-check).

## 9. Calls made in this design (check these)

- Rate limit numbers (20/min, 200/day, 60/min per IP), the 1000-character cap, the 15 s timeout, and the retry rule.
- US-012's "location" criterion is dropped because of D8.
- The "Not sure" choice sits on the existing type step, not a new screen.
- US-016 at 5 pts and US-017 at 3 pts.
- US-016 is limited to Google users (no guests) because a voice session costs about 30x a text call.
- The README gets one user-secrets line as part of TE-003-BE-01.
- The "Not sure" helper's Yes answer suggests Sole Proprietorship and names OPC as the one-owner alternative.
- Rate-limit counts are in memory and reset on Render restarts. The spend limit is the backstop.
- One shared key (Jude's call). Per-person usage tracking is given up in exchange for simplicity.
- Mich gets tokens and timing from the API log, not the response.
- If Terra lacks strict outputs, the fallback is a config change to another model.
- Fake mode waits for US-012, which keeps TE-003-BE-01 at about its 5 h estimate.
