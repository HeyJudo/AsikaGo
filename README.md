# AsikaGo

A web app that turns Philippine business registration into a personalized,
step-by-step roadmap for micro-entrepreneurs (MVP: Pasig City only; designed to scale to more LGUs later).

| Part | Stack | Hosting |
|---|---|---|
| `frontend/` | React, Vite, TypeScript, Tailwind + shadcn/ui, TanStack Query | Vercel |
| `backend/` | ASP.NET Core (.NET 10) Minimal API, EF Core | Render (Docker) |
| Database / Auth | Supabase Postgres + Supabase Auth (Google, anonymous) | Supabase |

Product and design docs live in [`docs/`](docs/). Architecture decisions and
schema changes are in [`docs/decisions.md`](docs/decisions.md).

## Prerequisites

- .NET 10 SDK
- Node.js 24
- Access to the `asikago-dev` Supabase project (ask the team lead)

## First-time setup

### Backend

```sh
cd backend
dotnet tool restore
dotnet user-secrets set "ConnectionStrings:Default" "Host=<pooler-host>;Port=5432;Database=postgres;Username=postgres.wlvkwumxktigpyzedcnq;Password=<db-password>;SSL Mode=Require" --project src/AsikaGo.Api
```

Get `<pooler-host>` from Supabase → **Connect → Session pooler**. Use port
**5432** (session pooler), not 6543. Never commit the password.

### Frontend

```sh
cd frontend
npm install
cp .env.example .env.local   # then fill in the values
```

`VITE_SUPABASE_ANON_KEY` is the **anon public** key from Supabase → Project
Settings → API Keys.

## Run

```sh
# terminal 1
cd backend && dotnet run --project src/AsikaGo.Api --urls http://localhost:5080

# terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173. Sign in with Google or as a guest; the page calls
`GET /api/me` to prove auth and the database work end to end.

## Everyday workflow

| Task | Command |
|---|---|
| Backend tests | `cd backend && dotnet test` |
| Add a DB migration | `cd backend && dotnet ef migrations add <Name> --project src/AsikaGo.Api --output-dir Data/Migrations` |
| Apply migrations to dev DB | `cd backend && dotnet ef database update --project src/AsikaGo.Api` (only from `main`) |
| Regenerate API types after changing an endpoint | `cd backend && dotnet build`, then `cd frontend && npm run gen:api` |
| Frontend lint / build | `cd frontend && npm run lint && npm run build` |

CI fails if `backend/openapi/AsikaGo.Api.json` or `frontend/src/lib/api-types.ts`
is stale, so commit both after changing an endpoint.

## Where code goes

Features are vertical slices. One backlog story maps to one folder on each side:

| Feature | Backend | Frontend |
|---|---|---|
| Assessment (US-001, 002, 012) | `Features/Assessment/` | `src/features/assessment/` |
| Roadmap + engine (US-005–007, TE-004) | `Features/Roadmap/` | `src/features/roadmap/` |
| Documents + progress (US-008, 009, 011) | `Features/Progress/` | `src/features/progress/` |
| AI assistant (US-013, TE-003) | `Features/Assistant/` | `src/features/assistant/` |
| Offices / map (US-014, 015) | `Features/KnowledgeBase/` | — |

Rules:

- The frontend uses `supabase-js` **for auth only**. All data goes through the API.
- Business logic lives in the backend. The roadmap engine is a plain class with
  no DB or HTTP code so it can be unit-tested.
- Knowledge-base data is SQL in `database/seed/`, applied through EF migrations.

## Git workflow

- `main` is protected. Branch as `feature/123-short-name`.
- Put the Azure Boards ticket in commit/PR messages as `AB#123`.
- PRs need green CI and one review.
- Building with AI? Follow [`docs/AI_Workflow.md`](docs/AI_Workflow.md).
