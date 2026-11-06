import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PROJECT5_NATIVE,PROJECT5_NODES,PROJECT5_TARGETS,PROJECT5_WRITING,PROJECT5_SELECTIONS} from './content/project5';
import {PROJECT4_NATIVE} from './content/project4';
import {BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,PILOT,mediaAsset} from './content/pilot';
import {catalogueIndex,nodeScope,practiceScope,scopeQuestions} from './learning';
import {validateCatalogue,validateQuestionPack} from './content/validate';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,grammarItems,ineligibility,isAccepted,poolAvailability,poolMissions,sentenceItems,type Question} from './bank';
import {projectGuideFor,projectWritingUnits} from './content/project-series';
const qs=PROJECT5_NATIVE.questions as unknown as Question[];
describe('Project 5 native release',()=>{
 it('adds six complete units and the opening/final reviews to the shared bank',()=>{
  expect(qs).toHaveLength(990);expect(BUNDLED_QUESTIONS).toHaveLength(25637 + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(PROJECT5_NODES).toHaveLength(39);expect(PROJECT5_TARGETS).toHaveLength(24);expect(PROJECT5_WRITING).toHaveLength(6);expect(PROJECT5_WRITING.every(t=>t.checks.length===4)).toBe(true);
  expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);expect(validateQuestionPack(PROJECT5_NATIVE,catalogueIndex)).toEqual([]);expect(qs.flatMap(q=>ineligibility(q).map(r=>[q.id,r]))).toEqual([]);expect(new Set(qs.map(q=>q.canonical_id)).size).toBe(qs.length);
  expect(scopeQuestions(nodeScope('project-5.introduction'))).toHaveLength(55);expect(scopeQuestions(nodeScope('project-5.revision'))).toHaveLength(38);for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);}
 });
 it('uses the complete 82-page workbook and maps printed page to PDF page plus one',()=>{
  expect(PROJECT5_NATIVE.sources).toHaveLength(3);expect(PROJECT5_NATIVE.sources.find(s=>s['id']==='project5.workbook.4e')).toMatchObject({file:'Project-5-4th-Work-Book.pdf',pages:82});expect(PROJECT5_NATIVE.sources.find(s=>s['id']==='project5.annotated-excerpt')).toMatchObject({pages:54});
  for(const[id,pages]of [['project-5.introduction',[3,4]],['project-5.u001.s1',[5,6]],['project-5.u006.s5',[63,64]],['project-5.revision',[65,66]]] as const)expect(PROJECT5_NODES.find(n=>n.id===id)?.['source_pages']).toEqual(pages);
  for(const t of [9,10,12,20,22,29,31,32])expect(contextById(`project5.native.audio.${t}.review`)).toMatchObject({spoken_transcript:false,kind:'workbook_answer_review'});
  expect(qs.find(q=>q.id==='project5.native.listen.t4.1')?.placements?.[0]?.node_id).toBe('project-5.u001.s2');expect(qs.find(q=>q.id==='project5.native.listen.t4.1')?.source.pages).toEqual([7]);expect(qs.find(q=>q.id==='project5.native.listen.t31.1')?.source.pages).toEqual([62]);expect(qs.find(q=>q.id==='project5.native.listen.t33.1')?.placements?.[0]?.node_id).toBe('project-5.revision');
  for(const q of qs)expect(q.source.pages.every(p=>p>=3&&p<=66),q.id).toBe(true);
 });
 it('covers the sport refresher and all unit game modes with independent writing identities',()=>{
  expect(flashcardItems(qs)).toHaveLength(402);expect(grammarItems(qs)).toHaveLength(293);expect(sentenceItems(qs)).toHaveLength(24);expect(projectWritingUnits(qs,5)).toEqual([1,2,3,4,5,6]);expect(projectWritingUnits(qs,4)).toEqual([]);expect(projectGuideFor('project-5.u001')?.book).toBe(5);
  const words=new Set(PROJECT5_NATIVE.vocabulary_entries.map(v=>v['lemma']));for(const w of ['court','pitch','field','rink','ring','alley','course','track','net','bat','racket','shuttlecock','goggles','puck','skates','refund','receipt','bullying','generous','confident','architect','electrician','flight attendant','time limit','reschedule','earthquake','drought','famine','cautious','infectious','polite','tidy','unreliable','give back','fill in','suite','single ticket','return ticket','faucet','counterfeit','boycott','civil rights','postbox','representative'])expect(words.has(w),w).toBe(true);
  for(let n=1;n<=6;n++){const id=`project-5.u00${n}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(pool.every(q=>q.id.startsWith('project5.'))).toBe(true);expect(a.flashcards.count,id).toBeGreaterThan(40);expect(a.grammar_detective.count,id).toBeGreaterThan(20);expect(a.listening_lab.count,id).toBeGreaterThan(20);expect(a.sentence_builder.count).toBe(4);expect(a.reading_explorer.count).toBe(1);expect(a.writing_studio.count).toBe(1);for(let s=1;s<=5;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length).toBeGreaterThan(5);}
  for(const id of ['project-5.introduction','project-5.revision','project-5.u006.s5'])expect(poolAvailability(scopeQuestions(nodeScope(id))).writing_studio.count,id).toBe(0);
 });
 it('retains 32 recordings, 24 actual supplied scripts and eight honest answer-key reviews',()=>{
  const audio=PROJECT5_NATIVE.assets.filter(a=>a.kind==='audio');expect(audio).toHaveLength(32);expect(audio.map(a=>a['track'])).toEqual(Array.from({length:32},(_,i)=>i+2));expect(qs.filter(q=>q.skill==='listening')).toHaveLength(209);expect(PROJECT5_NATIVE.contexts.filter(c=>c.kind==='listening_transcript')).toHaveLength(24);expect(PROJECT5_NATIVE.contexts.filter(c=>c.kind==='workbook_answer_review')).toHaveLength(8);
  for(const a of audio){const c=contextById(a.id+'.review')!;expect(c.display_policy).toBe('after_answer_only');expect(c.text,a.id).not.toMatch(/Copyright|University Press|Workbook Audio scripts|^T\d+/m);expect(c.text!.length).toBeGreaterThan(80);expect(qs.some(q=>q.assets.audio===a.id)).toBe(true);if(c.kind==='workbook_answer_review')expect(c.text).toContain('not a verbatim audio transcription');}
  for(const t of [6,11,23,24,25,29,31])expect(contextById(`project5.native.audio.${t}.review`)).toMatchObject({source_period_only:true});expect(contextById('project5.native.audio.10.review')?.text).toContain('differ in the opening activity wording');expect(qs.filter(q=>q.assets.audio==='project5.native.audio.29').map(q=>q.prompt_en).join(' ')).not.toMatch(/196\d|199\d|how many people/i);
  expect(mediaAsset('project5.native.audio.32')?.['label_fa']).toBe('درس 6 · مرور درس');expect(mediaAsset('project5.native.audio.33')?.['label_fa']).toBe('مرور پایانی');const q=qs.find(q=>q.skill==='listening')!;expect(ineligibility({...q,assets:{...q.assets,audio:'absent',required_asset_ids:['absent']}})).toContain('unresolved_audio');
 });
 it('grades reviewed options and token pools with distinct accepted answers',()=>{
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const {q,pool}of gapItems(qs))expect(pool.filter(s=>isAccepted(q,s)),q.id).toHaveLength(1);for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  for(const group of [['attractive','good-looking','gorgeous','pretty','handsome'],['nice','friendly','charming'],['hazard','danger','risk'],['hazardous','dangerous','risky'],['pitch','field']])for(const q of qs.filter(q=>q.vocabulary_entry_id&&group.includes(q.answer.value!)))expect(q.options.filter(o=>group.includes(o.text)),q.id).toHaveLength(1);
 });
 it('provides native object diagrams, clocks and exact visual sets with local hashed media',()=>{
  for(const[kind,count]of [['object_problem',8],['clock',4],['calendar',4],['process_sequence',6],['table',24]] as const)expect(qs.filter(q=>q.native_scene?.kind===kind)).toHaveLength(count);expect(qs.filter(q=>q.native_options)).toHaveLength(7);expect(PROJECT5_SELECTIONS.filter(s=>s.selection_type==='visual_practice')).toHaveLength(9);
  const checked=new Map<string,string>();for(const a of PROJECT5_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);expect(a.path).not.toMatch(/\.pdf|source.page|screenshot/);if(a.kind==='image'){expect(a.native_crop).toHaveLength(4);const[x,y,w,h]=a.native_crop!;expect(x+w).toBeLessThanOrEqual(1);expect(y+h).toBeLessThanOrEqual(1);}}
  for(const s of PROJECT5_SELECTIONS){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
 });
 it('appends after the twenty earlier batches while preserving missions and source boundaries',()=>{
  expect(BOOK_RELEASES.slice(0,21)).toHaveLength(21);expect(BOOK_RELEASES[19]).toBe(PROJECT4_NATIVE);expect(BOOK_RELEASES[20]).toBe(PROJECT5_NATIVE);const old=BOOK_RELEASES.slice(0,20).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  const through=scopeQuestions(practiceScope('through_unit','project-5.u003'));expect(through.every(q=>q.placements?.every(p=>p.node_id==='project-5.introduction'||/^project-5\.u00[1-3]\./.test(p.node_id)))).toBe(true);expect(PROJECT5_NATIVE.assessments).toEqual([]);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);expect(readFileSync('src/data/project5/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
