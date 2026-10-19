import { useSyncExternalStore } from "react";
import { LIVE_CATALOGUE as catalogue } from './content/pilot';
import { BASELINE_VERSION, contextById, getBankVersion, ID_ALIASES, missions } from "@/lib/bank";
import { indexCatalogue, canonicalId } from "@/lib/content/core";
import { buildScope, livePack, resolvePool, reviewedPracticeScope, type PracticeModeId } from "@/lib/scope";
import type { Catalogue, CatalogueNode, Scope } from "@/lib/content/contracts";
import type { Progress } from "@/lib/progress";
import { fa, gradeLabel, termLabel } from "@/lib/fa";

export const catalogueIndex = indexCatalogue(catalogue as unknown as Catalogue);
export const nodeById = (id: string) => catalogueIndex.nodes.get(id);
export const childrenOf = (id: string | null) => [...catalogueIndex.nodes.values()].filter(n => n.parent_id === id).sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0));
export const nodeTitle = (n: CatalogueNode) => n.kind === "grade" && n.grade ? gradeLabel(n.grade) : fa(n.title_fa);
export function ancestorsOf(id: string): CatalogueNode[] {
  const out: CatalogueNode[] = [];
  let n = nodeById(id);
  while (n) { out.unshift(n); n = n.parent_id ? nodeById(n.parent_id) : undefined; }
  return out;
}
export const nodeScope = (id: string): Scope => ({ kind: "node", node_ids: [id], include_descendants: true });
/** Single approved-question service: scope → unique canonical items (live bundled + browser-local reviewed). Unknown scopes throw. */
export function scopeQuestions(scope: Scope, gameId?: string) {
  return resolvePool(livePack(catalogue as unknown as Catalogue, getBankVersion()), catalogueIndex, scope, contextById, gameId);
}
/** For display/restoration only: an invalid stored scope shows as unavailable instead of crashing. */
export function safeScopeQuestions(scope: Scope) { try { return scopeQuestions(scope); } catch { return []; } }
export const practiceScope = (mode: PracticeModeId, nodeId: string, custom: string[] = []) => {
  const scope = buildScope(catalogueIndex, mode, nodeId, custom);
  return reviewedPracticeScope(mode, nodeId) ?? scope;
};
export const scopeKey = (mode: string, nodeId: string, custom: string[] = []) => [mode, nodeId, ...[...custom].sort()].join(":");
/** Unique canonical items across saved courses (Home → My Learning). Unknown when none are ready. */
export function savedStats(ids: string[], p: Progress) {
  const qs = ids.flatMap(id => nodeById(id) ? safeScopeQuestions(nodeScope(id)) : []);
  return statsFor(new Set(qs.map(q => q.canonical_id)), p);
}
export function scopeStats(scope: Scope, p: Progress) {
  return statsFor(new Set(safeScopeQuestions(scope).map(q => q.canonical_id)), p);
}
/** Aggregates underlying unique items (never averages unit percentages). coverage = null means unknown, not 0%. */
function statsFor(ids: Set<string>, p: Progress) {
  const attempted = new Set(p.attempts.map(a => canonicalId(a.canonical, ID_ALIASES)).filter(id => ids.has(id))).size;
  const mastered = new Set(Object.entries(p.mastery).filter(([, m]) => m.mastered).map(([id]) => canonicalId(id, ID_ALIASES)).filter(id => ids.has(id))).size;
  return { total: ids.size, attempted, mastered, coverage: ids.size ? attempted / ids.size : null };
}
export type Bookmark = { nodeId: string; scope: Scope; game: string | null; release: string; mission?: string; practice?: PracticeModeId; custom?: string[]; selection?: string; ancestors: string[] };
export type LearningState = { version: 1; saved: string[]; current: Bookmark | null };
export const EMPTY_LEARNING: LearningState = { version: 1, saved: [], current: null };
export const LEARNING_KEY = "english-quest-learning-v1";
export function bookmark(id: string, game: string | null = null, mission?: string, practice?: { mode: PracticeModeId; custom?: string[] }): Bookmark {
  const scope = practice ? practiceScope(practice.mode, id, practice.custom) : nodeScope(id);
  return { nodeId: id, scope, game, release: BASELINE_VERSION, ...(mission === undefined ? {} : { mission }),
    ...(practice ? { practice: practice.mode, ...(practice.custom?.length ? { custom: practice.custom } : {}) } : {}), ancestors: ancestorsOf(id).map(n => n.id) };
}
export function toggleSaved(s: LearningState, id: string): LearningState {
  const n = nodeById(id);
  if (!n || !["book", "term"].includes(n.kind)) return s;
  return { ...s, saved: s.saved.includes(id) ? s.saved.filter(x => x !== id) : [...s.saved, id] };
}
export function restoreBookmark(b: Bookmark | null): Bookmark | null {
  if (!b) return null;
  const n = nodeById(b.nodeId);
  if (n) {
    const available = safeScopeQuestions(b.scope).length > 0;
    if (!b.game || available) return b;
  }
  const parent = [...b.ancestors].reverse().map(nodeById).find(n => n && safeScopeQuestions(nodeScope(n.id)).length > 0);
  return parent ? bookmark(parent.id) : n ? bookmark(n.id) : bookmark("school");
}
export function legacyBookmark(p: Progress): Bookmark | null {
  if (!p.grade) return null;
  const n = [...catalogueIndex.nodes.values()].find(n => n.kind === "term" && n.grade === p.grade && n.term === p.term);
  if (!n) return null;
  const a = [...p.attempts].reverse().find(a => a.grade === p.grade && a.term === p.term);
  const mission = missions(p.grade, p.term).find(m => !p.missionsDone.includes(m.id))?.id;
  return bookmark(n.id, a?.mode ?? "quest_trail", a?.mode && a.mode !== "quest_trail" ? undefined : mission);
}
export const courseTitle = (b: Bookmark) => {
  const n = nodeById(b.nodeId);
  return n?.kind === "term" && n.grade && n.term ? `${gradeLabel(n.grade)} · ${termLabel(n.term)}` : n ? nodeTitle(n) : "یادگیری";
};
let state = EMPTY_LEARNING;
let loaded = false;
const listeners = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const value = JSON.parse(localStorage.getItem(LEARNING_KEY) ?? "null") as LearningState | null;
    if (value?.version === 1 && Array.isArray(value.saved)) state = { ...EMPTY_LEARNING, ...value };
  } catch { /* navigation storage never affects progress */ }
}
export function setLearning(fn: (s: LearningState) => LearningState) {
  load(); const next = fn(state);
  if (JSON.stringify(next) === JSON.stringify(state)) return;
  state = next;
  try { localStorage.setItem(LEARNING_KEY, JSON.stringify(state)); } catch { /* keep session usable */ }
  listeners.forEach(l => l());
}
export function useLearning() {
  return useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, () => { load(); return state; }, () => EMPTY_LEARNING);
}
export const remember = (b: Bookmark) => setLearning(s => ({ ...s, current: b }));
/** Browsing a course must not erase a resumable game or mission. */
export const selectCourse = (s: LearningState, b: Bookmark): LearningState => s.current?.game ? s : { ...s, current: b };
export const rememberCourse = (b: Bookmark) => setLearning(s => selectCourse(s, b));