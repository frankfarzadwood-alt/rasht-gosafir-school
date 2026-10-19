/** Native-v2 static release. Original canonical question payloads are never rewritten. */
import raw from '@/data/pilot/question_pack.pilot.json';
import selections from '@/data/pilot/practice_selections.pilot.json';
import baseCatalogue from '@/data/foundation/catalogue.json';
import pilotCatalogue from '@/data/pilot/catalogue.json';
import alignmentRaw from '@/data/pilot/alignments.json';
import { OXFORD } from './oxford';
import type { Catalogue, QuestionPack, Scope, AlignmentPack } from './contracts';

export const PILOT = raw as unknown as QuestionPack;
const nodes = new Map((baseCatalogue as unknown as Catalogue).nodes.map(n => [n.id, n]));
for (const n of (pilotCatalogue as unknown as Catalogue).nodes) nodes.set(n.id, { ...nodes.get(n.id), ...n });
export const LIVE_CATALOGUE: Catalogue = { ...baseCatalogue, nodes: [...nodes.values()] } as unknown as Catalogue;
export const PILOT_SELECTIONS = selections.selections as unknown as {
  id: string; title_en: string; anchor_node_id: string; selection_type: string; scope: Scope; expected_ready_count: number; counted_canonical_question_ids: string[];
}[];
/** Immutable asset pointers keyed by the file name of each release asset path. */
const files = import.meta.glob<{ url: string }>('../../assets/pilot/*.asset.json', { eager: true, import: 'default' });
const byFile = new Map(Object.entries(files).map(([p, v]) => [p.split('/').pop()!.replace(/\.asset\.json$/, ''), v]));
export const ASSET_POINTERS: Record<string, { url: string }> = Object.fromEntries(
  PILOT.assets.flatMap(a => { const v = byFile.get(String(a.path ?? '').split('/').pop() ?? ''); return v ? [[a.id, v]] : []; }));
/** Ordered, immutable content batches also define append-only book missions. */
export const BOOK_RELEASES = [PILOT, OXFORD];
export const BOOK_CONTENT: QuestionPack = {
  ...PILOT, release_id: OXFORD.release_id,
  questions: BOOK_RELEASES.flatMap(p => p.questions), contexts: BOOK_RELEASES.flatMap(p => p.contexts),
  assets: BOOK_RELEASES.flatMap(p => p.assets), vocabulary_entries: BOOK_RELEASES.flatMap(p => p.vocabulary_entries),
};
const assetsById = new Map(BOOK_CONTENT.assets.map(a => [a.id, a]));
const staticAssets = new Map(OXFORD.assets.filter(a => /^\/assets\/oxford-elementary-r2\/[a-z0-9.]+\.webp$/.test(a.path)).map(a => [a.id, { url: a.path }]));
const pointers = ASSET_POINTERS;
/** Same selection identities/scopes; release additions enter their actual catalogue section. */
export const LIVE_SELECTIONS = PILOT_SELECTIONS.map(s => {
  if (!s.anchor_node_id.startsWith('ows-elementary')) return s;
  const matches = OXFORD.questions.filter(q => q.placements.some(p => {
    let n = nodes.get(p.node_id);
    while (n) {
      if (s.scope.node_ids.includes(n.id)) return true;
      n = n.parent_id ? nodes.get(n.parent_id) : undefined;
    }
    return false;
  })).map(q => q.canonical_id);
  const ids = [...new Set([...s.counted_canonical_question_ids, ...matches])];
  return { ...s, expected_ready_count: ids.length, counted_canonical_question_ids: ids };
});
export function mediaAsset(ref: unknown) {
  const id = typeof ref === 'string' ? ref : ref && typeof ref === 'object' && 'asset_id' in ref ? String(ref.asset_id) : '';
  const a = assetsById.get(id);
  const pointer = pointers[id] ?? staticAssets.get(id);
  return a?.review_status === 'ready' && pointer ? { ...a, url: pointer.url, alt: String(a['alt_en'] ?? '') } : null;
}
/** Adapt only the alignment field names; preserve status, evidence and reviewer provenance. */
export const PILOT_ALIGNMENTS = { ...alignmentRaw, alignments: alignmentRaw.alignments.map(e => ({
  ...e, from_node_id: e.source_node_id, to_node_id: e.target_node_id, relationship: e.relationship_type,
})) } as unknown as AlignmentPack;