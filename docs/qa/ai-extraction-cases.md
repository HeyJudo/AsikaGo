# AI Extraction Test Set (TE-003-AI-01)

## Results summary (TE-003-AI-02)

- Correct: 19 of 20
- Wrong: 1 (case 16)
- Null: 0
- Kinds of description that fail: A very short description that hints at how the business sells but gives no business type or category. "online seller" (case 16) came back as Retail where we expected null, because the model guessed the category from the word "seller". Every description with a clear structure and kind of business was correct, in English, Taglish, short, or misspelled. All three fully unclear cases (17-19) and the partly unclear case (20) correctly returned null for the unclear fields.
- Average response time: 2,265 ms (1,894 ms without the first call, which took 9,300 ms)
- Total tokens: 6,711 (6,288 input, 423 output, 0 cached)
- Total cost of the run: _ (work out from the tokens above and the model's price, or read it from the OpenAI usage page)
- Run: each of the 20 cases once through `POST /api/assistant/extract` on the local API. 19 of 20 is above the 15 of 20 bar, so no prompt change or rerun is needed.

## How to read this file

Each case is a business description written the way a real user might type it. The model must return a business type and a category, using only the values the knowledge base knows.

- **Business types (4):** Sole Proprietorship, Partnership, Corporation, One Person Corporation
- **Categories (3):** Retail, Food and Beverage, Services
- **Expected = null** for a field means the description does not say enough to pick it. A case is "unclear" when at least one field is null.
- A case is **correct** only when both fields match the expected values.
- A case is **wrong** when any field has a value that doesn't match the expected value.
- A case is **null** when nothing is wrong but the model returned null for a field where we expected a value.

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

## Draft instruction text for the model

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

## Results (TE-003-AI-02)

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
