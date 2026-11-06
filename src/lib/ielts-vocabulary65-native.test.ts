import {MAXIMIZER_NATIVE} from './content/ielts-maximizer';
import {IELTS_VOCABULARY60_NATIVE} from './content/ielts-vocabulary60';
import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {IELTS_VOCABULARY65_NATIVE as pack,IELTS_VOCABULARY65_NODES as nodes,IELTS_VOCABULARY65_SELECTIONS as sets} from './content/ielts-vocabulary65';
import {IELTS_GUIDES,ieltsGuideFor,ieltsWritingUnits,ieltsSpeakingTasks} from './content/ielts-series';
import {BOOK_CONTENT,BOOK_RELEASES,mediaAsset} from './content/pilot';
import {BUNDLED_QUESTIONS,contextById,flashcardItems,forgeItems,gapItems,gradeChoice,ineligibility,isAccepted,pairCandidates,poolAvailability,poolMissions,readingGroups,sentenceItems,type Question} from './bank';
import {nodeById,nodeScope,practiceScope,scopeQuestions} from './learning';
import {assessmentSession} from './scope';
const qs=pack.questions as unknown as Question[];
describe('IELTS Vocabulary 6.5 native release',()=>{
 it('releases the topic and reference curricula with populated native groups and correct page boundaries',()=>{
  expect(qs).toHaveLength(1128);expect(BUNDLED_QUESTIONS).toHaveLength(27708 + IELTS_VOCABULARY60_NATIVE.questions.length + MAXIMIZER_NATIVE.questions.length);expect(nodes).toHaveLength(126);expect(ieltsGuideFor('ielts-vocabulary-65')?.targets).toHaveLength(25);expect(IELTS_GUIDES[0]!.id).toBe('ielts-grammar-65');
  for(const[id,pages]of [['ielts-vocabulary-65.u001',[10,11,12,13]],['ielts-vocabulary-65.u020',[104,105,106,107,108,109]],['ielts-vocabulary-65.u021',[112,113,114,115]],['ielts-vocabulary-65.u025',[128,129,130,131]]] as const)expect(nodeById(id)?.['source_pages']).toEqual(pages);
  for(let n=1;n<=25;n++){const id=`ielts-vocabulary-65.u${String(n).padStart(3,'0')}`;for(let s=1;s<=4;s++){expect(scopeQuestions(nodeScope(id+'.s'+s)).length,id+'.s'+s).toBeGreaterThan(0);expect(nodeById(id+'.s'+s)?.['source_section_claim']).toBe(false);}const pool=scopeQuestions(practiceScope('unit',id)),a=poolAvailability(pool);expect(a.flashcards.count).toBeGreaterThan(9);expect(a.sentence_builder.count).toBe(2);expect(a.writing_studio.count).toBe(1);expect(a.speaking_studio.count).toBe([1,5,7,19,20,25].includes(n)?1:0);expect(a.listening_lab.count>0).toBe(n<=20||n===24);}
 });
 it('offers native meanings, usage, sentence builders and independent reading without screenshot assets',()=>{
  expect(flashcardItems(qs)).toHaveLength(686);expect(sentenceItems(qs)).toHaveLength(50);expect(readingGroups(qs)).toHaveLength(11);expect(qs.filter(q=>q.native_scene)).toHaveLength(16);
  for(const q of qs){expect(q.grade).toBeUndefined();expect(q.term).toBeUndefined();expect(q.assets.source_image_required).toBe(false);expect(q.assets.image).toBeNull();expect(q.source.pages.every(p=>p>=10&&p<=131),q.id).toBe(true);}
  for(const q of qs.filter(q=>q.options.length)){expect(new Set(q.options.map(o=>o.text.toLowerCase())).size,q.id).toBe(q.options.length);expect(gradeChoice(q,q.answer.correct_option_id!),q.id).toBe(true);for(const o of q.options.filter(o=>o.id!==q.answer.correct_option_id))expect(isAccepted(q,o.text),q.id).toBe(false);}
  for(const {q,pool}of gapItems(qs))expect(pool.filter(v=>isAccepted(q,v)),q.id).toHaveLength(1);
  for(const q of sentenceItems(qs))expect(isAccepted(q,q.reorder_tokens!.join(' ')),q.id).toBe(true);
  for(const q of forgeItems(qs))expect([...q.answer.value!].sort(),q.id).toEqual([...q.letter_pool!].sort());
  const pairs=pairCandidates(qs);expect(pairs.length).toBeGreaterThan(400);for(const word of ['self-centred','self-absorbed','terrified','petrified','astronomical','colossal','gimmick','ploy','catchy','memorable'])expect(pairs.some(p=>p.answer===word),word).toBe(false);
  for(const q of qs.filter(q=>['gimmick','ploy'].includes(q.answer.value??'')))expect(q.options.filter(o=>o.id!==q.answer.correct_option_id).some(o=>['gimmick','ploy'].includes(o.text))).toBe(false);
 });
 it('keeps all 43 mapped exercise recordings separate with supplied hidden scripts and matching bytes',()=>{
  expect(pack.assets).toHaveLength(43);expect(qs.filter(q=>q.skill==='listening')).toHaveLength(169);expect(pack.assets.map(a=>a['track'])).toEqual(Array.from({length:43},(_,i)=>i+2));
  for(const a of pack.assets){expect(a['unit']).toBe(Number(String(qs.find(q=>q.assets.audio===a.id)?.placements?.[0]?.node_id).match(/\.u(\d+)/)?.[1]));expect(contextById(a.id+'.script')).toMatchObject({display_policy:'after_answer_only',spoken_transcript:true});expect(createHash('sha256').update(readFileSync(new URL('../../public'+a.path,import.meta.url))).digest('hex'),a.id).toBe(a.sha256);expect(mediaAsset(a.id)?.url).toBe(a.path);expect(contextById(a.id+'.script')?.text).not.toMatch(/Recording scripts|JiMiiFI|1¢fflfj|l !®'M/);}
  expect(pack.assets.filter(a=>a['unit']===24).map(a=>a['track'])).toEqual([39,40,41,42,43,44]);expect(pack.assets.find(a=>a['track']===38)?.['unit']).toBe(20);expect(pack.assets.find(a=>a['track']===36)?.['unit']).toBe(18);expect(contextById('ieltsv65.native.audio.14.script')?.text).toContain('irritating promotional effective');expect(contextById('ieltsv65.native.audio.24.script')?.text).not.toContain('I moved here');expect(contextById('ieltsv65.native.audio.30.script')?.text).not.toContain('Sarah:');expect(contextById('ieltsv65.native.audio.8.script')?.text).toContain('12. sip');
  expect(ineligibility({...qs.find(q=>q.skill==='listening')!,assets:{image:null,audio:'missing',source_audio_required:true,source_image_required:false,required_asset_ids:['missing']}})).toContain('unresolved_audio');
 });
 it('records the unavailable natural-medicine exercise honestly and corrects contextual vocabulary senses',()=>{
  expect(pack.sources[0]).toMatchObject({pdf_pages:175,printed_to_pdf_offset:2,unassigned_tracks:[1],unavailable_exercises:[{unit:4,pdf_page:26,status:'recording_unavailable_confirmed_by_user'}]});expect(pack.assets.filter(a=>a['unit']===4).map(a=>a['track'])).toEqual([9]);expect(contextById('ieltsv65.native.audio.9.script')?.text).toMatch(/Science centre/i);
  expect(pack.vocabulary_entries.find(v=>v['lemma']==='astronomical')?.['sense_en']).toContain('cost');expect(pack.vocabulary_entries.some(v=>v['lemma']==='drought')).toBe(true);expect(pack.vocabulary_entries.some(v=>v['lemma']==='draft')).toBe(false);expect(qs.find(q=>q.id==='ieltsv65.native.u15.use1')?.answer.value).toBe('drought');
 });
 it('keeps five fixed thirty-question reviews complete and ordered without official marks',()=>{
  expect(pack.assessments).toHaveLength(5);for(const a of pack.assessments){expect(a.question_ids).toHaveLength(30);expect(new Set(a.question_ids).size).toBe(30);expect(a.official_max_marks).toBeNull();expect(a['source_test_reproduction']).toBe(false);const session=assessmentSession(BOOK_CONTENT,a,contextById);expect(session.status).toBe('ready');if(session.status==='ready')expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(a.question_ids);}
  for(const s of sets){expect(scopeQuestions(s.scope).map(q=>q.id),s.id).toEqual(s.counted_canonical_question_ids);expect(s.expected_ready_count).toBe(s.counted_canonical_question_ids.length);}
  const first=pack.assessments[0]!;expect(assessmentSession({...pack,questions:pack.questions.filter(q=>q.id!==first.question_ids[0])},first,contextById).status).toBe('incomplete');
 });
 it('keeps writing and speaking scoped to released application tasks and preserves all earlier mission boundaries',()=>{
  expect(ieltsWritingUnits(qs)).toHaveLength(25);expect(ieltsSpeakingTasks(qs)).toHaveLength(6);expect(ieltsWritingUnits(scopeQuestions(nodeScope('ielts-vocabulary-65.u001.s1')))).toEqual([]);expect(ieltsSpeakingTasks(scopeQuestions(nodeScope('ielts-vocabulary-65.u001.s2')))).toEqual([]);expect(ieltsWritingUnits(qs,'ielts-grammar-65')).toEqual([]);
  expect(BOOK_RELEASES.slice(0,23)).toHaveLength(23);expect(BOOK_RELEASES[22]).toBe(pack);const old=BOOK_RELEASES.slice(0,22).flatMap(p=>p.questions) as unknown as Question[],before=poolMissions('collection',old);expect(poolMissions('collection',[...old,...qs]).slice(0,before.length)).toEqual(before);
  const custom=scopeQuestions(practiceScope('custom','ielts-vocabulary-65',['ielts-vocabulary-65.u002','ielts-vocabulary-65.u024']));expect(custom.every(q=>q.placements?.every(p=>/^ielts-vocabulary-65\.u(?:002|024)\./.test(p.node_id)))).toBe(true);expect(readFileSync('src/data/ielts-vocabulary65/native.pack.json').length).toBeLessThan(3_200_000);
 });
});
