import raw from '@/data/evolve5/native.pack.json';
import catalogue from '@/data/evolve5/catalogue.json';
import recommendations from '@/data/evolve5/recommendations.json';
import targets from '@/data/evolve5/learning-targets.json';
import selections from '@/data/evolve5/selections.json';
import writing from '@/data/evolve5/writing.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const EVOLVE5_NATIVE = raw as unknown as QuestionPack;
export const EVOLVE5_NODES = catalogue as unknown as CatalogueNode[];
export const EVOLVE5_RECOMMENDATIONS = recommendations;
export const EVOLVE5_TARGETS = targets;
export const EVOLVE5_WRITING = writing;
export const EVOLVE5_SELECTIONS = selections as unknown as {
  id:string; title_en:string; anchor_node_id:string; selection_type:string; scope:Scope;
  expected_ready_count:number; counted_canonical_question_ids:string[];
}[];
