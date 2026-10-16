/**
 * Read-only audit of existing learner state against the current content release.
 * Stage 01 changes no storage layout: progress stays at localStorage "english-quest-progress-v1", version 1.
 * This never writes, never recomputes XP/mastery and never drops attempts — it only reports how records resolve.
 */
import type { Progress } from "@/lib/progress";
import { canonicalId } from "./core";

export const PROGRESS_STORAGE_KEY = "english-quest-progress-v1";
export const PROGRESS_SCHEMA_VERSION = 1;

export type ProgressAudit = {
  version: number; attempts: number; masteryRows: number; xpEntries: number;
  /** Attempt/mastery references that resolve to a live canonical item (directly or via alias). */
  resolved: number; viaAlias: number;
  /** References to IDs absent from this release: kept as history, simply not playable now. */
  unresolved: string[];
};

export function auditProgress(p: Progress, liveCanonicals: Set<string>, aliases: Record<string, string>): ProgressAudit {
  const refs = [...p.attempts.map((a) => a.canonical), ...Object.keys(p.mastery)];
  let resolved = 0, viaAlias = 0;
  const unresolved = new Set<string>();
  for (const r of refs) {
    const c = canonicalId(r, aliases);
    if (liveCanonicals.has(c)) { resolved++; if (c !== r) viaAlias++; } else unresolved.add(r);
  }
  return { version: p.version, attempts: p.attempts.length, masteryRows: Object.keys(p.mastery).length,
    xpEntries: Object.keys(p.xpLedger).length, resolved, viaAlias, unresolved: [...unresolved].sort() };
}
