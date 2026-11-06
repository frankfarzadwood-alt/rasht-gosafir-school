import raw from '@/data/evolve3/native.pack.json';
import catalogue from '@/data/evolve3/catalogue.json';
import recommendations from '@/data/evolve3/recommendations.json';
import targets from '@/data/evolve3/learning-targets.json';
import selections from '@/data/evolve3/selections.json';
import writing from '@/data/evolve3/writing.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const EVOLVE3_NATIVE = raw as unknown as QuestionPack;
export const EVOLVE3_NODES = catalogue as unknown as CatalogueNode[];
export const EVOLVE3_RECOMMENDATIONS = recommendations;
export const EVOLVE3_TARGETS = targets;
export const EVOLVE3_WRITING = writing;
export const EVOLVE3_SELECTIONS = selections as unknown as {
  id:string; title_en:string; anchor_node_id:string; selection_type:string; scope:Scope;
  expected_ready_count:number; counted_canonical_question_ids:string[];
}[];
