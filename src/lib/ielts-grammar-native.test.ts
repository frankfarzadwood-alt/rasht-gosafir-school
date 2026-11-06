import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {IELTS_VOCABULARY65_NATIVE} from './content/ielts-vocabulary65';
import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {IELTS_GRAMMAR_NATIVE as pack,IELTS_GRAMMAR_NODES as nodes,IELTS_GRAMMAR_SELECTIONS as sets} from './content/ielts-grammar65';
import {IELTS_GUIDES,ieltsWritingUnits,ieltsSpeakingTasks} from './content/ielts-series';
import {BOOK_CONTENT,BOOK_RELEASES,LIVE_CATALOGUE,mediaAsset,PILOT} from './content/pilot';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,grammarItems,gradeChoice,ineligibility,isAccepted,poolAvailability,poolMissions,readingGroups,sentenceItems,type Question} from './bank';
import {nodeById,nodeScope,practiceScope,scopeQuestions} from './learning';
import {assessmentSession} from './scope';
const qs=pack.questions as unknown as Question[];
describe('IELTS Grammar native release',()=>{
 it('releases all 25 existing units and one hundred source-aligned sections',()=>{
  expect(qs).toHaveLength(943);expect(BUNDLED_QUESTIONS).toHaveLength(26580 + IELTS_VOCABULARY65_NATIVE.questions.length + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(nodes).toHaveLength(126);expect(IELTS_GUIDES[0]!.targets).toHaveLength(25);expect(IELTS_GUIDES[0]!.writing).toHaveLength(25);
  expect(pack.sources[0]).toMatchObject({pdf_pages:267,printed_to_pdf_offset:11,key_pages:[231,247],script_pages:[248,263],unassigned_title_track:1});
  for(const [id,pages]of [['ielts-grammar-65.u001.s1',[12]],['ielts-grammar-65.u004.s1',[38,39]],['ielts-grammar-65.u008.s2',[72,73,74,75]],['ielts-grammar-65.u008.s3',[76,77]],['ielts-grammar-65.u013.s1',[114]],['ielts-grammar-65.u014.s1',[122]],['ielts-grammar-65.u025.s4',[230]]] as const)expect(nodeById(id)?.['source_pages']).toEqual(pages);
  for(const q of qs){expect(q.grade).toBeUndefined();expect(q.term).toBeUndefined();expect(q.source.pages.every(p=>p>=12&&p<=230),q.id).toBe(true);expect(q.assets.source_image_required).toBe(false);expect(q.assets.image).toBeNull();}
 });
 it('makes the complete native game set available without leaking personal tasks across sections',()=>{
  expect(flashcardItems(qs)).toHaveLength(150);expect(grammarItems(qs)).toHaveLength(486);expect(sentenceItems(qs)).toHaveLength(100);expect(readingGroups(qs)).toHaveLength(25);expect(ieltsWritingUnits(qs)).toEqual(Array.from({length:25},(_,i)=>i+1));expect(ieltsSpeakingTasks(qs)).toHaveLength(1);
  for(let n=1;n<=25;n++){const id=`ielts-grammar-65.u${String(n).padStart(3,'0')}`,pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(a.flashcards.count).toBe(6);expect(a.grammar_detective.count).toBeGreaterThanOrEqual(16);expect(a.sentence_builder.count).toBe(4);expect(a.reading_explorer.count).toBe(1);expect(a.writing_studio.count).toBe(1);expect(a.listening_lab.count).toBeGreaterThan(3);expect(a.speaking_studio.count).toBe(n===7?1:0);for(let s=1;s<=4;s++)expect(scopeQuestions(nodeScope(id+'.s'+s)).length).toBeGreaterThan(0);expect(ieltsWritingUnits(scopeQuestions(nodeScope(id+'.s1')))).toEqual([]);}
  expect(ieltsSpeakingTasks(scopeQuestions(nodeScope('ielts-grammar-65.u007.s2')))).toEqual([]);expect(ieltsWritingUnits(scopeQuestions(nodeScope('project-5')))).toEqual([]);
 });
 it('retains every exercise recording and the distinct multipart scripts',()=>{
  expect(pack.assets).toHaveLength(32);expect(qs.filter(q=>q.skill==='listening')).toHaveLength(207);expect(pack.contexts.filter(c=>c.kind==='listening_transcript')).toHaveLength(32);
  expect(pack.assets.map(a=>a['track'])).toEqual(Array.from({length:32},(_,i)=>i+2));
  const p1=contextById('ieltsg.native.audio.5.script')!,p2=contextById('ieltsg.native.audio.6.script')!;expect(p1.text).toContain('read five books last week');expect(p1.text).not.toContain('I find the best approach');expect(p2.text).toMatch(/^Sue: I find the best approach/);expect(p2.text).not.toContain('Have you written your assignment yet');
  expect(contextById('ieltsg.native.audio.20.script')?.text).not.toContain('At local company Angleside');expect(contextById('ieltsg.native.audio.21.script')?.text).toMatch(/^At local company Angleside/);expect(contextById('ieltsg.native.audio.22.script')?.text).toContain('fruit juice factory');
  for(const a of pack.assets){const c=contextById(a.id+'.script')!;expect(c).toMatchObject({display_policy:'after_answer_only',spoken_transcript:true});expect(c.text).not.toMatch(/Recording scripts|University Press|::\.\.i|;l~/);expect(qs.some(q=>q.assets.audio===a.id)).toBe(true);expect(createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);}
  expect(ineligibility({...qs.find(q=>q.skill==='listening')!,assets:{image:null,audio:'missing',source_audio_required:true,source_image_required:false,required_asset_ids:['missing']}})).toContain('unresolved_audio');
 });
 it('grades choices, letter pools and builders while excluding zero-article and multi-form answers from gap tiles',()=>{
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const {q,pool}of gapItems(qs)){expect(pool.filter(v=>isAccepted(q,v)),q.id).toHaveLength(1);expect(q.answer.value).not.toBe('No article');expect(q.answer.value).not.toContain(' / ');}
  for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  expect(qs.find(q=>q.id==='ieltsg.native.u13.g10')?.answer.value).toBe('may, might, could');expect(qs.find(q=>q.id==='ieltsg.native.u20.g1')?.answer.value).toBe('who / that');expect(qs.find(q=>q.id==='ieltsg.native.u8.g21')?.answer.value).toBe('lives / live');expect(qs.find(q=>q.id==='ieltsg.native.u8.g21')?.eligible_games).not.toContain('gap_builder');
 });
 it('keeps nine visual scopes exact and two complete fixed fifty-question reviews independent of official band marks',()=>{
  expect(qs.filter(q=>q.native_scene)).toHaveLength(36);expect(qs.filter(q=>q.native_scene?.kind==='data_chart')).toHaveLength(8);expect(sets.filter(s=>s.selection_type==='native_visual')).toHaveLength(9);
  for(const s of sets){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
  expect(pack.assessments).toHaveLength(2);for(const a of pack.assessments){expect(a.question_ids).toHaveLength(50);expect(new Set(a.question_ids).size).toBe(50);expect(a.official_max_marks).toBeNull();expect(a['source_test_reproduction']).toBe(false);const session=assessmentSession(BOOK_CONTENT,a,contextById);expect(session.status).toBe('ready');if(session.status==='ready')expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);}
  const first=pack.assessments[0]!,missing={...pack,questions:pack.questions.filter(q=>q.id!==first.question_ids[0])};expect(assessmentSession(missing,first,contextById).status).toBe('incomplete');
 });
 it('preserves earlier missions and keeps custom and cumulative scopes within their intended units',()=>{
  expect(BOOK_RELEASES.slice(0,22)).toHaveLength(22);expect(BOOK_RELEASES[21]).toBe(pack);const old=BOOK_RELEASES.slice(0,21).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);for(const a of PILOT.assessments)expect(BOOK_CONTENT.assessments.find(x=>x.id===a.id)).toEqual(a);
  const through=scopeQuestions(practiceScope('through_unit','ielts-grammar-65.u003'));expect(through.every(q=>q.placements?.every(p=>/^ielts-grammar-65\.u00[1-3]\./.test(p.node_id)))).toBe(true);const custom=scopeQuestions(practiceScope('custom','ielts-grammar-65',['ielts-grammar-65.u002','ielts-grammar-65.u024']));expect(custom.every(q=>q.placements?.every(p=>/^ielts-grammar-65\.u(?:002|024)\./.test(p.node_id)))).toBe(true);expect(readFileSync('src/data/ielts-grammar65/native.pack.json').length).toBeLessThan(3_200_000);
 });
 it('includes the released eighteenth Speaking Maximizer book',()=>{
  expect(LIVE_CATALOGUE.nodes.filter(n=>n.kind==='book')).toHaveLength(18);expect(nodeById('ielts-speaking-maximizer')).toMatchObject({parent_id:'ielts',availability:'ready',source_pdf_pages:218,supplied_audio_files:44});expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);expect(scopeQuestions(practiceScope('whole_book','ielts-speaking-maximizer'))).toHaveLength(1320);
 });
});
