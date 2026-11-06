import first from '@/data/ielts-maximizer/native.1.pack.json?raw';
import second from '@/data/ielts-maximizer/native.2.pack.json?raw';
import catalogue from '@/data/ielts-maximizer/catalogue.json';
import selections from '@/data/ielts-maximizer/selections.json';
import type {CatalogueNode,QuestionPack,Scope} from './contracts';
export const MAXIMIZER_RELEASES=[first,second].map(s=>JSON.parse(s) as QuestionPack);
export const MAXIMIZER_NATIVE:QuestionPack={
 ...MAXIMIZER_RELEASES[0]!,pack_id:'ielts-maximizer-native',release_id:'ielts-maximizer-native-r1',
 questions:MAXIMIZER_RELEASES.flatMap(p=>p.questions),contexts:MAXIMIZER_RELEASES.flatMap(p=>p.contexts),
 assets:MAXIMIZER_RELEASES.flatMap(p=>p.assets),sources:[...new Map(MAXIMIZER_RELEASES.flatMap(p=>p.sources).map(s=>[s['id'],s])).values()],
 vocabulary_entries:MAXIMIZER_RELEASES.flatMap(p=>p.vocabulary_entries),assessments:MAXIMIZER_RELEASES.flatMap(p=>p.assessments),
};
export const MAXIMIZER_NODES=catalogue as unknown as CatalogueNode[];
export const MAXIMIZER_SELECTIONS=selections as unknown as {id:string;title_en:string;anchor_node_id:string;selection_type:string;scope:Scope;expected_ready_count:number;counted_canonical_question_ids:string[]}[];
