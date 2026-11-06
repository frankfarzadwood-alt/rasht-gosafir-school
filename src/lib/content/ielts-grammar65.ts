import raw from '@/data/ielts-grammar65/native.pack.json?raw';
import catalogue from '@/data/ielts-grammar65/catalogue.json';
import selections from '@/data/ielts-grammar65/selections.json';
import type {CatalogueNode,QuestionPack,Scope} from './contracts';
export const IELTS_GRAMMAR_NATIVE=JSON.parse(raw) as QuestionPack;
export const IELTS_GRAMMAR_NODES=catalogue as unknown as CatalogueNode[];
export const IELTS_GRAMMAR_SELECTIONS=selections as unknown as {id:string;title_en:string;anchor_node_id:string;selection_type:string;scope:Scope;expected_ready_count:number;counted_canonical_question_ids:string[]}[];
