# OutreachOps (MVP)

OutreachOps is a production-lean LinkedIn outreach tracker for BlueprintAI.

## Compliance guardrails
- **No scraping**: the app never fetches LinkedIn pages.
- Uses only data manually pasted by the user.
- Stores only user inputs and AI outputs.
- UI reminder: **"Paste only content you have permission to use."**

## Tech stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Prisma ORM
- SQLite (default local dev)
- Single-user local auth (email + app password cookie)
- OpenAI API (Responses API)
- Zod validation

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Set required variables in `.env`.
4. Generate Prisma client + migrate:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed demo data:
   ```bash
   npm run seed
   ```
6. Start dev server:
   ```bash
   npm run dev
   ```

## Environment variables
- `DATABASE_URL` (default sqlite path)
- `APP_PASSWORD` (required for local sign-in)
- `OPENAI_API_KEY` (required for AI generation)

See `.env.example` for defaults.

## Scripts
- `npm run dev` – run local dev server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run prisma:migrate` – Prisma migration (dev)
- `npm run prisma:studio` – Prisma Studio
- `npm run seed` – seed demo user/prospect

## Switching SQLite → Postgres
1. Update `DATABASE_URL` in `.env` to your Postgres connection string.
2. In `prisma/schema.prisma`, change datasource provider from `sqlite` to `postgresql`.
3. Run:
   ```bash
   npx prisma migrate dev --name postgres_init
   ```

## Main routes
- `/login`
- `/prospects`
- `/prospects/new`
- `/prospects/[id]`
- `/export`

## Notes
- AI endpoint: `POST /api/ai/generate` (rate-limited in-memory per user).
- AI output validated with strict Zod schema.
- If AI validation fails, one repair retry is attempted.
- CSV export via `/api/export`.
