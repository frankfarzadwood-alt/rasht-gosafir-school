import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import { PROJECT5_NATIVE } from './content/project5';
import { PROJECT4_NATIVE } from './content/project4';
import {describe,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PROJECT3_NATIVE,PROJECT3_NODES,PROJECT3_TARGETS,PROJECT3_WRITING,PROJECT3_SELECTIONS} from './content/project3';
import {PROJECT2_NATIVE} from './content/project2';
import {BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,PILOT,mediaAsset} from './content/pilot';
import {catalogueIndex,nodeScope,practiceScope,scopeQuestions} from './learning';
import {validateCatalogue,validateQuestionPack} from './content/validate';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,grammarItems,ineligibility,isAccepted,poolAvailability,poolMissions,sentenceItems,type Question} from './bank';
import {projectGuideFor,projectWritingUnits} from './content/project-series';
const qs=PROJECT3_NATIVE.questions as unknown as Question[];

describe('Project 3 native release',()=>{
 it('adds the six source units and separate opening/revision to the shared bank',()=>{
  expect(qs).toHaveLength(802);expect(BUNDLED_QUESTIONS).toHaveLength(23767+PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(PROJECT3_NODES).toHaveLength(39);expect(PROJECT3_TARGETS).toHaveLength(24);expect(PROJECT3_WRITING).toHaveLength(6);expect(PROJECT3_WRITING.every(t=>t.checks.length===4)).toBe(true);
  expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);expect(validateQuestionPack(PROJECT3_NATIVE,catalogueIndex)).toEqual([]);expect(qs.flatMap(q=>ineligibility(q).map(r=>[q.id,r]))).toEqual([]);expect(new Set(qs.map(q=>q.canonical_id)).size).toBe(qs.length);expect(PROJECT3_NATIVE.sources).toHaveLength(5);
  expect(scopeQuestions(nodeScope('project-3.introduction'))).toHaveLength(21);expect(scopeQuestions(nodeScope('project-3.revision'))).toHaveLength(34);
  for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);}
 });
 it('maps the extra cover scan and nonuniform recording groups to their exact lessons',()=>{
  expect(PROJECT3_NODES.find(n=>n.id==='project-3.introduction')?.['source_pages']).toEqual([3,4]);expect(PROJECT3_NODES.find(n=>n.id==='project-3.u001.s1')?.['source_pages']).toEqual([5,6]);expect(PROJECT3_NODES.find(n=>n.id==='project-3.u006.s5')?.['source_pages']).toEqual([63,64]);expect(PROJECT3_NODES.find(n=>n.id==='project-3.revision')?.['source_pages']).toEqual([65,66]);
  for(const t of [16,17])expect(qs.find(q=>q.id===`project3.native.listen.t${t}.1`)?.placements?.[0]?.node_id).toBe('project-3.u004.s3');for(const t of [23,24])expect(qs.find(q=>q.id===`project3.native.listen.t${t}.1`)?.placements?.[0]?.node_id).toBe('project-3.u006.s1');for(const t of [27,28])expect(qs.find(q=>q.id===`project3.native.listen.t${t}.1`)?.placements?.[0]?.node_id).toBe('project-3.u006.s4');
  expect(qs.find(q=>q.id==='project3.native.listen.t2.1')?.source.pages).toEqual([3]);expect(qs.find(q=>q.id==='project3.native.listen.t28.1')?.source.pages).toEqual([61]);expect(qs.filter(q=>q.placements?.[0]?.node_id.endsWith('.s5')).some(q=>q.skill==='listening')).toBe(false);
 });
 it('covers the flashcard themes and all common game modes at unit scopes',()=>{
  expect(flashcardItems(qs)).toHaveLength(305);expect(grammarItems(qs)).toHaveLength(262);expect(sentenceItems(qs)).toHaveLength(24);expect(projectWritingUnits(qs,3)).toEqual([1,2,3,4,5,6]);expect(projectWritingUnits(qs,2)).toEqual([]);expect(projectGuideFor('project-3.u001')?.book).toBe(3);
  const words=new Set(PROJECT3_NATIVE.vocabulary_entries.map(v=>v['lemma']));for(const w of ['be born','grow up','move house','start school','leave school','go to university','get a job','get married','have children','die','earthquake','volcanic eruption','tornado','hurricane','tsunami','flood','explosion','avalanche','lightning','forest fire','on the other side of','over','under','along','on the left','on the right','round','turn left','turn right','past','on the corner of','between'])expect(words.has(w),w).toBe(true);
  for(let n=1;n<=6;n++){const id=`project-3.u00${n}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(pool.every(q=>q.id.startsWith('project3.'))).toBe(true);expect(a.flashcards.count,id).toBeGreaterThan(40);expect(a.grammar_detective.count,id).toBeGreaterThan(20);expect(a.listening_lab.count,id).toBeGreaterThan(10);expect(a.sentence_builder.count).toBe(4);expect(a.reading_explorer.count).toBe(1);expect(a.writing_studio.count).toBe(1);for(let s=1;s<=5;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length).toBeGreaterThan(5);}
  for(const id of ['project-3.introduction','project-3.revision','project-3.u006.s5'])expect(poolAvailability(scopeQuestions(nodeScope(id))).writing_studio.count,id).toBe(0);
 });
 it('retains all 27 recordings and explicitly distinguishes the eleven workbook reviews',()=>{
  const audio=PROJECT3_NATIVE.assets.filter(a=>a.kind==='audio');expect(audio).toHaveLength(27);expect(audio.map(a=>a['track'])).toEqual(Array.from({length:27},(_,i)=>i+2));expect(qs.filter(q=>q.skill==='listening')).toHaveLength(134);expect(PROJECT3_NATIVE.contexts.filter(c=>c.kind==='listening_transcript')).toHaveLength(16);expect(PROJECT3_NATIVE.contexts.filter(c=>c.kind==='workbook_answer_review')).toHaveLength(11);
  for(const a of audio){const c=contextById(a.id+'.review')!;expect(c.display_policy).toBe('after_answer_only');expect(c.text,a.id).not.toMatch(/Copyright|University Press|Workbook Audio scripts|^T\d+/m);expect(c.text!.length).toBeGreaterThan(80);expect(qs.some(q=>q.assets.audio===a.id)).toBe(true);if(c.kind==='workbook_answer_review'){expect(c).toMatchObject({spoken_transcript:false});expect(c.text).toContain('not a verbatim audio transcription');}}
  for(const t of [6,14])expect(contextById(`project3.native.audio.${t}.review`)).toMatchObject({source_period_only:true});for(const t of [23,24])expect(contextById(`project3.native.audio.${t}.review`)).toMatchObject({language_scene_only:true});
  expect(mediaAsset('project3.native.audio.27')?.['source_filename']).toBe('27 Pista 27.mp3');const q=qs.find(q=>q.skill==='listening')!;expect(ineligibility({...q,assets:{...q.assets,audio:'absent',required_asset_ids:['absent']}})).toContain('unresolved_audio');
 });
 it('grades choices and token games with distinct reviewed answers',()=>{
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const {q,pool}of gapItems(qs))expect(pool.filter(s=>isAccepted(q,s)),q.id).toHaveLength(1);for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
 });
 it('uses code-native scenes, exact visual sets and independent photo assets with valid local hashes',()=>{
  expect(qs.filter(q=>q.native_options)).toHaveLength(15);expect(qs.filter(q=>q.native_scene?.kind==='rule_sign')).toHaveLength(8);expect(qs.filter(q=>q.native_scene?.kind==='practice_route')).toHaveLength(6);expect(qs.filter(q=>q.native_scene?.kind==='direction_arrow')).toHaveLength(4);expect(PROJECT3_SELECTIONS.filter(s=>s.selection_type==='visual_practice')).toHaveLength(6);
  const checked=new Map<string,string>();for(const a of PROJECT3_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);expect(a.path).not.toMatch(/\.pdf|source.page|screenshot/);}
  for(const s of PROJECT3_SELECTIONS){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
 });
 it('appends after the eighteen earlier batches and preserves missions, assessments and source boundaries',()=>{
  expect(BOOK_RELEASES.slice(0,19)).toHaveLength(19);expect(BOOK_RELEASES[17]).toBe(PROJECT2_NATIVE);expect(BOOK_RELEASES[18]).toBe(PROJECT3_NATIVE);const old=BOOK_RELEASES.slice(0,18).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  const through=scopeQuestions(practiceScope('through_unit','project-3.u003'));expect(through.every(q=>q.placements?.every(p=>p.node_id==='project-3.introduction'||/^project-3\.u00[1-3]\./.test(p.node_id)))).toBe(true);const custom=scopeQuestions(practiceScope('custom','project-3',['project-3.u002','project-3.revision']));expect(custom.every(q=>q.placements?.every(p=>p.node_id.startsWith('project-3.u002.')||p.node_id==='project-3.revision'))).toBe(true);expect(PROJECT3_NATIVE.assessments).toEqual([]);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);expect(readFileSync('src/data/project3/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
