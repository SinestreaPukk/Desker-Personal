/** One-off: create the LINE rich menu and set it as default. Usage: npx tsx scripts/setup-richmenu.ts path/to/menu-2500x843.png */
import { messagingApi } from "@line/bot-sdk";
import { readFileSync } from "node:fs";

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const api = new messagingApi.MessagingApiClient({ channelAccessToken: token });
const blob = new messagingApi.MessagingApiBlobClient({ channelAccessToken: token });
const msg = (label: string, text: string) => ({ type: "message" as const, label, text });

// Mirrors the web rich-menu row (DESIGN.MD): Today, Add a bill, Plan a trip, Workout plan, Budget, Week.
const cells = [msg("Today", "What's on my plate today?"), msg("Add a bill", "I want to add a bill"), msg("Plan a trip", "Help me plan a trip"),
  msg("Workout plan", "Plan my workouts for this week"), msg("Budget", "Show my budget this month"), msg("My week", "Show my week")];

const { richMenuId } = await api.createRichMenu({
  size: { width: 2500, height: 843 }, selected: true, name: "Desker", chatBarText: "Desker",
  areas: cells.map((action, i) => ({ bounds: { x: (i % 3) * 833, y: Math.floor(i / 3) * 421, width: 833, height: 421 }, action })),
});
await blob.setRichMenuImage(richMenuId, new Blob([readFileSync(process.argv[2]!)], { type: "image/png" }));
await api.setDefaultRichMenu(richMenuId);
console.log("rich menu", richMenuId);
