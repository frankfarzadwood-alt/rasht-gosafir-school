/** Native-v2 static release. Original canonical question payloads are never rewritten. */
import raw from '@/data/pilot/question_pack.pilot.json';
import selections from '@/data/pilot/practice_selections.pilot.json';
import baseCatalogue from '@/data/foundation/catalogue.json';
import pilotCatalogue from '@/data/pilot/catalogue.json';
import alignmentRaw from '@/data/pilot/alignments.json';
import audioA from '@/assets/pilot/evolve1.quiz.u01.a.audio.mp3.asset.json';
import audioB from '@/assets/pilot/evolve1.quiz.u01.b.audio.mp3.asset.json';
import quizImage from '@/assets/pilot/evolve1.quiz.u01.b.paper.c.image.png.asset.json';
import workbookImage from '@/assets/pilot/evolve1.workbook.p010.png.asset.json';
import type { Catalogue, QuestionPack, Scope, AlignmentPack } from './contracts';

export const PILOT = raw as unknown as QuestionPack;
const nodes = new Map((baseCatalogue as unknown as Catalogue).nodes.map(n => [n.id, n]));
for (const n of (pilotCatalogue as unknown as Catalogue).nodes) nodes.set(n.id, { ...nodes.get(n.id), ...n });
export const LIVE_CATALOGUE: Catalogue = { ...baseCatalogue, nodes: [...nodes.values()] } as unknown as Catalogue;
export const PILOT_SELECTIONS = selections.selections as unknown as {
  id: string; title_en: string; anchor_node_id: string; selection_type: string; scope: Scope; expected_ready_count: number; counted_canonical_question_ids: string[];
}[];
const pointers: Record<string, { url: string }> = {
  'evolve1.quiz.u01.a.audio': audioA, 'evolve1.quiz.u01.b.audio': audioB,
  'evolve1.quiz.u01.b.paper.c.image': quizImage, 'evolve1.workbook.p010': workbookImage,
};
export function mediaAsset(ref: unknown) {
  const id = typeof ref === 'string' ? ref : ref && typeof ref === 'object' && 'asset_id' in ref ? String(ref.asset_id) : '';
  const a = PILOT.assets.find(a => a.id === id);
  const pointer = pointers[id];
  return a?.review_status === 'ready' && pointer ? { ...a, url: pointer.url, alt: String(a['alt_en'] ?? '') } : null;
}
/** Adapt only the alignment field names; preserve status, evidence and reviewer provenance. */
export const PILOT_ALIGNMENTS = { ...alignmentRaw, alignments: alignmentRaw.alignments.map(e => ({
  ...e, from_node_id: e.source_node_id, to_node_id: e.target_node_id, relationship: e.relationship_type,
})) } as unknown as AlignmentPack;