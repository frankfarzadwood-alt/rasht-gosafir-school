import "fake-indexeddb/auto";
import { describe, it, expect, vi, beforeAll } from "vitest";
import real from "@/data/bank.json";

type Q = { id: string; prompt_en: string | null; review_status: string; context_id: string | null; format: string; eligible_games: string[]; grade: number; term: number };
const realQs = (real as unknown as { questions: Q[] }).questions;
// A genuine approved starter record held out of the test baseline (never shipped as a test item).
const held = realQs.find((q) => !q.context_id && q.format === "mcq" && q.eligible_games.includes("quiz_sprint"))!;

vi.mock("@/data/bank.json", async (orig) => {
  const m = (await orig()) as { default: { questions: Q[] } & Record<string, unknown> };
  const d = m.default;
  return { default: { ...d, questions: d.questions.filter((q) => q.id !== held.id) } };
});

const bank = await import("./bank");
const local = await import("./localBank");
const { applyAttempt } = await import("./progress").catch(() => ({ applyAttempt: undefined }));
void applyAttempt;

const count = () => Object.values(bank.playableCounts()).reduce((a, b) => a + b, 0);

describe("ready-pack integration (isolated baseline with one record held out)", () => {
  let before: ReturnType<typeof bank.modeAvailability>;
  let missionsBefore: string[];
  beforeAll(() => {
    before = bank.modeAvailability(held.grade, held.term);
    missionsBefore = bank.missions(held.grade, held.term).map((m) => m.id + ":" + m.questionIds.join(","));
  });

  it("baseline has 307 in the isolated setup", () => expect(count()).toBe(307));

  it("importing the held-out approved record adds it once to its track and games", async () => {
    const plan = await local.importPack({ content_version: "t1", questions: [held, held] });
    expect(plan.newIds).toEqual([held.id]);
    expect(plan.duplicates).toBe(1);
    expect(count()).toBe(308);
    const after = bank.modeAvailability(held.grade, held.term);
    expect(after.quiz_sprint.count).toBe(before.quiz_sprint.count + 1);
    expect(after.boss_exam.count).toBe(before.boss_exam.count + 1);
    expect(bank.trackQuestions(held.grade === 7 ? 8 : 7, held.term).some((q) => q.id === held.id)).toBe(false);
  });

  it("existing missions keep their IDs and contents; the new item is appended", () => {
    const ms = bank.missions(held.grade, held.term);
    expect(ms.slice(0, missionsBefore.length).map((m) => m.id + ":" + m.questionIds.join(","))).toEqual(missionsBefore);
    expect(ms.at(-1)!.questionIds).toContain(held.id);
  });

  it("re-importing the same pack changes nothing", async () => {
    const plan = await local.importPack({ content_version: "t1", questions: [held] });
    expect(plan.unchanged).toBe(1);
    expect(plan.accept).toHaveLength(0);
    expect(count()).toBe(308);
  });

  it("survives a reload from IndexedDB", async () => {
    bank.setLocalOverlay([], []);
    expect(count()).toBe(307);
    await local.loadLocalOverlay();
    expect(count()).toBe(308);
  });

  it("option grading stays correct for the imported item", () => {
    const q = bank.trackQuestions(held.grade, held.term).find((x) => x.id === held.id)!;
    expect(bank.gradeChoice(q, q.answer.correct_option_id!)).toBe(true);
    expect(bank.gradeChoice(q, q.options.find((o) => o.id !== q.answer.correct_option_id)!.id)).toBe(false);
  });

  it("an older or same-version edit is a conflict, not an overwrite", async () => {
    const edited = { ...held, prompt_en: held.prompt_en + " (edited)" };
    const plan = await local.importPack({ content_version: "t0", questions: [edited] });
    expect(plan.conflicts.map((c) => c.id)).toEqual([held.id]);
    expect(bank.trackQuestions(held.grade, held.term).find((x) => x.id === held.id)!.prompt_en).toBe(held.prompt_en);
  });

  it("bundled records with changed content are conflicts; needs_review and excluded stay out", async () => {
    const b = bank.ALL_QUESTIONS[0]!;
    const plan = await local.importPack({ content_version: "t9", questions: [
      { ...b, answer: { ...b.answer, value: "zzz" } },
      { ...b, id: "x_pending", canonical_id: "x_pending", review_status: "needs_review" },
      { ...b, id: "x_excl", canonical_id: "x_excl", review_status: "excluded" },
      { ...b, id: "x_unrev", canonical_id: "x_unrev", answer: { ...b.answer, verification_status: "not_reviewed" } },
    ] });
    expect(plan.conflicts).toHaveLength(1);
    expect(plan.notReady).toBe(1);
    expect(plan.excluded).toBe(1);
    expect(plan.errors.map((e) => e.id)).toEqual(["x_unrev"]);
    expect(count()).toBe(308);
  });

  it("passage questions keep their approved context", () => {
    const withCtx = bank.ALL_QUESTIONS.filter((q) => q.context_id);
    expect(withCtx.length).toBe(3);
    for (const q of withCtx) expect(bank.isEligible(q)).toBe(true);
  });
});
