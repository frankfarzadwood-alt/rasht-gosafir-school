import { describe, expect, it } from "vitest";
import { applyAttempt, DEFAULT } from "./progress";
import { ALL_QUESTIONS, GRADES_CHECK, isAccepted, gradeChoice, shuffle, trackQuestions } from "./bank.testkit";

const base = { qid: "q1", canonical: "c1", grade: 7, term: 1, mode: "quiz_sprint", hinted: false, ms: 1000, response: "x" };

describe("rewards", () => {
  it("gives 10 XP for a first unassisted correct answer", () => {
    expect(applyAttempt(DEFAULT, { ...base, id: "a1", correct: true, retry: false }, "grammar").xp).toBe(10);
  });
  it("gives 5 XP for a corrected retry", () => {
    expect(applyAttempt(DEFAULT, { ...base, id: "a1", correct: true, retry: true }, "grammar").xp).toBe(5);
  });
  it("does not reward the same attempt ID twice", () => {
    const r1 = applyAttempt(DEFAULT, { ...base, id: "a1", correct: true, retry: false }, "grammar");
    expect(applyAttempt(r1.next, { ...base, id: "a1", correct: true, retry: false }, "grammar").xp).toBe(0);
  });
  it("caps XP per question per day at 10", () => {
    const r1 = applyAttempt(DEFAULT, { ...base, id: "a1", correct: true, retry: false }, "grammar");
    expect(applyAttempt(r1.next, { ...base, id: "a2", correct: true, retry: false }, "grammar").xp).toBe(0);
  });
  it("hint-assisted correct answers give no first-attempt XP", () => {
    expect(applyAttempt(DEFAULT, { ...base, id: "a1", correct: true, retry: false, hinted: true }, "g").xp).toBe(0);
  });
});

describe("mastery", () => {
  it("needs three unassisted correct retrievals across at least two dates", () => {
    let p = DEFAULT;
    const d1 = new Date("2026-01-01T09:00:00Z"), d2 = new Date("2026-01-02T09:00:00Z"), d3 = new Date("2026-01-05T09:00:00Z");
    p = applyAttempt(p, { ...base, id: "a", correct: true, retry: false }, "g", d1).next;
    p = applyAttempt(p, { ...base, id: "b", correct: true, retry: false }, "g", d1).next; // same day ignored
    p = applyAttempt(p, { ...base, id: "c", correct: true, retry: false }, "g", d2).next;
    expect(p.mastery.c1.mastered).toBe(false);
    p = applyAttempt(p, { ...base, id: "d", correct: true, retry: false }, "g", d3).next;
    expect(p.mastery.c1.mastered).toBe(true);
  });
  it("a wrong answer is due again after 10 minutes", () => {
    const now = new Date("2026-01-01T09:00:00Z");
    const p = applyAttempt(DEFAULT, { ...base, id: "a", correct: false, retry: false }, "g", now).next;
    expect(new Date(p.mastery.c1.due).getTime() - now.getTime()).toBe(10 * 60000);
  });
});

describe("question bank", () => {
  it("contains all 308 starter records", () => expect(ALL_QUESTIONS.length).toBe(308));
  it("every one of the 12 tracks has eligible questions", () => {
    for (const [g, t] of GRADES_CHECK) expect(trackQuestions(g, t).length).toBeGreaterThan(0);
  });
  it("tracks never include another grade or term", () => {
    for (const [g, t] of GRADES_CHECK) expect(trackQuestions(g, t).every((q) => q.grade === g && q.term === t)).toBe(true);
  });
  it("shuffled options still grade by option ID", () => {
    const q = ALL_QUESTIONS.find((x) => x.format === "mcq")!;
    const correct = shuffle(q.options).find((o) => o.id === q.answer.correct_option_id)!;
    expect(gradeChoice(q, correct.id)).toBe(true);
  });
  it("accepts approved variants like grandma", () => {
    const q = ALL_QUESTIONS.find((x) => x.answer.accepted_answers.includes("grandma"))!;
    expect(isAccepted(q, " Grandma. ")).toBe(true);
    expect(isAccepted(q, "grandmom")).toBe(false);
  });
});

import { validateEnvelope } from "./importer";
describe("import dry-run", () => {
  it("importing the same bank twice does not double counts", () => {
    const rows = ALL_QUESTIONS.slice(0, 5);
    const r = validateEnvelope({ questions: [...rows, ...rows] }, new Set());
    expect(r.newIds).toBe(5);
    expect(r.duplicates).toBe(5);
  });
  it("rejects malformed rows but keeps valid ones", () => {
    const r = validateEnvelope({ questions: [{ id: "bad" }, ALL_QUESTIONS[0]] }, new Set());
    expect(r.errors.map((e) => e.id)).toEqual(["bad"]);
    expect(r.ready).toBe(1);
  });
});
