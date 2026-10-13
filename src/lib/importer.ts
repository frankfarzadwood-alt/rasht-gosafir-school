import { ineligibility, type Question } from "./bank";

export type DryRun = {
  total: number; duplicates: number; ready: number; needsReview: number; excluded: number;
  newIds: number; updates: number; byTrack: Record<string, number>;
  errors: { row: number; id?: string; message: string }[];
};
const REQUIRED = ["id", "canonical_id", "grade", "term", "source_id", "granularity", "skill", "format", "answer", "assets", "review_status", "source"];

/** Dry-run validation with idempotent semantics: rows are keyed by stable ID, so a re-import never doubles counts. */
export function validateEnvelope(env: unknown, existing: Set<string>): DryRun {
  const out: DryRun = { total: 0, duplicates: 0, ready: 0, needsReview: 0, excluded: 0, newIds: 0, updates: 0, byTrack: {}, errors: [] };
  const rows = Array.isArray(env) ? env : (env as { questions?: unknown[] })?.questions;
  if (!Array.isArray(rows)) { out.errors.push({ row: -1, message: "missing questions array" }); return out; }
  const seen = new Set<string>();
  rows.forEach((r, i) => {
    out.total++;
    const q = r as Partial<Question>;
    const missing = REQUIRED.filter((k) => (q as Record<string, unknown>)[k] === undefined);
    if (missing.length) { out.errors.push({ row: i, id: q.id, message: `missing: ${missing.join(", ")}` }); return; }
    if (![7, 8, 9, 10, 11, 12].includes(q.grade!)) { out.errors.push({ row: i, id: q.id, message: "invalid grade" }); return; }
    if (![1, 2].includes(q.term!)) { out.errors.push({ row: i, id: q.id, message: "invalid term" }); return; }
    if (seen.has(q.id!)) { out.duplicates++; return; }
    seen.add(q.id!);
    existing.has(q.id!) ? out.updates++ : out.newIds++;
    let status = q.review_status!;
    if (status === "ready" && ineligibility(q as Question).length) {
      status = "needs_review";
      out.errors.push({ row: i, id: q.id, message: `marked ready but fails: ${ineligibility(q as Question).join(", ")}` });
    }
    if (status === "ready") out.ready++; else if (status === "excluded") out.excluded++; else out.needsReview++;
    const k = `G${q.grade} T${q.term} ${status}`;
    out.byTrack[k] = (out.byTrack[k] ?? 0) + 1;
  });
  return out;
}
