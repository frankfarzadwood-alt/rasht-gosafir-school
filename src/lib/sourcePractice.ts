import { SOURCE_TASKS, type SourceTask } from './content/library';
import { descendantIds, type CatalogueIndex } from './content/core';
import type { Scope } from './content/contracts';
export function selectSourceTasks(ix: CatalogueIndex, scope: Scope, tasks = SOURCE_TASKS): SourceTask[] {
 if (scope.kind === 'assessment') return [];
 let roots = scope.node_ids;
 if (scope.kind === 'through_unit') {
  const unit = ix.nodes.get(scope.through_unit_id ?? ''); const book = unit?.parent_id ? ix.nodes.get(unit.parent_id) : undefined;
  if (!unit || unit.kind !== 'unit' || unit.ordinal === null || book?.kind !== 'book') throw new Error('Invalid cumulative activity scope');
  if (roots.length && (roots.length !== 1 || roots[0] !== book.id)) throw new Error('Cumulative activity scope crosses books');
  roots = (ix.children.get(book.id) ?? []).filter(id => { const n=ix.nodes.get(id)!; return n.kind==='unit' && n.ordinal!==null && n.ordinal<=unit.ordinal!; });
 }
 const nodes=descendantIds(ix,roots,scope.kind==='through_unit'||scope.include_descendants);
 if (scope.skills?.length) return [];
 return tasks.filter(t=>t.review_status==='ready' && t.evaluation==='self_review' && t.placements.some(p=>nodes.has(p.node_id)));
}
export const DRAFT_KEY='english-quest-workbook-drafts-v1';
export interface SourceDraft { text: string; checks: number[]; reviewed: boolean; updatedAt: string }
export const EMPTY_DRAFT: SourceDraft={text:'',checks:[],reviewed:false,updatedAt:''};
export function readSourceDraft(id: string,storage: Pick<Storage,'getItem'>): SourceDraft {
 try { const all=JSON.parse(storage.getItem(DRAFT_KEY)??'{}'); const d: unknown=all[id];
  if(d && typeof d==='object' && 'text' in d && typeof d.text==='string') { const x=d as Partial<SourceDraft>;return {text:d.text,checks:Array.isArray(x.checks)?x.checks.filter(n=>Number.isInteger(n)&&n>=0):[],reviewed:x.reviewed===true,updatedAt:typeof x.updatedAt==='string'?x.updatedAt:''}; }
 } catch { /* Draft failures never affect scored progress. */ }
 return {...EMPTY_DRAFT,checks:[]};
}
export function saveSourceDraft(id: string,value: SourceDraft,storage: Pick<Storage,'getItem'|'setItem'>): boolean {
 try { const parsed:unknown=JSON.parse(storage.getItem(DRAFT_KEY)??'{}'); const all=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};storage.setItem(DRAFT_KEY,JSON.stringify({...all,[id]:value}));return true; } catch {return false;}
}
