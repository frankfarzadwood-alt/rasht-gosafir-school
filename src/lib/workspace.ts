/**
 * Pure rules for the device-local content-review workspace.
 * No storage here: idb.ts persists these records, the worker and admin screen call these functions.
 */
import { ineligibility, type Context, type CtxLookup, type Question } from "./bank";

export type LocalStatus = "approved" | "excluded" | "split" | null;
export type Approval = { at: string; checks: { atomic: boolean; answer: boolean; context: boolean } };
export type WsQuestion = {
  id: string;
  /** Exactly as imported; never edited in place. */
  original: Question;
  /** Local review edits, shallow over original. */
  override: Partial<Question> | null;
  local_status: LocalStatus;
  approval: Approval | null;
  conflict: { at: string; incoming: Question } | null;
  parent_id?: string | null;
  children?: string[];
  origin: "import" | "split";
  updated_at: string;
};
export type WsContext = {
  id: string; original: Context; override: Partial<Context> | null;
  local_status: "approved" | null; conflict: { at: string; incoming: Context } | null; updated_at: string;
};
export type MergeKind = "new" | "updated" | "unchanged" | "conflict";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const touched = (r: { override: unknown; local_status: unknown; approval?: unknown }) => !!(r.override || r.local_status || r.approval);

/** Stable-ID upsert. A changed source never silently replaces a record that has local review work. */
export function mergeQuestion(existing: WsQuestion | undefined, incoming: Question, now: string): { rec: WsQuestion; kind: MergeKind } {
  if (!existing) return { kind: "new", rec: { id: incoming.id, original: incoming, override: null, local_status: null, approval: null, conflict: null, origin: "import", updated_at: now } };
  if (same(existing.original, incoming)) {
    // Same content again: clear a stale conflict pointing to the same data, otherwise untouched.
    return { kind: "unchanged", rec: existing };
  }
  if (touched(existing)) {
    if (existing.conflict && same(existing.conflict.incoming, incoming)) return { kind: "conflict", rec: existing };
    return { kind: "conflict", rec: { ...existing, conflict: { at: now, incoming } } };
  }
  return { kind: "updated", rec: { ...existing, original: incoming, updated_at: now } };
}
export function mergeContext(existing: WsContext | undefined, incoming: Context, now: string): { rec: WsContext; kind: MergeKind } {
  if (!existing) return { kind: "new", rec: { id: incoming.id, original: incoming, override: null, local_status: null, conflict: null, updated_at: now } };
  if (same(existing.original, incoming)) return { kind: "unchanged", rec: existing };
  if (existing.override || existing.local_status) {
    if (existing.conflict && same(existing.conflict.incoming, incoming)) return { kind: "conflict", rec: existing };
    return { kind: "conflict", rec: { ...existing, conflict: { at: now, incoming } } };
  }
  return { kind: "updated", rec: { ...existing, original: incoming, updated_at: now } };
}

/** Effective record = original + local overrides + local status. Local approval is labelled as device-local, never as teacher. */
export function effectiveQuestion(r: WsQuestion): Question {
  const q = { ...r.original, ...(r.override ?? {}) } as Question;
  if (r.local_status === "excluded" || r.local_status === "split") return { ...q, review_status: "excluded" };
  if (r.local_status === "approved") {
    const answerEdited = !!r.override?.answer;
    const vs = q.answer.verification_status;
    const keep = !answerEdited && (vs === "reviewed_by_assistant" || vs === "reviewed_by_teacher");
    return {
      ...q, review_status: "ready", granularity: r.approval?.checks.atomic ? "atomic" : q.granularity,
      answer: { ...q.answer, verification_status: keep ? vs : "reviewed_locally" },
    };
  }
  // Any unapproved local edit sends the record back to review.
  if (r.override && q.review_status === "ready") return { ...q, review_status: "needs_review" };
  return q;
}
export function effectiveContext(r: WsContext): Context {
  const c = { ...r.original, ...(r.override ?? {}) } as Context;
  if (r.local_status === "approved") return { ...c, review_status: "ready" };
  if (r.override && c.review_status === "ready") return { ...c, review_status: "needs_review" };
  return c;
}

/** Reasons the person cannot approve yet. Empty = approval allowed. */
export function approvalBlockers(r: WsQuestion, checks: Approval["checks"], ctx: CtxLookup): string[] {
  const out: string[] = [];
  const base = effectiveQuestion({ ...r, local_status: null });
  if (base.granularity === "question_group") out.push("group_must_be_split_first");
  if (!checks.atomic) out.push("check_atomic");
  if (!checks.answer) out.push("check_answer");
  if (base.context_id && !checks.context) out.push("check_context");
  if ((base.assets?.source_image_required || base.assets?.source_audio_required) && !checks.context) out.push("check_assets");
  const candidate = effectiveQuestion({ ...r, local_status: "approved", approval: { at: "", checks } });
  out.push(...ineligibility(candidate, ctx).filter((x) => x !== "review_status_not_ready"));
  return [...new Set(out)];
}

/** Splits a question group into child records linked to the parent. Children start in review. */
export function splitGroup(r: WsQuestion, parts: string[], now: string): { parent: WsQuestion; children: WsQuestion[] } {
  const base = effectiveQuestion({ ...r, local_status: null });
  const children = parts.map((text, i): WsQuestion => {
    const id = `${r.id}__p${i + 1}`;
    const q: Question = {
      ...base, id, canonical_id: id, granularity: "atomic_candidate", prompt_en: text, options: [],
      answer: { ...base.answer, value: null, correct_option_id: null, accepted_answers: [], verification_status: "not_reviewed", provenance: "split_from_group" },
      review_status: "needs_review", review_issues: [...new Set([...base.review_issues, "split_child_needs_review"])], eligible_games: [],
    };
    return { id, original: q, override: null, local_status: null, approval: null, conflict: null, parent_id: r.id, origin: "split", updated_at: now };
  });
  return { parent: { ...r, local_status: "split", children: children.map((c) => c.id), updated_at: now }, children };
}

/** Starter items stay as adapted in the app; local approved items replace them by stable ID. */
export function buildPracticePack(starter: Question[], starterCtx: Context[], ws: WsQuestion[], wsCtx: WsContext[], now: string) {
  const localCtx = new Map(wsCtx.filter((c) => c.local_status === "approved").map((c) => [c.id, effectiveContext(c)]));
  const lookup: CtxLookup = (id) => (id && (localCtx.get(id) ?? starterCtx.find((c) => c.id === id))) || null;
  const byId = new Map(starter.map((q) => [q.id, q]));
  const wsMap = new Map(ws.map((r) => [r.id, r]));
  for (const r of ws) {
    if (r.local_status === "approved") byId.set(r.id, effectiveQuestion(r));
    else if (r.local_status === "excluded" || r.local_status === "split") byId.delete(r.id);
  }
  const strip = ({ extraction: _e, review_notes: _n, source_review_issues: _s, ...q }: Question & Record<string, unknown>) =>
    ({ ...q, review_issues: [], answer: { ...q.answer, key_candidates: [] }, source: { listing_url: q.source.listing_url, pdf_url: q.source.pdf_url, pages: q.source.pages } }) as Question;
  const questions = [...byId.values()].filter((q) => q.granularity === "atomic" && ineligibility(q, lookup).length === 0).map((q) => strip(q as Question & Record<string, unknown>));
  const ctxIds = new Set(questions.map((q) => q.context_id).filter(Boolean) as string[]);
  const contexts = [...ctxIds].map((id) => lookup(id)!).filter((c) => c.review_status === "ready");
  void wsMap;
  return {
    schema_version: "1.0.0", kind: "reviewed_practice_pack", generated_at: now,
    note: "Approved atomic items only. Local-device approvals are labelled reviewed_locally, not teacher-verified.",
    contexts, questions,
  };
}
