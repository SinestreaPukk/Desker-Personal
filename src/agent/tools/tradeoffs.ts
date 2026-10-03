import { z } from "zod";
import { getSnapshot } from "@/context/snapshot";
import { buildDigest } from "@/reasoning/digest";
import { findConflicts } from "@/reasoning/conflicts";
import { defineTool } from "../tool";

export const analyzeTradeoffs = defineTool({
  name: "analyze_tradeoffs", kind: "read",
  description: "Check the user's whole context for cross-domain conflicts (calendar overlaps, overloaded days, budget, bills due, workout clashes). Call before or after any change that touches more than one domain.",
  schema: z.object({}),
  async execute({ db, userId, now }) {
    const conflicts = findConflicts(await getSnapshot(db, userId, now));
    return { text: JSON.stringify(conflicts) };
  },
});

export const showWeek = defineTool({
  name: "show_week", kind: "read",
  description: "Show the user's week and budget as a digest card (conflicts, bills, spend vs budget). Use for 'show my budget', 'show my week', 'how am I doing'. Then add a short comment on what matters most.",
  schema: z.object({}),
  async execute({ db, userId, now }) {
    const digest = buildDigest(await getSnapshot(db, userId, now));
    return { text: JSON.stringify(digest), blocks: [{ type: "card", variant: "digest", title: "Your week", data: { digest } }] };
  },
});
