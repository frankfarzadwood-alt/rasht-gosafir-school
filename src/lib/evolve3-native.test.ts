import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { EVOLVE3_NATIVE, EVOLVE3_NODES, EVOLVE3_RECOMMENDATIONS, EVOLVE3_TARGETS, EVOLVE3_WRITING } from './content/evolve3';
import { EVOLVE2_NATIVE } from './content/evolve2';
import { ALL_EVOLVE_RECOMMENDATIONS, oxfordDestination } from './content/evolve-series';
import { BOOK_CONTENT, BOOK_RELEASES, LIVE_CATALOGUE, LIVE_SELECTIONS, mediaAsset, PILOT } from './content/pilot';
import { contextById, flashcardItems, forgeItems, gapItems, grammarItems, ineligibility, isAccepted, pairCandidates, poolAvailability, poolMissions, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { assessmentSession, livePack } from './scope';
import { validateQuestionPack } from './content/validate';
type ReviewedQuestion=Question & {source:Question['source'] & Record<string,unknown>};
const questions=EVOLVE3_NATIVE.questions as unknown as ReviewedQuestion[];
const byId=new Map(questions.map(q=>[q.id,q]));
const quiz=(item:string)=>byId.get('evolve3.quiz.'+item)!;

describe('Evolve 3 native release',()=>{
  it('adds unique, eligible, source-linked content across every lesson',()=>{
    expect(EVOLVE3_NODES).toHaveLength(61);
    expect(EVOLVE3_TARGETS).toHaveLength(48);
    expect(EVOLVE3_WRITING).toHaveLength(12);
    expect(questions).toHaveLength(1561);
    expect(questions.filter(q=>q.id.startsWith('evolve3.native.wb.'))).toHaveLength(605);
    expect(new Set(questions.map(q=>q.id)).size).toBe(questions.length);
    expect(validateQuestionPack(EVOLVE3_NATIVE,catalogueIndex)).toEqual([]);
    expect(questions.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    const sources=new Set(EVOLVE3_NATIVE.sources.map(s=>s['id']));
    for(const q of questions){
      expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();
      expect(sources.has(q.source_id),q.id).toBe(true);
      expect(q.source.pages.length,q.id).toBeGreaterThan(0);
      expect(q.assets.source_image_required,q.id).toBe(false);
      expect(q.assets.image,q.id).toBeNull();
      if(q.context_id)expect(contextById(q.context_id),q.id).toBeTruthy();
    }
  });
  it('offers native vocabulary, grammar, conversation, listening and writing in all twelve units',()=>{
    expect(flashcardItems(questions)).toHaveLength(277);
    for(let unit=1;unit<=12;unit++){
      const node=`evolve-3.u${String(unit).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',node)),a=poolAvailability(pool);
      expect(pool.length,node).toBeGreaterThan(40);
      expect(pool.every(q=>q.id.startsWith('evolve3.native.wb.')),node).toBe(true);
      expect(a.flashcards.count,node).toBeGreaterThan(15);
      expect(a.grammar_detective.count,node).toBe(16);
      expect(a.sentence_builder.count,node).toBe(4);
      expect(a.listening_lab.count,node).toBe(6);
      expect(a.writing_studio.count,node).toBe(1);
      expect(pool.filter(q=>q.skill==='conversation'),node).toHaveLength(4);
      expect(scopeQuestions(nodeScope(node+'.s4')).some(q=>q.skill==='reading'),node).toBe(true);
    }
    for(const {q,pool}of gapItems(questions))expect(pool.filter(a=>isAccepted(q,a)),q.id).toHaveLength(1);
    for(const q of sentenceItems(questions))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(questions))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
    expect(grammarItems(questions).length).toBeGreaterThan(300);
    const pairs=pairCandidates(questions).map(p=>p.answer);
    for(const synonyms of [['huge','enormous'],['magnificent','terrific'],['achievement','success']])expect(synonyms.filter(s=>pairs.includes(s))).toHaveLength(1);
  });
  it('keeps 24 fixed six-section quizzes complete and ordered with practice scoring',()=>{
    const pack=livePack(LIVE_CATALOGUE,0);
    expect(EVOLVE3_NATIVE.assessments).toHaveLength(24);
    expect(EVOLVE3_NATIVE.assessments.flatMap(a=>a.question_ids)).toHaveLength(956);
    for(const assessment of EVOLVE3_NATIVE.assessments){
      expect(assessment.official_max_marks).toBeNull();
      expect(assessment.time_limit_seconds).toBeNull();
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
  it('rejects the duplicate 12A key for 12B and records independently reviewed practice answers',()=>{
    const derived=questions.filter(q=>q.id.startsWith('evolve3.quiz.u12.b.'));
    expect(derived).toHaveLength(41);
    expect(EVOLVE3_NATIVE.sources.find(s=>s['id']==='evolve3.quiz.u12.b.key')).toMatchObject({usable_as_key:false,reason:'duplicate_of_12A'});
    for(const q of derived){
      expect(q.source['original_key'],q.id).toBeNull();
      expect(q.source['answer_basis'],q.id).toBe('independent_review_of_paper_script_and_passage');
      expect(q.answer.provenance,q.id).toContain('duplicated 12A key rejected');
      expect(q.answer.verification_status,q.id).toBe('reviewed_by_assistant');
    }
    expect(['a1','a2','a3','a4'].map(id=>quiz('u12.b.'+id).answer.correct_option_id)).toEqual(['c','b','a','b']);
    expect(['f1','f2','f3','f4','f5'].map(id=>quiz('u12.b.'+id).answer.value)).toEqual(['False','Not given','True','Not given','False']);
    expect(quiz('u12.b.b3').answer.value).toBe('fell');
    expect(quiz('u12.b.d7').answer.value).toBe('No one');
    expect(quiz('u12.b.e5').answer.value).toBe('had done');
  });
  it('preserves printed items when source keys omit, reorder or misstate answers',()=>{
    expect(quiz('u01.a.d1').source['item_number']).toBe(1);
    expect(quiz('u02.b.d1').source['item_number']).toBe(1);
    expect(quiz('u06.a.b1').source['answer_key_section']).toBe('2');
    expect(quiz('u02.a.d7').answer.value).toBe('since');
    expect(quiz('u02.a.d7').source['original_key']).toBeNull();
    expect(quiz('u05.a.d7').answer.value).toBe('searched');
    expect(questions.filter(q=>q.id.startsWith('evolve3.quiz.u05.a.e'))).toHaveLength(5);
    expect(quiz('u05.a.e5').source['answer_key_item_number']).toBe(6);
    expect(quiz('u05.a.e5').answer.value).toBe('was walking / started');
    expect(['f1','f2','f3','f4','f5'].map(id=>quiz('u08.b.'+id).answer.correct_option_id)).toEqual(['c','c','a','b','a']);
    expect(quiz('u08.b.f1').source['answer_key_section']).toBe('G');
    for(const [id,answer]of Object.entries({'u07.a.b1':'jazz','u10.a.d2':'is dropped','u10.b.d1':'are watched','u10.b.c6':'designed','u11.a.e4':'had / would read','u11.b.e7':'would / go'})){
      expect(quiz(id).answer.value,id).toBe(answer);
      expect(quiz(id).source['source_correction'],id).toBeTruthy();
    }
    expect(isAccepted(quiz('u10.b.d1'),'is watched')).toBe(false);
    expect(quiz('u04.b.e1').answer.value).toContain('open');
  });
  it('uses readable numbered native paragraphs and complete choice controls',()=>{
    const contexts=EVOLVE3_NATIVE.contexts.filter(c=>c.kind==='native_cloze');
    expect(contexts).toHaveLength(31);
    for(const c of contexts){
      const labels=[...c.text!.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]));
      expect(labels,c.id).toEqual(Array.from({length:labels.length},(_,i)=>i+1));
      expect(c.text,c.id).not.toMatch(/(?:H ow|W hat|Ineed|Ithink|____\s*\/)/);
    }
    const closed=questions.filter(q=>q.source['choice_origin']==='printed_inline_alternatives');
    expect(closed).toHaveLength(197);
    for(const q of questions.filter(q=>q.options.length)){
      expect(new Set(q.options.map(o=>o.text.trim().toLowerCase())).size,q.id).toBe(q.options.length);
      expect(q.options.find(o=>o.id===q.answer.correct_option_id),q.id).toBeTruthy();
      expect(q.options.map(o=>o.text),q.id).not.toContain('Wouldn');
    }
    expect(quiz('u02.a.b1').options.map(o=>o.text)).toEqual(['fancy','useful','useless']);
    expect(contextById('evolve3.quiz.u05.b.e.cloze')?.text).toContain('Hank [3] ____ to Las Vegas');
    expect(contextById('evolve3.quiz.u11.b.e.cloze')?.text).toContain('what would you change?');
  });
  it('bundles all 36 recordings and 16 independent photo tiles with matching hashes',()=>{
    expect(EVOLVE3_NATIVE.assets.filter(a=>a.kind==='audio')).toHaveLength(36);
    expect(EVOLVE3_NATIVE.assets.filter(a=>a.kind==='image')).toHaveLength(16);
    const checked=new Map<string,string>();
    for(const a of EVOLVE3_NATIVE.assets){
      expect(a.path).toMatch(/^\/assets\/evolve-3-native\//);
      if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));
      expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);
    }
    for(const q of questions.filter(q=>q.skill==='listening'))expect(contextById(q.context_id)?.display_policy).toBe('after_answer_only');
    for(let unit=1;unit<=12;unit++)expect(contextById(`evolve3.native.wb.audio.${unit}.transcript`)?.text?.length).toBeGreaterThan(300);
    expect(contextById('evolve3.native.wb.audio.4.transcript')?.text).toMatch(/see you on Friday/);
    expect(byId.get('evolve3.native.wb.u09.listen1')?.source).toMatchObject({printed_page:73,pages:[75]});
  });
  it('preserves 36 Intermediate mappings and exact ready sections without mixing levels',()=>{
    const expected=[['7','10','6'],['41','36','69'],['31A','33','32'],['19','35','39'],['90','54A','55'],['16','17','48'],['62','60','63'],['42','87','88'],['75','78','79'],['27','28','44'],['83','93','92'],['84','12','67']];
    expect(EVOLVE3_RECOMMENDATIONS).toHaveLength(12);
    for(const row of EVOLVE3_RECOMMENDATIONS){
      expect(row.evolve_book_id).toBe('evolve-3');
      expect(row.recommendations.map(r=>String(r.unit)+(r.section??''))).toEqual(expected[row.unit-1]);
      for(const r of row.recommendations){expect(r.book_id).toBe('ows-intermediate');const target=oxfordDestination(r,LIVE_CATALOGUE.nodes)!;expect(target).toBeTruthy();expect(scopeQuestions(nodeScope(target.id)).length).toBeGreaterThan(0);}
    }
    const exact=ALL_EVOLVE_RECOMMENDATIONS.find(r=>r.evolve_book_id==='evolve-1')!.recommendations.find(r=>r.unit===13&&r.section==='A')!;
    const destination=oxfordDestination(exact,LIVE_CATALOGUE.nodes)!;
    expect(destination.id).toBe('ows-elementary.u013.s1');
    expect(scopeQuestions(nodeScope(destination.id))).toHaveLength(27);
    expect(oxfordDestination({...exact,section:'Z'},LIVE_CATALOGUE.nodes)).toBeNull();
  });
  it('appends after earlier releases without shifting old missions or fixed quizzes',()=>{
    expect(BOOK_RELEASES[4]).toBe(EVOLVE2_NATIVE);expect(BOOK_RELEASES[5]).toBe(EVOLVE3_NATIVE);
    const old=BOOK_RELEASES.slice(0,5).flatMap(p=>p.questions) as unknown as Question[];
    const before=poolMissions('cumulative',old),after=poolMissions('cumulative',[...old,...questions]);
    expect(after.slice(0,before.length)).toEqual(before);
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  });
});
