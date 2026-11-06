import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import { PROJECT5_NATIVE } from './content/project5';
import { PROJECT4_NATIVE } from './content/project4';
import { PROJECT3_NATIVE } from './content/project3';
import { PROJECT2_NATIVE } from './content/project2';
import { describe,expect,it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PROJECT1_NATIVE,PROJECT1_NODES,PROJECT1_TARGETS,PROJECT1_WRITING,project1WritingUnits } from './content/project1';
import { BOOK_RELEASES,BOOK_CONTENT,LIVE_CATALOGUE,LIVE_SELECTIONS,PILOT,mediaAsset } from './content/pilot';
import { EVOLVE6_RELEASES } from './content/evolve6';
import { catalogueIndex,nodeScope,practiceScope,scopeQuestions } from './learning';
import { validateCatalogue,validateQuestionPack } from './content/validate';
import { BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,grammarItems,ineligibility,isAccepted,poolAvailability,poolMissions,sentenceItems,type Question } from './bank';

const qs=PROJECT1_NATIVE.questions as unknown as Question[];
describe('Project 1 native curriculum release',()=>{
 it('provides all six units, 24 named lessons, six checks and final revision in the shared approved bank',()=>{
  expect(qs).toHaveLength(761);expect(BUNDLED_QUESTIONS).toHaveLength(22134+PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(PROJECT1_NODES).toHaveLength(38);expect(PROJECT1_TARGETS).toHaveLength(24);expect(PROJECT1_WRITING).toHaveLength(6);
  expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);expect(validateQuestionPack(PROJECT1_NATIVE,catalogueIndex)).toEqual([]);expect(qs.flatMap(q=>ineligibility(q).map(r=>[q.id,r]))).toEqual([]);
  expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);expect(new Set(PROJECT1_NATIVE.sources.map(s=>s['id'])).size).toBe(8);
  for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);expect(q.source.pages.length,q.id).toBeGreaterThan(0);if(q.context_id)expect(contextById(q.context_id),q.id).toBeTruthy();}
  expect(scopeQuestions(nodeScope('project-1.revision'))).toHaveLength(34);expect(PROJECT1_NODES.find(n=>n.id==='project-1.revision')?.['source_pages']).toEqual([62,63,64]);
 });
 it('keeps real lesson placements and all common game builders usable',()=>{
  expect(flashcardItems(qs)).toHaveLength(298);expect(sentenceItems(qs)).toHaveLength(24);expect(grammarItems(qs)).toHaveLength(200);expect(project1WritingUnits(qs)).toEqual([1,2,3,4,5,6]);
  for(let n=1;n<=6;n++){const id=`project-1.u${String(n).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(pool.length,id).toBeGreaterThan(65);expect(a.flashcards.count,id).toBeGreaterThan(30);expect(a.listening_lab.count,id).toBeGreaterThan(20);expect(a.sentence_builder.count,id).toBe(4);expect(a.reading_explorer.count,id).toBe(1);expect(a.writing_studio.count,id).toBe(1);expect(scopeQuestions(nodeScope(id+'.s5')).length,id).toBeGreaterThanOrEqual(12);for(let s=1;s<=4;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length,id+'.s'+s).toBeGreaterThan(5);}
  for(const {q,pool}of gapItems(qs))expect(pool.filter(s=>isAccepted(q,s)),q.id).toHaveLength(1);
  for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
  expect(poolAvailability(scopeQuestions(nodeScope('project-1.u002.s1'))).writing_studio.count).toBe(0);expect(poolAvailability(scopeQuestions(nodeScope('project-1.revision'))).writing_studio.count).toBe(0);
 });
 it('keeps unit, cumulative, custom and whole-book scopes exact without inventing published tests',()=>{
  const through=scopeQuestions(practiceScope('through_unit','project-1.u003'));expect(through.every(q=>q.placements?.every(p=>/^project-1\.u00[1-3]\./.test(p.node_id)))).toBe(true);
  const custom=scopeQuestions(practiceScope('custom','project-1',['project-1.u001','project-1.revision']));expect(custom.every(q=>q.placements?.every(p=>p.node_id.startsWith('project-1.u001.')||p.node_id==='project-1.revision'))).toBe(true);
  expect(scopeQuestions(practiceScope('whole_book','project-1'))).toHaveLength(761);expect(PROJECT1_NATIVE.assessments).toEqual([]);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);
  for(const s of LIVE_SELECTIONS.filter(s=>s.anchor_node_id.startsWith('project-1'))){expect(scopeQuestions(s.scope).map(q=>q.id)).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
 });
 it('maps all 31 exercise recordings, preserves transcript locks and leaves extra unverified tracks unassigned',()=>{
  const audio=PROJECT1_NATIVE.assets.filter(a=>a.kind==='audio');expect(audio).toHaveLength(31);expect(qs.filter(q=>q.skill==='listening')).toHaveLength(171);expect(audio.map(a=>a['track'])).toEqual(Array.from({length:31},(_,i)=>i+2));
  for(const a of audio){expect(qs.filter(q=>q.assets.audio===a.id).length,a.id).toBeGreaterThanOrEqual(4);const c=contextById(a.id+'.transcript')!;expect(c.display_policy).toBe('after_answer_only');expect(c.text,a.id).not.toMatch(/Copyright|University Press|Audio scripts/);expect(c.text!.length,a.id).toBeGreaterThan(80);}
  expect(contextById('project1.native.audio.2.transcript')?.text).toContain('Anna');expect(contextById('project1.native.audio.32.transcript')?.text).toContain('chest of drawers');
  expect(qs.find(q=>q.id==='project1.native.listen.t28.5')?.answer.value).toBe('50p');expect(qs.find(q=>q.id==='project1.native.listen.t31.5')?.answer.value).toBe('£25.00');
  const listening=qs.find(q=>q.skill==='listening')!;expect(ineligibility({...listening,assets:{...listening.assets,audio:'absent',required_asset_ids:['absent']}})).toContain('unresolved_audio');
 });
 it('uses independent native visuals and local files with verified hashes',()=>{
  expect(qs.filter(q=>q.native_options)).toHaveLength(16);expect(qs.filter(q=>q.native_scene?.kind==='clock')).toHaveLength(12);expect(qs.filter(q=>q.native_scene?.kind==='position')).toHaveLength(8);expect(new Set(qs.filter(q=>q.native_scene?.kind==='table').map(q=>q.id.includes('revision.ability')?'ability':q.id.split('.')[3])).size).toBe(4);
  const checked=new Map<string,string>();for(const a of PROJECT1_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url,a.id).toBe(a.path);expect(a.path).not.toMatch(/\.pdf|source.page|screenshot/);}
  for(const q of qs.filter(q=>q.native_options))expect(Object.values(q.native_options!).every(id=>mediaAsset(id))).toBe(true);
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
 });
 it('appends after the original sixteen releases and preserves school, missions and fixed assessments',()=>{
  expect(BOOK_RELEASES.slice(0,17)).toHaveLength(17);expect(BOOK_RELEASES.slice(14,16)).toEqual(EVOLVE6_RELEASES);expect(BOOK_RELEASES[16]).toBe(PROJECT1_NATIVE);
  const before=BOOK_RELEASES.slice(0,16).flatMap(p=>p.questions) as unknown as Question[],missions=poolMissions('collection',before);expect(poolMissions('collection',[...before,...qs]).slice(0,missions.length)).toEqual(missions);
  for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);expect(readFileSync('src/data/project1/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
