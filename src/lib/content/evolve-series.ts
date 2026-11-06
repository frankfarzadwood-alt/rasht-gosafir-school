import recommendations1 from '@/data/evolve/recommendations.json';
import targets1 from '@/data/evolve/learning-targets.json';
import recommendations2 from '@/data/evolve2/recommendations.json';
import targets2 from '@/data/evolve2/learning-targets.json';
import writing2 from '@/data/evolve2/writing.json';
import recommendations3 from '@/data/evolve3/recommendations.json';
import targets3 from '@/data/evolve3/learning-targets.json';
import writing3 from '@/data/evolve3/writing.json';
import recommendations4 from '@/data/evolve4/recommendations.json';
import targets4 from '@/data/evolve4/learning-targets.json';
import writing4 from '@/data/evolve4/writing.json';
import recommendations5 from '@/data/evolve5/recommendations.json';
import targets5 from '@/data/evolve5/learning-targets.json';
import writing5 from '@/data/evolve5/writing.json';
import recommendations6 from '@/data/evolve6/recommendations.json';
import targets6 from '@/data/evolve6/learning-targets.json';
import writing6 from '@/data/evolve6/writing.json';
import type { CatalogueNode } from './contracts';

export interface OxfordRecommendation { book_id:string; unit:number; section:string|null; unit_node_id:string; source_label:string }
export interface RecommendationRow { evolve_book_id:string; unit:number; node_id:string; recommendations:OxfordRecommendation[]; source:string }
export const EVOLVE_GUIDES = [
  {book:1,id:'evolve-1',workbookTracks:12,intro:'معرفی خودت، ارتباط با دیگران، زندگی روزمره',recommendations:recommendations1,targets:targets1},
  {book:2,id:'evolve-2',workbookTracks:12,intro:'تجربه‌ها، برنامه‌ها و ارتباط در دنیای واقعی',recommendations:recommendations2,targets:targets2},
  {book:3,id:'evolve-3',workbookTracks:12,intro:'فرصت‌ها، تجربه‌ها و تصمیم‌های روزمره',recommendations:recommendations3,targets:targets3},
  {book:4,id:'evolve-4',workbookTracks:13,intro:'داستان‌ها، دیدگاه‌ها و انتخاب‌های دنیای امروز',recommendations:recommendations4,targets:targets4},
  {book:5,id:'evolve-5',workbookTracks:12,intro:'چالش‌ها، تجربه‌ها و دیدگاه‌های تازه',recommendations:recommendations5,targets:targets5},
  {book:6,id:'evolve-6',workbookTracks:17,intro:'فناوری، دیدگاه‌ها و تغییر در دنیای امروز',recommendations:recommendations6,targets:targets6},
];
export const EVOLVE_ADDED_WRITING: Record<number,{title:string;prompt:string;checks:string[]}[]> = {2:writing2,3:writing3,4:writing4,5:writing5,6:writing6};
export const ALL_EVOLVE_RECOMMENDATIONS: RecommendationRow[] = EVOLVE_GUIDES.flatMap(g=>g.recommendations);
export const evolveGuideFor = (nodeId:string) => EVOLVE_GUIDES.find(g=>nodeId===g.id||nodeId.startsWith(g.id+'.'));

/** Exact section readiness: an absent or pending section never broadens to a unit. */
export function oxfordDestination(r:OxfordRecommendation,nodes:readonly CatalogueNode[]) {
  const target=r.section?nodes.find(n=>n.parent_id===r.unit_node_id&&n.kind==='subunit'&&n.source_label===r.section):nodes.find(n=>n.id===r.unit_node_id);
  return target?.availability==='ready'?target:null;
}
