import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { billLines, bills } from "@/db/schema";
import { billInsights } from "@/reasoning/billInsights";
import { defineTool } from "../tool";

export const recordBill = defineTool({
  name: "record_bill", kind: "read", // records into our own store; reversible
  description: "Save a parsed bill/invoice with its line items, then show it as a card with insights. Amounts in minor units.",
  schema: z.object({
    payee: z.string(), category: z.string().default("other"),
    issuedOn: z.string().date(), dueOn: z.string().date().optional(),
    lines: z.array(z.object({ description: z.string(), quantity: z.number().int().default(1), amountMinor: z.number().int() })).min(1),
  }),
  async execute({ db, userId, now }, i) {
    const totalMinor = i.lines.reduce((s, l) => s + l.amountMinor, 0);
    const bill = await db.transaction(async (tx) => {
      const [b] = await tx.insert(bills).values({ userId, payee: i.payee, category: i.category, totalMinor, issuedOn: i.issuedOn, dueOn: i.dueOn }).returning();
      await tx.insert(billLines).values(i.lines.map((l) => ({ billId: b!.id, ...l })));
      return b!;
    });
    const since = new Date(now.getTime() - 180 * 86_400_000).toISOString().slice(0, 10);
    const history = await db.select().from(bills).where(and(eq(bills.userId, userId), gte(bills.issuedOn, since)));
    const insights = billInsights(history, now);
    return { text: `Recorded ${i.payee}, total ${totalMinor}`, blocks: [{ type: "card", variant: "bill", title: i.payee, data: { bill, lines: i.lines, insights } }] };
  },
});

export const payBill = defineTool({
  name: "pay_bill", kind: "consequential",
  description: "Mark a bill as paid after the user pays it.",
  schema: z.object({ billId: z.string().uuid() }),
  summarize: () => "Mark this bill as paid",
  async execute({ db, userId, now }, i) {
    await db.update(bills).set({ paidAt: now }).where(and(eq(bills.id, i.billId), eq(bills.userId, userId)));
    return { text: "Bill marked paid" };
  },
});
