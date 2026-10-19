/**
 * Stage 03 practice scopes: one approved-question service for every game.
 * Location (catalogue node), scope (what to draw from), game mode and fixed assessment stay separate.
 * Pure functions take a pack + catalogue index so tests can use isolated fixtures; live* wrappers use the bundled
 * school release plus browser-local reviewed additions.
 */
import practiceRaw from "@/data/foundation/practice_modes.json";
import { PILOT, PILOT_ALIGNMENTS, PILOT_SELECTIONS } from './content/pilot';
import { contextById, CONTEXTS, ID_ALIASES, isEligible, playableSource, RAW_RELEASE, overlayContexts, type Context as BankContext, type CtxLookup, type Question as BankQuestion } from "@/lib/bank";
import type { Alignment, AlignmentPack, Assessment, Catalogue, LegacyPack, QuestionPack, Scope } from "@/lib/content/contracts";
import { adaptLegacySchoolPack, canonicalId, selectQuestions, type CatalogueIndex } from "@/lib/content/core";

export type PracticeModeId = "subunit" | "unit" | "through_unit" | "whole_book" | "custom";
export const PRACTICE_MODES = (practiceRaw as { practice_modes: { id: string; scope_kind: string; description: string }[] }).practice_modes;
export const PRACTICE_FA: Record<PracticeModeId, string> = {
  subunit: "همین بخش", unit: "کل درس", through_unit: "از ابتدای کتاب تا این درس", whole_book: "کل کتاب", custom: "انتخاب دلخواه",
};
export class ScopeError extends Error {}

/** Which practice modes a catalogue location offers. School terms keep their own routes. */
export function modesFor(ix: CatalogueIndex, nodeId: string): PracticeModeId[] {
  const n = ix.nodes.get(nodeId);
  if (!n) return [];
  if (n.kind === "subunit") return ["subunit"];
  if (n.kind === "unit") return ["unit", "through_unit"];
  if (n.kind === "book") return ["whole_book", "custom"];
  return [];
}

/** Builds a validated scope. Unknown nodes, wrong kinds and empty custom selections are rejected, never widened. */
export function buildScope(ix: CatalogueIndex, mode: string, nodeId: string, custom: string[] = [], skills: string[] = []): Scope {
  const n = ix.nodes.get(nodeId);
  if (!n) throw new ScopeError(`Unknown scope node: ${nodeId}`);
  const base = skills.length ? { skills } : {};
  const need = (kind: string) => { if (n.kind !== kind) throw new ScopeError(`${mode} scope needs a ${kind}, got ${n.kind}`); };
  switch (mode) {
    case "subunit": need("subunit"); return { kind: "node", node_ids: [n.id], include_descendants: true, ...base };
    case "unit": need("unit"); return { kind: "node", node_ids: [n.id], include_descendants: true, ...base };
    case "whole_book": need("book"); return { kind: "node", node_ids: [n.id], include_descendants: true, ...base };
    case "through_unit": {
      need("unit");
      const book = n.parent_id ? ix.nodes.get(n.parent_id) : undefined;
      if (!book || book.kind !== "book" || n.ordinal === null) throw new ScopeError("Cumulative scope requires a numbered unit in a book");
      return { kind: "through_unit", node_ids: [book.id], include_descendants: true, through_unit_id: n.id, ...base };
    }
    case "custom": {
      need("book");
      const ids = [...new Set(custom)];
      if (!ids.length) throw new ScopeError("Custom scope needs at least one selected unit");
      for (const id of ids) {
        let cur = ix.nodes.get(id);
        if (!cur) throw new ScopeError(`Unknown scope node: ${id}`);
        while (cur && cur.id !== n.id) cur = cur.parent_id ? ix.nodes.get(cur.parent_id) : undefined;
        if (!cur) throw new ScopeError(`Custom selection ${id} is outside ${n.id}`);
      }
      return { kind: "custom", node_ids: ids, include_descendants: true, ...base };
    }
    default: throw new ScopeError(`Unknown practice mode: ${mode}`);
  }
}

/** Scope → unique canonical approved items, then game eligibility. Game-specific builders run afterwards. */
export function resolvePool(pack: QuestionPack, ix: CatalogueIndex, scope: Scope, ctx: CtxLookup, gameId?: string): BankQuestion[] {
  return (selectQuestions(pack, ix, scope, gameId) as unknown as BankQuestion[])
    .map((q) => ({ ...q, canonical_id: canonicalId(q.canonical_id, pack.id_aliases) }))
    .filter((q) => isEligible(q, ctx));
}

export type AssessmentSession =
  | { status: "ready"; id: string; title_en: string; sections: { id: string; title_en: string | null; questions: BankQuestion[] }[]; time_limit_seconds: number | null; official_max_marks: number | null }
  | { status: "incomplete" | "unavailable"; id: string; missing: string[]; reason: string };
type Section = { id?: string; title_en?: string | null; source_label?: string; question_ids?: string[] };

/** A fixed assessment keeps its exact ordered list and sections. Any missing item makes the whole assessment incomplete. */
export function assessmentSession(pack: QuestionPack, a: Assessment, ctx: CtxLookup): AssessmentSession {
  if (a.status !== "ready" || !a.question_ids.length) return { status: "unavailable", id: a.id, missing: [], reason: "awaiting_source" };
  const playable = new Map(selectQuestions(pack, { nodes: new Map(), children: new Map() }, { kind: "custom", node_ids: [], include_descendants: false, question_ids: a.question_ids }).map((q) => [q.id, q as unknown as BankQuestion]));
  const missing: string[] = [];
  const seen = new Set<string>();
  const byId = new Map<string, BankQuestion>();
  for (const id of a.question_ids) {
    const c = canonicalId(id, pack.id_aliases);
    if (seen.has(c)) return { status: "incomplete", id: a.id, missing: [id], reason: "repeated_item" };
    seen.add(c);
    const q = playable.get(c);
    if (!q || !isEligible(q, ctx)) missing.push(id); else byId.set(id, q);
  }
  if (missing.length) return { status: "incomplete", id: a.id, missing, reason: "missing_items" };
  const raw = (a["sections"] as Section[] | undefined) ?? [];
  const sections = raw.length ? raw.map((s, i) => ({ id: s.id ?? s.source_label ?? `s${i + 1}`, title_en: s.title_en ?? s.source_label ?? null, ids: s.question_ids ?? [] })) : [{ id: "s1", title_en: null, ids: a.question_ids }];
  const inSections = sections.flatMap((s) => s.ids);
  if (inSections.length !== a.question_ids.length || inSections.some((id, i) => id !== a.question_ids[i])) return { status: "incomplete", id: a.id, missing: [], reason: "sections_do_not_match_question_list" };
  return {
    status: "ready", id: a.id, title_en: a.title_en,
    sections: sections.map((s) => ({ id: s.id, title_en: s.title_en, questions: s.ids.flatMap((id) => { const q = byId.get(id); return q ? [q] : []; }) })),
    time_limit_seconds: a.time_limit_seconds ?? null, official_max_marks: a.official_max_marks ?? null,
  };
}

/** Recommendations only from reviewed edges with identified editions, shared targets and page evidence. Bidirectional. */
export function recommendedAlignments(pack: AlignmentPack, ix: CatalogueIndex, filter: { book?: string | undefined; unit?: string | undefined } = {}) {
  const inside = (id: string, root?: string) => { if (!root) return true; let n = ix.nodes.get(id); while (n) { if (n.id === root) return true; n = n.parent_id ? ix.nodes.get(n.parent_id) : undefined; } return false; };
  return pack.alignments.filter((e: Alignment) => {
    const from = ix.nodes.get(e.from_node_id), to = ix.nodes.get(e.to_node_id);
    const targets = e["shared_targets"], evidence = e["evidence"];
    const ok = (e.review_status === "reviewed" || e.review_status === 'ready' && ['reviewed_by_assistant', 'reviewed_by_teacher'].includes(String(e['verification_status']))) && from?.edition_id && to?.edition_id && Array.isArray(targets) && targets.length > 0
      && Array.isArray(evidence) && evidence.length > 0 && evidence.every((x: { pages?: unknown }) => Array.isArray(x?.pages) && x.pages.length > 0);
    if (!ok) return false;
    const target = filter.unit ?? filter.book;
    return !target || inside(e.from_node_id, target) || inside(e.to_node_id, target);
  });
}
export const ALIGNMENTS = PILOT_ALIGNMENTS;
export function reviewedPracticeScope(mode: PracticeModeId, nodeId: string) {
  if (mode === 'custom' || mode === 'whole_book') return undefined;
  const type = mode === 'unit' ? ['unit', 'whole_unit'] : [mode];
  return PILOT_SELECTIONS.find(s => s.anchor_node_id === nodeId && type.includes(s.selection_type))?.scope;
}

// ---------- Live wrappers (bundled release + browser-local reviewed additions) ----------
let live: { key: string; pack: QuestionPack } | null = null;
export function livePack(catalogue: Catalogue, version: number): QuestionPack {
  const key = String(version);
  if (live?.key === key) return live.pack;
  const legacy: LegacyPack = { ...(RAW_RELEASE as LegacyPack), schema_version: "1.0.0" as const, questions: playableSource().filter(q => Number.isInteger(q.grade) && Number.isInteger(q.term)) as unknown as LegacyPack["questions"], contexts: [...CONTEXTS, ...overlayContexts()] as unknown as NonNullable<LegacyPack["contexts"]>, id_aliases: ID_ALIASES };
  const school = adaptLegacySchoolPack(legacy, catalogue, { packId: "school-live" });
  live = { key, pack: { ...school, questions: [...school.questions, ...PILOT.questions], contexts: [...school.contexts, ...PILOT.contexts], sources: [...school.sources, ...PILOT.sources], assets: PILOT.assets, assessments: PILOT.assessments, vocabulary_entries: PILOT.vocabulary_entries } };
  return live.pack;
}
export const liveCtx: CtxLookup = contextById;
export type { BankContext };
