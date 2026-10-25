import { EXPANSION,EXERCISE_HOLDS } from './content/expansion';
import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {LIBRARY,SOURCE_TASKS} from './content/library';
import {BOOK_RELEASES,BOOK_CONTENT,LIVE_CATALOGUE,mediaAsset,PILOT} from './content/pilot';
import {OXFORD} from './content/oxford';import {validateQuestionPack} from './content/validate';
import {catalogueIndex,nodeScope,scopeActivities} from './learning';
import {isEligible,type Question,contextById} from './bank';import {assessmentSession} from './scope';
describe('consolidated source release',()=>{
 it('appends a unique release while preserving original order and payloads',()=>{
  expect(BOOK_RELEASES).toEqual([PILOT,OXFORD,LIBRARY,EXPANSION]);expect(new Set(BOOK_CONTENT.questions.map(q=>q.canonical_id)).size).toBe(BOOK_CONTENT.questions.length);expect(validateQuestionPack(LIBRARY,catalogueIndex)).toEqual([]);expect(LIBRARY.questions.filter(q=>!EXERCISE_HOLDS.has(q.id)&&!isEligible(q as unknown as Question)).map(q=>q.id)).toEqual([]);
 });
 it('has original source exercises in all 17 books and all 477 units',()=>{
  const books=LIVE_CATALOGUE.nodes.filter(n=>n.kind==='book'),units=LIVE_CATALOGUE.nodes.filter(n=>n.kind==='unit');expect(books).toHaveLength(17);expect(units).toHaveLength(477);
  for(const n of [...books,...units])expect(scopeActivities(nodeScope(n.id)).filter(t=>t.kind==='workbook').length,n.id).toBeGreaterThan(0);
  expect(new Set(SOURCE_TASKS.map(t=>t.id)).size).toBe(SOURCE_TASKS.length);expect(SOURCE_TASKS.filter(t=>t.kind==='quiz')).toHaveLength(120);expect(SOURCE_TASKS.some(t=>t.book_id==='ielts-vocabulary-65'&&t.kind==='writing')).toBe(true);
 });
 it('resolves and hashes every page/recording and never uses a key image in a scored question',()=>{
  const byId=new Map(LIBRARY.assets.map(a=>[a.id,a]));
  for(const a of LIBRARY.assets){expect(mediaAsset(a.id)?.url,a.id).toBe(a.path);const bytes=readFileSync(new URL('../../public'+a.path,import.meta.url));expect(createHash('sha256').update(bytes).digest('hex'),a.id).toBe(a.sha256);if(a.kind==='image')expect(bytes.subarray(8,12).toString(),a.id).toBe('WEBP');}
  for(const q of LIBRARY.questions)for(const ref of q.assets.required_asset_ids??[])expect(byId.get(ref)?.['source_role'],q.id).not.toBe('answer_key');
  for(const t of SOURCE_TASKS)for(const ref of [...t.images,...t.answer_images,...t.audio_ids])expect(mediaAsset(ref),t.id).not.toBeNull();
 },30000);
 it('withholds mismatched keys and never shortens an incomplete fixed paper',()=>{
  expect(LIBRARY.questions.some(q=>q.id.startsWith('evolve-3.quiz.u012.b'))).toBe(false);expect(SOURCE_TASKS.find(t=>t.id==='study.evolve-3.quiz.u012.b')!.answer_images).toEqual([]);
  for(const a of LIBRARY.assessments){const s=assessmentSession(BOOK_CONTENT,a,contextById);expect(s.status==='ready',a.id).toBe(a.status==='ready');if(s.status==='ready')expect(s.sections.flatMap(x=>x.questions.map(q=>q.id)),a.id).toEqual(a.question_ids);}
 });
 it('keeps every listening transcript behind the answer phase',()=>{
  const ts=LIBRARY.contexts.filter(c=>c.kind==='listening_transcript');expect(ts.length).toBeGreaterThan(0);expect(ts.every(c=>c['display_policy']==='after_answer_only')).toBe(true);
 });
 it('binds moved sections to their matching key blocks and verifies complete item counts',()=>{
  const find=(s:string,n=1)=>LIBRARY.questions.find(q=>q.id===`evolve-2.quiz.u001.b.${s}.${String(n).padStart(2,'0')}`)!;
  expect(find('e',3).answer.value).toBe('true');expect(find('e',3).format).toBe('true_false');expect(find('e',3).source['answer_key_section']).toBe('A');expect(find('a').answer.value).toBe('b');expect(find('b').answer.value).toBe('hairbrush');expect(find('c').answer.value).toBe('am');expect(find('d').answer.value).toBe('Whose');expect(find('f').answer.value).toBe('false');expect(LIBRARY.questions.some(q=>q.id.startsWith('evolve-3.quiz.u008.b'))).toBe(false);
  for(const a of LIBRARY.assessments.filter(a=>a.status==='ready'))for(const s of a['sections'] as {question_ids:string[]}[]){const first=LIBRARY.questions.find(q=>q.id===s.question_ids[0])!;expect(first.source['printed_item_count'],a.id).toBe(s.question_ids.length);}
 });
});
