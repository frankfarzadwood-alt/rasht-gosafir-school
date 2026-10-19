import { describe, it, expect } from "vitest";
import fixture from "@/test/fixtures/gameplay_questions.v1.json";
import starter from "@/test/fixtures/starter_questions.v0.json";
import bundled from "@/data/bank.json";
import alignments from "@/data/foundation/alignments.json";
import type { AlignmentPack, LegacyPack, QuestionPack } from "./contracts";
import { adaptLegacySchoolPack, canonicalId, indexCatalogue, mergeQuestionRevisions, selectQuestions, stableStringify } from "./core";
import { validateAlignments, validateAssessmentPlan, validateCatalogue, validateQuestionPack } from "./validate";
import { ASSESSMENT_PLAN, CATALOGUE, schoolContent, trackScope } from "./school";
import { createRepository } from "./repository";
import { auditProgress } from "./progressCompat";
import { applyAttempt, DEFAULT, type Progress } from "@/lib/progress";
import { ID_ALIASES, playableCounts } from "@/lib/bank";

const FX = fixture as unknown as LegacyPack;
const ix = indexCatalogue(CATALOGUE);
const pack = adaptLegacySchoolPack(FX, CATALOGUE, { questionRevision: 2 });
const EXPECTED: Record<string, number> = { "7/1": 114, "7/2": 113, "8/1": 99, "8/2": 137, "9/1": 164, "9/2": 68, "10/1": 203, "10/2": 258, "11/1": 200, "11/2": 127, "12/1": 151, "12/2": 167 };
const MOVED = ["g11_t2_e011_q0017", "g11_t2_e011_q0018", "g11_t2_e011_q0019", "g11_t2_e011_q0020", "g11_t2_e011_q0027", "g11_t2_e011_q0028", "g11_t2_e011_q0029"];

describe("catalogue metadata", () => {
  it("has the 926 planned nodes and validates cleanly", () => {
    const k: Record<string, number> = {};
    CATALOGUE.nodes.forEach((n) => (k[n.kind] = (k[n.kind] ?? 0) + 1));
    expect(CATALOGUE.nodes.length).toBe(926);
    expect(k).toMatchObject({ book: 17, unit: 477, subunit: 408, term: 12 });
    expect(validateCatalogue(CATALOGUE)).toEqual([]);
    expect(validateAssessmentPlan(ASSESSMENT_PLAN, ix)).toEqual([]);
    expect(validateAlignments(alignments as unknown as AlignmentPack, ix)).toEqual([]);
  });
  it("detects duplicates, missing parents and cycles", () => {
    const n = (id: string, parent_id: string | null) => ({ id, kind: "category" as const, parent_id, title_en: id, title_fa: id, ordinal: 1, edition_id: null });
    expect(validateCatalogue({ ...CATALOGUE, nodes: [n("a", null), n("a", null)] })[0]!.message).toMatch(/Duplicate/);
    expect(validateCatalogue({ ...CATALOGUE, nodes: [n("a", "x")] })[0]!.message).toMatch(/Missing parent/);
    expect(validateCatalogue({ ...CATALOGUE, nodes: [n("a", "b"), n("b", "a")] })[0]!.message).toMatch(/cycle/);
  });
});

describe("school compatibility adapter", () => {
  it("bundled release equals the reference fixture question-for-question", () => {
    expect(stableStringify((bundled as unknown as LegacyPack).questions)).toBe(stableStringify(FX.questions));
  });
  it("preserves every legacy field byte-value equivalent", () => {
    FX.questions.forEach((orig, i) => {
      const { revision, placements, ...rest } = pack.questions[i]!;
      expect(stableStringify(rest)).toBe(stableStringify(orig));
      expect(revision).toBe(2);
      expect(placements).toEqual([{ node_id: `school.g${String(orig.grade).padStart(2, "0")}.t${orig.term}`, relation: "primary" }]);
    });
    expect(pack.contexts.length).toBe(18);
    expect(Object.keys(pack.id_aliases).length).toBe(109);
  });
  it("pack validates against catalogue foreign keys", () => {
    expect(validateQuestionPack(pack, ix)).toEqual([]);
  });
  it("reproduces all twelve reference track counts via catalogue selectors", () => {
    for (const [k, v] of Object.entries(EXPECTED)) {
      const [g, t] = k.split("/").map(Number) as [number, number];
      expect(selectQuestions(pack, ix, trackScope(g, t)).length, k).toBe(v);
    }
    expect(Object.values(playableCounts()).reduce((a, b) => a + b, 0)).toBe(1801);
  });
  it("grade routing uses explicit grade/term, not ID prefixes or memberships", () => {
    const g10t2 = new Set(selectQuestions(pack, ix, trackScope(10, 2)).map((q) => q.id));
    const g11t2 = new Set(selectQuestions(pack, ix, trackScope(11, 2)).map((q) => q.id));
    for (const id of MOVED) { expect(g10t2.has(id)).toBe(true); expect(g11t2.has(id)).toBe(false); }
    expect(FX.questions.filter((q) => q.source_id === "g11_t2_e011").length).toBe(13);
  });
  it("keeps the cleans correction and whole-word answers", () => {
    const by = new Map(pack.questions.map((q) => [q.id, q]));
    expect(by.get("g09_t2_e023_q0013")!.answer.value).toBe("cleans");
    expect(by.get("g07_t2_e003_q0018")!.answer.value).toBe("friend");
  });
  it("canonical aliases resolve to live questions", () => {
    const live = new Set(pack.questions.map((q) => q.id));
    for (const a of Object.keys(pack.id_aliases)) expect(live.has(canonicalId(a, pack.id_aliases))).toBe(true);
    const [alias, target] = Object.entries(pack.id_aliases)[0]!;
    const sel = selectQuestions(pack, ix, { kind: "custom", node_ids: [], include_descendants: false, question_ids: [alias, target] });
    expect(sel.map((q) => q.id)).toEqual([target]);
  });
});

describe("planned books stay empty", () => {
  const repo = createRepository(CATALOGUE, [pack], ASSESSMENT_PLAN.assessments);
  it("no school question leaks into any book, and availability is derived from content", () => {
    for (const b of CATALOGUE.nodes.filter((n) => n.kind === "book")) {
      expect(repo.availability(b.id)).toEqual({ ready: 0, status: "no_content_yet" });
    }
    expect(repo.availability("school").ready).toBe(1801);
  });
  it("cumulative through-unit scope on a planned book is empty, not an error", () => {
    expect(repo.select({ kind: "through_unit", node_ids: [], include_descendants: false, through_unit_id: "evolve-1.u003" })).toEqual([]);
  });
  it("assessment-plan slots are unplayable", () => {
    const a = ASSESSMENT_PLAN.assessments.find((x) => x.status === "awaiting_source")!;
    expect(a.question_ids).toEqual([]);
    expect(() => repo.select({ kind: "assessment", node_ids: [], include_descendants: false, assessment_id: a.id })).toThrow(/unavailable/);
    // Source-bound slots list their original items but stay unplayable until official scoring is reviewed.
    const bound = ASSESSMENT_PLAN.assessments.find((x) => x.status === "needs_review")!;
    expect(bound.question_ids.length).toBeGreaterThan(0);
    expect(() => repo.select({ kind: "assessment", node_ids: [], include_descendants: false, assessment_id: bound.id })).toThrow(/unavailable/);
  });
  it("unknown scopes throw instead of returning everything", () => {
    expect(() => repo.select({ kind: "node", node_ids: ["nope"], include_descendants: true })).toThrow(/Unknown scope node/);
    expect(() => repo.select({ kind: "through_unit", node_ids: [], include_descendants: false, through_unit_id: "school.g07.t1" })).toThrow();
  });
});

describe("revision upgrade 308 → 1,801", () => {
  const old = adaptLegacySchoolPack({ ...(starter as unknown as LegacyPack), schema_version: "1.0.0" }, CATALOGUE, { questionRevision: 1 });
  it("higher revision updates starters, moves the seven, never duplicates", () => {
    const r = mergeQuestionRevisions(old.questions, pack.questions);
    expect(old.questions.length).toBe(308);
    expect(r.questions.length).toBe(1801);
    expect(r.counts.conflicts).toBe(0);
    expect(r.counts.added + r.counts.updated + r.counts.unchanged).toBe(1801);
    const m = new Map(r.questions.map((q) => [q.id, q]));
    for (const id of MOVED) expect(m.get(id)!.placements[0]!.node_id).toBe("school.g10.t2");
  });
  it("older revision cannot overwrite; same revision with different content is a conflict", () => {
    expect(mergeQuestionRevisions(pack.questions, old.questions).counts.updated).toBe(0);
    const same = old.questions.map((q) => ({ ...q, revision: 2 }));
    expect(mergeQuestionRevisions(pack.questions, same).counts.conflicts).toBeGreaterThan(0);
  });
  it("local edits are protected as conflicts", () => {
    const r = mergeQuestionRevisions(old.questions, pack.questions, new Set([MOVED[0]!]));
    expect(r.conflictIds).toContain(MOVED[0]);
  });
});

describe("existing learner state", () => {
  it("legacy v1 progress round-trips untouched and resolves against the release", () => {
    let p: Progress = structuredClone(DEFAULT);
    const day1 = new Date("2026-10-10T08:00:00Z"), day2 = new Date("2026-10-12T08:00:00Z");
    const ids = [MOVED[0]!, "g09_t2_e023_q0013", Object.keys(ID_ALIASES)[0]!, "retired_id_x"];
    ids.forEach((id, i) => {
      p = applyAttempt(p, { id: `a${i}`, qid: id, canonical: id, grade: 11, term: 2, mode: "quiz_sprint", correct: true, hinted: false, retry: false, ms: 900, response: "x" }, "grammar", i % 2 ? day2 : day1).next;
    });
    const legacyJson = JSON.stringify(p);
    const copy = JSON.parse(legacyJson) as Progress;
    const live = new Set(pack.questions.map((q) => q.canonical_id));
    const audit = auditProgress(copy, live, pack.id_aliases);
    expect(JSON.stringify(copy)).toBe(legacyJson);
    expect(audit).toMatchObject({ version: 1, attempts: 4, masteryRows: 4, xpEntries: 4, viaAlias: 2 });
    expect(audit.unresolved).toEqual(["retired_id_x"]);
    expect(Object.values(copy.xpLedger).reduce((a, b) => a + b, 0)).toBe(40);
  });
  it("school content selector is cached and stable", () => {
    expect(schoolContent().pack).toBe(schoolContent().pack as QuestionPack);
  });
});
