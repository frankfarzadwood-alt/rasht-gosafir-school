import targets from '@/data/ielts-grammar65/learning-targets.json';
import writing from '@/data/ielts-grammar65/writing.json';
import speaking from '@/data/ielts-grammar65/speaking.json';
import vocabularyTargets from '@/data/ielts-vocabulary65/learning-targets.json';
import vocabularyWriting from '@/data/ielts-vocabulary65/writing.json';
import vocabularySpeaking from '@/data/ielts-vocabulary65/speaking.json';
import band6Targets from '@/data/ielts-vocabulary60/learning-targets.json';
import band6Writing from '@/data/ielts-vocabulary60/writing.json';
import band6Speaking from '@/data/ielts-vocabulary60/speaking.json';
import maximizerSpeaking from '@/data/ielts-maximizer/speaking.json';
export type SpeakingTask={id:string;book_id:string;unit:number;node_id:string;title:string;intro_questions:string[];cue:string;points:string[];followups:string[];checks:string[];preparation_seconds:number;speaking_seconds:number;practice_part?:number;activation_question_ids?:string[]};
type Placed={placements?:{node_id:string}[]};
export const IELTS_GUIDES=[
 {id:'ielts-grammar-65',tracks:32,targets,writing,speaking,eyebrow:'IELTS · GRAMMAR IN CONTEXT',heading:'ساختار را بفهم، دقیق‌تر بیان کن',overview:'۲۵ درس از زمان‌های فعل تا جمله‌های شرطی، مجهول و اسم‌سازی؛ با شنیدن، جمله‌سازی، خواندن، نمودارهای تمرینی و نوشتن پیش برو. مرور آغازین و پایانی هرکدام ۵۰ پرسش ثابت دارند.'},
 {id:'ielts-vocabulary-65',tracks:43,targets:vocabularyTargets,writing:vocabularyWriting,speaking:vocabularySpeaking,eyebrow:'IELTS · VOCABULARY IN CONTEXT',heading:'واژه را در کاربرد یاد بگیر',overview:'۲۰ درس موضوعی و ۵ درس دربارهٔ یادگیری واژه و مهارت‌های آیلتس؛ با معنی، خانوادهٔ واژه، هم‌آیی، جمله‌سازی، شنیدن و متن‌های مستقل تمرین کن. پنج مرور ۳۰ پرسشی در پایان گروه‌های پنج‌درسی آماده‌اند. بخش‌بندی‌ها برای تمرین در برنامه طراحی شده‌اند.'},
 {id:'ielts-vocabulary-60',tracks:48,targets:band6Targets,writing:band6Writing,speaking:band6Speaking,eyebrow:'IELTS · VOCABULARY UP TO BAND 6.0',heading:'از واژه تا جمله و گفت‌وگو',overview:'۲۰ درس موضوعی و ۵ درس واژه‌سازی و نوشتن آکادمیک و جنرال؛ با معنی، هم‌آیی، جمله‌سازی، عکس‌های مستقل، شنیدن و متن‌های تمرینی یاد بگیر. پنج مرور ثابت ۴۰ پرسشی در پایان گروه‌های پنج‌درسی آماده‌اند. بخش‌بندی‌ها برای تمرین در برنامه طراحی شده‌اند.'},
];
export const ieltsGuideFor=(id:string)=>IELTS_GUIDES.find(g=>id===g.id||id.startsWith(g.id+'.'));
/** Personal tasks belong to their released application sections, never to an unrelated book or pool. */
export function ieltsWritingUnits(pool:Placed[],bookId?:string){
 return [...new Set(pool.flatMap(q=>(q.placements??[]).flatMap(p=>{
  const guide=IELTS_GUIDES.find(g=>(!bookId||g.id===bookId)&&p.node_id.startsWith(g.id+'.'));
  const unit=Number(p.node_id.match(/\.u(\d{3})\.s4$/)?.[1]);
  return guide&&guide.writing.some(t=>t.unit===unit)?[unit]:[];
 })))].sort((a,b)=>a-b);
}
export function ieltsSpeakingTasks(pool:(Placed&{id?:string})[]):SpeakingTask[]{
 const nodes=new Set(pool.flatMap(q=>(q.placements??[]).map(p=>p.node_id)));
 const ids=new Set(pool.map(q=>q.id));
 return [...IELTS_GUIDES.flatMap(g=>g.speaking),...maximizerSpeaking].filter((t:SpeakingTask)=>nodes.has(t.node_id)&&(!t.activation_question_ids||t.activation_question_ids.some(id=>ids.has(id))));
}
