import first from '@/data/evolve6/native.1.pack.json?raw';
import second from '@/data/evolve6/native.2.pack.json?raw';
import catalogue from '@/data/evolve6/catalogue.json';
import recommendations from '@/data/evolve6/recommendations.json';
import targets from '@/data/evolve6/learning-targets.json';
import selections from '@/data/evolve6/selections.json';
import writing from '@/data/evolve6/writing.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const EVOLVE6_RELEASES=[first,second].map(s=>JSON.parse(s) as QuestionPack);
export const EVOLVE6_NATIVE:QuestionPack={
  ...EVOLVE6_RELEASES[0]!,pack_id:'evolve-6-native',release_id:'evolve-6-native-r1',
  questions:EVOLVE6_RELEASES.flatMap(p=>p.questions),contexts:EVOLVE6_RELEASES.flatMap(p=>p.contexts),
  assets:[...new Map(EVOLVE6_RELEASES.flatMap(p=>p.assets).map(a=>[a.id,a])).values()],
  sources:[...new Map(EVOLVE6_RELEASES.flatMap(p=>p.sources).map(s=>[s['id'],s])).values()],
  vocabulary_entries:EVOLVE6_RELEASES.flatMap(p=>p.vocabulary_entries),assessments:EVOLVE6_RELEASES.flatMap(p=>p.assessments),
};
export const EVOLVE6_NODES=catalogue as unknown as CatalogueNode[];
export const EVOLVE6_RECOMMENDATIONS=recommendations;
export const EVOLVE6_TARGETS=targets;
export const EVOLVE6_WRITING=writing;
export const EVOLVE6_SELECTIONS=selections as unknown as {
  id:string;title_en:string;anchor_node_id:string;selection_type:string;scope:Scope;
  expected_ready_count:number;counted_canonical_question_ids:string[];
}[];
