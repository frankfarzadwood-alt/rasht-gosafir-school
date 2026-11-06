import targets1 from '@/data/project1/learning-targets.json';
import writing1 from '@/data/project1/writing.json';
import targets2 from '@/data/project2/learning-targets.json';
import writing2 from '@/data/project2/writing.json';
import targets3 from '@/data/project3/learning-targets.json';
import writing3 from '@/data/project3/writing.json';
import targets4 from '@/data/project4/learning-targets.json';
import writing4 from '@/data/project4/writing.json';
import targets5 from '@/data/project5/learning-targets.json';
import writing5 from '@/data/project5/writing.json';

export const PROJECT_GUIDES=[
  {book:1,id:'project-1',tracks:31,intro:'از اولین سلام تا گفت‌وگوهای روزمره',overview:'شش درس با بازی‌های واژگان، دستور و مکالمه؛ ساعت‌ها، تصویرها و جدول‌های تعاملی، مرور هر درس و یک مرور پایانی. از بخش A شروع کن یا محدودهٔ دلخواهت را انتخاب کن.',tagline:'EVERYDAY ENGLISH',targets:targets1,writing:writing1},
  {book:2,id:'project-2',tracks:32,intro:'روایت کن، مقایسه کن و برنامه بریز',overview:'از مرور آغازین شروع کن و در شش درس، زندگی روزمره، حیوانات، سفر، غذا، جهان و سرگرمی را تمرین کن. تقویم‌ها، ساعت‌ها، نمودارهای هوا، تصویرها و مرورهای هر درس همراهت هستند.',tagline:'STORIES, PLANS & DISCOVERY',targets:targets2,writing:writing2},
  {book:3,id:'project-3',tracks:27,intro:'داستان بگو، مسیر پیدا کن و تجربه‌هایت را بیان کن',overview:'شش درس دربارهٔ زندگی، آینده، رویدادهای گذشته، شهرها، تجربه‌ها و قوانین. با مسیرها و علامت‌های تعاملی، تصویرها، شنیدن و داستان‌سازی تمرین کن؛ مرور آغازین و پایانی هم در دسترس‌اند.',tagline:'STORIES, ROUTES & EXPERIENCES',targets:targets3,writing:writing3},
  {book:4,id:'project-4',tracks:32,intro:'گذشته و حال را مقایسه کن، توصیف کن و برنامه بریز',overview:'شش درس دربارهٔ گذشته و حال، تجربه‌ها، بدن، قهرمان‌ها، محیط‌زیست و روابط. با شکل‌های بدن، طرح لباس‌ها، خط زمان و مراحل کار تمرین کن؛ شنیدن، نوشتن و مرورهای آغازین، هر درس و پایانی هم همراهت هستند.',tagline:'DESCRIBE, CONNECT & PLAN',targets:targets4,writing:writing4},
  {book:5,id:'project-5',tracks:32,intro:'مسئله‌ها را توضیح بده، درخواست کن و دیدگاه‌ها را نقل کن',overview:'از مرور ورزش‌ها و علاقه‌ها شروع کن و در شش درس، روایت، برنامه‌ها، موقعیت‌های خیالی، درخواست‌ها، سفر و نقل‌قول را تمرین کن. شکل‌های اشیاء، ساعت‌ها، جدول‌ها، شنیدن و نوشتن همراهت هستند؛ مرور هر درس و مرور پایانی هم آماده‌اند.',tagline:'EXPLAIN, REQUEST & REPORT',targets:targets5,writing:writing5},
];
export const projectGuideFor=(id:string)=>PROJECT_GUIDES.find(g=>id===g.id||id.startsWith(g.id+'.'));
/** Writing belongs to the actual D lessons of released books, never to an opening/final review. */
export function projectWritingUnits(pool:{placements?:{node_id:string}[]}[],book?:number){
  return [...new Set(pool.flatMap(q=>(q.placements??[]).flatMap(p=>{
    const m=p.node_id.match(/^project-([1-5])\.u00([1-6])\.s4$/);
    return m&&(!book||Number(m[1])===book)&&PROJECT_GUIDES.some(g=>g.book===Number(m[1]))?[Number(m[2])]:[];
  })))].sort((a,b)=>a-b);
}
