import first from '@/data/ielts-vocabulary60/native.1.pack.json?raw';
import second from '@/data/ielts-vocabulary60/native.2.pack.json?raw';
import catalogue from '@/data/ielts-vocabulary60/catalogue.json';
import selections from '@/data/ielts-vocabulary60/selections.json';
import type {CatalogueNode,QuestionPack,Scope} from './contracts';
export const IELTS_VOCABULARY60_RELEASES=[first,second].map(s=>JSON.parse(s) as QuestionPack);
export const IELTS_VOCABULARY60_NATIVE:QuestionPack={
 ...IELTS_VOCABULARY60_RELEASES[0]!,pack_id:'ielts-vocabulary60-native',release_id:'ielts-vocabulary60-native-r1',
 questions:IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.questions),contexts:IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.contexts),
 assets:[...new Map(IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.assets).map(a=>[a.id,a])).values()],
 sources:[...new Map(IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.sources).map(s=>[s['id'],s])).values()],
 vocabulary_entries:IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.vocabulary_entries),assessments:IELTS_VOCABULARY60_RELEASES.flatMap(p=>p.assessments),
};
export const IELTS_VOCABULARY60_NODES=catalogue as unknown as CatalogueNode[];
export const IELTS_VOCABULARY60_SELECTIONS=selections as unknown as {id:string;title_en:string;anchor_node_id:string;selection_type:string;scope:Scope;expected_ready_count:number;counted_canonical_question_ids:string[]}[];
