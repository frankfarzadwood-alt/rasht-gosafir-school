import { EXERCISE_HOLDS } from './reviewHolds';
/**
 * Pure content core, adapted from the foundation package's reference/content-core.ts.
 * General selection only: game-specific rules (word banks, tokens, letter pools, pairs) stay in src/lib/bank.ts.
 */
import type { Asset, Catalogue, CatalogueNode, Context, LegacyPack, Question, QuestionPack, Scope } from "./contracts";

export type CatalogueIndex = { nodes: Map<string, CatalogueNode>; children: Map<string, string[]> };

export function indexCatalogue(catalogue: Catalogue): CatalogueIndex {
  const nodes = new Map<string, CatalogueNode>();
  for (const n of catalogue.nodes) {
    if (nodes.has(n.id)) throw new Error(`Duplicate catalogue node: ${n.id}`);
    nodes.set(n.id, n);
  }
  const children = new Map<string, string[]>();
  for (const n of catalogue.nodes) {
    const seen = new Set<string>();
    let cur: CatalogueNode | undefined = n;
    while (cur) {
      if (seen.has(cur.id)) throw new Error(`Catalogue cycle: ${cur.id}`);
      seen.add(cur.id);
      if (cur.parent_id === null) break;
      const parent = nodes.get(cur.parent_id);
      if (!parent) throw new Error(`Missing parent: ${cur.parent_id}`);
      cur = parent;
    }
    if (n.parent_id) children.set(n.parent_id, [...(children.get(n.parent_id) ?? []), n.id]);
  }
  return { nodes, children };
}

export function descendantIds(ix: CatalogueIndex, roots: string[], include: boolean): Set<string> {
  const out = new Set<string>();
  const visit = (id: string): void => {
    if (!ix.nodes.has(id)) throw new Error(`Unknown scope node: ${id}`);
    if (out.has(id)) return;
    out.add(id);
    if (include) for (const c of ix.children.get(id) ?? []) visit(c);
  };
  roots.forEach(visit);
  return out;
}

export function canonicalId(id: string, aliases: Record<string, string>): string {
  let r = id;
  const seen = new Set<string>();
  while (Object.hasOwn(aliases, r)) {
    if (seen.has(r)) throw new Error(`Alias cycle: ${r}`);
    seen.add(r);
    r = aliases[r]!;
  }
  return r;
}

/** Explicit grade/term → school term node. Memberships and ID prefixes never add placements. */
export function schoolTrackMap(ix: CatalogueIndex): Map<string, string> {
  const m = new Map<string, string>();
  for (const n of ix.nodes.values()) if (n.kind === "term") {
    const k = `${n.grade}/${n.term}`;
    if (m.has(k)) throw new Error(`Duplicate school track: ${k}`);
    m.set(k, n.id);
  }
  return m;
}

/** Additive: every legacy field is cloned unchanged; only revision and placements are added. */
export function adaptLegacySchoolPack(input: LegacyPack, catalogue: Catalogue,
  o: { questionRevision?: number; contentRevision?: number; packId?: string } = {}): QuestionPack {
  if (input.schema_version !== "1.0.0") throw new Error("Expected legacy schema 1.0.0");
  const tracks = schoolTrackMap(indexCatalogue(catalogue));
  const qr = o.questionRevision ?? 1, cr = o.contentRevision ?? 1;
  if (!Number.isInteger(qr) || qr < 1 || !Number.isInteger(cr) || cr < 1) throw new Error("Invalid revision");
  const questions: Question[] = input.questions.map((orig) => {
    const loc = tracks.get(`${orig.grade}/${orig.term}`);
    if (!loc) throw new Error(`Missing grade/term placement for ${orig.id}`);
    return { ...structuredClone(orig), revision: qr, placements: [{ node_id: loc, relation: "primary" }] };
  });
  return {
    schema_version: "2.0.0", kind: "question_pack", pack_id: o.packId ?? "school-reviewed",
    release_id: input.release_id ?? "legacy-school-release", content_revision: cr,
    questions, contexts: structuredClone(input.contexts ?? []),
    sources: (input.sources ?? []).map((s) => ({ ...structuredClone(s), kind: "remote_pdf", file_name: null, book_id: null, edition_id: null })),
    assets: [], vocabulary_entries: [], assessments: [], id_aliases: structuredClone(input.id_aliases ?? {}),
  };
}

function assetId(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "asset_id" in v && typeof (v as { asset_id: unknown }).asset_id === "string") return (v as { asset_id: string }).asset_id;
  return null;
}
export const VERIFIED = ["reviewed_by_assistant", "reviewed_by_teacher", "reviewed_locally"];

/** General ready gate (atomic, reviewed, usable prompt/answer, resolved context/assets, supported task). */
export function isPlayable(q: Question, contexts: Map<string, Context>, assets: Map<string, Asset>): boolean {
  if (EXERCISE_HOLDS.has(q.id)) return false;
  if (q.review_status !== "ready" || q.granularity !== "atomic" || !q.prompt_en?.trim()) return false;
  if (!VERIFIED.includes(q.answer.verification_status) || !q.answer.value?.trim()) return false;
  if (q.format === "free_writing" || q.format === "source_review" || q.eligible_games.length === 0) return false;
  if (q.context_id) {
    const c = contexts.get(q.context_id);
    if (!c || c.review_status !== "ready" || !c.text?.trim()) return false;
  }
  const needed = [...(q.assets.required_asset_ids ?? [])];
  for (const [req, val] of [[q.assets.source_image_required, q.assets.image], [q.assets.source_audio_required, q.assets.audio]] as const) {
    if (req) { const id = assetId(val); if (!id) return false; needed.push(id); }
  }
  if (q.skill === "listening" && !assetId(q.assets.audio)) return false;
  if (needed.some((id) => assets.get(id)?.review_status !== "ready" || !assets.get(id)?.path)) return false;
  if (["mcq", "odd_one_out", "true_false"].includes(q.format)) {
    if (q.options.length < 2 || new Set(q.options.map((x) => x.id)).size !== q.options.length) return false;
    if (!q.options.some((x) => x.id === q.answer.correct_option_id)) return false;
  }
  return true;
}

// Released arrays are immutable; review/import updates replace arrays.
const readyPools = new WeakMap<QuestionPack, { questions: Question[]; contexts: Context[]; assets: Asset[]; pool: Question[] }>();
function readyPool(pack: QuestionPack): Question[] {
 const cached=readyPools.get(pack);
 if(cached?.questions===pack.questions&&cached.contexts===pack.contexts&&cached.assets===pack.assets)return cached.pool;
 const contexts=new Map(pack.contexts.map(c=>[c.id,c]));const assets=new Map(pack.assets.map(a=>[a.id,a]));
 const pool=pack.questions.filter(q=>isPlayable(q,contexts,assets));readyPools.set(pack,{questions:pack.questions,contexts:pack.contexts,assets:pack.assets,pool});return pool;
}

/** Scope → deduplicated ready questions. Unknown nodes throw; fixed assessments are never shortened. */
export function selectQuestions(pack: QuestionPack, catalogue: Catalogue | CatalogueIndex, scope: Scope, gameId?: string): Question[] {
  const ix = "nodes" in catalogue && catalogue.nodes instanceof Map ? (catalogue as CatalogueIndex) : indexCatalogue(catalogue as Catalogue);
  const pool = readyPool(pack);
  if (scope.kind === "assessment") {
    if (scope.node_ids.length || scope.skills?.length || scope.question_ids?.length || scope.through_unit_id) throw new Error("A fixed assessment cannot be shortened by scope filters");
    const a = pack.assessments.find((x) => x.id === scope.assessment_id);
    if (!a || a.status !== "ready" || !a.question_ids.length) throw new Error("Assessment is unavailable");
    const byId = new Map(pool.map((q) => [q.id, q]));
    const seen = new Set<string>();
    return a.question_ids.map((id) => {
      const c = canonicalId(id, pack.id_aliases);
      if (seen.has(c)) throw new Error("Repeated canonical item in assessment");
      seen.add(c);
      const q = byId.get(c);
      if (!q || (gameId && !q.eligible_games.includes(gameId))) throw new Error(`Incomplete assessment: ${id}`);
      return q;
    });
  }
  let roots = scope.node_ids;
  if (scope.kind === "through_unit") {
    const unit = ix.nodes.get(scope.through_unit_id ?? "");
    const book = unit?.parent_id ? ix.nodes.get(unit.parent_id) : undefined;
    if (!unit || unit.kind !== "unit" || !book || book.kind !== "book" || unit.ordinal === null) throw new Error("Cumulative scope requires a unit in a book");
    if (roots.length && (roots.length !== 1 || roots[0] !== book.id)) throw new Error("Cumulative scope points to another book");
    roots = (ix.children.get(book.id) ?? []).map((id) => ix.nodes.get(id)!).filter((n) => n.kind === "unit" && n.ordinal !== null && n.ordinal <= unit.ordinal!).map((n) => n.id);
  }
  const nodes = descendantIds(ix, roots, scope.kind === "through_unit" || scope.include_descendants);
  const explicit = new Set((scope.question_ids ?? []).map((id) => canonicalId(id, pack.id_aliases)));
  const seen = new Set<string>();
  return pool.filter((q) => {
    const id = canonicalId(q.canonical_id, pack.id_aliases);
    if (seen.has(id)) return false;
    const inScope = roots.length ? q.placements.some((p) => nodes.has(p.node_id)) : explicit.size > 0;
    if (!inScope || (explicit.size && !explicit.has(id))) return false;
    if (scope.skills?.length && !scope.skills.includes(q.skill)) return false;
    if (gameId && !q.eligible_games.includes(gameId)) return false;
    seen.add(id);
    return true;
  });
}

export function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  if (v !== null && typeof v === "object")
    return "{" + Object.entries(v).sort(([a], [b]) => a.localeCompare(b, "en")).map(([k, x]) => JSON.stringify(k) + ":" + stableStringify(x)).join(",") + "}";
  return JSON.stringify(v);
}

/** Content-only upsert: same ID + same revision + different content = conflict; older revisions never overwrite. */
export function mergeQuestionRevisions(existing: Question[], incoming: Question[], localEditedIds = new Set<string>()) {
  if (new Set(existing.map((q) => q.id)).size !== existing.length || new Set(incoming.map((q) => q.id)).size !== incoming.length) throw new Error("Duplicate import IDs");
  const next = new Map(existing.map((q) => [q.id, q]));
  const counts = { added: 0, updated: 0, unchanged: 0, stale: 0, conflicts: 0 };
  const conflictIds: string[] = [];
  for (const q of incoming) {
    if (!Number.isInteger(q.revision) || q.revision < 1) throw new Error("Invalid question revision");
    const prior = next.get(q.id);
    if (!prior) { next.set(q.id, structuredClone(q)); counts.added++; }
    else if (stableStringify(prior) === stableStringify(q)) counts.unchanged++;
    else if (localEditedIds.has(q.id) || q.revision === prior.revision) { counts.conflicts++; conflictIds.push(q.id); }
    else if (q.revision < prior.revision) counts.stale++;
    else { next.set(q.id, structuredClone(q)); counts.updated++; }
  }
  return { questions: [...next.values()], counts, conflictIds };
}
