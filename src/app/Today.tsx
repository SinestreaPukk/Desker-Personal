import type { Digest } from "@/reasoning/digest";
import { money } from "./Cards";

const time = (d: string | Date) => new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/** Summary only: no buttons here. Actions happen in the thread. */
export function Today({ d, currency }: { d: Digest | null; currency: string }) {
  if (!d) return null;
  return (<>
    <div className="rail-card"><h3>This week</h3>
      {d.conflicts.length ? d.conflicts.map((c, i) => <div key={i} className={`rail-item ${c.severity === "danger" ? "bad" : "warn"}`}>{c.message}</div>) : <div className="empty">All clear</div>}
    </div>
    <div className="rail-card"><h3>Upcoming bills</h3>
      {d.bills.length ? d.bills.map((b) => <div key={b.id} className="rail-item"><span>{b.payee}</span><span>{money(b.totalMinor, currency)}</span></div>) : <div className="empty">Nothing due</div>}
    </div>
    <div className="rail-card"><h3>Today</h3>
      {d.todayEvents.length ? d.todayEvents.map((e) => <div key={e.id} className="rail-item"><span>{e.title}</span><span>{time(e.startsAt)}</span></div>) : <div className="empty">Nothing scheduled</div>}
    </div>
    {d.nextWorkout && <div className="rail-card"><h3>Next workout</h3><div className="rail-item"><span>{d.nextWorkout.title}</span><span>{time(d.nextWorkout.plannedAt)}</span></div></div>}
  </>);
}
