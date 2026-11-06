import raw from '@/data/evolve4/native.pack.json';
import catalogue from '@/data/evolve4/catalogue.json';
import recommendations from '@/data/evolve4/recommendations.json';
import targets from '@/data/evolve4/learning-targets.json';
import selections from '@/data/evolve4/selections.json';
import writing from '@/data/evolve4/writing.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const EVOLVE4_NATIVE = raw as unknown as QuestionPack;
export const EVOLVE4_NODES = catalogue as unknown as CatalogueNode[];
export const EVOLVE4_RECOMMENDATIONS = recommendations;
export const EVOLVE4_TARGETS = targets;
export const EVOLVE4_WRITING = writing;
export const EVOLVE4_SELECTIONS = selections as unknown as {
  id:string; title_en:string; anchor_node_id:string; selection_type:string; scope:Scope;
  expected_ready_count:number; counted_canonical_question_ids:string[];
}[];
