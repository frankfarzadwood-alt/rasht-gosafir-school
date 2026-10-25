import { describe, expect, it } from "vitest";
import { indexCatalogue } from "@/lib/content/core";
import type { Assessment } from "@/lib/content/contracts";
import { assessmentSession, buildScope, recommendedAlignments, resolvePool, ScopeError, ALIGNMENTS } from "@/lib/scope";
import { contextById, gradeChoice, playableCounts, poolAvailability, quizItems, readingGroups, isAccepted, modeAvailability } from "@/lib/bank";
import { summarize } from "@/lib/display";
import { scopeQuestions, practiceScope, catalogueIndex, nodeScope } from "@/lib/learning";
import { FIXTURE_CATALOGUE, fixturePack, ITEMS } from "@/test/fixtures/bookScopes";

const ix = indexCatalogue(FIXTURE_CATALOGUE);
const pack = fixturePack();
const ctx = (id: string | null) => pack.contexts.find((c) => c.id === id) as never ?? null;
const ids = (mode: string, node: string, custom: string[] = []) => resolvePool(pack, ix, buildScope(ix, mode, node, custom), ctx).map((q) => q.id).sort();
const r = ITEMS.real.map((q) => q.id);

describe("practice scopes", () => {
  it("subunit stays inside its subunit", () => expect(ids("subunit", "fx.u1.a")).toEqual([r[0], r[1]].sort()));
  it("unit includes every real subunit", () => expect(ids("unit", "fx.u1")).toEqual([r[0], r[1], r[2], r[3], r[4]].sort()));
  it("through-unit includes earlier units and their subunits, never later units or another book", () => {
    const got = ids("through_unit", "fx.u2");
    expect(got).toEqual([r[0], r[1], r[2], r[3], r[4], r[5], ...ITEMS.passageQs.map((q) => q.id)].sort());
    expect(got).not.toContain(r[6]); expect(got).not.toContain(r[7]);
    expect(ids("through_unit", "fx.u1")).toEqual(ids("unit", "fx.u1"));
  });
  it("whole book covers all its units only", () => expect(ids("whole_book", "fx.book")).toHaveLength(7 + ITEMS.passageQs.length));
  it("custom overlap is unioned and deduplicated by canonical ID", () => {
    const got = ids("custom", "fx.book", ["fx.u1.a", "fx.u1.b", "fx.u1.a"]);
    expect(got).toEqual([r[0], r[1], r[2], r[3]].sort());
    expect(new Set(got).size).toBe(got.length);
  });
  it("an aliased duplicate record never appears twice", () => {
    const pool = resolvePool(pack, ix, buildScope(ix, "whole_book", "fx.book"), ctx);
    expect(pool.filter((q) => q.canonical_id === r[0])).toHaveLength(1);
    expect(pool.map((q) => q.id)).not.toContain("fx_dup_of_real0");
  });
  it("unknown, mismatched and empty selections reject instead of meaning all questions", () => {
    expect(() => buildScope(ix, "unit", "nope")).toThrow(ScopeError);
    expect(() => buildScope(ix, "galaxy", "fx.u1")).toThrow(ScopeError);
    expect(() => buildScope(ix, "unit", "fx.book")).toThrow(ScopeError);
    expect(() => buildScope(ix, "custom", "fx.book", [])).toThrow(ScopeError);
    expect(() => buildScope(ix, "custom", "fx.book", ["fx.other.u1"])).toThrow(ScopeError);
  });
  it("skill and game eligibility apply after scope", () => {
    const skill = ITEMS.real[0]!.skill;
    const pool = resolvePool(pack, ix, buildScope(ix, "unit", "fx.u1", [], [skill]), ctx, "quiz_sprint");
    expect(pool.every((q) => q.skill === skill && q.eligible_games.includes("quiz_sprint"))).toBe(true);
  });
  it("an empty planned book has zero items and every game stays unavailable", () => {
    const pool = resolvePool(pack, ix, buildScope(ix, "whole_book", "fx.empty"), ctx);
    expect(pool).toEqual([]);
    expect(Object.values(poolAvailability(pool)).every((a) => a.count === 0)).toBe(true);
  });
  it("each passage keeps only its own questions", () => {
    const pool = resolvePool(pack, ix, buildScope(ix, "whole_book", "fx.book"), ctx);
    const groups = readingGroups(pool, ctx);
    expect(groups.map((g) => g.context.id)).toEqual([ITEMS.passage.id]);
    expect(groups[0]!.questions.every((q) => q.context_id === ITEMS.passage.id)).toBe(true);
  });
});

describe("fixed assessments", () => {
  const base: Assessment = { id: "fx.exam", anchor_node_id: "fx.book", title_en: "Exam", status: "ready", coverage_node_ids: [], question_ids: [r[3]!, r[0]!, r[5]!], time_limit_seconds: null, official_max_marks: null };
  it("keeps its exact order, sections and null unknown marks/timing", () => {
    const s = assessmentSession(pack, { ...base, sections: [{ id: "A", question_ids: [r[3]!, r[0]!] }, { id: "B", question_ids: [r[5]!] }] }, ctx);
    expect(s.status).toBe("ready");
    if (s.status !== "ready") return;
    expect(s.sections.map((x) => x.id)).toEqual(["A", "B"]);
    expect(s.sections.flatMap((x) => x.questions.map((q) => q.id))).toEqual([r[3], r[0], r[5]]);
    expect(s.time_limit_seconds).toBeNull(); expect(s.official_max_marks).toBeNull();
  });
  it("a missing item makes it incomplete — never shortened or filled", () => {
    const s = assessmentSession(pack, { ...base, question_ids: [r[0]!, "missing_item"] }, ctx);
    expect(s).toMatchObject({ status: "incomplete", missing: ["missing_item"] });
  });
  it("a repeated canonical item (via alias) is rejected", () => {
    expect(assessmentSession(pack, { ...base, question_ids: [r[0]!, "fx_dup_of_real0"] }, ctx).status).toBe("incomplete");
  });
  it("planned assessments awaiting source stay unavailable", () => {
    expect(assessmentSession(pack, { ...base, status: "awaiting_source", question_ids: [] }, ctx).status).toBe("unavailable");
  });
});

describe("live school content through the shared service", () => {
  it("school track counts are unchanged", () => {
    expect(playableCounts()).toEqual({ "7-1": 114, "7-2": 113, "8-1": 99, "8-2": 137, "9-1": 164, "9-2": 68, "10-1": 203, "10-2": 258, "11-1": 200, "11-2": 127, "12-1": 151, "12-2": 167 });
    for (const [k, n] of Object.entries(playableCounts())) {
      const [g, t] = k.split("-");
      const node = [...catalogueIndex.nodes.values()].find((x) => x.kind === "term" && x.grade === +g! && x.term === +t!)!;
      expect(scopeQuestions(nodeScope(node.id)).length).toBe(n);
    }
    expect(modeAvailability(7, 1).quiz_sprint.count).toBe(81);
    expect(modeAvailability(8, 2).grammar_detective.count).toBe(26);
  });
  it("supplied book questions stay inside their actual unit boundaries", () => {
    expect(scopeQuestions(practiceScope("whole_book", "evolve-2")).length).toBeGreaterThan(0);
    const qs = scopeQuestions(practiceScope("through_unit", "evolve-2.u003")); expect(qs.length).toBeGreaterThan(0); expect(qs.every(q=>q.placements?.every(p=>/^evolve-2\.u00[1-3](?:\.|$)/.test(p.node_id)))).toBe(true);
  });
  it("real choice grading uses stable option IDs and a wrong-first/correct-retry summary keeps first-try accuracy", () => {
    const q = quizItems(scopeQuestions(nodeScope("school")))[0]!;
    const wrong = q.options.find((o) => o.id !== q.answer.correct_option_id)!;
    expect(gradeChoice(q, wrong.id)).toBe(false);
    expect(gradeChoice(q, q.answer.correct_option_id!)).toBe(true);
    const s = summarize(q.id, [{ response: wrong.text, correct: false, hinted: false }, { response: q.answer.value!, correct: true, hinted: false }]);
    expect(s).toMatchObject({ firstCorrect: false, finalCorrect: true, correctedOnRetry: true, firstResponse: wrong.text });
    expect(isAccepted(q, q.answer.value!)).toBe(true);
  });
  it("passages in the school release stay linked to their own questions", () => {
    for (const g of readingGroups(scopeQuestions(nodeScope("school")), contextById)) expect(g.questions.every((q) => q.context_id === g.context.id)).toBe(true);
  });
});

describe("Oxford–Evolve mapping", () => {
  it("loads only the 35 reviewed pilot edges", () => expect(recommendedAlignments(ALIGNMENTS, catalogueIndex)).toHaveLength(35));
  it("only reviewed edges with editions, shared targets and page evidence are recommended, in both directions", () => {
    const e = (over: Record<string, unknown>) => ({ id: "e", from_node_id: "fx.u1", to_node_id: "fx.other.u1", relationship: "partial_overlap" as const, review_status: "reviewed", shared_targets: ["past simple"], evidence: [{ pages: [12] }], ...over });
    const fxIx = indexCatalogue({ ...FIXTURE_CATALOGUE, nodes: FIXTURE_CATALOGUE.nodes.map((n) => ({ ...n, edition_id: "ed" })) });
    const pk = { schema_version: "2.0.0" as const, kind: "alignment_pack" as const, alignments: [e({}), e({ id: "x1", review_status: "draft" }), e({ id: "x2", shared_targets: [] }), e({ id: "x3", evidence: [{ pages: [] }] })] };
    expect(recommendedAlignments(pk, fxIx).map((x) => x.id)).toEqual(["e"]);
    expect(recommendedAlignments(pk, fxIx, { book: "fx.other" }).map((x) => x.id)).toEqual(["e"]);
    expect(recommendedAlignments(pk, fxIx, { unit: "fx.u3" })).toEqual([]);
  });
});
