# Desker Personal

One AI agent, one thread, two channels (web app + LINE). Design: `DESIGN.MD`. Architecture: `docs/ARCHITECTURE.md`.

## Run
```
cp .env.example .env        # fill in keys; TOKEN_ENCRYPTION_KEY: openssl rand -base64 32
npm install && npm run db:up && npm run db:migrate
npm run dev                 # web app + API + LINE/Twilio webhooks
npm run worker              # reminders, alerts, calendar sync, Monday digest (separate process)
npm test                    # needs the db up
```

## Wire-up checklist
- LINE: Messaging API webhook -> `{APP_URL}/api/line/webhook`; run `scripts/setup-richmenu.ts <image>`.
- Google / Microsoft / Slack: OAuth redirect `{APP_URL}/api/oauth/<provider>/callback`; connect from the thread ("connect my calendar").
- Twilio: voice webhook -> `/api/twilio/voice`; set `preferences.twilioNumber` on the user for call screening.

## Where things live
`src/context` shared read model · `src/agent` the one agent, tools, approval gate · `src/reasoning` pure conflict/insight/digest logic ·
`src/integrations` provider connectors · `src/channels` LINE rendering + notify · `src/jobs` worker · `src/app` UI + API routes.

## Rules to keep
- A tool with `kind: "consequential"` must never run outside `resolveApproval`.
- Channels render `Block[]`; they never contain business logic.
- Known ceilings are marked `ponytail:` in code (e.g. cookie identity instead of real auth).
# Desker-Personal
