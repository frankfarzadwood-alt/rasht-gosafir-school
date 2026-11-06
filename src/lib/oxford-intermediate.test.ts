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
import { OXFORD_INTERMEDIATE, OXFORD_INTERMEDIATE_RELEASES, OXFORD_INTERMEDIATE_SECTIONS, OXFORD_INTERMEDIATE_COVERAGE, OXFORD_INTERMEDIATE_NODES } from './content/oxford-intermediate';
import { BOOK_RELEASES, BOOK_CONTENT, LIVE_CATALOGUE, mediaAsset, PILOT } from './content/pilot';
import { EVOLVE3_RECOMMENDATIONS } from './content/evolve3';
import { EVOLVE4_NATIVE } from './content/evolve4';
import { oxfordDestination } from './content/evolve-series';
import { validateCatalogue, validateQuestionPack } from './content/validate';
import { BUNDLED_QUESTIONS, contextById, flashcardItems, forgeItems, gapItems, grammarItems, ineligibility, isAccepted, pairCandidates, poolMissions, readingGroups, sentenceItems, type Question } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
type NativeQuestion=Question & {source:Question['source'] & Record<string,unknown>};
const qs=OXFORD_INTERMEDIATE.questions as unknown as NativeQuestion[];
const unit=(n:number)=>`ows-intermediate.u${String(n).padStart(3,'0')}`;
const byId=new Map(qs.map(q=>[q.id,q]));

describe('Oxford Intermediate native release',()=>{
  it('covers all 100 units with unique, approved, source-linked native content',()=>{
    expect(OXFORD_INTERMEDIATE_COVERAGE.units).toHaveLength(100);
    expect(OXFORD_INTERMEDIATE_NODES.filter(n=>n.kind==='unit')).toHaveLength(100);
    expect(OXFORD_INTERMEDIATE_SECTIONS).toHaveLength(132);
    expect(qs).toHaveLength(3172);
    expect(new Set(qs.map(q=>q.canonical_id)).size).toBe(qs.length);
    expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);
    for(const pack of OXFORD_INTERMEDIATE_RELEASES)expect(validateQuestionPack(pack,catalogueIndex)).toEqual([]);
    expect(qs.flatMap(q=>ineligibility(q).map(reason=>[q.id,reason]))).toEqual([]);
    const sources=new Set(OXFORD_INTERMEDIATE.sources.map(s=>s['id']));
    for(const q of qs){
      expect(q.grade,q.id).toBeUndefined();expect(q.term,q.id).toBeUndefined();
      expect(q.assets.source_audio_required,q.id).toBe(false);
      expect(q.assets.source_image_required,q.id).toBe(false);
      expect(q.assets.image,q.id).toBeNull();
      expect(sources.has(q.source_id),q.id).toBe(true);
      expect(q.source.pages.every(p=>p>=12&&p<=197),q.id).toBe(true);
      expect(q.prompt_en,q.id).not.toMatch(/source image|book page|OCR|Response:/i);
    }
    expect(BUNDLED_QUESTIONS).toHaveLength(13324 + EVOLVE4_NATIVE.questions.length + EVOLVE5_NATIVE.questions.length + OXFORD_UPPER.questions.length + EVOLVE6_NATIVE.questions.length + PROJECT1_NATIVE.questions.length + PROJECT2_NATIVE.questions.length + PROJECT3_NATIVE.questions.length + PROJECT4_NATIVE.questions.length + PROJECT5_NATIVE.questions.length + IELTS_GRAMMAR_NATIVE.questions.length + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);
  });
  it('makes vocabulary, contextual choices and sentence builders available in every unit',()=>{
    expect(flashcardItems(qs)).toHaveLength(2422);
    expect(sentenceItems(qs)).toHaveLength(200);
    expect(gapItems(qs)).toHaveLength(400);
    expect(grammarItems(qs).length).toBeGreaterThan(400);
    for(let n=1;n<=100;n++){
      const pool=scopeQuestions(practiceScope('unit',unit(n)));
      expect(flashcardItems(pool).length,unit(n)).toBeGreaterThanOrEqual(12);
      expect(sentenceItems(pool),unit(n)).toHaveLength(2);
      expect(gapItems(pool),unit(n)).toHaveLength(4);
      expect(grammarItems(pool).length,unit(n)).toBeGreaterThanOrEqual(2);
      expect(pool.length,unit(n)).toBe(OXFORD_INTERMEDIATE_COVERAGE.units[n-1]!.graded_questions);
    }
    for(const {q,pool}of gapItems(qs))expect(pool.filter(w=>isAccepted(q,w)),q.id).toHaveLength(1);
    for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
    for(const q of forgeItems(qs))expect([...q.answer.value!.toLowerCase()].sort(),q.id).toEqual(q.letter_pool!.map(s=>s.toLowerCase()).sort());
    for(const q of qs.filter(q=>q.options.length&&!q.native_options))expect(q.options.find(o=>o.id===q.answer.correct_option_id)?.text,q.id).toBe(q.answer.value);
  });
  it('keeps section A and B separate and activates every exact Evolve 3 recommendation',()=>{
    for(const row of EVOLVE3_RECOMMENDATIONS)for(const r of row.recommendations){
      const target=oxfordDestination(r,LIVE_CATALOGUE.nodes)!;expect(target,r.source_label).toBeTruthy();
      const pool=scopeQuestions(nodeScope(target.id));expect(pool.length,r.source_label).toBeGreaterThan(0);
      if(r.section)expect(pool.every(q=>(q.source as unknown as {source_section:string}).source_section===r.section),r.source_label).toBe(true);
    }
    for(const section of OXFORD_INTERMEDIATE_SECTIONS){
      const pool=scopeQuestions(nodeScope(section.id));expect(pool.length,section.id).toBeGreaterThan(0);
      expect(pool.every(q=>q.source.pages.every(p=>section.pages.includes(p))),section.id).toBe(true);
    }
    const a=scopeQuestions(nodeScope(unit(31)+'.s1')),b=scopeQuestions(nodeScope(unit(31)+'.s2'));
    expect(a.every(q=>!b.some(x=>x.id===q.id))).toBe(true);
    expect(a.some(q=>q.answer.value==='traffic lights')).toBe(true);
    expect(a.some(q=>q.answer.value==='skid')).toBe(false);
    expect(b.some(q=>q.answer.value==='skid')).toBe(true);
    const rec=EVOLVE3_RECOMMENDATIONS[2]!.recommendations[0]!;
    const pending=LIVE_CATALOGUE.nodes.map(n=>n.id===unit(31)+'.s1'?{...n,availability:'awaiting_source'}:n);
    expect(oxfordDestination(rec,pending)).toBeNull();
  });
  it('offers native readings, conversations and checked language patterns',()=>{
    expect(readingGroups(qs)).toHaveLength(8);
    expect(qs.filter(q=>q.skill==='reading')).toHaveLength(32);
    expect(qs.filter(q=>q.skill==='conversation')).toHaveLength(20);
    expect(qs.filter(q=>/\.form\d+\./.test(q.id))).toHaveLength(58);
    expect(contextById('ows.int.u031.reading')?.text).toContain('pavement');
    expect(contextById('ows.int.u054.reading')?.text).toContain('combination of factors');
    expect(isAccepted(byId.get('ows.int.u055.form16.1')!,'spilled')).toBe(true);
    expect(isAccepted(byId.get('ows.int.u055.form09.1')!,'lay')).toBe(true);
    expect(isAccepted(byId.get('ows.int.u055.form09.1')!,'lied')).toBe(false);
    expect(byId.get('ows.int.u083.g1')?.answer.value).toBe('turn them off');
    expect(byId.get('ows.int.u096.dialogue1')?.answer.value).toBe('No, go ahead.');
  });
  it('avoids interchangeable near-synonyms in vocabulary choices and matching pools',()=>{
    const rows=qs.filter(q=>q.vocabulary_entry_id),pairs=pairCandidates(qs).map(p=>p.answer);
    for(const group of [['aim','goal','objective','target'],['rarely','seldom'],['garbage','trash'],['advert','ad']]){
      for(const q of rows.filter(q=>group.includes(q.answer.value!)))expect(q.options.filter(o=>group.includes(o.text)),q.id).toHaveLength(1);
      expect(group.filter(word=>pairs.includes(word))).toHaveLength(1);
    }
  });
  it('bundles independent photos and native geometry with verified file hashes',()=>{
    expect(OXFORD_INTERMEDIATE.assets).toHaveLength(40);
    expect(qs.filter(q=>q.native_options)).toHaveLength(40);
    const checked=new Map<string,string>();
    for(const a of OXFORD_INTERMEDIATE.assets){
      expect(a.path).toMatch(/^\/assets\/oxford-intermediate-native\//);
      if(!checked.has(a.path))checked.set(a.path,createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'));
      expect(checked.get(a.path),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);
    }
    for(const q of qs.filter(q=>q.native_options))expect(Object.values(q.native_options!).every(id=>!!mediaAsset(id)),q.id).toBe(true);
  });
  it('appends three bounded batches while preserving earlier missions and fixed quizzes',()=>{
    expect(BOOK_RELEASES.slice(6,9)).toEqual(OXFORD_INTERMEDIATE_RELEASES);
    const old=BOOK_RELEASES.slice(0,6).flatMap(p=>p.questions) as unknown as Question[];
    const before=poolMissions('cumulative',old),after=poolMissions('cumulative',[...old,...qs]);
    expect(after.slice(0,before.length)).toEqual(before);
    for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
    for(let n=1;n<=3;n++)expect(readFileSync(`src/data/oxford-intermediate/native.${n}.pack.json`).length).toBeLessThan(3_200_000);
  });
});
