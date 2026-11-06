import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVOLVE2_NATIVE, EVOLVE2_NODES, EVOLVE2_RECOMMENDATIONS, EVOLVE2_TARGETS, EVOLVE2_WRITING } from './content/evolve2';
import { BOOK_CONTENT, BOOK_RELEASES, LIVE_CATALOGUE, LIVE_SELECTIONS, mediaAsset, PILOT } from './content/pilot';
import { contextById, flashcardItems, forgeItems, gapItems, grammarItems, ineligibility, isAccepted, poolAvailability, poolMissions, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { assessmentSession, livePack } from './scope';
import { validateQuestionPack } from './content/validate';
import { learnerInstruction } from './display';
const questions=EVOLVE2_NATIVE.questions as unknown as Question[];

describe('Evolve 2 native release',()=>{
  it('adds a complete native catalogue and reviewed, unique source-linked items',()=>{
    expect(EVOLVE2_NODES).toHaveLength(61);
    expect(EVOLVE2_TARGETS).toHaveLength(48);
    expect(EVOLVE2_WRITING).toHaveLength(12);
    expect(questions).toHaveLength(1575);
    expect(new Set(questions.map(q=>q.id)).size).toBe(questions.length);
    expect(validateQuestionPack(EVOLVE2_NATIVE,catalogueIndex)).toEqual([]);
    expect(questions.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    const sources=new Set(EVOLVE2_NATIVE.sources.map(s=>s['id']));
    for(const q of questions){expect(q.grade).toBeUndefined();expect(q.term).toBeUndefined();expect(sources.has(q.source_id),q.id).toBe(true);expect(q.source.pages.length,q.id).toBeGreaterThan(0);}
    expect(EVOLVE2_NATIVE.assets.every(a=>a.path.startsWith('/assets/evolve-2-native/'))).toBe(true);
  });
  it('provides vocabulary, grammar, speaking, listening and writing in all twelve units',()=>{
    expect(flashcardItems(questions)).toHaveLength(264);
    expect(questions.filter(q=>q.vocabulary_entry_id).every(q=>q.options.length===4&&q.options.some(o=>o.id===q.answer.correct_option_id&&o.text===q.answer.value))).toBe(true);
    for(let unit=1;unit<=12;unit++){
      const node=`evolve-2.u${String(unit).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',node)),a=poolAvailability(pool);
      expect(pool.length,node).toBeGreaterThan(40);
      expect(pool.every(q=>q.id.startsWith('evolve2.native.wb.'))).toBe(true);
      expect(a.flashcards.count,node).toBeGreaterThan(15);
      expect(a.grammar_detective.count,node).toBe(16);
      expect(a.sentence_builder.count,node).toBe(4);
      expect(a.listening_lab.count,node).toBe(6);
      expect(a.writing_studio.count,node).toBe(1);
      expect(pool.filter(q=>q.skill==='conversation'),node).toHaveLength(4);
      expect(scopeQuestions(nodeScope(node+'.s4')).some(q=>q.skill==='reading')).toBe(true);
    }
    for(const {q,pool}of gapItems(questions))expect(pool.filter(a=>isAccepted(q,a)),q.id).toHaveLength(1);
    for(const q of sentenceItems(questions))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(questions))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
    expect(grammarItems(questions).length).toBeGreaterThan(300);
    const typed=questions.find(q=>q.id==='evolve2.native.wb.u01.g1')!;
    expect(learnerInstruction(typed,'quiz_sprint').fa).toContain('بنویس');
    expect(learnerInstruction(typed,'grammar_detective').fa).toContain('بنویس');
    expect(learnerInstruction(questions.find(q=>q.id==='evolve2.native.wb.u01.s1')!,'grammar_detective').fa).not.toContain('خطادار');
  });
  it('keeps all 24 quizzes in six exact, ordered sections, with unweighted practice scoring',()=>{
    const pack=livePack(LIVE_CATALOGUE,0);
    expect(EVOLVE2_NATIVE.assessments).toHaveLength(24);
    expect(EVOLVE2_NATIVE.assessments.flatMap(a=>a.question_ids)).toHaveLength(967);
    for(const assessment of EVOLVE2_NATIVE.assessments){
      expect(assessment.official_max_marks).toBeNull();
      const session=assessmentSession(pack,assessment,contextById);
      expect(session.status,assessment.id).toBe('ready');
      if(session.status==='ready'){
        expect(session.sections.map(s=>s.id)).toEqual(['A','B','C','D','E','F']);
        expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(assessment.question_ids);
        expect(session.sections.every(s=>s.questions.length>0)).toBe(true);
      }
      const selection=LIVE_SELECTIONS.find(s=>s.id===assessment.id)!;
      expect(scopeQuestions(selection.scope).map(q=>q.id)).toEqual(assessment.question_ids);
    }
  });
  it('pairs reordered answer keys with the correct source exercises and records the inconsistent key',()=>{
    const byId=new Map(questions.map(q=>[q.id,q]));
    expect(byId.get('evolve2.quiz.u01.b.a1')!.answer.value).toBe('neighbors');
    expect(byId.get('evolve2.quiz.u01.b.e1')!.skill).toBe('listening');
    expect(byId.get('evolve2.quiz.u03.a.a1')!.answer.value).toBe('True');
    expect(byId.get('evolve2.quiz.u03.a.b1')!.answer.value).toBe('gym');
    expect(byId.get('evolve2.quiz.u03.b.a2')!.answer.value).toBe('35 miles');
    expect(byId.get('evolve2.quiz.u04.b.e1')!.skill).toBe('listening');
    expect(byId.get('evolve2.quiz.u06.a.b1')!.answer.provenance).toContain('cannot be mapped');
    expect(byId.get('evolve2.quiz.u06.a.b1')!.answer.value).toBe('sold');
    expect(isAccepted(byId.get('evolve2.quiz.u12.a.e2')!,'that')).toBe(true);
  });
  it('bundles every local recording and both independent photo atlases with matching hashes',()=>{
    expect(EVOLVE2_NATIVE.assets.filter(a=>a.kind==='audio')).toHaveLength(36);
    expect(EVOLVE2_NATIVE.assets.filter(a=>a.kind==='image')).toHaveLength(32);
    const checked=new Map<string,string>();
    for(const a of EVOLVE2_NATIVE.assets){
      if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));
      expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);
    }
    for(const q of questions.filter(q=>q.skill==='listening'))expect(contextById(q.context_id)?.display_policy).toBe('after_answer_only');
    for(const q of questions.filter(q=>q.native_options))expect(Object.values(q.native_options!)).toHaveLength(3);
  });
  it('follows all 36 supplied Oxford recommendations without mixing Evolve book numbers',()=>{
    const expected=[[16,29,42],[41,75,91],[82,12,96],[84,94,10],[17,39,95],[27,28,20],[49,50,55],[89,53,45],[25,11,32],[69,31,15],[85,74,21],[37,57,76]];
    expect(EVOLVE2_RECOMMENDATIONS).toHaveLength(12);
    for(const row of EVOLVE2_RECOMMENDATIONS){expect(row.evolve_book_id).toBe('evolve-2');expect(row.recommendations.map(r=>r.unit)).toEqual(expected[row.unit-1]);for(const r of row.recommendations)expect(scopeQuestions(nodeScope(r.unit_node_id)).length).toBeGreaterThan(0);}
  });
  it('appends a new release while preserving existing quiz and mission identities',()=>{
    expect(BOOK_RELEASES[4]).toBe(EVOLVE2_NATIVE);
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
    const old=BOOK_RELEASES.slice(0,4).flatMap(release=>release.questions) as unknown as Question[];
    const before=poolMissions('cumulative',old),after=poolMissions('cumulative',[...old,...questions]);
    expect(after.slice(0,before.length)).toEqual(before);
  });
});
