# Voice Pre-checks (US-016-AI-01, US-017-AI-01)

Both checks run on the local voice pre-check page (`http://localhost:5173/voice-precheck.html`), not the OpenAI playground. The page uses the team key through `tools/voice-precheck/server.mjs`, so the key never reaches the browser.

Audio files are not committed.

---

## 1. GPT-Live Taglish check (US-016-AI-01, AB#132)

### Summary

_Fill in after the talk session._

- Model: _
- Total talk time: _ minutes
- Cost: _ (from the page: estimated cost and the usage from OpenAI)
- Understands Taglish: _ (yes / no). Notes: _
- Filipino sounds natural: _ (yes / no). Notes: _
- Handles interruptions: _ (yes / no). Notes: _
- Answers that invent a requirement, fee, office, hour or phone number: _ (questions: _)
- **Go / no-go for talk mode:** _ Why: _
- Run: the 5 items below asked by voice in one or two talk sessions, about 10 minutes in all. The session gets the instructions and test roadmap from `docs/qa/ai-qa-cases.md` sections 1 and 2, the same as the text chat test set. Check each answer against that question's **Must** and **Must not** lines in `docs/qa/ai-qa-cases.md` section 4.

### Results

| # | Question (from `ai-qa-cases.md`) | What I said | What it answered (short) | Pass / fail | Notes (Taglish, Filipino voice, interruption) |
| --- | --- | --- | --- | --- | --- |
| 1 | Q01 `Ano ang kailangan kong dalhin sa barangay hall?` | | | | |
| 2 | Q02 `Saan kukunin yung cedula?` | | | | |
| 3 | Q08 `Ano pa kulang ko?` | | | | |
| 4 | Q10 `Saan ang BPLD office?`, then the follow-up Q13 `Anong oras bukas yung nasa Bridgetowne?` (interrupt it during the Q10 answer) | | | | |
| 5 | Q17 `Corporation ba dapat ako imbes na sole proprietor?` | | | | |

---

## 2. Transcribe Taglish samples (US-017-AI-01, AB#133)

### Summary

_Fill in after all samples are transcribed._

- Model: _
- Price: _ per minute (source: _)
- Average length: _ seconds. Average cost per description: _
- Transcripts that match what was said (exact or only small differences): _ of _
- Extractions still right from the transcript: _ of _
- Kinds of speech that fail: _
- Run: 5-10 business descriptions from 2-3 people, in Taglish, some with background noise. Write the expected type and category before checking extraction. Each recording goes through the page's Transcribe card, then "Check extraction" sends the transcript to `POST /api/assistant/extract` on the local API.

### Results

| # | Speaker | Noise (yes / no) | What was said | Expected (type, category) | Transcript | Extraction (type, category) | Extraction right (yes / no) | Seconds | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |
| 4 | | | | | | | | | |
| 5 | | | | | | | | | |
| 6 | | | | | | | | | |
| 7 | | | | | | | | | |
| 8 | | | | | | | | | |
| 9 | | | | | | | | | |
| 10 | | | | | | | | | |
