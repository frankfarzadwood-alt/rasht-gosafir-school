import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import { PROJECT5_NATIVE } from './content/project5';
import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PROJECT4_NATIVE,PROJECT4_NODES,PROJECT4_TARGETS,PROJECT4_WRITING,PROJECT4_SELECTIONS} from './content/project4';
import {PROJECT3_NATIVE} from './content/project3';
import {BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,PILOT,mediaAsset} from './content/pilot';
import {catalogueIndex,nodeScope,practiceScope,scopeQuestions} from './learning';
import {validateCatalogue,validateQuestionPack} from './content/validate';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,grammarItems,ineligibility,isAccepted,poolAvailability,poolMissions,sentenceItems,type Question} from './bank';
import {projectGuideFor,projectWritingUnits} from './content/project-series';
const qs=PROJECT4_NATIVE.questions as unknown as Question[];

describe('Project 4 native release',()=>{
 it('adds the six source units and separately named opening and final reviews',()=>{
  expect(qs).toHaveLength(880);expect(BUNDLED_QUESTIONS).toHaveLength(24647+PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(PROJECT4_NODES).toHaveLength(39);expect(PROJECT4_TARGETS).toHaveLength(24);expect(PROJECT4_WRITING).toHaveLength(6);expect(PROJECT4_WRITING.every(t=>t.checks.length===4)).toBe(true);
  expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);expect(validateQuestionPack(PROJECT4_NATIVE,catalogueIndex)).toEqual([]);expect(qs.flatMap(q=>ineligibility(q).map(r=>[q.id,r]))).toEqual([]);expect(new Set(qs.map(q=>q.canonical_id)).size).toBe(qs.length);expect(PROJECT4_NATIVE.sources).toHaveLength(2);
  expect(scopeQuestions(nodeScope('project-4.introduction'))).toHaveLength(21);expect(scopeQuestions(nodeScope('project-4.revision'))).toHaveLength(35);
  for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);}
 });
 it('uses equal printed/PDF pages and exact progress-check recording placements',()=>{
  for(const[id,pages]of [['project-4.introduction',[2,3]],['project-4.u001.s1',[4,5]],['project-4.u003.s1',[24,25]],['project-4.u006.s5',[62,63]],['project-4.revision',[64,65]]] as const)expect(PROJECT4_NODES.find(n=>n.id===id)?.['source_pages']).toEqual(pages);
  expect(qs.find(q=>q.id==='project4.native.listen.t2.1')?.placements?.[0]?.node_id).toBe('project-4.introduction');expect(qs.find(q=>q.id==='project4.native.listen.t33.1')?.placements?.[0]?.node_id).toBe('project-4.revision');
  for(let n=1;n<=6;n++){const track=7+(n-1)*5,q=qs.find(q=>q.id===`project4.native.listen.t${track}.1`)!;expect(q.placements?.[0]?.node_id).toBe(`project-4.u00${n}.s5`);expect(q.source.pages).toEqual([n===1?12:n*10+3]);}
  for(const q of qs)expect(q.source.pages.every(p=>p>=2&&p<=65),q.id).toBe(true);
 });
 it('covers materials, garments, all 33 body words and the common game modes',()=>{
  expect(flashcardItems(qs)).toHaveLength(327);expect(grammarItems(qs)).toHaveLength(288);expect(sentenceItems(qs)).toHaveLength(24);expect(projectWritingUnits(qs,4)).toEqual([1,2,3,4,5,6]);expect(projectWritingUnits(qs,3)).toEqual([]);expect(projectGuideFor('project-4.u001')?.book).toBe(4);
  const words=new Set(PROJECT4_NATIVE.vocabulary_entries.map(v=>v['lemma']));for(const w of ['iron','steel','copper','cotton','polyester','striped','checked','plain','baggy','flared','T-shirt','shirt','jumper','jacket','dress','skirt','shorts','trousers','jeans','trainers','boots','top','cap','shoes','eye','forehead','palm','thigh','shin','nose','teeth','stomach','hand','bottom','ankle','wrist','finger','thumb','elbow','knee','arm','lips','leg','chest','heel','head','throat','shoulder','hair','calf','toes','mouth','tongue','foot','back','neck','ear','autograph','knight','armour','fossil fuels','run out of','agreement'])expect(words.has(w),w).toBe(true);
  for(let n=1;n<=6;n++){const id=`project-4.u00${n}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(pool.every(q=>q.id.startsWith('project4.'))).toBe(true);expect(a.flashcards.count,id).toBeGreaterThan(40);expect(a.grammar_detective.count,id).toBeGreaterThan(20);expect(a.listening_lab.count,id).toBeGreaterThan(20);expect(a.sentence_builder.count).toBe(4);expect(a.reading_explorer.count).toBe(1);expect(a.writing_studio.count).toBe(1);for(let s=1;s<=5;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length).toBeGreaterThan(5);}
  for(const id of ['project-4.introduction','project-4.revision','project-4.u006.s5'])expect(poolAvailability(scopeQuestions(nodeScope(id))).writing_studio.count,id).toBe(0);
 });
 it('retains all 32 supplied scripts with after-answer locks and source-scene boundaries',()=>{
  const audio=PROJECT4_NATIVE.assets.filter(a=>a.kind==='audio');expect(audio).toHaveLength(32);expect(audio.map(a=>a['track'])).toEqual(Array.from({length:32},(_,i)=>i+2));expect(qs.filter(q=>q.skill==='listening')).toHaveLength(166);expect(PROJECT4_NATIVE.contexts.filter(c=>c.kind==='listening_transcript')).toHaveLength(32);
  for(const a of audio){const c=contextById(a.id+'.review')!;expect(c.display_policy).toBe('after_answer_only');expect(c).toMatchObject({spoken_transcript:true});expect(c.text,a.id).not.toMatch(/Copyright|University Press|Workbook Audio scripts|^T\d+/m);expect(c.text!.length).toBeGreaterThan(80);expect(qs.some(q=>q.assets.audio===a.id)).toBe(true);}
  expect(contextById('project4.native.audio.4.review')).toMatchObject({source_period_only:true});for(const t of [14,15,17])expect(contextById(`project4.native.audio.${t}.review`)).toMatchObject({language_scene_only:true});for(const t of [10,24,27,30,32])expect(contextById(`project4.native.audio.${t}.review`)).toMatchObject({fictional_source_scene:true});
  expect(mediaAsset('project4.native.audio.7')?.['label_fa']).toBe('درس 1 · مرور درس');expect(mediaAsset('project4.native.audio.33')?.['label_fa']).toBe('مرور پایانی');expect(qs.find(q=>q.id==='project4.native.listen.t24.5')?.answer.value).toBe('Doctor Marcus Teal');expect(qs.find(q=>q.id==='project4.native.listen.t24.6')?.answer.value).toBe('Professor Jane Briggs');
  const q=qs.find(q=>q.skill==='listening')!;expect(ineligibility({...q,assets:{...q.assets,audio:'absent',required_asset_ids:['absent']}})).toContain('unresolved_audio');
 });
 it('grades choices and token games and keeps overlapping senses out of the same choice set',()=>{
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const {q,pool}of gapItems(qs))expect(pool.filter(s=>isAccepted(q,s)),q.id).toHaveLength(1);for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  for(const group of [['baggy','loose'],['top','T-shirt','shirt','jumper','jacket'],['trousers','jeans'],['nervous','worried'],['decision','choice'],['decide','choose']])for(const q of qs.filter(q=>q.vocabulary_entry_id&&group.includes(q.answer.value!)))expect(q.options.filter(o=>group.includes(o.text)),q.id).toHaveLength(1);
 });
 it('provides exact body/clothing/timeline/process sets and independently generated photo tiles',()=>{
  for(const[kind,count]of [['body_part',14],['clothing',6],['duration',8],['process_sequence',6],['table',16]] as const)expect(qs.filter(q=>q.native_scene?.kind===kind)).toHaveLength(count);expect(qs.filter(q=>q.native_options)).toHaveLength(15);expect(PROJECT4_SELECTIONS.filter(s=>s.selection_type==='visual_practice')).toHaveLength(7);
  for(const q of qs.filter(q=>['duration','process_sequence'].includes(q.native_scene?.kind??''))){expect(q.skill,q.id).toBe('grammar');expect(grammarItems(qs).some(g=>g.id===q.id),q.id).toBe(true);}
  const checked=new Map<string,string>();for(const a of PROJECT4_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);expect(a.path).not.toMatch(/\.pdf|source.page|screenshot/);if(a.path.includes('city-materials-v1')){expect(a.native_crop).toHaveLength(4);const[x,y,w,h]=a.native_crop!;expect(x).toBeGreaterThanOrEqual(0);expect(y).toBeGreaterThanOrEqual(0);expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);expect(x+w).toBeLessThanOrEqual(1);expect(y+h).toBeLessThanOrEqual(1);}}
  for(const s of PROJECT4_SELECTIONS){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
 });
 it('appends after the nineteen earlier batches without changing their missions or source bounds',()=>{
  expect(BOOK_RELEASES.slice(0,20)).toHaveLength(20);expect(BOOK_RELEASES[18]).toBe(PROJECT3_NATIVE);expect(BOOK_RELEASES[19]).toBe(PROJECT4_NATIVE);const old=BOOK_RELEASES.slice(0,19).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  const through=scopeQuestions(practiceScope('through_unit','project-4.u003'));expect(through.every(q=>q.placements?.every(p=>p.node_id==='project-4.introduction'||/^project-4\.u00[1-3]\./.test(p.node_id)))).toBe(true);const custom=scopeQuestions(practiceScope('custom','project-4',['project-4.u002','project-4.revision']));expect(custom.every(q=>q.placements?.every(p=>p.node_id.startsWith('project-4.u002.')||p.node_id==='project-4.revision'))).toBe(true);expect(PROJECT4_NATIVE.assessments).toEqual([]);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);expect(readFileSync('src/data/project4/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
