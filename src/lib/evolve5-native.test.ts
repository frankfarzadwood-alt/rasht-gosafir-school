import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {IELTS_GRAMMAR_NATIVE} from './content/ielts-grammar65';
import { PROJECT5_NATIVE } from './content/project5';
import { PROJECT4_NATIVE } from './content/project4';
import { PROJECT3_NATIVE } from './content/project3';
import { PROJECT2_NATIVE } from './content/project2';
import { PROJECT1_NATIVE } from './content/project1';
import { EVOLVE6_NATIVE } from './content/evolve6';
import { OXFORD_UPPER } from './content/oxford-upper';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVOLVE5_NATIVE, EVOLVE5_NODES, EVOLVE5_RECOMMENDATIONS, EVOLVE5_TARGETS, EVOLVE5_WRITING } from './content/evolve5';
import { EVOLVE4_NATIVE } from './content/evolve4';
import { BOOK_CONTENT, BOOK_RELEASES, LIVE_CATALOGUE, LIVE_SELECTIONS, mediaAsset, PILOT } from './content/pilot';
import { oxfordDestination } from './content/evolve-series';
import { BUNDLED_QUESTIONS, contextById, flashcardItems, forgeItems, gapItems, gradeChoice, ineligibility, isAccepted, poolAvailability, poolMissions, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { assessmentSession, livePack } from './scope';
import { validateQuestionPack } from './content/validate';

type ReviewedQuestion=Question & {source:Question['source'] & Record<string,unknown>};
const qs=EVOLVE5_NATIVE.questions as unknown as ReviewedQuestion[];
const byId=new Map(qs.map(q=>[q.id,q]));
const quiz=(id:string)=>byId.get('evolve5.quiz.'+id)!;

describe('Evolve 5 native release',()=>{
  it('adds approved, source-linked native questions throughout all 48 main lessons',()=>{
    expect(qs).toHaveLength(1631);expect(qs.filter(q=>q.id.startsWith('evolve5.native.wb.'))).toHaveLength(672);
    expect(EVOLVE5_NODES).toHaveLength(61);expect(EVOLVE5_TARGETS).toHaveLength(48);expect(EVOLVE5_WRITING).toHaveLength(12);
    expect(validateQuestionPack(EVOLVE5_NATIVE,catalogueIndex)).toEqual([]);
    expect(qs.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);expect(BUNDLED_QUESTIONS).toHaveLength(16530 + OXFORD_UPPER.questions.length + EVOLVE6_NATIVE.questions.length + PROJECT1_NATIVE.questions.length + PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);
    expect(EVOLVE5_NODES[0]).toMatchObject({title_fa:'ایوالو 5',ordinal:5});
    expect(EVOLVE5_TARGETS.every(t=>t.book===5)).toBe(true);expect(EVOLVE5_WRITING.every(t=>t.book===5)).toBe(true);
    const sources=new Set(EVOLVE5_NATIVE.sources.map(s=>s['id']));
    for(const q of qs){
      expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(sources.has(q.source_id),q.id).toBe(true);
      expect(q.source.pages.length,q.id).toBeGreaterThan(0);expect(q.assets.source_image_required,q.id).toBe(false);expect(q.assets.image,q.id).toBeNull();
      expect(q.topic_tags,q.id).not.toContain('evolve_4_unit_1');if(q.context_id)expect(contextById(q.context_id),q.id).toBeTruthy();
    }
  });
  it('offers the workbook modes and puts listening in the actual third lesson',()=>{
    expect(flashcardItems(qs)).toHaveLength(296);
    for(let u=1;u<=12;u++){
      const id=`evolve-5.u${String(u).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);
      expect(pool.every(q=>q.id.startsWith('evolve5.native.wb.')),id).toBe(true);
      expect(a.flashcards.count,id).toBeGreaterThan(15);expect(a.grammar_detective.count,id).toBe(16);
      expect(a.sentence_builder.count,id).toBe(4);expect(a.listening_lab.count,id).toBe(6);expect(a.writing_studio.count,id).toBe(1);
      expect(a.reading_explorer.count,id).toBe(1);
      expect(pool.filter(q=>q.skill==='reading'),id).toHaveLength(4);
      expect(scopeQuestions(nodeScope(id+'.s3')).filter(q=>q.skill==='listening'),id).toHaveLength(6);
      expect(scopeQuestions(nodeScope(id+'.s4')).some(q=>q.skill==='reading'),id).toBe(true);
    }
    for(const {q,pool}of gapItems(qs))expect(pool.filter(a=>isAccepted(q,a)),q.id).toHaveLength(1);
    for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  });
  it('retains every printed quiz item in 24 ordered fixed assessments',()=>{
    expect(EVOLVE5_NATIVE.assessments).toHaveLength(24);expect(EVOLVE5_NATIVE.assessments.flatMap(a=>a.question_ids)).toHaveLength(959);
    const pack=livePack(LIVE_CATALOGUE,0);
    for(const a of EVOLVE5_NATIVE.assessments){
      expect(a.time_limit_seconds).toBeNull();expect(a.official_max_marks).toBeNull();
      const session=assessmentSession(pack,a,contextById);expect(session.status,a.id).toBe('ready');
      if(session.status==='ready'){expect(session.sections.map(s=>s.id)).toEqual(['A','B','C','D','E','F']);expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);}
      expect(scopeQuestions(LIVE_SELECTIONS.find(s=>s.id===a.id)!.scope).map(q=>q.id)).toEqual(a.question_ids);
    }
    expect(EVOLVE5_NATIVE.assessments.find(a=>a.id==='evolve5.quiz.u10.b.practice')!.question_ids).toHaveLength(39);
    expect(EVOLVE5_NATIVE.assessments.find(a=>a.id==='evolve5.quiz.u12.a.practice')!.question_ids).toHaveLength(40);
  });
  it('grades complete answer sets without rejecting legitimate alternatives or accepting incomplete sets',()=>{
    const forms=quiz('u01.a.e1');expect(forms.answer.value).toBe('used to buy / would buy / bought');expect(forms.instruction_en).toContain('EVERY');
    expect(gradeChoice(forms,forms.answer.correct_option_id!)).toBe(true);
    expect(gradeChoice(forms,forms.options.find(o=>o.text==='used to buy')!.id)).toBe(false);
    const both=quiz('u07.b.e2');expect(both.answer.value).toBe('Both A and B');expect(both.options.map(o=>o.text)).toEqual(['Only A','Only B','Both A and B']);
    expect(gradeChoice(both,'c')).toBe(true);expect(gradeChoice(both,'a')).toBe(false);
    expect(quiz('u01.b.e2').answer.value).toBe('would go / used to go');
    expect(quiz('u07.a.e1').answer.value).toBe('Incorrect');expect(quiz('u07.a.e2').answer.value).toBe('Correct');
    expect(quiz('u05.a.e1').format).toBe('odd_one_out');expect(quiz('u05.a.e1').answer.value).toBe('unless');
  });
  it('repairs source-key swaps, missing labels and malformed sentence options explicitly',()=>{
    expect(quiz('u02.a.d4').answer.value).toBe('to');expect(quiz('u02.a.d6').answer.value).toBe('warm enough');
    expect(quiz('u02.b.e1').answer.value).toBe('One of the best ways to reduce pollution is with electric cars');
    expect(quiz('u03.a.d8').answer.value).toBe('We need people more confident about the project');
    expect(quiz('u06.a.e7').answer.value).toBe('we had to do');
    expect(quiz('u12.a.c7').answer.value).toBe('gets');expect(quiz('u12.a.c8').answer.value).toBe('was');
    expect(quiz('u12.a.c8').source['answer_key_item_number']).toBe(9);
    for(const id of ['u02.a.d4','u02.a.d6','u02.b.e1','u03.a.d8','u06.a.e7','u12.a.c8'])expect(quiz(id).source['source_correction'],id).toBeTruthy();
    expect(['a1','a2','a3','a4','a5'].map(id=>quiz('u01.b.'+id).answer.value)).toEqual(['Lesson 5','Lesson 3','Lesson 4','Lesson 2','Lesson 1']);
  });
  it('preserves complete readings, paragraph labels and clean native choice text',()=>{
    expect(EVOLVE5_NATIVE.contexts.filter(c=>c.kind==='reading_passage')).toHaveLength(36);
    expect(EVOLVE5_NATIVE.contexts.filter(c=>c.kind==='reading_passage'&&c.id.startsWith('evolve5.native.wb.'))).toHaveLength(12);
    expect(contextById('evolve5.quiz.u08.b.f.reading')?.text).toContain('Filmmaking Workshop');
    expect(contextById('evolve5.quiz.u08.b.f.reading')?.text).not.toContain('What is Get together');
    expect(quiz('u08.b.f1').options).toHaveLength(3);
    expect(quiz('u10.a.f1').answer.value).toBe('identical');expect(quiz('u10.a.f2').answer.value).toBe('non-identical');
    const c=contextById('evolve5.quiz.u01.b.e.cloze')!;expect([...c.text!.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]))).toEqual([1,2,3,4,5,6,7]);
    for(const q of qs.filter(q=>q.options.length)){
      expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(q.options.some(o=>o.id===q.answer.correct_option_id),q.id).toBe(true);
      expect(q.options.map(o=>o.text).join('|'),q.id).not.toMatch(/UNIT QUIZ|can't be reduced|1\/One/);
    }
  });
  it('bundles all 36 recordings with full transcripts and independent photo assets',()=>{
    expect(EVOLVE5_NATIVE.assets.filter(a=>a.kind==='audio')).toHaveLength(36);expect(EVOLVE5_NATIVE.assets.filter(a=>a.kind==='image')).toHaveLength(16);
    const checked=new Map<string,string>();for(const a of EVOLVE5_NATIVE.assets){
      expect(a.path).toMatch(/^\/assets\/evolve-5-native\//);if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));
      expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);
    }
    const scripts=EVOLVE5_NATIVE.contexts.filter(c=>c.kind==='listening_transcript');expect(scripts).toHaveLength(36);
    for(const c of scripts){expect(c.text!.length,c.id).toBeGreaterThan(1000);expect(c['display_policy'],c.id).toBe('after_answer_only');}
    expect(contextById('evolve5.quiz.u01.a.audio.transcript')?.text).toContain('Do something new every week');
    expect(contextById('evolve5.native.wb.audio.6.transcript')?.text).toContain('overhead costs');
    expect(byId.get('evolve5.native.wb.u01.listen1')?.source).toMatchObject({printed_page:6,pages:[8]});
  });
  it('preserves all 36 Upper Intermediate recommendations and their ready destinations',()=>{
    const expected=[[72,45,74],[46,47,49],[16,64,17],[65,66,93],[67,83,39],[62,42,3],[32,36,37],[23,99,18],[21,84,88],[70,1,38],[61,54,55],[20,85,94]];
    for(const row of EVOLVE5_RECOMMENDATIONS){expect(row.recommendations.map(r=>r.unit)).toEqual(expected[row.unit-1]);for(const r of row.recommendations){expect(r.book_id).toBe('ows-upper-intermediate');expect(oxfordDestination(r,LIVE_CATALOGUE.nodes)).toBeTruthy();}}
    expect(BOOK_RELEASES.slice(0,16)).toHaveLength(16);expect(BOOK_RELEASES[9]).toBe(EVOLVE4_NATIVE);expect(BOOK_RELEASES[10]).toBe(EVOLVE5_NATIVE);
    const old=BOOK_RELEASES.slice(0,10).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('cumulative',old);
    expect(poolMissions('cumulative',[...old,...qs]).slice(0,before.length)).toEqual(before);
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
    expect(readFileSync('src/data/evolve5/native.pack.json').length).toBeLessThan(3_200_000);
  });
});
