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
import { EVOLVE6_NATIVE,EVOLVE6_RELEASES,EVOLVE6_NODES,EVOLVE6_TARGETS,EVOLVE6_WRITING,EVOLVE6_RECOMMENDATIONS } from './content/evolve6';
import { PROJECT1_NATIVE } from './content/project1';
import { BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,LIVE_SELECTIONS,PILOT,mediaAsset } from './content/pilot';
import { OXFORD_UPPER_RELEASES } from './content/oxford-upper';
import { oxfordDestination,ALL_EVOLVE_RECOMMENDATIONS } from './content/evolve-series';
import { catalogueIndex,nodeScope,practiceScope,scopeQuestions } from './learning';
import { assessmentSession,livePack } from './scope';
import { validateQuestionPack } from './content/validate';
import { BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,ineligibility,isAccepted,pairCandidates,poolAvailability,poolMissions,sentenceItems,type Question } from './bank';

const qs=EVOLVE6_NATIVE.questions as unknown as Question[],byId=new Map(qs.map(q=>[q.id,q])),quiz=(id:string)=>byId.get('evolve6.quiz.'+id)!;
describe('Evolve 6 native release',()=>{
 it('provides all twelve units and 48 lessons through the common approved bank',()=>{
  expect(qs).toHaveLength(1655);expect(qs.filter(q=>q.id.startsWith('evolve6.native.wb.'))).toHaveLength(682);expect(BUNDLED_QUESTIONS).toHaveLength(21373+PROJECT1_NATIVE.questions.length + PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);
  expect(EVOLVE6_NODES).toHaveLength(61);expect(EVOLVE6_TARGETS).toHaveLength(48);expect(EVOLVE6_WRITING).toHaveLength(12);
  expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);for(const p of EVOLVE6_RELEASES)expect(validateQuestionPack(p,catalogueIndex)).toEqual([]);
  expect(qs.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
  const sources=new Set(EVOLVE6_NATIVE.sources.map(s=>s['id']));expect(sources.size).toBe(74);
  for(const q of qs){expect(sources.has(q.source_id),q.id).toBe(true);expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(q.source.pages.length,q.id).toBeGreaterThan(0);expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_image_required,q.id).toBe(false);if(q.context_id)expect(contextById(q.context_id),q.id).toBeTruthy();}
  expect(EVOLVE6_NODES[0]).toMatchObject({title_fa:'ایوالو 6',ordinal:6});
 });
 it('offers native workbook modes at the correct lesson scopes',()=>{
  expect(flashcardItems(qs)).toHaveLength(291);
  for(let u=1;u<=12;u++){const id=`evolve-6.u${String(u).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool),listens=[3,4,6,8,9].includes(u)?9:6;
   expect(pool.every(q=>q.id.startsWith('evolve6.native.wb.')),id).toBe(true);expect(a.flashcards.count,id).toBeGreaterThan(15);expect(a.grammar_detective.count,id).toBe(16);expect(a.sentence_builder.count,id).toBe(4);expect(a.listening_lab.count,id).toBe(listens);expect(a.writing_studio.count,id).toBe(1);expect(a.reading_explorer.count,id).toBe(1);
   expect(scopeQuestions(nodeScope(id+'.s3')).filter(q=>q.skill==='listening'),id).toHaveLength(listens);expect(pool.filter(q=>q.skill==='reading'),id).toHaveLength(4);
  }
  for(const {q,pool}of gapItems(qs))expect(pool.filter(a=>isAccepted(q,a)),q.id).toHaveLength(1);
  for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
  for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
 });
 it('keeps all 973 printed test positions in 24 exact ordered assessments',()=>{
  expect(EVOLVE6_NATIVE.assessments).toHaveLength(24);expect(EVOLVE6_NATIVE.assessments.flatMap(a=>a.question_ids)).toHaveLength(973);const pack=livePack(LIVE_CATALOGUE,0);
  for(const a of EVOLVE6_NATIVE.assessments){const session=assessmentSession(pack,a,contextById);expect(session.status,a.id).toBe('ready');expect(a.time_limit_seconds).toBeNull();expect(a.official_max_marks).toBeNull();if(session.status==='ready'){expect(session.sections.map(s=>s.id)).toEqual(['A','B','C','D','E','F']);expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);}expect(scopeQuestions(LIVE_SELECTIONS.find(s=>s.id===a.id)!.scope).map(q=>q.id)).toEqual(a.question_ids);}
  expect((EVOLVE6_NATIVE.assessments.find(a=>a.id==='evolve6.quiz.u07.a.practice')!['sections'] as {question_ids:string[]}[])[0]!.question_ids).toHaveLength(6);
  expect((EVOLVE6_NATIVE.assessments.find(a=>a.id==='evolve6.quiz.u10.b.practice')!['sections'] as {question_ids:string[]}[])[5]!.question_ids).toHaveLength(9);
  expect(qs.filter(q=>/^evolve6.quiz.u07\.[ab]\.e/.test(q.id))).toHaveLength(14);
 });
 it('preserves full readings and all current paragraph gap labels',()=>{
  expect(EVOLVE6_NATIVE.contexts.filter(c=>c.kind==='reading_passage')).toHaveLength(36);expect(qs.filter(q=>q.id.startsWith('evolve6.native.wb.')&&q.skill==='reading')).toHaveLength(48);
  for(const c of EVOLVE6_NATIVE.contexts.filter(c=>c.kind==='native_cloze')){const dependent=qs.filter(q=>q.context_id===c.id);expect([...c.text!.matchAll(/\[(\d+)\]/g)].map(m=>+m[1]!)).toEqual(dependent.map(q=>Number((q.source as unknown as {item_number:number}).item_number)));}
  expect(contextById('evolve6.quiz.u08.a.f.reading')?.text).toContain('STEP 5');expect(contextById('evolve6.quiz.u10.b.f.reading')?.text).toContain('Patricia');
  expect(quiz('u08.a.f2').answer.value).toBe('Steps 4 and 5');expect(quiz('u10.b.f8').answer.value).toContain('Jon');
 });
 it('corrects ambiguous keys and does not accept grammar distractors as alternatives',()=>{
  const all=quiz('u08.b.e1');expect(all.answer.value).toBe('All three can be used');expect(gradeChoice(all,'a')).toBe(true);expect(gradeChoice(all,'b')).toBe(false);
  expect(quiz('u11.b.d7').answer.value).toBe('is');expect(quiz('u11.b.d7').prompt_en).toContain('formal singular');
  expect(isAccepted(quiz('u04.a.d3'),'which / for')).toBe(true);expect(isAccepted(quiz('u04.a.d3'),'that')).toBe(false);
  expect(quiz('u01.a.d1').prompt_en).toContain('after the first auxiliary');
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);expect(q.options.map(o=>o.text).join('|'),q.id).not.toMatch(/UNIT QUIZ|undefined|\(in any order\)/);}
  for(const q of qs.filter(q=>/\.wb\..*\.g\d+$/.test(q.id)))for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id+' '+o.text).toBe(false);
 });
 it('bundles all 41 distinct recordings and keeps supplementary tracks separate',()=>{
  const audio=EVOLVE6_NATIVE.assets.filter(a=>a.kind==='audio'),scripts=EVOLVE6_NATIVE.contexts.filter(c=>c.kind==='listening_transcript');expect(audio).toHaveLength(41);expect(scripts).toHaveLength(41);
  for(const a of audio){expect(qs.some(q=>q.assets.source_audio_required&&q.assets.required_asset_ids?.includes(a.id)),a.id).toBe(true);const c=contextById(a.id+'.transcript')!;expect(c,a.id).toBeTruthy();expect(c['display_policy']).toBe('after_answer_only');expect(c.text!.length,a.id).toBeGreaterThan(200);}
  expect(contextById('evolve6.native.wb.audio.3.main.transcript')?.text).toContain('Zach');expect(contextById('evolve6.native.wb.audio.3.2A.transcript')?.text).toContain('Mona');
  expect(contextById('evolve6.native.wb.audio.4.1C.transcript')?.text).toContain('rubbing');expect(contextById('evolve6.native.wb.audio.8.1C.transcript')?.text).toContain('headsets');
  expect(contextById('evolve6.quiz.u04.b.audio.transcript')?.text).toContain('supplied script ends here');expect(contextById('evolve6.quiz.u11.a.audio.transcript')?.text).toContain('Supplied script excerpt');
  expect(quiz('u09.b.a2').answer.value).toBe('She said she could not act until her husband returned.');expect(quiz('u03.a.a1').answer.value).toBe('He tried to beat a changing traffic light.');
  const checked=new Map<string,string>();for(const a of EVOLVE6_NATIVE.assets){if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);}
 });
 it('uses independent photos and keeps interchangeable vocabulary out of competing choices',()=>{
  expect(EVOLVE6_NATIVE.assets.filter(a=>a.kind==='image')).toHaveLength(16);expect(qs.filter(q=>q.native_options)).toHaveLength(16);
  for(const q of qs.filter(q=>q.native_options))expect(Object.values(q.native_options!).every(id=>!!mediaAsset(id)),q.id).toBe(true);
  const pairs=pairCandidates(qs).map(p=>p.answer);for(const group of [['undoubtedly','unquestionably'],['progressively','gradually','increasingly'],['immense','vast'],['concentrate','focus']]){for(const q of qs.filter(q=>q.vocabulary_entry_id&&group.includes(q.answer.value!)))expect(q.options.filter(o=>group.includes(o.text)),q.id).toHaveLength(1);expect(group.filter(w=>pairs.includes(w))).toHaveLength(1);}
 });
 it('activates all 36 supplied Upper recommendations and appends two bounded batches',()=>{
  const expected=[[40,100,48],[82,25,95],[60,63,57],[11,79,15],[68,89,35],[91,44,41],[22,87,19],[69,8,71],[52,4,14],[86,75,24],[96,2,98],[77,43,34]];
  for(const row of EVOLVE6_RECOMMENDATIONS){expect(row.recommendations.map(r=>r.unit)).toEqual(expected[row.unit-1]);for(const r of row.recommendations){expect(r.book_id).toBe('ows-upper-intermediate');const target=oxfordDestination(r,LIVE_CATALOGUE.nodes)!;expect(target).toBeTruthy();expect(scopeQuestions(nodeScope(target.id)).length).toBeGreaterThan(0);}}
  expect(ALL_EVOLVE_RECOMMENDATIONS.filter(r=>r.evolve_book_id==='evolve-6')).toHaveLength(12);expect(BOOK_RELEASES.slice(0,16)).toHaveLength(16);expect(BOOK_RELEASES.slice(11,14)).toEqual(OXFORD_UPPER_RELEASES);expect(BOOK_RELEASES.slice(14,16)).toEqual(EVOLVE6_RELEASES);expect(EVOLVE6_RELEASES.map(p=>p.questions.length)).toEqual([831,824]);
  const old=BOOK_RELEASES.slice(0,14).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('cumulative',old);expect(poolMissions('cumulative',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  for(let n=1;n<=2;n++)expect(readFileSync(`src/data/evolve6/native.${n}.pack.json`).length).toBeLessThan(3_200_000);
 });
});
