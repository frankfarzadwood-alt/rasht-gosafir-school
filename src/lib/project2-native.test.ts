import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import { PROJECT5_NATIVE } from './content/project5';
import { PROJECT4_NATIVE } from './content/project4';
import { PROJECT3_NATIVE } from './content/project3';
import { describe,expect,it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PROJECT2_NATIVE,PROJECT2_NODES,PROJECT2_TARGETS,PROJECT2_WRITING,PROJECT2_SELECTIONS } from './content/project2';
import { PROJECT1_NATIVE } from './content/project1';
import { projectWritingUnits,projectGuideFor } from './content/project-series';
import { BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,PILOT,mediaAsset } from './content/pilot';
import { catalogueIndex,nodeScope,practiceScope,scopeQuestions } from './learning';
import { validateCatalogue,validateQuestionPack } from './content/validate';
import { BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,grammarItems,ineligibility,isAccepted,pairCandidates,poolAvailability,poolMissions,sentenceItems,type Question } from './bank';

const qs=PROJECT2_NATIVE.questions as unknown as Question[];
describe('Project 2 native release',()=>{
 it('provides all six units and the real opening/final reviews in the shared approved bank',()=>{
  expect(qs).toHaveLength(831);expect(BUNDLED_QUESTIONS).toHaveLength(22965+PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(PROJECT2_NODES).toHaveLength(39);expect(PROJECT2_TARGETS).toHaveLength(24);expect(PROJECT2_WRITING).toHaveLength(6);
  expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);expect(validateQuestionPack(PROJECT2_NATIVE,catalogueIndex)).toEqual([]);expect(qs.flatMap(q=>ineligibility(q).map(r=>[q.id,r]))).toEqual([]);
  expect(new Set(qs.map(q=>q.canonical_id)).size).toBe(qs.length);expect(PROJECT2_NATIVE.sources).toHaveLength(7);
  for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);expect(q.source.pages.length,q.id).toBeGreaterThan(0);}
  expect(scopeQuestions(nodeScope('project-2.introduction'))).toHaveLength(22);expect(scopeQuestions(nodeScope('project-2.revision'))).toHaveLength(34);
 });
 it('corrects the duplicated scan page without drifting printed-page and lesson identities',()=>{
  expect(PROJECT2_NODES.find(n=>n.id==='project-2.u005.s5')?.['source_pages']).toEqual([52,54]);expect(PROJECT2_NODES.find(n=>n.id==='project-2.u006.s1')?.['source_pages']).toEqual([55,56]);expect(PROJECT2_NODES.find(n=>n.id==='project-2.revision')?.['source_pages']).toEqual([65,66]);
  expect(qs.some(q=>q.source.pages.includes(53))).toBe(false);expect(qs.find(q=>q.id==='project2.native.listen.t27.1')?.source).toMatchObject({pages:[54],printed_page:53});expect(qs.find(q=>q.id==='project2.native.listen.t33.1')?.source).toMatchObject({pages:[65],printed_page:64});
  expect(mediaAsset('project2.native.audio.5')?.['source_filename']).toContain('1C Ex 4');expect(mediaAsset('project2.native.audio.5')?.['source_heading']).toBe('1.5 p8 Exercise 3');
 });
 it('keeps all common game modes usable at exact unit and lesson scopes',()=>{
  expect(flashcardItems(qs)).toHaveLength(300);expect(sentenceItems(qs)).toHaveLength(24);expect(grammarItems(qs)).toHaveLength(233);expect(projectWritingUnits(qs,2)).toEqual([1,2,3,4,5,6]);expect(projectWritingUnits(qs,1)).toEqual([]);expect(projectGuideFor('project-2.u003')?.book).toBe(2);expect(projectGuideFor('ielts-grammar-65.u001')).toBeUndefined();
  for(let n=1;n<=6;n++){const id=`project-2.u${String(n).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(pool.every(q=>q.id.startsWith('project2.')),id).toBe(true);expect(a.flashcards.count,id).toBeGreaterThan(30);expect(a.sentence_builder.count,id).toBe(4);expect(a.reading_explorer.count,id).toBe(1);expect(a.writing_studio.count,id).toBe(1);expect(a.listening_lab.count,id).toBeGreaterThan(20);expect(a.grammar_detective.count,id).toBeGreaterThan(20);for(let s=1;s<=5;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length,id+'.s'+s).toBeGreaterThan(5);}
  for(const id of ['project-2.introduction','project-2.revision','project-2.u001.s2'])expect(poolAvailability(scopeQuestions(nodeScope(id))).writing_studio.count,id).toBe(0);
  for(const {q,pool}of gapItems(qs))expect(pool.filter(s=>isAccepted(q,s)),q.id).toHaveLength(1);for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
 });
 it('maps every recording and distinguishes real speech from the animal-sound answer review',()=>{
  const audio=PROJECT2_NATIVE.assets.filter(a=>a.kind==='audio');expect(audio).toHaveLength(32);expect(audio.map(a=>a['track'])).toEqual(Array.from({length:32},(_,i)=>i+2));expect(qs.filter(q=>q.skill==='listening')).toHaveLength(190);
  expect(PROJECT2_NATIVE.contexts.filter(c=>c.kind==='listening_transcript')).toHaveLength(31);const sounds=contextById('project2.native.audio.12.review')!;expect(sounds).toMatchObject({kind:'non_speech_answer_review',display_policy:'after_answer_only',spoken_transcript:false,answer_sequence:['duck','frog','cow','monkey','pig','sheep','tiger']});expect(qs.filter(q=>q.assets.audio==='project2.native.audio.12')).toHaveLength(7);
  for(const a of audio){const c=contextById(a.id+'.review')!;expect(c.display_policy,a.id).toBe('after_answer_only');expect(c.text,a.id).not.toMatch(/Copyright|University Press|^Audio scripts/m);expect(c.text!.length,a.id).toBeGreaterThan(80);expect(qs.some(q=>q.assets.audio===a.id),a.id).toBe(true);}
  for(const t of [23,25,26,27])expect(contextById(`project2.native.audio.${t}.review`)).toMatchObject({source_period_only:true});expect(qs.find(q=>q.id==='project2.native.listen.t25.2')?.answer.value).toBe('1.7 million');
  const q=qs.find(q=>q.skill==='listening')!;expect(ineligibility({...q,assets:{...q.assets,audio:'absent',required_asset_ids:['absent']}})).toContain('unresolved_audio');
 });
 it('uses native visual clues and reviewed local photos, all with matching file hashes',()=>{
  expect(qs.filter(q=>q.native_options)).toHaveLength(18);expect(qs.filter(q=>q.native_scene?.kind==='weather')).toHaveLength(8);expect(qs.filter(q=>q.native_scene?.kind==='calendar')).toHaveLength(8);expect(qs.filter(q=>q.native_scene?.kind==='clock')).toHaveLength(6);expect(PROJECT2_SELECTIONS.filter(s=>s.selection_type==='visual_practice')).toHaveLength(7);
  const checked=new Map<string,string>();for(const a of PROJECT2_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);expect(a.path).not.toMatch(/\.pdf|source.page|screenshot/);}
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const q of qs.filter(q=>q.vocabulary_entry_id&&['normally','usually'].includes(q.answer.value!)))expect(q.options.filter(o=>['normally','usually'].includes(o.text))).toHaveLength(1);expect(pairCandidates(qs).map(p=>p.answer).filter(a=>['normally','usually'].includes(a))).toEqual(['usually']);
 });
 it('preserves all earlier releases, missions and assessments and exposes exact custom/reviewed scopes',()=>{
  expect(BOOK_RELEASES.slice(0,18)).toHaveLength(18);expect(BOOK_RELEASES[16]).toBe(PROJECT1_NATIVE);expect(BOOK_RELEASES[17]).toBe(PROJECT2_NATIVE);const old=BOOK_RELEASES.slice(0,17).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  for(const s of PROJECT2_SELECTIONS){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
  expect(scopeQuestions(practiceScope('through_unit','project-2.u003')).every(q=>q.placements?.every(p=>p.node_id==='project-2.introduction'||/^project-2\.u00[1-3]\./.test(p.node_id)))).toBe(true);
  const custom=scopeQuestions(practiceScope('custom','project-2',['project-2.u002','project-2.revision']));expect(custom.every(q=>q.placements?.every(p=>p.node_id.startsWith('project-2.u002.')||p.node_id==='project-2.revision'))).toBe(true);expect(PROJECT2_NATIVE.assessments).toEqual([]);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);expect(readFileSync('src/data/project2/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
