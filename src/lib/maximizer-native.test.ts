import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MAXIMIZER_NATIVE as pack,MAXIMIZER_RELEASES as releases,MAXIMIZER_NODES as nodes,MAXIMIZER_SELECTIONS as sets} from './content/ielts-maximizer';
import tasks from '@/data/ielts-maximizer/speaking.json';
import audio from '@/data/ielts-maximizer/bonus-audio.json';
import {BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,mediaAsset} from './content/pilot';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,isAccepted,pairSet,poolAvailability,poolMissions,readingGroups,sentenceItems,type Question} from './bank';
import {ieltsSpeakingTasks,ieltsWritingUnits} from './content/ielts-series';
import {nodeById,nodeScope,practiceScope,scopeQuestions} from './learning';
import {assessmentSession} from './scope';
const qs=pack.questions as unknown as Question[];
describe('Speaking Maximizer native release',()=>{
 it('retains all three source parts, nineteen themes and both hundred-topic sequences',()=>{
  expect(qs).toHaveLength(1320);expect(BUNDLED_QUESTIONS).toHaveLength(31000);expect(nodes).toHaveLength(226);expect(LIVE_CATALOGUE.nodes.filter(n=>n.kind==='book')).toHaveLength(18);expect(nodeById('ielts-speaking-maximizer')).toMatchObject({availability:'ready',expected_units:3});
  for(const n of LIVE_CATALOGUE.nodes.filter(n=>n.kind==='book'))expect(scopeQuestions(nodeScope(n.id)).length,n.id).toBeGreaterThan(0);
  for(const[p,count]of [[1,20],[2,101],[3,101]] as const){const parent=`ielts-speaking-maximizer.u00${p}`;expect(nodes.filter(n=>n.parent_id===parent)).toHaveLength(count);for(const n of nodes.filter(n=>n.parent_id===parent)){const pool=scopeQuestions(nodeScope(n.id)),a=poolAvailability(pool);expect(pool.length,n.id).toBeGreaterThanOrEqual(5);expect(a.flashcards.count,n.id).toBe(4);expect(a.sentence_builder.count,n.id).toBeGreaterThan(0);expect(a.grammar_detective.count,n.id).toBeGreaterThan(0);expect(a.match_arena.count,n.id).toBeGreaterThanOrEqual(3);expect(a.speaking_studio.count,n.id).toBe(1);expect(n['source_section_claim']).toBe(false);}}
  expect(nodeById('ielts-speaking-maximizer.u002.s100')?.title_en).toContain('interesting building');expect(nodeById('ielts-speaking-maximizer.u003.s100')?.title_en).toContain('Zoos');
 });
 it('honours the scan page exceptions without inventing source topic or card 101',()=>{
  expect(pack.sources[0]).toMatchObject({pdf_pages:218,out_of_order_pdf_page_pairs:[[73,74],[172,173],[185,186],[201,202]],bonus_audio_user_confirmed_unrelated:true});
  for(const[n,pages]of [['ielts-speaking-maximizer.u001.s017',[71,72,74]],['ielts-speaking-maximizer.u002.s001',[98]],['ielts-speaking-maximizer.u002.s100',[110]],['ielts-speaking-maximizer.u003.s050',[173]],['ielts-speaking-maximizer.u003.s052',[172]],['ielts-speaking-maximizer.u003.s070',[186]],['ielts-speaking-maximizer.u003.s072',[185]],['ielts-speaking-maximizer.u003.s100',[202]]] as const)expect(nodeById(n)?.['source_pages']).toEqual(pages);
  expect(nodeById('ielts-speaking-maximizer.u001.s018')?.['source_pages']).toContain(73);expect(nodeById('ielts-speaking-maximizer.u001.s018')?.['source_pages']).not.toContain(74);expect(nodes.filter(n=>n.id.endsWith('.s101')).every(n=>n.title_en.startsWith('Toolkit'))).toBe(true);
 });
 it('grades native vocabulary, language functions and all sentence builders through shared services',()=>{
  expect(flashcardItems(qs)).toHaveLength(888);expect(sentenceItems(qs)).toHaveLength(225);expect(qs.filter(q=>q.id.endsWith('.function'))).toHaveLength(100);expect(qs.filter(q=>q.skill==='listening')).toEqual([]);
  for(const q of qs){expect(q.grade).toBeUndefined();expect(q.term).toBeUndefined();expect(q.assets.source_image_required).toBe(false);expect(q.assets.image).toBeNull();expect(q.assets.audio).toBeNull();expect(q.source.pages.every(p=>p>=14&&p<=210),q.id).toBe(true);if(q.options.length){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}}
  for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());for(const{q,pool}of gapItems(qs))expect(pool.filter(v=>isAccepted(q,v)),q.id).toHaveLength(1);for(let seed=1;seed<=12;seed++)expect(pairSet(qs,6,seed)).toHaveLength(6);
  const animal=pack.vocabulary_entries.find(v=>v['id']==='maxi.native.p2.t38.v4.entry');expect(animal?.['sense_en']).toContain('animal');expect(pack.vocabulary_entries.find(v=>v['id']==='maxi.native.p2.t89.v3.entry')?.['sense_en']).toContain('protection');
 });
 it('keeps personal response tasks unscored, part-specific and restricted to their application questions',()=>{
  expect(tasks).toHaveLength(222);expect(tasks.filter(t=>t.practice_part===1).flatMap(t=>t.intro_questions)).toHaveLength(100);expect(ieltsSpeakingTasks(qs)).toHaveLength(222);expect(ieltsSpeakingTasks(qs.filter(q=>q.skill==='vocabulary'))).toEqual([]);expect(ieltsWritingUnits(qs)).toEqual([]);
  for(const t of tasks){expect(t.automatic_band_score).toBe(false);expect(t.checks).toHaveLength(4);expect(t.activation_question_ids.every(id=>qs.some(q=>q.id===id))).toBe(true);expect(t.preparation_seconds).toBe(t.practice_part===2?60:0);expect(t.speaking_seconds).toBe(t.practice_part===1?45:t.practice_part===2?120:90);}
  expect(new Set(tasks.map(t=>t.id)).size).toBe(222);expect(tasks.find(t=>t.id==='maxi.speaking.p2.t46')?.points).not.toEqual(tasks.find(t=>t.id==='maxi.speaking.p2.t64')?.points);
 });
 it('keeps all forty-four extras distinct and byte-identical, with no fabricated book mapping or questions',()=>{
  expect(audio).toHaveLength(44);expect(pack.assets).toHaveLength(44);expect(audio.filter(a=>a.group==='Maxi 1 - 2')).toHaveLength(16);expect(audio.filter(a=>a.group==='Maxi 3 - 4')).toHaveLength(12);expect(audio.filter(a=>a.group==='Maxi 5 - 6')).toHaveLength(16);expect(new Set(audio.map(a=>a.id)).size).toBe(44);expect(new Set(pack.assets.map(a=>a.path)).size).toBe(44);
  for(const a of audio){const m=mediaAsset(a.id)!;expect(a.book_topic_mapping).toBe(false);expect(m['source_book_mapping']).toBe(false);expect(m.url).toContain(a.group.replace('Maxi ','').replaceAll(' - ','-')+'/'+a.filename);expect(createHash('sha256').update(readFileSync(new URL('../../public'+m.url,import.meta.url))).digest('hex'),a.id).toBe(a.sha256);expect(qs.some(q=>q.assets.required_asset_ids?.includes(a.id))).toBe(false);}
  expect(audio.filter(a=>a.filename==='01.mp3')).toHaveLength(3);expect(audio.filter(a=>a.filename==='12-1.mp3'||a.filename==='12-2.mp3')).toHaveLength(2);expect(poolAvailability(qs).listening_lab.count).toBe(0);
 });
 it('resolves independent extracts, native visuals and complete fixed language reviews exactly',()=>{
  expect(readingGroups(qs)).toHaveLength(20);expect(qs.filter(q=>q.eligible_games.includes('reading_explorer'))).toHaveLength(40);expect(qs.filter(q=>q.native_scene)).toHaveLength(16);expect(sets.filter(s=>s.selection_type==='native_visual')).toHaveLength(4);for(const c of pack.contexts)expect(c.text).toContain('Original fictional response extract');
  for(const s of sets){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}expect(pack.assessments).toHaveLength(3);for(const a of pack.assessments){expect(a.question_ids).toHaveLength(20);expect(a.official_max_marks).toBeNull();expect(a['speaking_band_score']).toBe(false);const session=assessmentSession(BOOK_CONTENT,a,contextById);expect(session.status).toBe('ready');if(session.status==='ready')expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);}const a=pack.assessments[0]!;expect(assessmentSession({...pack,questions:pack.questions.filter(q=>q.id!==a.question_ids[0])},a,contextById).status).toBe('incomplete');
 });
 it('appends stable batches while preserving earlier missions and exact part and custom scopes',()=>{
  expect(BOOK_RELEASES).toHaveLength(27);expect(BOOK_RELEASES.slice(25)).toEqual(releases);expect(releases.map(p=>p.questions.length)).toEqual([694,626]);for(let n=1;n<=2;n++)expect(readFileSync(`src/data/ielts-maximizer/native.${n}.pack.json`).length).toBeLessThan(3_200_000);const old=BOOK_RELEASES.slice(0,25).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);
  const through=scopeQuestions(practiceScope('through_unit','ielts-speaking-maximizer.u002'));expect(through.every(q=>q.placements?.every(p=>/\.u00[12]\./.test(p.node_id)))).toBe(true);const custom=scopeQuestions(practiceScope('custom','ielts-speaking-maximizer',['ielts-speaking-maximizer.u002','ielts-speaking-maximizer.u003']));expect(custom.every(q=>q.placements?.every(p=>/\.u00[23]\./.test(p.node_id)))).toBe(true);
 });
});
