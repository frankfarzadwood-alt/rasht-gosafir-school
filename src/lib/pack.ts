/** Pure validation + upsert planning for reviewed ready packs. Storage lives in localBank.ts. */
import { ineligibility, type Context, type Question } from "./bank";

export type StoredQ = { id: string; q: Question; version: string; seq: number };
export type StoredC = { id: string; c: Context; version: string };
export type PackPlan = {
  version: string; total: number; duplicates: number; notReady: number; excluded: number;
  newIds: string[]; updated: string[]; unchanged: number;
  conflicts: { id: string; reason: string }[];
  errors: { id: string; message: string }[];
  accept: Question[]; acceptCtx: Context[];
};
const REQUIRED = ["id", "canonical_id", "grade", "term", "granularity", "skill", "format", "answer", "assets", "review_status", "options", "eligible_games"] as const;

/** Fields that define what a learner sees and how it is graded. Source/provenance trimming does not count as a content change. */
export const contentKey = (q: Question) => JSON.stringify([
  q.grade, q.term, q.format, q.skill, q.prompt_en, q.options, q.context_id, q.reorder_tokens, q.pairs, q.word_bank,
  q.answer.value, q.answer.correct_option_id, [...q.answer.accepted_answers].sort(), q.answer.verification_status,
]);
const ctxKey = (c: Context) => JSON.stringify([c.kind, c.text, c.review_status]);

export function planPack(
  env: unknown,
  baseline: Map<string, Question>, baseCtx: Map<string, Context>,
  local: Map<string, StoredQ>, localCtx: Map<string, StoredC>,
): PackPlan {
  const e = env as { questions?: unknown[]; contexts?: unknown[]; content_version?: string } | unknown[];
  const rows = Array.isArray(e) ? e : e?.questions;
  const ctxRows = (Array.isArray(e) ? [] : e?.contexts) ?? [];
  const version = (!Array.isArray(e) && typeof e?.content_version === "string" && e.content_version) || "0";
  const p: PackPlan = { version, total: 0, duplicates: 0, notReady: 0, excluded: 0, newIds: [], updated: [], unchanged: 0, conflicts: [], errors: [], accept: [], acceptCtx: [] };
  if (!Array.isArray(rows)) { p.errors.push({ id: "(file)", message: "missing questions array" }); return p; }

  // Contexts: only ready contexts with text are usable; a different text for a bundled context is a conflict.
  const staged = new Map<string, Context>();
  for (const raw of ctxRows) {
    const c = raw as Context;
    if (!c?.id) continue;
    if (c.review_status !== "ready" || !c.text) continue;
    const b = baseCtx.get(c.id);
    if (b) { if (ctxKey(b) !== ctxKey(c)) p.conflicts.push({ id: c.id, reason: "context differs from bundled approved context; bundled kept" }); continue; }
    const l = localCtx.get(c.id);
    if (l && ctxKey(l.c) !== ctxKey(c) && !(version > l.version)) { p.conflicts.push({ id: c.id, reason: `context differs; pack version ${version} not newer than stored ${l.version}` }); continue; }
    staged.set(c.id, c);
  }
  const lookup = (id: string | null) => (id && (staged.get(id) ?? localCtx.get(id)?.c ?? baseCtx.get(id))) || null;

  const seen = new Set<string>();
  const usedCtx = new Set<string>();
  for (const raw of rows) {
    p.total++;
    const q = raw as Question;
    const missing = REQUIRED.filter((k) => (q as unknown as Record<string, unknown>)?.[k] === undefined);
    if (missing.length) { p.errors.push({ id: q?.id ?? "(no id)", message: `missing: ${missing.join(", ")}` }); continue; }
    if (![7, 8, 9, 10, 11, 12].includes(q.grade) || ![1, 2].includes(q.term)) { p.errors.push({ id: q.id, message: "invalid grade/term" }); continue; }
    if (seen.has(q.id)) { p.duplicates++; continue; }
    seen.add(q.id);
    if (q.review_status === "excluded") { p.excluded++; continue; }
    if (q.review_status !== "ready") { p.notReady++; continue; }
    const why = ineligibility(q, lookup);
    if (why.length) { p.errors.push({ id: q.id, message: `marked ready but fails: ${why.join(", ")}` }); continue; }
    const b = baseline.get(q.id);
    if (b) {
      if (contentKey(b) === contentKey(q)) p.unchanged++;
      else p.conflicts.push({ id: q.id, reason: "differs from bundled reviewed version; bundled kept" });
      continue;
    }
    const l = local.get(q.id);
    if (l) {
      if (contentKey(l.q) === contentKey(q)) { p.unchanged++; continue; }
      if (!(version > l.version)) { p.conflicts.push({ id: q.id, reason: `pack version ${version} not newer than stored ${l.version}` }); continue; }
      p.updated.push(q.id);
    } else p.newIds.push(q.id);
    p.accept.push(q);
    if (q.context_id && staged.has(q.context_id)) usedCtx.add(q.context_id);
  }
  p.acceptCtx = [...usedCtx].map((id) => staged.get(id)!);
  return p;
}
