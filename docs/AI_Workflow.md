# AsikaGo AI Workflow

The standard way to build a feature or ticket with Claude Code.
Needs the `mattpocock-skills` plugin. Run `/setup-matt-pocock-skills` once per laptop.

## The flow

| # | Type this | What it does |
|---|---|---|
| 1 | `/grill-with-docs` | AI interviews you until the feature is clear. Saves decisions. |
|   | *or* `/wayfinder` | Only for huge, foggy work that won't fit in one session. |
| 2 | `/to-spec` | Turns the conversation into a spec. |
| 3 | `/to-tickets` | Splits the spec into small tickets, in order. |
| 4 | `/implement` | Builds **one** ticket, test first. |
| 5 | `/code-review` | Reviews the diff against the ticket and our rules. |

**Keep steps 1–3 in one session.** Then `/clear` before **each** ticket in steps 4–5.

## Where to start

- **New feature or idea** → start at step 1.
- **Ticket already written** (Sprint ticket breakdown / Azure Boards) → use `/build-ticket` instead of steps 4–5.

## Per ticket: `/build-ticket`

1. `/clear`, then `/build-ticket <ticket ID> AB#<id>`
2. The AI branches, builds test-first, runs the CI checks, reviews its own work, and commits.
3. You click through the acceptance criteria in the running app.
4. Open a PR with `AB#<id>` in the title. The other dev reviews it. Merge when CI is green.

The skill lives in `.claude/skills/build-ticket/SKILL.md`. It's in the repo, so everyone who pulls gets it.

## Rules for the AI

From `docs/decisions.md`. Say them again if the AI drifts.

- Frontend uses `supabase-js` for auth only. All data goes through the API.
- Business logic lives in the backend. Schema changes happen only through EF migrations.
- Pasig City only (D8).
- No new packages or secrets in commits.
- You must be able to explain every line before you merge.
