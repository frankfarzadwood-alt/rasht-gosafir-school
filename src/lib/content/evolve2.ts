import raw from '@/data/evolve2/native.pack.json';
import catalogue from '@/data/evolve2/catalogue.json';
import recommendations from '@/data/evolve2/recommendations.json';
import targets from '@/data/evolve2/learning-targets.json';
import selections from '@/data/evolve2/selections.json';
import writing from '@/data/evolve2/writing.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const EVOLVE2_NATIVE = raw as unknown as QuestionPack;
export const EVOLVE2_NODES = catalogue as unknown as CatalogueNode[];
export const EVOLVE2_RECOMMENDATIONS = recommendations;
export const EVOLVE2_TARGETS = targets;
export const EVOLVE2_WRITING = writing;
export const EVOLVE2_SELECTIONS = selections as unknown as {
  id:string; title_en:string; anchor_node_id:string; selection_type:string; scope:Scope;
  expected_ready_count:number; counted_canonical_question_ids:string[];
}[];
