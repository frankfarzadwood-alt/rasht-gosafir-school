import { it } from "vitest";
import { writeFileSync } from "fs";
import * as b from "@/lib/bank";
it("snap", () => { const o: Record<string, unknown> = {}; for (const g of [7,8,9,10,11,12]) for (const t of [1,2]) { const a = b.modeAvailability(g,t); o[`${g}-${t}`] = Object.fromEntries(Object.entries(a).filter(([k])=>!["match_arena","memory_pairs"].includes(k)).map(([k,v])=>[k,v.count])); o[`${g}-${t}-pairs`] = b.pairCandidates(b.trackQuestions(g,t)).length; o[`${g}-${t}-m`] = b.missions(g,t).map(m=>m.id+":"+m.questionIds.join(",")).join("|").length; } writeFileSync(process.env.SNAP!, JSON.stringify(o,null,1)); });
