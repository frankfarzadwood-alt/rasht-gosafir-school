/** Native-v2 static release. Original canonical question payloads are never rewritten. */
import raw from '@/data/pilot/question_pack.pilot.json';
import selections from '@/data/pilot/practice_selections.pilot.json';
import baseCatalogue from '@/data/foundation/catalogue.json';
import pilotCatalogue from '@/data/pilot/catalogue.json';
import alignmentRaw from '@/data/pilot/alignments.json';
import { EVOLVE_NATIVE, nativeEvolveQuestion } from './evolve';
import { EVOLVE2_NATIVE, EVOLVE2_NODES, EVOLVE2_SELECTIONS } from './evolve2';
import { EVOLVE3_NATIVE, EVOLVE3_NODES, EVOLVE3_SELECTIONS } from './evolve3';
import { EVOLVE4_NATIVE, EVOLVE4_NODES, EVOLVE4_SELECTIONS } from './evolve4';
import { EVOLVE5_NATIVE, EVOLVE5_NODES, EVOLVE5_SELECTIONS } from './evolve5';
import { EVOLVE6_NATIVE, EVOLVE6_RELEASES, EVOLVE6_NODES, EVOLVE6_SELECTIONS } from './evolve6';
import { PROJECT1_NATIVE, PROJECT1_NODES, PROJECT1_SELECTIONS } from './project1';
import { PROJECT2_NATIVE, PROJECT2_NODES, PROJECT2_SELECTIONS } from './project2';
import { PROJECT3_NATIVE, PROJECT3_NODES, PROJECT3_SELECTIONS } from './project3';
import { PROJECT4_NATIVE, PROJECT4_NODES, PROJECT4_SELECTIONS } from './project4';
import { PROJECT5_NATIVE, PROJECT5_NODES, PROJECT5_SELECTIONS } from './project5';
import { IELTS_PENDING_NODES } from './ielts-pending';
import { IELTS_GRAMMAR_NATIVE,IELTS_GRAMMAR_NODES,IELTS_GRAMMAR_SELECTIONS } from './ielts-grammar65';
import { IELTS_VOCABULARY65_NATIVE,IELTS_VOCABULARY65_NODES,IELTS_VOCABULARY65_SELECTIONS } from './ielts-vocabulary65';
import { IELTS_VOCABULARY60_RELEASES,IELTS_VOCABULARY60_NATIVE,IELTS_VOCABULARY60_NODES,IELTS_VOCABULARY60_SELECTIONS } from './ielts-vocabulary60';
import { MAXIMIZER_RELEASES,MAXIMIZER_NATIVE,MAXIMIZER_NODES,MAXIMIZER_SELECTIONS } from './ielts-maximizer';
import { NATIVE_OXFORD, OXFORD_NATIVE, OXFORD_SECTIONS, nativeOxfordQuestion } from './oxford-native';
import { OXFORD_INTERMEDIATE, OXFORD_INTERMEDIATE_NODES, OXFORD_INTERMEDIATE_RELEASES } from './oxford-intermediate';
import { OXFORD_UPPER_NODES, OXFORD_UPPER_RELEASES } from './oxford-upper';
import { selectQuestions } from './core';
import { refineNativeArtAsset } from './native-art';
import { publicAssetUrl } from '@/lib/public-asset';
import type { Catalogue, QuestionPack, Scope, AlignmentPack, Asset } from './contracts';

export const PILOT = raw as unknown as QuestionPack;
const nodes = new Map((baseCatalogue as unknown as Catalogue).nodes.map(n => [n.id, n]));
for (const n of (pilotCatalogue as unknown as Catalogue).nodes) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of EVOLVE2_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of EVOLVE3_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of OXFORD_INTERMEDIATE_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of EVOLVE4_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of EVOLVE5_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of OXFORD_UPPER_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of EVOLVE6_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of PROJECT1_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of PROJECT2_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of PROJECT3_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of PROJECT4_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of PROJECT5_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of IELTS_PENDING_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of IELTS_GRAMMAR_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of IELTS_VOCABULARY65_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of IELTS_VOCABULARY60_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const n of MAXIMIZER_NODES) nodes.set(n.id, { ...nodes.get(n.id), ...n });
for (const s of OXFORD_SECTIONS) {
  const parent = nodes.get(s.id.replace(/\.s\d+$/, ''));
  nodes.set(s.id, { ...nodes.get(s.id), id:s.id, parent_id:parent?.id ?? null, kind:'subunit', title_en:`${s.letter} · ${s.title}`, title_fa:`بخش ${s.letter}`, ordinal:s.letter.charCodeAt(0)-64, edition_id:parent?.edition_id ?? null, source_label:s.letter, availability:'ready', structure_status:'verified_from_source', source_pages:s.pages });
}
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
export const NATIVE_PILOT: QuestionPack = { ...PILOT, questions: PILOT.questions.map(q => nativeOxfordQuestion(nativeEvolveQuestion(q))) };
export const BOOK_RELEASES = [NATIVE_PILOT, NATIVE_OXFORD, EVOLVE_NATIVE, OXFORD_NATIVE, EVOLVE2_NATIVE, EVOLVE3_NATIVE, ...OXFORD_INTERMEDIATE_RELEASES, EVOLVE4_NATIVE, EVOLVE5_NATIVE, ...OXFORD_UPPER_RELEASES, ...EVOLVE6_RELEASES, PROJECT1_NATIVE, PROJECT2_NATIVE, PROJECT3_NATIVE, PROJECT4_NATIVE, PROJECT5_NATIVE, IELTS_GRAMMAR_NATIVE, IELTS_VOCABULARY65_NATIVE, ...IELTS_VOCABULARY60_RELEASES, ...MAXIMIZER_RELEASES];
export const BOOK_CONTENT: QuestionPack = {
  ...PILOT, release_id: MAXIMIZER_NATIVE.release_id,
  questions: BOOK_RELEASES.flatMap(p => p.questions), contexts: BOOK_RELEASES.flatMap(p => p.contexts),
  assets: [...new Map(BOOK_RELEASES.flatMap(p => p.assets).map(a => [a.id, a])).values()], vocabulary_entries: BOOK_RELEASES.flatMap(p => p.vocabulary_entries),
  sources: BOOK_RELEASES.flatMap(p => p.sources), assessments: BOOK_RELEASES.flatMap(p => p.assessments),
};
const assetsById = new Map(BOOK_CONTENT.assets.map(a => [a.id, refineNativeArtAsset(a)]));
const staticAssets = new Map(BOOK_CONTENT.assets.filter(a => a.path.startsWith('/assets/')).map(a => [a.id, { url: a.path }]));
const pointers = ASSET_POINTERS;
/** Same selection identities/scopes; release additions enter their actual catalogue section. */
export const LIVE_SELECTIONS = [...PILOT_SELECTIONS.map(s => {
  if (s.anchor_node_id.startsWith('evolve-1') && !PILOT.assessments.some(a => a.id === s.id) && s.scope.kind !== 'assessment') {
    const anchor = nodes.get(s.anchor_node_id);
    const additionScope: Scope = s.selection_type === 'through_unit'
      ? {kind:'through_unit',node_ids:[anchor?.parent_id ?? 'evolve-1'],through_unit_id:s.anchor_node_id,include_descendants:true}
      : {kind:'node',node_ids:[s.anchor_node_id],include_descendants:true};
    const additions = selectQuestions(EVOLVE_NATIVE, LIVE_CATALOGUE, additionScope).map(q => q.canonical_id);
    const ids = [...new Set([...s.counted_canonical_question_ids, ...additions])];
    return { ...s, expected_ready_count: ids.length, counted_canonical_question_ids: ids, scope: { ...s.scope, ...(s.scope.question_ids ? {question_ids:ids} : {}) } };
  }
  if (!s.anchor_node_id.startsWith('ows-elementary')) return s;
  const matches = NATIVE_OXFORD.questions.filter(q => q.placements.some(p => {
    let n = nodes.get(p.node_id);
    while (n) {
      if (s.scope.node_ids.includes(n.id)) return true;
      n = n.parent_id ? nodes.get(n.parent_id) : undefined;
    }
    return false;
  })).map(q => q.canonical_id);
  const ids = [...new Set([...s.counted_canonical_question_ids, ...matches])];
  return { ...s, expected_ready_count: ids.length, counted_canonical_question_ids: ids };
}), ...EVOLVE2_SELECTIONS, ...EVOLVE3_SELECTIONS, ...EVOLVE4_SELECTIONS, ...EVOLVE5_SELECTIONS, ...EVOLVE6_SELECTIONS, ...PROJECT1_SELECTIONS, ...PROJECT2_SELECTIONS, ...PROJECT3_SELECTIONS, ...PROJECT4_SELECTIONS, ...PROJECT5_SELECTIONS, ...IELTS_GRAMMAR_SELECTIONS, ...IELTS_VOCABULARY65_SELECTIONS, ...IELTS_VOCABULARY60_SELECTIONS, ...MAXIMIZER_SELECTIONS];
export function mediaAsset(ref: unknown): (Asset & {url:string;alt:string}) | null {
  const id = typeof ref === 'string' ? ref : ref && typeof ref === 'object' && 'asset_id' in ref ? String(ref.asset_id) : '';
  const a = assetsById.get(id);
  const pointer = staticAssets.get(id) ?? pointers[id];
  return a?.review_status === 'ready' && pointer ? { ...a, url: publicAssetUrl(pointer.url), alt: String(a['alt_en'] ?? '') } : null;
}
/** Adapt only the alignment field names; preserve status, evidence and reviewer provenance. */
export const PILOT_ALIGNMENTS = { ...alignmentRaw, alignments: alignmentRaw.alignments.map(e => ({
  ...e, from_node_id: e.source_node_id, to_node_id: e.target_node_id, relationship: e.relationship_type,
})) } as unknown as AlignmentPack;
