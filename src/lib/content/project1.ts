import raw from '@/data/project1/native.pack.json?raw';
import catalogue from '@/data/project1/catalogue.json';
import targets from '@/data/project1/learning-targets.json';
import writing from '@/data/project1/writing.json';
import selections from '@/data/project1/selections.json';
import type { CatalogueNode, QuestionPack, Scope } from './contracts';

export const PROJECT1_NATIVE = JSON.parse(raw) as QuestionPack;
export const PROJECT1_NODES = catalogue as unknown as CatalogueNode[];
export const PROJECT1_TARGETS = targets;
export const PROJECT1_WRITING = writing;
export const PROJECT1_SELECTIONS = selections as unknown as {
  id:string; title_en:string; anchor_node_id:string; selection_type:string; scope:Scope;
  expected_ready_count:number; counted_canonical_question_ids:string[];
}[];
/** Only actual D-lesson placements enable these six writing tasks; final revision is separate. */
export function project1WritingUnits(pool: {placements?: {node_id:string}[]}[]) {
  return [...new Set(pool.flatMap(q=>(q.placements??[]).flatMap(p=>{
    const m=p.node_id.match(/^project-1\.u00([1-6])\.s4$/);
    return m ? [Number(m[1])] : [];
  })))].sort((a,b)=>a-b);
}
