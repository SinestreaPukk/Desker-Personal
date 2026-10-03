# Desker Personal

One AI agent, one thread, two channels (web app + LINE). Design: `DESIGN.MD`. Architecture: `docs/ARCHITECTURE.md`.

## Run
```
cp .env.example .env        # fill in keys; TOKEN_ENCRYPTION_KEY: openssl rand -base64 32
npm install && npm run db:up && npm run db:migrate
npm run dev                 # web app + API + LINE/Twilio webhooks
npm test                    # needs the db up
```

## Deploy (Vercel + Postgres)
- Import the repo in Vercel; add a Postgres (Neon via Vercel Marketplace) and the env vars from `.env.example` (`CRON_SECRET`: any long random string, `TOKEN_ENCRYPTION_KEY`: `openssl rand -base64 32`).
- Run migrations once from your machine: `DATABASE_URL=<prod url> npm run db:migrate` (again after any schema change).
- Scheduler: call `GET {APP_URL}/api/cron/tick` every minute with header `Authorization: Bearer $CRON_SECRET` (cron-job.org or similar; Vercel Cron's free tier is daily only, too coarse for reminders).

## Wire-up checklist
- LINE: Messaging API webhook -> `{APP_URL}/api/line/webhook`; run `scripts/setup-richmenu.ts <image>`.
- Google / Microsoft / Slack: OAuth redirect `{APP_URL}/api/oauth/<provider>/callback`; connect from the thread ("connect my calendar").
- Twilio: voice webhook -> `/api/twilio/voice`; set `preferences.twilioNumber` on the user for call screening.

## Where things live
`src/context` shared read model · `src/agent` the one agent, tools, approval gate · `src/reasoning` pure conflict/insight/digest logic ·
`src/integrations` provider connectors · `src/channels` LINE rendering + notify · `src/jobs` scheduled checks · `src/app` UI + API routes.

## Rules to keep
- A tool with `kind: "consequential"` must never run outside `resolveApproval`.
- Channels render `Block[]`; they never contain business logic.
- Known ceilings are marked `ponytail:` in code (e.g. cookie identity instead of real auth).
# Desker-Personal
