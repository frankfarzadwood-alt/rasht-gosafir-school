import {describe,expect,it} from 'vitest';
import {selectSourceTasks,readSourceDraft,saveSourceDraft,DRAFT_KEY} from './sourcePractice';
import {indexCatalogue} from './content/core';
import type {Catalogue,Scope} from './content/contracts';
import type {SourceTask} from './content/library';
const nodes=[{id:'b',parent_id:null,kind:'book',ordinal:null},{id:'u1',parent_id:'b',kind:'unit',ordinal:1},{id:'s1',parent_id:'u1',kind:'subunit',ordinal:1},{id:'u2',parent_id:'b',kind:'unit',ordinal:2},{id:'u3',parent_id:'b',kind:'unit',ordinal:3},{id:'other',parent_id:null,kind:'book',ordinal:null}];
const ix=indexCatalogue({nodes} as unknown as Catalogue);
const tasks=nodes.map(n=>({id:n.id,placements:[{node_id:n.id,relation:'primary'}],review_status:'ready',evaluation:'self_review'})) as SourceTask[];
const ids=(s:Scope)=>selectSourceTasks(ix,s,tasks).map(t=>t.id);
describe('workbook scopes',()=>{
 it('keeps subunits, cumulative boundaries, custom selections and other books separate',()=>{
  expect(ids({kind:'node',node_ids:['u1'],include_descendants:true})).toEqual(['u1','s1']);
  expect(ids({kind:'through_unit',node_ids:['b'],through_unit_id:'u2',include_descendants:true})).toEqual(['u1','s1','u2']);
  expect(ids({kind:'custom',node_ids:['s1','u3'],include_descendants:true})).toEqual(['s1','u3']);
  expect(ids({kind:'custom',node_ids:[],include_descendants:true})).toEqual([]);
  expect(()=>ids({kind:'node',node_ids:['missing'],include_descendants:true})).toThrow();
  expect(()=>ids({kind:'through_unit',node_ids:['other'],through_unit_id:'u2',include_descendants:true})).toThrow();
 });
 it('does not turn fixed papers or skill filters into partial source exercises',()=>{
  expect(ids({kind:'assessment',node_ids:[],assessment_id:'quiz',include_descendants:false})).toEqual([]);
  expect(ids({kind:'node',node_ids:['u1'],include_descendants:true,skills:['grammar']})).toEqual([]);
  expect(ids({kind:'node',node_ids:['u1'],include_descendants:true,question_ids:['reviewed-q']})).toEqual(['u1','s1']);
 });
});
describe('independent source drafts',()=>{
 it('persists each draft without touching XP, mastery, progress or another task',()=>{
  const map=new Map([['english-quest-progress-v1','{"xp":123,"mastery":{"old":true}}']]);const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
  const a={text:'My answer',checks:[1],reviewed:true,updatedAt:'2026-10-24'};
  expect(saveSourceDraft('a',a,storage)).toBe(true);expect(saveSourceDraft('b',{...a,text:'Another answer'},storage)).toBe(true);
  expect(readSourceDraft('a',storage)).toEqual(a);expect(readSourceDraft('b',storage).text).toBe('Another answer');expect(map.get('english-quest-progress-v1')).toBe('{"xp":123,"mastery":{"old":true}}');expect([...map.keys()]).toEqual(['english-quest-progress-v1',DRAFT_KEY]);
 });
 it('reports failed saves without destroying unreadable stored bytes',()=>{
  const s={getItem:()=>'{broken',setItem:()=>{throw new Error('quota');}};expect(readSourceDraft('a',s).text).toBe('');expect(saveSourceDraft('a',{text:'kept in memory',checks:[],reviewed:false,updatedAt:''},s)).toBe(false);
 });
});
