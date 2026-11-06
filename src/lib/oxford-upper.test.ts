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
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { OXFORD_UPPER, OXFORD_UPPER_RELEASES, OXFORD_UPPER_NODES, OXFORD_UPPER_SECTIONS, OXFORD_UPPER_COVERAGE } from './content/oxford-upper';
import { EVOLVE5_NATIVE, EVOLVE5_RECOMMENDATIONS } from './content/evolve5';
import { BOOK_RELEASES, BOOK_CONTENT, LIVE_CATALOGUE, mediaAsset, PILOT } from './content/pilot';
import { ALL_EVOLVE_RECOMMENDATIONS, oxfordDestination } from './content/evolve-series';
import { validateCatalogue, validateQuestionPack } from './content/validate';
import { BUNDLED_QUESTIONS, contextById, flashcardItems, forgeItems, gapItems, gradeChoice, grammarItems, ineligibility, isAccepted, pairCandidates, poolMissions, readingGroups, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';

type NativeQuestion=Question & {source:Question['source'] & Record<string,unknown>};
const qs=OXFORD_UPPER.questions as unknown as NativeQuestion[];
const unit=(n:number)=>`ows-upper-intermediate.u${String(n).padStart(3,'0')}`;
const byId=new Map(qs.map(q=>[q.id,q]));

describe('Oxford Upper Intermediate–Advanced native release',()=>{
  it('covers 100 source units with validated native content and stable source references',()=>{
    expect(qs).toHaveLength(3188);expect(OXFORD_UPPER_COVERAGE.units).toHaveLength(100);
    expect(OXFORD_UPPER_NODES.filter(n=>n.kind==='unit')).toHaveLength(100);expect(OXFORD_UPPER_SECTIONS).toHaveLength(134);
    expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);expect(BUNDLED_QUESTIONS).toHaveLength(19718 + EVOLVE6_NATIVE.questions.length + PROJECT1_NATIVE.questions.length + PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);
    expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);
    for(const p of OXFORD_UPPER_RELEASES)expect(validateQuestionPack(p,catalogueIndex)).toEqual([]);
    expect(qs.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    const sources=new Set(OXFORD_UPPER.sources.map(s=>s['id']));
    for(const q of qs){expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();expect(sources.has(q.source_id),q.id).toBe(true);expect(q.source.pages.every(p=>p>=11&&p<=204),q.id).toBe(true);expect(q.assets.image,q.id).toBeNull();expect(q.assets.source_audio_required,q.id).toBe(false);expect(q.prompt_en,q.id).not.toMatch(/OCR|source image|Response:|book page/i);}
  });
  it('offers contextual gaps, sentence builders and vocabulary throughout the book',()=>{
    expect(flashcardItems(qs)).toHaveLength(2387);expect(gapItems(qs)).toHaveLength(400);expect(sentenceItems(qs)).toHaveLength(200);expect(grammarItems(qs)).toHaveLength(401);
    for(let n=1;n<=100;n++){const pool=scopeQuestions(practiceScope('unit',unit(n)));expect(pool.length,unit(n)).toBe(OXFORD_UPPER_COVERAGE.units[n-1]!.graded_questions);expect(flashcardItems(pool).length,unit(n)).toBeGreaterThanOrEqual(10);expect(gapItems(pool),unit(n)).toHaveLength(4);expect(sentenceItems(pool),unit(n)).toHaveLength(2);expect(grammarItems(pool).length,unit(n)).toBeGreaterThanOrEqual(2);}
    for(const {q,pool}of gapItems(qs))expect(pool.filter(w=>isAccepted(q,w)),q.id).toHaveLength(1);
    for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(qs))expect([...q.answer.value!.toLowerCase()].sort(),q.id).toEqual(q.letter_pool!.map(s=>s.toLowerCase()).sort());
    for(const q of qs.filter(q=>q.options.length&&!q.native_options))expect(q.options.find(o=>o.id===q.answer.correct_option_id)?.text,q.id).toBe(q.answer.value);
  });
  it('preserves exact A/B page scopes and corrected primary target placements',()=>{
    for(const s of OXFORD_UPPER_SECTIONS){const pool=scopeQuestions(nodeScope(s.id));expect(pool.length,s.id).toBeGreaterThan(0);expect(pool.every(q=>q.source.pages.every(p=>s.pages.includes(p))),s.id).toBe(true);}
    const a=scopeQuestions(nodeScope(unit(24)+'.s1')),b=scopeQuestions(nodeScope(unit(24)+'.s2'));
    expect(a.some(q=>q.answer.value==='avocado')).toBe(true);expect(a.some(q=>q.answer.value==='colander')).toBe(false);expect(b.some(q=>q.answer.value==='colander')).toBe(true);expect(b.some(q=>q.answer.value==='avocado')).toBe(false);
    expect(a.every(q=>!b.some(x=>x.id===q.id))).toBe(true);
    expect(byId.get('ows.upper.u007.g1')?.answer.value).toBe('bald');expect(byId.get('ows.upper.u014.g1')?.answer.value).toBe('possibly');
    expect(byId.get('ows.upper.u051.dialogue1')?.source['source_section']).toBe('A');
    expect(byId.get('ows.upper.u099.g1')?.source['source_section']).toBe('A');expect(byId.get('ows.upper.u099.g4')?.answer.value).toBe('comprehensive');
  });
  it('activates all 36 Evolve 5 recommendations without broadening a missing section',()=>{
    for(const row of EVOLVE5_RECOMMENDATIONS)for(const r of row.recommendations){const target=oxfordDestination(r,LIVE_CATALOGUE.nodes)!;expect(target,r.source_label).toBeTruthy();expect(target.id).toBe(unit(r.unit));expect(scopeQuestions(nodeScope(target.id)).length).toBeGreaterThan(0);}
    const r=EVOLVE5_RECOMMENDATIONS[0]!.recommendations[0]!;
    const pending=LIVE_CATALOGUE.nodes.map(n=>n.id===r.unit_node_id?{...n,availability:'awaiting_source'}:n);expect(oxfordDestination(r,pending)).toBeNull();
    expect(oxfordDestination({...r,section:'C'},LIVE_CATALOGUE.nodes)).toBeNull();
    expect(ALL_EVOLVE_RECOMMENDATIONS.filter(r=>r.evolve_book_id==='evolve-5')).toHaveLength(12);
    expect(LIVE_CATALOGUE.nodes.find(n=>n.id==='evolve-6')?.availability).toBe('ready');
  });
  it('provides original readings, dialogue choices, word families and multiple-meaning contexts',()=>{
    expect(readingGroups(qs)).toHaveLength(12);expect(qs.filter(q=>q.skill==='reading')).toHaveLength(48);expect(qs.filter(q=>q.skill==='conversation')).toHaveLength(20);
    expect(qs.filter(q=>/\.form\d+$/.test(q.id))).toHaveLength(67);expect(qs.filter(q=>/\.sense\d+$/.test(q.id))).toHaveLength(28);
    expect(contextById('ows.upper.u008.reading')?.text).toContain('needed more evidence');expect(contextById('ows.upper.u032.reading')?.text).toContain('surplus of 30');
    const correct=(id:string)=>byId.get(id)!;
    expect(correct('ows.upper.u082.sense1').answer.value).toBe('Uses a large quantity');
    expect(correct('ows.upper.u099.sense1').answer.value).toBe('Comparative');expect(correct('ows.upper.u099.sense2').answer.value).toBe('Comparable');
    expect(correct('ows.upper.u100.sense1').answer.value).toBe('For a short time');expect(correct('ows.upper.u100.sense2').answer.value).toBe('Using few words');
    for(const q of qs.filter(q=>q.options.length))expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);
  });
  it('keeps interchangeable near-synonyms out of competing vocabulary choices and pairs',()=>{
    const rows=qs.filter(q=>q.vocabulary_entry_id),pairs=pairCandidates(qs).map(p=>p.answer);
    for(const group of [['accurate','precise'],['ecstatic','thrilled','delighted','over the moon'],['outgoings','expenditure'],['put off','postpone'],['primarily','predominantly','chiefly']]){for(const q of rows.filter(q=>group.includes(q.answer.value!)))expect(q.options.filter(o=>group.includes(o.text)),q.id).toHaveLength(1);expect(group.filter(w=>pairs.includes(w))).toHaveLength(1);}
  });
  it('bundles 32 independent photo tiles and six native diagrams with verified hashes',()=>{
    expect(OXFORD_UPPER.assets).toHaveLength(38);expect(qs.filter(q=>q.native_options)).toHaveLength(38);
    const checked=new Map<string,string>();for(const a of OXFORD_UPPER.assets){expect(a.path).toMatch(/^\/assets\/oxford-upper-native\//);if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);}
    for(const q of qs.filter(q=>q.native_options))expect(Object.values(q.native_options!).every(id=>!!mediaAsset(id)),q.id).toBe(true);
  });
  it('appends bounded batches after the first eleven releases without shifting missions or quizzes',()=>{
    expect(BOOK_RELEASES.slice(0,16)).toHaveLength(16);expect(BOOK_RELEASES[10]).toBe(EVOLVE5_NATIVE);expect(BOOK_RELEASES.slice(11,14)).toEqual(OXFORD_UPPER_RELEASES);
    const old=BOOK_RELEASES.slice(0,11).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('cumulative',old);expect(poolMissions('cumulative',[...old,...qs]).slice(0,before.length)).toEqual(before);
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
    for(let n=1;n<=3;n++)expect(readFileSync(`src/data/oxford-upper/native.${n}.pack.json`).length).toBeLessThan(3_200_000);
    expect(OXFORD_UPPER_RELEASES.map(p=>p.questions.length)).toEqual([1115,1011,1062]);
  });
});
