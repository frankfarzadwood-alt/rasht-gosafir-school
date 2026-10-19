/**
 * TEST-ONLY fixture: an isolated fake book whose nodes hold clones of real reviewed school items.
 * Never imported by app code, so it can never enter production packs.
 */
import { ALL_QUESTIONS, CONTEXTS, isEligible } from "@/lib/bank";
import type { Catalogue, CatalogueNode, Question, QuestionPack } from "@/lib/content/contracts";

const node = (id: string, kind: CatalogueNode["kind"], parent_id: string | null, ordinal: number | null): CatalogueNode =>
  ({ id, kind, parent_id, title_en: id, title_fa: id, ordinal, edition_id: kind === "book" ? `${id}-ed1` : null });
export const FIXTURE_CATALOGUE: Catalogue = { schema_version: "2.0.0", kind: "catalogue", nodes: [
  node("fx", "category", null, 1),
  node("fx.book", "book", "fx", 1),
  node("fx.u1", "unit", "fx.book", 1), node("fx.u1.a", "subunit", "fx.u1", 1), node("fx.u1.b", "subunit", "fx.u1", 2),
  node("fx.u2", "unit", "fx.book", 2), node("fx.u2.a", "subunit", "fx.u2", 1),
  node("fx.u3", "unit", "fx.book", 3),
  node("fx.other", "book", "fx", 2), node("fx.other.u1", "unit", "fx.other", 1),
  node("fx.empty", "book", "fx", 3), node("fx.empty.u1", "unit", "fx.empty", 1),
] };

const real = ALL_QUESTIONS.filter((q) => isEligible(q) && !q.context_id && q.format === "mcq" && q.eligible_games.includes("quiz_sprint")).slice(0, 8);
const passage = CONTEXTS.find((c) => c.review_status === "ready" && ALL_QUESTIONS.filter((q) => q.context_id === c.id && isEligible(q)).length >= 2)!;
const passageQs = ALL_QUESTIONS.filter((q) => q.context_id === passage.id && isEligible(q));
const otherPassage = CONTEXTS.find((c) => c.id !== passage.id && c.review_status === "ready" && ALL_QUESTIONS.some((q) => q.context_id === c.id && isEligible(q)))!;
const otherPassageQs = ALL_QUESTIONS.filter((q) => q.context_id === otherPassage.id && isEligible(q));

const place = (q: (typeof ALL_QUESTIONS)[number], ...nodes: string[]): Question => {
  const { grade: _g, term: _t, ...rest } = structuredClone(q);
  return { ...(rest as unknown as Question), revision: 1, placements: nodes.map((node_id, i) => ({ node_id, relation: i ? "supplementary" : "primary" })) };
};
export const ITEMS = { real, passage, passageQs, otherPassage, otherPassageQs };
/** u1.a: real0, real1 · u1.b: real2, real3 (+ real1 supplementary overlap) · u1: real4 · u2.a: real5 + passage · u3: real6 · other book: real7 + other passage. */
export function fixturePack(): QuestionPack {
  const questions = [
    place(real[0]!, "fx.u1.a"), place(real[1]!, "fx.u1.a", "fx.u1.b"), place(real[2]!, "fx.u1.b"), place(real[3]!, "fx.u1.b"),
    place(real[4]!, "fx.u1"), place(real[5]!, "fx.u2.a"), ...passageQs.map((q) => place(q, "fx.u2.a")), place(real[6]!, "fx.u3"),
    place(real[7]!, "fx.other.u1"), ...otherPassageQs.map((q) => place(q, "fx.other.u1")),
    // a later duplicate record of real[0] whose ID is aliased to the canonical item
    { ...place(real[0]!, "fx.u2.a"), id: "fx_dup_of_real0", canonical_id: "fx_dup_of_real0" },
  ];
  return {
    schema_version: "2.0.0", kind: "question_pack", pack_id: "fixture", release_id: "fixture", content_revision: 1,
    questions, contexts: structuredClone([passage, otherPassage]) as unknown as QuestionPack["contexts"], sources: [], assets: [], vocabulary_entries: [],
    assessments: [], id_aliases: { fx_dup_of_real0: real[0]!.id },
  };
}
