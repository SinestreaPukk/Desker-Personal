import type { Tool } from "../tool";
import { cancelEvent, createEvent, moveEvent } from "./calendar";
import { placeCall, sendEmail, sendSlack, sendSms } from "./comms";
import { addTask, completeTask, planWorkouts, setGoal } from "./life";
import { payBill, recordBill } from "./money";
import { connectionLinks } from "./connect";
import { readSlack, searchEmail } from "./inbox";
import { analyzeTradeoffs, showWeek } from "./tradeoffs";

export const tools: Tool[] = [
  createEvent, moveEvent, cancelEvent, addTask, completeTask, planWorkouts, setGoal,
  recordBill, payBill, sendEmail, sendSlack, sendSms, placeCall, analyzeTradeoffs, showWeek, connectionLinks, searchEmail, readSlack,
];
export const toolsByName: Record<string, Tool> = Object.fromEntries(tools.map((t) => [t.name, t]));
