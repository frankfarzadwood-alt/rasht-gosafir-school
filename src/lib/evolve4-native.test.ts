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
import { EVOLVE5_NATIVE } from './content/evolve5';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVOLVE4_NATIVE, EVOLVE4_NODES, EVOLVE4_RECOMMENDATIONS, EVOLVE4_TARGETS, EVOLVE4_WRITING } from './content/evolve4';
import { BOOK_CONTENT, BOOK_RELEASES, LIVE_CATALOGUE, LIVE_SELECTIONS, mediaAsset, PILOT } from './content/pilot';
import { oxfordDestination } from './content/evolve-series';
import { BUNDLED_QUESTIONS, contextById, flashcardItems, forgeItems, gapItems, ineligibility, isAccepted, poolAvailability, poolMissions, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { assessmentSession, livePack } from './scope';
import { validateQuestionPack } from './content/validate';

type ReviewedQuestion=Question & {source:Question['source'] & Record<string,unknown>};
const qs=EVOLVE4_NATIVE.questions as unknown as ReviewedQuestion[];
const byId=new Map(qs.map(q=>[q.id,q]));
const quiz=(id:string)=>byId.get('evolve4.quiz.'+id)!;

describe('Evolve 4 native release',()=>{
  it('adds complete source-linked content for all 48 lessons without school fields or page crops',()=>{
    expect(qs).toHaveLength(1575);expect(qs.filter(q=>q.id.startsWith('evolve4.native.wb.'))).toHaveLength(607);
    expect(EVOLVE4_NODES).toHaveLength(61);expect(EVOLVE4_TARGETS).toHaveLength(48);expect(EVOLVE4_WRITING).toHaveLength(12);
    expect(validateQuestionPack(EVOLVE4_NATIVE,catalogueIndex)).toEqual([]);
    expect(qs.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);
    const sources=new Set(EVOLVE4_NATIVE.sources.map(s=>s['id']));
    for(const q of qs){
      expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();
      expect(sources.has(q.source_id),q.id).toBe(true);expect(q.source.pages.length,q.id).toBeGreaterThan(0);
      expect(q.assets.source_image_required,q.id).toBe(false);expect(q.assets.image,q.id).toBeNull();
      if(q.context_id)expect(contextById(q.context_id),q.id).toBeTruthy();
    }
    expect(BUNDLED_QUESTIONS).toHaveLength(14899 + EVOLVE5_NATIVE.questions.length + OXFORD_UPPER.questions.length + EVOLVE6_NATIVE.questions.length + PROJECT1_NATIVE.questions.length + PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);
  });
  it('offers the native workbook modes in every unit and preserves answer inventories',()=>{
    expect(flashcardItems(qs)).toHaveLength(274);
    for(let u=1;u<=12;u++){
      const id=`evolve-4.u${String(u).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);
      expect(pool.length,id).toBeGreaterThan(40);expect(pool.every(q=>q.id.startsWith('evolve4.native.wb.')),id).toBe(true);
      expect(a.flashcards.count,id).toBeGreaterThan(15);expect(a.grammar_detective.count,id).toBe(16);
      expect(a.sentence_builder.count,id).toBe(4);expect(a.listening_lab.count,id).toBe(u===10?11:6);
      expect(a.writing_studio.count,id).toBe(1);expect(pool.filter(q=>q.skill==='conversation'),id).toHaveLength(4);
      expect(scopeQuestions(nodeScope(id+'.s4')).some(q=>q.skill==='reading'),id).toBe(true);
    }
    for(const {q,pool}of gapItems(qs))expect(pool.filter(a=>isAccepted(q,a)),q.id).toHaveLength(1);
    for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  });
  it('retains all 968 quiz items, including the seventh section in 1A, in exact fixed order',()=>{
    const pack=livePack(LIVE_CATALOGUE,0);
    expect(EVOLVE4_NATIVE.assessments).toHaveLength(24);expect(EVOLVE4_NATIVE.assessments.flatMap(a=>a.question_ids)).toHaveLength(968);
    for(const a of EVOLVE4_NATIVE.assessments){
      expect(a.official_max_marks).toBeNull();expect(a.time_limit_seconds).toBeNull();
      const session=assessmentSession(pack,a,contextById);expect(session.status,a.id).toBe('ready');
      if(session.status==='ready'){
        expect(session.sections.map(s=>s.id)).toEqual(a.id==='evolve4.quiz.u01.a.practice'?['A','B','C','D','E','F','G']:['A','B','C','D','E','F']);
        expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);
        expect(session.sections.every(s=>s.questions.length>0)).toBe(true);
      }
      expect(scopeQuestions(LIVE_SELECTIONS.find(s=>s.id===a.id)!.scope).map(q=>q.id)).toEqual(a.question_ids);
    }
  });
  it('corrects conflicting source keys and keeps shuffled source section mappings explicit',()=>{
    expect(quiz('u02.a.c1').source['answer_key_section']).toBe('D');
    expect(quiz('u02.a.d1').source['answer_key_section']).toBe('E');
    expect(quiz('u02.a.e1').source['answer_key_section']).toBe('C');
    expect(quiz('u03.b.b1').source['answer_key_section']).toBe('C');
    expect(quiz('u03.b.c1').source['answer_key_section']).toBe('B');
    expect(['g1','g2','g3'].map(id=>quiz('u01.a.'+id).answer.value)).toEqual(['Comment C','Comment B','Comment A']);
    expect(quiz('u01.b.e6').answer.value).toBe('Stative');
    expect(quiz('u04.b.e6').answer.value).toBe('that');expect(quiz('u04.b.e6').options.map(o=>o.text)).not.toContain('');
    expect(quiz('u08.a.e1').answer.value).toBe("I wish I hadn't bought these shoes");
    expect(quiz('u11.a.e1').answer.value).toBe('made me do');
    for(const id of ['u01.b.e6','u01.a.g1','u01.a.g2','u01.a.g3','u04.b.e6','u08.a.e1','u11.a.e1'])expect(quiz(id).source['source_correction'],id).toBeTruthy();
    expect(['f1','f2','f3','f4','f5'].map(id=>quiz('u10.b.'+id).answer.value)).toEqual(['True','False','False','True','False']);
    expect(quiz('u10.b.f4').prompt_en).toContain('Beatles');expect(quiz('u10.b.f5').prompt_en).toContain('Decca');
  });
  it('uses complete category tasks, native paragraphs and unambiguous choice identities',()=>{
    expect(qs.filter(q=>q.id.startsWith('evolve4.quiz.u11.a.b'))).toHaveLength(10);
    expect(qs.filter(q=>q.id.startsWith('evolve4.quiz.u12.a.b'))).toHaveLength(10);
    expect(quiz('u11.a.b1').prompt_en).toContain('dorm');expect(quiz('u11.a.b1').answer.value).toBe('places and buildings');
    expect(quiz('u12.a.b1').answer.value).toBe('smell');
    const contexts=EVOLVE4_NATIVE.contexts.filter(c=>c.kind==='native_cloze');expect(contexts).toHaveLength(9);
    for(const c of contexts){const labels=[...c.text!.matchAll(/\[(\d+)\]/g)].map(m=>+m[1]!);expect(labels,c.id).toEqual(Array.from({length:labels.length},(_,i)=>i+1));}
    for(const q of qs.filter(q=>q.options.length)){
      expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);
      expect(q.options.some(o=>o.id===q.answer.correct_option_id),q.id).toBe(true);
      expect(q.options.map(o=>o.text).join('|'),q.id).not.toMatch(/\b(?:truthfu l|fac e|p rofile|medicall y|S tart|Strat)\b/);
    }
    expect(EVOLVE4_NATIVE.contexts.filter(c=>c.kind==='reading_passage')).toHaveLength(25);
    expect(contextById('evolve4.quiz.u01.a.f.reading')?.text).not.toContain('Small problems');
    expect(contextById('evolve4.quiz.u01.a.g.reading')?.text).toContain('Candidate 3 got the job');
    expect(contextById('evolve4.quiz.u07.a.f.reading')?.text).toMatch(/^Mansi22/);
  });
  it('bundles every supplied recording and independent photo with verified local hashes',()=>{
    expect(EVOLVE4_NATIVE.assets.filter(a=>a.kind==='audio')).toHaveLength(37);expect(EVOLVE4_NATIVE.assets.filter(a=>a.kind==='image')).toHaveLength(16);
    const checked=new Map<string,string>();
    for(const a of EVOLVE4_NATIVE.assets){
      expect(a.path).toMatch(/^\/assets\/evolve-4-native\//);
      if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));
      expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);
    }
    for(const q of qs.filter(q=>q.skill==='listening'))expect(contextById(q.context_id)?.display_policy,q.id).toBe('after_answer_only');
    expect(qs.filter(q=>q.assets.audio==='evolve4.native.wb.audio.10.tone')).toHaveLength(5);
    expect(byId.get('evolve4.native.wb.u10.listen1')?.assets.audio).toBe('evolve4.native.wb.audio.10');
    for(let u=1;u<=12;u++)expect(contextById(`evolve4.native.wb.audio.${u}.transcript`)?.text?.length).toBeGreaterThan(300);
  });
  it('activates the 36 supplied Intermediate recommendations and preserves every prior release',()=>{
    const expected=[[38,9,99],[23,25,24],[80,81,21],[82,64,66],[65,91,86],[43,37,56],[70,98,97],[77,85,94],[95,96,49],[53,20,72],[74,76,73],[47,18,52]];
    for(const row of EVOLVE4_RECOMMENDATIONS){expect(row.recommendations.map(r=>r.unit)).toEqual(expected[row.unit-1]);for(const r of row.recommendations){expect(r.book_id).toBe('ows-intermediate');const target=oxfordDestination(r,LIVE_CATALOGUE.nodes)!;expect(scopeQuestions(nodeScope(target.id)).length).toBeGreaterThan(0);}}
    expect(BOOK_RELEASES.slice(0,10)).toHaveLength(10);expect(BOOK_RELEASES[9]).toBe(EVOLVE4_NATIVE);
    const before=BOOK_RELEASES.slice(0,9).flatMap(p=>p.questions) as unknown as Question[];
    expect(poolMissions('cumulative',[...before,...qs]).slice(0,poolMissions('cumulative',before).length)).toEqual(poolMissions('cumulative',before));
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
    expect(readFileSync('src/data/evolve4/native.pack.json').length).toBeLessThan(3_200_000);
  });
});
