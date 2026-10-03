---
name: Desker Personal
description: Your life, in one thread — a team of named agents who talk with you, not a dashboard you operate.
colors:
  ember: "oklch(0.620 0.160 45.0)"
  ember-deep: "oklch(0.520 0.160 45.0)"
  on-ember: "oklch(0.990 0.004 70.0)"
  ember-soft: "oklch(0.960 0.030 55.0)"
  ember-soft-text: "oklch(0.480 0.140 40.0)"
  ember-edge: "oklch(0.850 0.070 50.0)"
  paper: "oklch(0.965 0.006 75.0)"
  thread-rail: "oklch(0.950 0.008 75.0)"
  bubble-surface: "oklch(0.997 0.003 75.0)"
  fill: "oklch(0.945 0.008 75.0)"
  fill-strong: "oklch(0.920 0.010 75.0)"
  ink: "oklch(0.240 0.012 55.0)"
  ink-muted: "oklch(0.500 0.016 60.0)"
  ink-subtle: "oklch(0.610 0.016 65.0)"
  hairline: "oklch(0.885 0.012 70.0)"
  control-edge: "oklch(0.640 0.018 65.0)"
  positive: "oklch(0.500 0.100 165.0)"
  positive-soft: "oklch(0.960 0.030 150.0)"
  positive-edge: "oklch(0.860 0.070 150.0)"
  warning: "oklch(0.550 0.130 70.0)"
  warning-soft: "oklch(0.970 0.070 90.0)"
  warning-edge: "oklch(0.880 0.110 85.0)"
  danger: "oklch(0.550 0.190 20.0)"
  danger-soft: "oklch(0.955 0.020 20.0)"
  danger-edge: "oklch(0.860 0.070 20.0)"
  av-penny: "oklch(0.620 0.140 150.0)"
  av-juno: "oklch(0.620 0.140 260.0)"
  av-remy: "oklch(0.620 0.160 340.0)"
  av-theo: "oklch(0.620 0.140 230.0)"
  av-isla: "oklch(0.620 0.150 190.0)"
  av-ollie: "oklch(0.620 0.150 95.0)"
typography:
  large-title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
    letterSpacing: "-0.02em"
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  bubble:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.4375rem"
    letterSpacing: "-0.003em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.3125rem"
    letterSpacing: "-0.003em"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  caption:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "normal"
  timestamp:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Geist, ui-sans-serif, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "1rem"
  bubble: "1.125rem"
  bubble-tight: "0.375rem"
  card: "1rem"
  full: "9999px"
spacing:
  bubble-gap: "0.375rem"
  bubble-group-gap: "1rem"
  bubble-padding: "0.625rem 0.875rem"
  thread-gutter: "1rem"
  thread-gutter-wide: "1.5rem"
  rail-gutter: "1.25rem"
  section: "1.5rem"
components:
  bubble-agent:
    backgroundColor: "{colors.bubble-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "{spacing.bubble-padding}"
  bubble-agent-tail:
    rounded: "{rounded.bubble-tight}"
  bubble-user:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.on-ember}"
    rounded: "{rounded.bubble}"
    padding: "{spacing.bubble-padding}"
  bubble-card:
    backgroundColor: "{colors.bubble-surface}"
    rounded: "{rounded.card}"
    padding: "1rem"
  approval-chip-yes:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.on-ember}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1.125rem"
    height: "2.25rem"
  approval-chip-no:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1.125rem"
    height: "2.25rem"
  composer:
    backgroundColor: "{colors.bubble-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  composer-send:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.on-ember}"
    rounded: "{rounded.full}"
    height: "2.25rem"
  rich-menu-action:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.625rem"
  rich-menu-action-hover:
    backgroundColor: "{colors.fill-strong}"
  agent-avatar-ring:
    rounded: "{rounded.full}"
  badge-positive:
    backgroundColor: "{colors.positive-soft}"
    textColor: "{colors.positive}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.625rem"
  rail-card:
    backgroundColor: "{colors.bubble-surface}"
    rounded: "{rounded.card}"
    padding: "1rem"
  rail-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.625rem"
---

# Design System: Desker Personal

## Overview

**Creative North Star: "One Thread"**

Desker Personal is not a dashboard you operate — it's one continuous thread with a team of people who happen to be AI. Penny, Juno, Remy, Theo, Isla and Ollie each speak in their own voice, in their own place in the thread, the same whether you're in the app or in LINE. There is no sidebar of menu items to learn and no separate page for each domain; the thread is the product, and the rest — a budget card, a calendar conflict, a trip option, a workout reminder — arrives as a rich card inside it, the way a friend might drop a photo or a link into a chat.

Where Desker's business app reads as a desk — source list, split view, a team you run — Desker Personal reads as a kitchen-table conversation: warm, unhurried, a little informal, but never sloppy. Ember (a warm terracotta, not the business app's indigo) is the one accent, used exactly where the business app uses indigo: the single affirmative action in view, your own messages, a link, a focus ring. Everything else sits on a warm paper ground, not a cool slate one — the single biggest tell, at a glance, that this is a different product from the same family.

Importance here isn't shown by splitting the screen into panes; it's shown by where something sits in time. The newest thing is always at the bottom of the thread, exactly where a message would be. A card that needs a yes or no carries its own two chips right inside the bubble — never a modal, never a separate "approvals" page — because the whole point of a conversational product is that nothing important ever makes you leave the conversation to deal with it.

**Key Characteristics:**
- One tint: ember. Solid ember is your own messages and the one affirmative action in any card; soft ember is a gentle highlight, never a selection system (there is nothing to "select" in a thread).
- A warm, not cool, neutral ground — paper and bubble-surface sit a hair toward amber, never toward blue-grey, so the product never reads as the business app's "desk."
- Six agents, six quiet avatar tints (av-penny through av-ollie), applied only to the avatar ring and a thin accent bar on that agent's cards — never to backgrounds or buttons, so the single ember action always stays legible as the one actionable colour.
- Approval lives inside the card that asked for it: two chips, Yes and No, never a dialog.
- Sentence case, warm and direct, everywhere — a text from Juno should read like a text from a capable friend, not a system notification.
- Motion behaves like messaging: new bubbles rise and settle, nothing condenses into a toolbar, because there is no toolbar to condense into.

## Colors

One warm accent on a warm paper ground, with six quiet agent tints and three status colours held in reserve for state.

### Primary
- **Ember** (`ember`, `--accent`): the user's own message bubbles, the one filled action in any card (book it, pay it, approve it), links, and the focus ring. Nothing else in the product is this colour.
- **Ember Deep** (`ember-deep`): hover/press state for the one filled action only.
- **Ember Soft** (`ember-soft`) with **Ember Soft Text** (`ember-soft-text`) and **Ember Edge** (`ember-edge`): a gentle highlight for something worth a second look inside a card (a flagged line item, a suggested change) — never a selection state, since nothing in a thread is "selected."

### Neutral
- **Paper** (`paper`, `--ground`): the thread's background. Warm, not cool — this one swap is what keeps the product from reading like the business app.
- **Thread Rail** (`thread-rail`): the "Today" rail on wide screens and the rich-menu footer's background; one step warmer-dark than paper.
- **Bubble Surface** (`bubble-surface`): every agent bubble, card, and the composer; the brightest thing on screen.
- **Fill** (`fill`) / **Fill Strong** (`fill-strong`): the "No" chip, rich-menu action tiles, quiet inner blocks.
- **Ink** (`ink`): all message text and titles.
- **Ink Muted** (`ink-muted`): timestamps, card captions, the agent's name line above its bubble.
- **Ink Subtle** (`ink-subtle`): placeholder text in the composer, decorative icons.
- **Hairline** (`hairline`): the thin line between the thread and the rail; otherwise nearly absent, since bubbles separate themselves by space, not by borders.
- **Control Edge** (`control-edge`): the composer's resting border.

### Agent tints
Six quiet hues, one per agent (`av-penny` money, `av-juno` life admin, `av-remy` branding, `av-theo` career, `av-isla` travel, `av-ollie` learning) — applied only to that agent's avatar ring and a 2px accent bar on the left edge of its cards. They identify who's speaking; they never compete with ember for attention.

### Status
- **Positive** (`positive` / `-soft` / `-edge`): paid, booked, confirmed, done. A sage-leaning green — calmer and warmer than a clinical teal.
- **Warning** (`warning` / `-soft` / `-edge`): due soon, needs a decision, a conflict the weekly brief caught.
- **Danger** (`danger` / `-soft` / `-edge`): overdue, failed, a destructive confirmation.

### Named Rules
**The One Tint Rule.** Ember is the only accent with the authority to mean "act on this." Agent tints identify a speaker; status colours describe a state; only ember asks for a tap.

**The Warm Ground Rule.** Every neutral in this system carries a small positive hue (toward amber), never a cool or blue-leaning grey. A component that imports a cool slate token has imported the wrong product's tokens.

**The No-Modal-Approval Rule.** A request for a yes/no lives inside the card itself, as two chips. A confirmation dialog is reserved for one thing only: an irreversible destructive action, never an everyday approval.

## Typography

**Face:** the system face (system-ui, -apple-system, BlinkMacSystemFont, Segoe UI), Geist as fallback — unchanged from the family, because a different typeface would fight the warmth the colour system is already doing.

**Character:** slightly looser than the business app's rows, because this is prose meant to be read as conversation, not scanned as a list. Line-height is generous (1.4+ on bubble text) and tracking is close to neutral rather than tightened, so long agent messages breathe.

### Hierarchy
- **Large Title** (700, 1.875rem): the thread's header when it names something (a shared trip, a specific agent's history) — otherwise the thread has no page title at all, since it opens straight into the conversation.
- **Display** (700, 2.5rem): big numbers in a digest card — a total saved, a countdown.
- **Headline** (600, 1.375rem): rare; a section break inside the rail.
- **Title** (600, 1.0625rem): a card's own heading (the trip name, the bill's payee).
- **Bubble** (400, 0.9375rem, line-height 1.4375rem): the default for every message, from the user or any agent. This is the typeface's main job in this product.
- **Body** (400, 0.875rem): card body copy, rail items.
- **Label** (600, 0.8125rem): a chip's word, a card's small heading.
- **Caption** (400, 0.75rem): the agent name line above its bubble, card metadata.
- **Timestamp** (500, 0.6875rem): the small grey time under a bubble, shown on hover or at the start of a new minute, the way a messaging app does it — never on every bubble at once.

### Named Rules
**The Conversation-Weight Rule.** Hierarchy inside the thread comes from who's speaking and when, not from heading levels — most of the thread is set in Bubble size; Title and Headline exist for the handful of places (a card, a rail section) that aren't dialogue.
**The Locked Scale Rule.** Only the sizes above exist. As in the parent system, Tailwind's default scale is reset so an arbitrary `text-2xl` renders nothing, and a type-scale test guards it.

## Layout

A thread, not a desk. On every screen size, the primary and usually only surface is a single vertically scrolling column of bubbles and cards, capped at 38rem wide and centred, exactly like a messaging app — because on a phone and inside LINE, that's exactly what it has to be.

On `lg` (1024px) and up, a 20rem "Today" rail appears to the right of the thread: the week's cross-domain digest, upcoming bills, today's calendar, a workout reminder — glanceable, not another place to go. The rail is read-only; every action still happens by replying in the thread or tapping a chip in a card. Below `lg`, the rail's content is folded into a single pinned card at the top of the thread instead of disappearing.

The composer is fixed to the bottom of the viewport, full-width, with the rich-menu's quick actions as a row of icon tiles directly above it — mirroring LINE's own rich-menu pattern so the web app and the LINE experience feel like the same product, not a port.

### Named Rules
**The Thread-Is-The-Product Rule.** There is no tab bar for "Calendar," "Bills," "Fitness." Those are things agents bring into the thread as cards when they're relevant, not destinations with their own navigation.
**The Rail-Never-Acts Rule.** The Today rail summarizes; it never carries its own buttons. An action always happens in the thread, so there is only ever one place to look for "what can I do right now."

## Elevation & Depth

Bubbles and cards float very slightly above the warm paper ground — the softest shadow in the family, because a thread should feel close and immediate, not stacked and layered like a desk full of windows. The composer and rich-menu row sit on a translucent paper-tinted material so the thread is visibly scrolling underneath them.

### Shadow Vocabulary
- **Bubble** (`0 1px 2px hsl(var(--shadow-color) / 0.05)`): every agent bubble and card at rest — barely there.
- **Raised** (`0 3px 10px -3px hsl(var(--shadow-color) / 0.14)`): a card on hover/focus, the send button on press.
- **Overlay** (`0 14px 34px -14px hsl(var(--shadow-color) / 0.26)`): the rare destructive-confirmation dialog, an attachment preview.

### Named Rules
**The Close, Not Stacked Rule.** Nothing in the thread should look like it's sitting in a separate pane or window. Depth is a whisper, there to separate a bubble from the ground it sits on, never to imply the business app's panes-within-panes.

## Shapes

Rounder than the business app, on purpose — bubble radius (1.125rem) is the largest radius in the system apart from full-round chips and avatars, because a conversational product should feel soft before it feels precise. An agent's first bubble in a run of messages keeps the full bubble radius; a following bubble from the same agent tightens its top corner (bubble-tight, 0.375rem) toward the avatar, the way most messaging apps show "still talking."

## Components

### Bubbles
- **Agent bubble:** bubble-surface background, ink text, the agent's avatar and name/caption line above the first bubble in a run.
- **User bubble:** solid ember, on-ember text, right-aligned, no avatar (it's always you).
- **Grouping:** consecutive bubbles from the same sender sit `bubble-gap` apart; a new sender or a time gap opens `bubble-group-gap`.

### Cards (inside the thread)
- **Bubble card:** a bubble-surface rounded block for anything structured — a bill, a trip option, the weekly digest — with the speaking agent's 2px tint bar on its left edge, a Title, a body, and an optional pair of approval chips at its foot.
- **Approval chips:** Yes (solid ember) and No (fill) sit side by side at the bottom of the card that asked the question; tapping either resolves the card in place — it never disappears, its state just updates (a small checkmark or an ember border replaces the chips) so scrolling back up still shows what you decided.

### Composer
- Full-width, pill-shaped (`rounded.full`), bubble-surface background, placeholder in ink-subtle ("Ask anything, or tell me what's going on"). The send control is a small solid-ember circle that only appears once there's text.

### Rich-menu row
- A row of icon tiles (fill background, lg radius) directly above the composer, mirroring LINE's rich menu: shortcuts like "Today," "Add a bill," "Plan a trip." Tapping one drops a prompt into the thread rather than navigating anywhere.

### Today rail (wide screens)
- A stack of rail-cards: this week's digest at the top (the cross-domain trade-offs, see the Build Prompt's Phase 3), then upcoming bills, today's calendar, and a workout reminder, each a quiet rail-item row with no buttons of its own.

### Agent avatars
- A circular avatar per agent, ringed in that agent's tint. The same six avatars appear consistently in the thread, the rail, and LINE's chat list, so the user learns to recognise who's talking by colour and face before they read a word.

### Badges
- Fully round, soft fill, tone-coloured label — used only inside cards (a bill's "Due in 3 days," a trip's "Booked"), never in the thread's plain conversation.

### Named Rules
**The Visible Speaker Rule.** Every bubble and card is attributed to a specific agent (or the user) by avatar, name, and tint — never an unlabelled system message, because the whole product's trust story depends on always being able to see who said or did what.
**The Resolved-In-Place Rule.** A decided approval card keeps its full content and simply marks itself resolved; it never collapses or vanishes, so the thread stays a true, scrollable record of what happened.

## Do's and Don'ts

### Do:
- **Do** keep the thread as the one primary surface; let cards bring structure into it rather than sending the user to a separate page.
- **Do** attribute every bubble and card to a named agent with its avatar and tint.
- **Do** resolve a yes/no right inside the card that asked it, with two chips, never a modal.
- **Do** keep the ground and surfaces warm (positive hue), never cool or blue-leaning.
- **Do** let the Today rail summarize only; every action happens in the thread.
- **Do** mirror the rich-menu row between the web app and LINE so both feel like one product.

### Don't:
- **Don't** add a sidebar of navigation destinations (Calendar, Bills, Fitness as tabs); those arrive as cards in the thread instead.
- **Don't** reuse the business app's indigo, slate neutrals, or source-list/split-view layout — this is a different product in the same family, not a reskin.
- **Don't** put an approval behind a separate "Approvals" page or a modal dialog for anything reversible.
- **Don't** leave a bubble or card unattributed; every message has a visible speaker.
- **Don't** let a resolved card disappear from the thread; mark it resolved and leave it in place.
- **Don't** use a font size outside the locked scale, or borrow the business app's tighter, denser row rhythm — this product reads like a conversation, not a list.
