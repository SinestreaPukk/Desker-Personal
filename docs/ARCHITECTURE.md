# Desker Personal — Architecture

**One agent.** A single AI agent ("Desker") serves every request. There are no per-domain agents;
domains (calendar, bills, fitness, tasks, comms, research) are *tool modules* the one agent can call.
Cross-domain judgment comes from the agent reading one shared context, plus deterministic checks in `reasoning/`.

Stack: TypeScript, Next.js (UI + API routes), Postgres + Drizzle, scheduled jobs via an authenticated cron route, Zod, Claude API.

## Layers (build order)
1. `src/context/` — **Shared context layer.** Postgres is the single source of truth: events, bills, tasks,
   workouts, goals, preferences, messages. `getSnapshot(userId)` is what the agent reads. Every tool writes via repos here.
2. `src/agent/` — **Chat entry point.** `handleMessage()` is the one function both channels call.
   Loop: snapshot + history -> Claude with tools -> reply. Router is the model's tool choice:
   `web_research` for lookups, domain tools for actions, `analyze_tradeoffs` for cross-domain.
3. `src/reasoning/` — **Trade-off engine.** Pure functions over the snapshot (budget vs. trip, overloaded week,
   bill-due vs. cash, workout vs. travel) returning `Conflict[]`. Feeds the agent, proactive alerts, and weekly digest.

## Approval-first (hard rule)
Tools are tagged `read` or `consequential`. A consequential tool never runs in the agent loop: it writes an
`approvals` row (`pending`) with a typed payload and returns a card. Only `resolveApproval(id, yes|no)` — called
from a chip tap in the app or a LINE postback — executes it. Every resolution is written to `audit_log`.

## Channels
`src/channels/` — `web` and `line` are thin adapters: normalise input -> `handleMessage()` -> render the
returned `Block[]` (text | card | approval) as bubbles (web) or Flex messages (LINE). One `notify()` fans
proactive alerts out to both. Same context, same agent, same history.

## Integrations
`src/integrations/` — each provider implements `Connector` (read + write methods, OAuth tokens encrypted at rest).
Calendar (Google, Outlook), Gmail, Slack, reminders, telephony (voice, SMS, call screening via Twilio).

## Jobs
`src/jobs/` — run by `/api/cron/tick`: calendar/Gmail sync, bill-due checks, workout reminders, weekly digest, all via `notify()`.

## Decisions
- Fitness is not an agent; it is a tool module. Because agents are collapsed, the agent avatar uses one tint (`av-penny`).
- Bill visuals: transaction-list card with totals, trend sparkline, anomaly flags ("Meowjot format" = any clear transaction format).
