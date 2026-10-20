# AI Extraction Test Set (TE-003-AI-01)

## Results summary (fill in during TE-003-AI-02)

- Correct: _ of 20
- Wrong: _
- Null: _
- Kinds of description that fail: _

## How to read this file

Each case is a business description written the way a real user might type it. Gemini must return a business type and a category, using only the values the knowledge base knows.

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

## Draft instruction text for Gemini

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
> - Answer only with JSON in this shape and nothing else: `{ "businessType": string or null, "category": string or null }`

**Note for TE-003-BE-01:** the prompt returns the category name. The backend maps the name to the seeded `categoryId` and returns null if no match.

## Results (fill in during TE-003-AI-02)

| # | Actual type | Actual category | Result (correct / wrong / null) |
| --- | --- | --- | --- |
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4 |  |  |  |
| 5 |  |  |  |
| 6 |  |  |  |
| 7 |  |  |  |
| 8 |  |  |  |
| 9 |  |  |  |
| 10 |  |  |  |
| 11 |  |  |  |
| 12 |  |  |  |
| 13 |  |  |  |
| 14 |  |  |  |
| 15 |  |  |  |
| 16 |  |  |  |
| 17 |  |  |  |
| 18 |  |  |  |
| 19 |  |  |  |
| 20 |  |  |  |
