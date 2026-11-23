# AI Extraction Test Set (TE-003-AI-01, US-012-AI-02)

## Run 1 summary (TE-003-AI-02, Sprint 4 prompt, 20 cases)

- Correct: 19 of 20
- Wrong: 1 (case 16)
- Null: 0
- Kinds of description that fail: A very short description that hints at how the business sells but gives no business type or category. "online seller" (case 16) came back as Retail where we expected null, because the model guessed the category from the word "seller". Every description with a clear structure and kind of business was correct, in English, Taglish, short, or misspelled. All three fully unclear cases (17-19) and the partly unclear case (20) correctly returned null for the unclear fields.
- Average response time: 2,265 ms (1,894 ms without the first call, which took 9,300 ms)
- Total tokens: 6,711 (6,288 input, 423 output, 0 cached)
- Total cost of the run: _ (work out from the tokens above and the model's price, or read it from the OpenAI usage page)
- Run: each of the 20 cases once through `POST /api/assistant/extract` on the local API. 19 of 20 is above the 15 of 20 bar, so no prompt change or rerun is needed.

## Run 2 summary (US-012-AI-02, revised prompt, 25 cases)

_Fill in after US-012-BE-01 merges and all 25 cases are rerun through the local API._

- Correct: _ of 25. Bar: at least 22 of 25, and cases 1-15 all still correct.
- Cases 1-15 all correct: _ (yes / no)
- Wrong: _ (cases: _)
- Null: _ (cases: _)
- Case 16 ("online seller"): returned _ for the category, expected null.
- Cases 21-25 (new): _ of 5 correct.
- Kinds of description that fail: _
- Average response time: _ ms (_ ms without the first call)
- Total tokens: _ (_ input, _ output, _ cached)
- Total cost of the run: _ (from the tokens above and the model's price, or the OpenAI usage page)
- Compared with run 1: _
- Run: each of the 25 cases once through `POST /api/assistant/extract` on the local API, with `OpenAI:ApiKey` set (fake mode off). If fewer than 22 of 25 are correct, or any of cases 1-15 broke, Michelle and Krystelle agree on one more prompt change and rerun once. Keep both results.

## How to read this file

Each case is a business description written the way a real user might type it. The model must return a business type and a category, using only the values the knowledge base knows.

- **Business types (4):** Sole Proprietorship, Partnership, Corporation, One Person Corporation
- **Categories (3):** Retail, Food and Beverage, Services
- **Expected = null** for a field means the description does not say enough to pick it. A case is "unclear" when at least one field is null.
- A case is **correct** only when both fields match the expected values.
- A case is **wrong** when any field has a value that doesn't match the expected value.
- A case is **null** when nothing is wrong but the model returned null for a field where we expected a value.
- **Cases 21-25** were added in Sprint 5 (US-012-AI-02). They name only how the business sells, or use a vague word ("online", "reseller", "side hustle"), so the expected category is null.

## Test cases

| # | Description (as typed by the user) | Language / style | Expected type | Expected category |
| --- | --- | --- | --- | --- |
| 1 | I want to open a small sari-sari store in Pasig. It's just me, in my own name. | English | Sole Proprietorship | Retail |
| 2 | magbubukas ako ng tindahan ng mga damit sa Kapitolyo, ako lang mag-isa may-ari, sa pangalan ko | Taglish | Sole Proprietorship | Retail |
| 3 | me and my sister are partners, we will sell phone accesories in a stall | English, misspelled | Partnership | Retail |
| 4 | We are a corporation with 3 stockholders selling appliances in a store in Ortigas. | English | Corporation | Retail |
| 5 | OPC po kami, nagbebenta ng school supplies | Taglish, short | One Person Corporation | Retail |
| 6 | Gusto ko magtayo ng carinderia sa Pasig, sarili kong pangalan ang gagamitin | Taglish | Sole Proprietorship | Food and Beverage |
| 7 | opening a coffe shop, kami ng 2 friends, partnership | English, misspelled | Partnership | Food and Beverage |
| 8 | Our company, a corporation, will run a fast food restaurant | English | Corporation | Food and Beverage |
| 9 | bakery lang po, one person corporation | Taglish, short | One Person Corporation | Food and Beverage |
| 10 | I will sell milk tea from a small kiosk. Solo owner, in my name. | English, short | Sole Proprietorship | Food and Beverage |
| 11 | laundry shop, ako lang may ari, sa pangalan ko | Taglish, short | Sole Proprietorship | Services |
| 12 | We are two partners opening a hair salon | English | Partnership | Services |
| 13 | Corporation kami, mag-aalok ng IT consulting | Taglish | Corporation | Services |
| 14 | I want to start a one person corporation offering graphic design services | English | One Person Corporation | Services |
| 15 | motorcycle repar shop, sole proprietor | English, misspelled | Sole Proprietorship | Services |
| 16 | online seller | English, short, **unclear** | null | null |
| 17 | I want to start a business | English, **unclear** | null | null |
| 18 | negosyo po sa Pasig, hindi ko pa sure kung ano | Taglish, **unclear** | null | null |
| 19 | We sell food and clothes, and I don't know if we should be a partnership or a corporation | English, **unclear** (two categories, no structure chosen) | null | null |
| 20 | I'm a sole proprietor, I haven't decided what to sell yet | English, **partly unclear** | Sole Proprietorship | null |
| 21 | I'm planning to be an online seller | English, short, **unclear** | null | null |
| 22 | reseller lang po ako sa Facebook | Taglish, short, **unclear** | null | null |
| 23 | side hustle lang po, gusto ko gawing legal | Taglish, **unclear** | null | null |
| 24 | I do online selling from home, just me, in my own name | English, **partly unclear** | Sole Proprietorship | null |
| 25 | We're two friends starting a reseller business, partners | English, **partly unclear** | Partnership | null |

## Revised instruction text for the model (US-012-AI-02)

Why: case 16 ("online seller") came back as Retail where null was expected. The model guessed the category from the word "seller". The revised text says the category comes from what the business sells or does, not how it sells. Changes from the Sprint 4 text are the three rules marked **new**.

> You help a business owner in Pasig City who is starting to register a business. Read their description and pick two things.
>
> **1. Business type.** Choose exactly one of: Sole Proprietorship, Partnership, Corporation, One Person Corporation.
>
> **2. Category.** Choose exactly one of: Retail, Food and Beverage, Services.
>
> Rules:
>
> - The description may be in English, Tagalog, or Taglish. It may be short or have spelling mistakes. Read it for meaning.
> - Pick a value only when the description says it clearly or it follows directly from what they wrote. Examples: "ako lang may-ari, sarili kong pangalan" means Sole Proprietorship. "kami ng kaibigan ko, partners" means Partnership.
> - If you are not sure about a field, answer null for that field. A wrong answer is worse than null.
> - Do not guess the business type from the kind of business. A bakery can be any of the four types.
> - **New:** The category comes from WHAT the business sells or does, not HOW it sells. Retail means they name goods they sell (clothes, appliances, school supplies). Food and Beverage means they name food or drinks. Services means they name work they do for a fee.
> - **New:** Words about how or where they sell do not name a category: "online", "seller", "reseller", "dropshipping", "wholesale", "side hustle", "from home", "Facebook", "Shopee", "Lazada". If that is all the description says about the business, answer null for the category.
> - If the description fits more than one category, answer null for the category.
> - **New:** Each field is separate. If the type is stated but the category is not, return the type and null for the category.
> - Never answer with a value that is not on the lists above.

**Note for US-012-BE-01:** paste the quoted text above, without the **New:** labels. It replaces `ExtractInstructions` in `OpenAIClient.cs`. The prompt still returns the category name, and the backend maps the name to the seeded `categoryId` and returns null if no match.

### Sprint 4 instruction text (used for run 1)

> You help a business owner in Pasig City who is starting to register a business. Read their description and pick two things.
>
> **1. Business type.** Choose exactly one of: Sole Proprietorship, Partnership, Corporation, One Person Corporation.
>
> **2. Category.** Choose exactly one of: Retail, Food and Beverage, Services.
>
> Rules:
>
> - The description may be in English, Tagalog, or Taglish. It may be short or have spelling mistakes. Read it for meaning.
> - Pick a value only when the description says it clearly or it follows directly from what they wrote. Examples: "ako lang may-ari, sarili kong pangalan" means Sole Proprietorship. "kami ng kaibigan ko, partners" means Partnership.
> - If you are not sure about a field, answer null for that field. A wrong answer is worse than null.
> - Do not guess the business type from the kind of business. A bakery can be any of the four types.
> - If the description fits more than one category, answer null for the category.
> - Never answer with a value that is not on the lists above.

**Note for TE-003-BE-01:** the prompt returns the category name. The backend maps the name to the seeded `categoryId` and returns null if no match.

## Run 1 results (TE-003-AI-02, Sprint 4 prompt)

| # | Actual type | Actual category | Result (correct / wrong / null) | Time (ms) | Tokens |
| --- | --- | --- | --- | --- | --- |
| 1 | Sole Proprietorship | Retail | correct | 9,300 | 346 (324 in + 22 out) |
| 2 | Sole Proprietorship | Retail | correct | 2,150 | 351 (329 in + 22 out) |
| 3 | Partnership | Retail | correct | 5,821 | 337 (317 in + 20 out) |
| 4 | Corporation | Retail | correct | 1,339 | 339 (319 in + 20 out) |
| 5 | One Person Corporation | Retail | correct | 1,798 | 333 (312 in + 21 out) |
| 6 | Sole Proprietorship | Food and Beverage | correct | 2,117 | 346 (322 in + 24 out) |
| 7 | Partnership | Food and Beverage | correct | 2,381 | 336 (314 in + 22 out) |
| 8 | Corporation | Food and Beverage | correct | 1,792 | 335 (313 in + 22 out) |
| 9 | One Person Corporation | Food and Beverage | correct | 1,251 | 332 (309 in + 23 out) |
| 10 | Sole Proprietorship | Food and Beverage | correct | 1,951 | 342 (318 in + 24 out) |
| 11 | Sole Proprietorship | Services | correct | 1,810 | 335 (313 in + 22 out) |
| 12 | Partnership | Services | correct | 1,638 | 329 (309 in + 20 out) |
| 13 | Corporation | Services | correct | 1,514 | 331 (311 in + 20 out) |
| 14 | One Person Corporation | Services | correct | 1,285 | 334 (313 in + 21 out) |
| 15 | Sole Proprietorship | Services | correct | 1,434 | 330 (308 in + 22 out) |
| 16 | null | Retail | wrong | 1,752 | 322 (303 in + 19 out) |
| 17 | null | null | correct | 1,299 | 326 (307 in + 19 out) |
| 18 | null | null | correct | 1,070 | 333 (314 in + 19 out) |
| 19 | null | null | correct | 2,270 | 339 (320 in + 19 out) |
| 20 | Sole Proprietorship | null | correct | 1,319 | 335 (313 in + 22 out) |

## Run 2 results (US-012-AI-02, revised prompt)

| # | Actual type | Actual category | Result (correct / wrong / null) | Time (ms) | Tokens |
| --- | --- | --- | --- | --- | --- |
| 1 | _ | _ | _ | _ | _ (_ in + _ out) |
| 2 | _ | _ | _ | _ | _ (_ in + _ out) |
| 3 | _ | _ | _ | _ | _ (_ in + _ out) |
| 4 | _ | _ | _ | _ | _ (_ in + _ out) |
| 5 | _ | _ | _ | _ | _ (_ in + _ out) |
| 6 | _ | _ | _ | _ | _ (_ in + _ out) |
| 7 | _ | _ | _ | _ | _ (_ in + _ out) |
| 8 | _ | _ | _ | _ | _ (_ in + _ out) |
| 9 | _ | _ | _ | _ | _ (_ in + _ out) |
| 10 | _ | _ | _ | _ | _ (_ in + _ out) |
| 11 | _ | _ | _ | _ | _ (_ in + _ out) |
| 12 | _ | _ | _ | _ | _ (_ in + _ out) |
| 13 | _ | _ | _ | _ | _ (_ in + _ out) |
| 14 | _ | _ | _ | _ | _ (_ in + _ out) |
| 15 | _ | _ | _ | _ | _ (_ in + _ out) |
| 16 | _ | _ | _ | _ | _ (_ in + _ out) |
| 17 | _ | _ | _ | _ | _ (_ in + _ out) |
| 18 | _ | _ | _ | _ | _ (_ in + _ out) |
| 19 | _ | _ | _ | _ | _ (_ in + _ out) |
| 20 | _ | _ | _ | _ | _ (_ in + _ out) |
| 21 | _ | _ | _ | _ | _ (_ in + _ out) |
| 22 | _ | _ | _ | _ | _ (_ in + _ out) |
| 23 | _ | _ | _ | _ | _ (_ in + _ out) |
| 24 | _ | _ | _ | _ | _ (_ in + _ out) |
| 25 | _ | _ | _ | _ | _ (_ in + _ out) |
