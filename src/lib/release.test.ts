import { describe, it, expect } from "vitest";
import * as b from "./bank";

describe("bundled reviewed release", () => {
  it("per-track playable counts match the release", () => {
    expect(b.playableCounts()).toEqual({ "7-1": 114, "7-2": 113, "8-1": 99, "8-2": 137, "9-1": 164, "9-2": 68, "10-1": 203, "10-2": 258, "11-1": 200, "11-2": 127, "12-1": 151, "12-2": 167 });
  });
  it("starter correction: g09_t2_e023_q0013 accepts cleans, not cleaned", () => {
    const q = b.ALL_QUESTIONS.find((x) => x.id === "g09_t2_e023_q0013")!;
    expect(b.isAccepted(q, "cleans")).toBe(true);
    expect(b.isAccepted(q, "cleaned")).toBe(false);
  });
  it("seven g11_t2_e011 starter questions are placed in grade 10 term 2", () => {
    const qs = b.ALL_QUESTIONS.filter((q) => q.source_id === "g11_t2_e011");
    expect(qs.filter((q) => q.grade === 10 && q.term === 2).length).toBeGreaterThanOrEqual(7);
    for (const q of qs.filter((q) => q.grade === 10)) expect(b.trackQuestions(11, 2).some((x) => x.id === q.id)).toBe(false);
  });
  it("secondary memberships do not add track eligibility", () => {
    const q = b.ALL_QUESTIONS.find((x) => x.memberships?.some((m) => m.grade !== x.grade || m.term !== x.term));
    if (!q) return;
    const m = q.memberships!.find((m) => m.grade !== q.grade || m.term !== q.term)!;
    expect(b.trackQuestions(m.grade, m.term).some((x) => x.id === q.id)).toBe(false);
  });
  it("every bundled record is eligible and no alias ID is bundled", () => {
    expect(b.ALL_QUESTIONS.every((q) => b.isEligible(q))).toBe(true);
    expect(b.ALL_QUESTIONS.some((q) => b.ID_ALIASES[q.id])).toBe(false);
    expect(new Set(b.ALL_QUESTIONS.map((q) => q.canonical_id)).size).toBe(1801);
  });
});
