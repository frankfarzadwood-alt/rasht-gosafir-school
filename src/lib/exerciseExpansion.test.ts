import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {EXPANSION,EXERCISE_HOLDS,exerciseCoverage} from './content/expansion';
import {BOOK_CONTENT,BOOK_RELEASES,mediaAsset} from './content/pilot';
import {LIBRARY} from './content/library';
import {validateQuestionPack} from './content/validate';
import {catalogueIndex,nodeScope,scopeQuestions} from './learning';
import {isAccepted,isEligible,responseText,type Question} from './bank';
import {learnerInstruction} from './display';
describe('exercise expansion',()=>{
 it('preserves old payloads, appends unique questions and resolves earlier media',()=>{
  expect(BOOK_RELEASES.at(-1)).toBe(EXPANSION);expect(new Set(BOOK_CONTENT.questions.map(q=>q.id)).size).toBe(BOOK_CONTENT.questions.length);
  expect(createHash('sha256').update(readFileSync(process.cwd()+'/src/data/library/library.pack.json')).digest('hex')).toBe('9f3395f2877d818323a37bfd0c4e15e80116359faf541b38ddd4e7ab9e66fec0');
  expect(validateQuestionPack({...EXPANSION,assets:BOOK_CONTENT.assets,sources:BOOK_CONTENT.sources},catalogueIndex)).toEqual([]);
  for(const q of EXPANSION.questions){expect(isEligible(q as unknown as Question),q.id).toBe(true);for(const id of q.assets.required_asset_ids??[]){const a=mediaAsset(id);expect(a,id).not.toBeNull();expect(BOOK_CONTENT.assets.find(a=>a.id===id)?.['source_role'],q.id).not.toBe('answer_key');}}
 });
 it('grades every stored answer and rejects blank and wrong answers',()=>{
  for(const q0 of EXPANSION.questions){const q=q0 as unknown as Question;const response=q.answer.fields?JSON.stringify(q.answer.fields.map(f=>f.value)):q.answer.value!;expect(isAccepted(q,response),q.id).toBe(true);expect(isAccepted(q,''),q.id).toBe(false);expect(isAccepted(q,'__wrong__'),q.id).toBe(false);if(q.answer.fields)expect(isAccepted(q,JSON.stringify(q.answer.fields.map((f,i)=>i?f.value:'__wrong__'))),q.id).toBe(false);}
 });
 it('keeps answer positions separate and handles unordered sets including overlapping variants',()=>{
  const q=EXPANSION.questions.find(q=>q.id==='evolve-3.r2.u001.s1.e1a.02') as unknown as Question;expect(isAccepted(q,JSON.stringify(['helpful','brave','generous']))).toBe(true);expect(isAccepted(q,JSON.stringify(['brave','brave','helpful']))).toBe(false);expect(isAccepted(q,JSON.stringify(['brave','helpful']))).toBe(false);expect(responseText(q,JSON.stringify(['a','b']))).toBe('a ; b');
  const ordered={...q,answer:{...q.answer,field_order:'ordered' as const}};expect(isAccepted(ordered,JSON.stringify(['helpful','brave','generous']))).toBe(false);
  const shared={...q,answer:{...q.answer,fields:[{label:'one',value:'a',accepted_answers:['b']},{label:'two',value:'a',accepted_answers:[]}]}};expect(isAccepted(shared,JSON.stringify(['a','b']))).toBe(true);
 });
 it('holds source stress exercises consistently without deleting their IDs',()=>{
  const pool=new Set(scopeQuestions(nodeScope('oxford')).map(q=>q.id));expect(EXERCISE_HOLDS.size).toBeGreaterThan(0);
  for(const id of EXERCISE_HOLDS){const q=LIBRARY.questions.find(q=>q.id===id)!;expect(q,id).toBeDefined();expect(isEligible(q as unknown as Question)).toBe(false);expect(pool.has(id)).toBe(false);}
  expect(EXPANSION.questions.some(q=>q.id.startsWith('ows-upper-intermediate.r2.u001.e1.'))).toBe(false);
 });
 it('reports converted, partial, self-review and pending key blocks separately',()=>{
  for(const book of ['project-1','project-2','project-3','project-4','project-5','ielts-grammar-65','ielts-vocabulary-60','ielts-vocabulary-65','evolve-3','ows-intermediate','ows-upper-intermediate']){const c=exerciseCoverage(book);expect(c.new_questions,book).toBeGreaterThan(0);expect(c.inspected,book).toBe(c.converted+c.partial+c.pending+c.self_review);}expect(exerciseCoverage('unknown').inspected).toBe(0);
 });
 it('tells Sprint learners to find and answer the printed item for typed tasks',()=>{
  const q=EXPANSION.questions.find(q=>q.answer.fields?.length) as unknown as Question;
  expect(learnerInstruction(q,'quiz_sprint').fa).toContain('شمارهٔ تمرین');
  expect(learnerInstruction(q,'quiz_sprint').fa).toContain('بنویس');
 });
});
