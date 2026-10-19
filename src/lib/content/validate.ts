/** Cross-field checks JSON Schema cannot express: duplicates, foreign keys, cycles, placement and answer/context/asset rules. */
import type { AlignmentPack, AssessmentPlan, Catalogue, QuestionPack } from "./contracts";
import { indexCatalogue, type CatalogueIndex } from "./core";

export type Issue = { id: string; message: string };

const PARENT_KINDS: Record<string, string[]> = {
  category: [], series: ["category"], book: ["category", "series"], grade: ["category"],
  term: ["grade"], unit: ["book"], subunit: ["unit"],
};

export function validateCatalogue(c: Catalogue): Issue[] {
  const out: Issue[] = [];
  let ix: CatalogueIndex;
  try { ix = indexCatalogue(c); } catch (e) { return [{ id: "catalogue", message: (e as Error).message }]; }
  for (const n of ix.nodes.values()) {
    const parent = n.parent_id ? ix.nodes.get(n.parent_id) : null;
    const allowed = PARENT_KINDS[n.kind];
    if (!allowed) out.push({ id: n.id, message: `unknown kind ${n.kind}` });
    else if (parent ? !allowed.includes(parent.kind) : n.kind !== "category") out.push({ id: n.id, message: `${n.kind} cannot sit under ${parent?.kind ?? "root"}` });
    const school = n.kind === "grade" || n.kind === "term";
    if (n.kind === "term" && (![7, 8, 9, 10, 11, 12].includes(n.grade ?? 0) || ![1, 2].includes(n.term ?? 0))) out.push({ id: n.id, message: "term needs numeric grade and term" });
    if (!school && (n.grade !== undefined || n.term !== undefined)) out.push({ id: n.id, message: "grade/term only apply to school nodes" });
  }
  return out;
}

export function validateQuestionPack(p: QuestionPack, ix: CatalogueIndex): Issue[] {
  const out: Issue[] = [];
  const ids = new Set<string>();
  const ctx = new Set(p.contexts.map((c) => c.id));
  const assets = new Set(p.assets.map((a) => a.id));
  if (ctx.size !== p.contexts.length) out.push({ id: "contexts", message: "duplicate context IDs" });
  for (const q of p.questions) {
    if (ids.has(q.id)) out.push({ id: q.id, message: "duplicate question ID" });
    ids.add(q.id);
    if (!Number.isInteger(q.revision) || q.revision < 1) out.push({ id: q.id, message: "invalid revision" });
    const primaries = q.placements.filter((x) => x.relation === "primary");
    if (primaries.length !== 1) out.push({ id: q.id, message: `needs exactly one primary placement (has ${primaries.length})` });
    for (const pl of q.placements) {
      const n = ix.nodes.get(pl.node_id);
      if (!n) { out.push({ id: q.id, message: `unknown placement node ${pl.node_id}` }); continue; }
      if (n.kind === "term" && (q.grade !== n.grade || q.term !== n.term)) out.push({ id: q.id, message: `placement ${n.id} disagrees with grade/term` });
    }
    if (q.context_id && !ctx.has(q.context_id)) out.push({ id: q.id, message: `missing context ${q.context_id}` });
    for (const a of q.assets.required_asset_ids ?? []) if (!assets.has(a)) out.push({ id: q.id, message: `missing asset ${a}` });
    if (q.review_status === "ready") {
      if (!q.answer.value?.trim()) out.push({ id: q.id, message: "ready without answer" });
      if (["mcq", "odd_one_out", "true_false"].includes(q.format) && !q.options.some((o) => o.id === q.answer.correct_option_id)) out.push({ id: q.id, message: "ready choice without valid correct option" });
      if ((q.assets.source_image_required && !q.assets.image) || (q.assets.source_audio_required && !q.assets.audio)) out.push({ id: q.id, message: "ready without required media" });
    }
  }
  for (const [from, to] of Object.entries(p.id_aliases)) {
    if (ids.has(from)) out.push({ id: from, message: "alias ID is also a live question" });
    if (!ids.has(to) && !Object.hasOwn(p.id_aliases, to)) out.push({ id: from, message: `alias target ${to} missing` });
    const seen = new Set([from]);
    let cur = to;
    while (Object.hasOwn(p.id_aliases, cur)) {
      if (seen.has(cur)) { out.push({ id: from, message: "alias cycle" }); break; }
      seen.add(cur); cur = p.id_aliases[cur]!;
    }
  }
  return out;
}

export function validateAssessmentPlan(a: AssessmentPlan, ix: CatalogueIndex): Issue[] {
  const out: Issue[] = [];
  const ids = new Set<string>();
  for (const x of a.assessments) {
    if (ids.has(x.id)) out.push({ id: x.id, message: "duplicate assessment ID" });
    ids.add(x.id);
    if (!ix.nodes.has(x.anchor_node_id)) out.push({ id: x.id, message: `unknown anchor ${x.anchor_node_id}` });
    for (const n of x.coverage_node_ids) if (!ix.nodes.has(n)) out.push({ id: x.id, message: `unknown coverage node ${n}` });
    if (x.status === "awaiting_source" && x.question_ids.length) out.push({ id: x.id, message: "planned assessment must not list questions" });
  }
  return out;
}

export function validateAlignments(a: AlignmentPack, ix: CatalogueIndex): Issue[] {
  return a.alignments.flatMap((x) => [x.from_node_id, x.to_node_id].filter((n) => !ix.nodes.has(n)).map((n) => ({ id: x.id, message: `unknown node ${n}` })));
}
