import { describe, expect, it } from 'vitest';
import { PILOT, LIVE_SELECTIONS, LIVE_CATALOGUE, mediaAsset } from './content/pilot';
import { mergeQuestionRevisions, stableStringify } from './content/core';
import { assessmentSession, livePack, recommendedAlignments, ALIGNMENTS } from './scope';
import { catalogueIndex, nodeScope, scopeQuestions, practiceScope, bookmark, restoreBookmark } from './learning';
import { ALL_QUESTIONS, contextById, ineligibility, gradeChoice, isAccepted, gapItems, forgeItems, sentenceItems, grammarItems, quizItems, pairCandidates, readingGroups, poolAvailability, missions, PILOT_QUESTIONS as BOOK_QUESTIONS, isEligible } from './bank';
import snapshot from '@/test/fixtures/pilot200.pack.json';
import { OXFORD, OXFORD_COVERAGE } from './content/oxford';
import { applyAttempt, DEFAULT } from './progress';
import { summarize } from './display';
import baselineCatalogue from '@/data/foundation/catalogue.json';
import plannedAssessments from '@/data/foundation/assessment_plan.json';

const pack = livePack(LIVE_CATALOGUE, 0);
/** The original Stage 04 pilot records, retained unchanged inside the full release. */
const PILOT_IDS = new Set(snapshot.questions.map(q => q.id));
const PILOT_QUESTIONS = BOOK_QUESTIONS.filter(q => PILOT_IDS.has(q.id));
const PILOT200 = PILOT.questions.filter(q => PILOT_IDS.has(q.id));
const ids = (q: { id: string }[]) => q.map(q => q.id).sort();
describe('bundled pilot boundaries', () => {
  it('retains the 200 pilot IDs inside the 2163-book release and the unchanged 1801-school baseline ', () => {
    expect(ALL_QUESTIONS).toHaveLength(1801);
    expect(PILOT200).toHaveLength(200);
    expect(PILOT.questions).toHaveLength(2163);
    expect(pack.questions).toHaveLength(3964 + OXFORD.questions.length);
    expect(new Set(pack.questions.map(q => q.canonical_id)).size).toBe(3964 + OXFORD.questions.length);
    expect(PILOT.questions.every(q => q.review_status === 'ready' && q.answer.verification_status === 'reviewed_by_assistant')).toBe(true);
    expect(PILOT.questions.every(q => q.grade === undefined && q.term === undefined && q.placements.filter(p => p.relation === 'primary').length === 1)).toBe(true);
    expect(PILOT_QUESTIONS.filter(q => !isEligible(q)).map(q => ({ id: q.id, why: ineligibility(q) }))).toEqual([]);
  });
  it('keeps the exact workbook/Quiz A/Quiz B/Oxford split 61/38/40/61', () => {
    expect(PILOT200.filter(q => q.id.startsWith('evolve1.wb.'))).toHaveLength(61);
    expect(PILOT200.filter(q => q.id.startsWith('evolve1.quiz.u01.a.'))).toHaveLength(38);
    expect(PILOT200.filter(q => q.id.startsWith('evolve1.quiz.u01.b.'))).toHaveLength(40);
    expect(PILOT200.filter(q => q.id.startsWith('ows.'))).toHaveLength(61);
    expect(PILOT200.filter(q => q.assets.source_audio_required)).toHaveLength(11);
  });
  it('merges six real Oxford sections without removing any original node', () => {
    expect(LIVE_CATALOGUE.nodes).toHaveLength(932);
    expect(baselineCatalogue.nodes.every(n => catalogueIndex.nodes.has(n.id))).toBe(true);
    expect(LIVE_CATALOGUE.nodes.filter(n => n.kind === 'book')).toHaveLength(17);
  });
  it('resolves every supplied exact practice-selection membership and count', () => {
    for (const s of LIVE_SELECTIONS) {
      const qs = scopeQuestions(s.scope);
      expect(qs.length, s.id).toBe(s.expected_ready_count);
      expect(ids(qs), s.id).toEqual([...s.counted_canonical_question_ids].sort());
    }
    expect(scopeQuestions(practiceScope('whole_book', 'evolve-1'))).toHaveLength(639 + 956);
    expect(scopeQuestions(practiceScope('whole_book', 'ows-elementary'))).toHaveLength(OXFORD_COVERAGE.ready_oxford_questions);
    expect(scopeQuestions(practiceScope('custom', 'evolve-1', ['evolve-1.u001.s2'])).length).toBeGreaterThanOrEqual(9);
    expect(scopeQuestions(practiceScope('whole_book', 'evolve-2'))).toEqual([]);
  });
  it('keeps all bundled school payloads and mission contents independent of pilot reapplication', () => {
    const before = stableStringify(missions(7, 1));
    const school = pack.questions.filter(q => q.grade !== undefined);
    for (const q of school) {
      const { revision, placements, ...rest } = q;
      expect(rest).toEqual(ALL_QUESTIONS.find(b => b.id === q.id));
    }
    const progress = stableStringify(DEFAULT);
    const r = mergeQuestionRevisions(pack.questions, PILOT.questions);
    expect(r.counts).toEqual({ added: 0, updated: 0, unchanged: 2163, stale: 0, conflicts: 0 });
    expect(stableStringify(missions(7, 1))).toBe(before);
    expect(stableStringify(DEFAULT)).toBe(progress);
  });
  it('same-revision edits conflict, older edits are stale, protected local edits are conflicts', () => {
    const q = PILOT.questions[0]; if (!q) throw new Error('pilot absent');
    const edit = { ...q, prompt_en: 'changed' };
    expect(mergeQuestionRevisions(PILOT.questions, [edit]).conflictIds).toEqual([q.id]);
    expect(mergeQuestionRevisions([{ ...q, revision: 2 }], [edit]).counts.stale).toBe(1);
    const protectedResult = mergeQuestionRevisions(PILOT.questions, [{ ...edit, revision: 2 }], new Set([q.id]));
    expect(protectedResult.conflictIds).toEqual([q.id]);
    expect(protectedResult.questions[0]).toEqual(q);
  });
});

describe('pilot gameplay and media contracts', () => {
  it('uses bounded banks, exact repeated letter and token multisets and explicit error pairs', () => {
    for (const { q, pool } of gapItems(PILOT_QUESTIONS)) expect([...pool].sort()).toEqual([...(q.word_bank ?? q.options.map(o => o.text))].sort());
    for (const q of forgeItems(PILOT_QUESTIONS)) expect(q.letter_pool?.map(s => s.toLowerCase()).sort().join('')).toBe(q.answer.value?.toLowerCase().split('').sort().join(''));
    expect(forgeItems(PILOT_QUESTIONS).some(q => new Set(q.letter_pool).size < (q.letter_pool?.length ?? 0))).toBe(true);
    expect(sentenceItems(PILOT_QUESTIONS).some(q => new Set(q.reorder_tokens).size < (q.reorder_tokens?.length ?? 0))).toBe(true);
    expect(grammarItems(PILOT_QUESTIONS)).toHaveLength(6);
    expect(grammarItems(PILOT_QUESTIONS).every(q => q.error_sentence_en && q.corrected_sentence_en)).toBe(true);
    expect(pairCandidates(PILOT_QUESTIONS)).toHaveLength(30);
  });
  it('stable shuffled option IDs grade correctly and normalization keeps apostrophes/negation', () => {
    for (const q of quizItems(PILOT_QUESTIONS).filter(q => q.options.length)) {
      for (const o of q.options.slice().reverse()) expect(gradeChoice(q, o.id)).toBe(o.id === q.answer.correct_option_id);
    }
    const q = PILOT_QUESTIONS[0]; if (!q) throw new Error('pilot absent');
    for (const [answer, wrong] of [["we're", 'were'], ["it's", 'its'], ["isn't", 'is']] as const) expect(isAccepted({ ...q, answer: { ...q.answer, value: answer, accepted_answers: [] } }, wrong)).toBe(false);
    expect(summarize(q.id, [{ response: 'wrong', correct: false, hinted: false }, { response: q.answer.value ?? '', correct: true, hinted: false }])).toMatchObject({ firstCorrect: false, finalCorrect: true, correctedOnRetry: true, firstResponse: 'wrong' });
  });
  it('all 58 assets resolve and listening scripts remain after-answer-only', () => {
    expect(PILOT.assets).toHaveLength(58);
    expect(PILOT.assets.every(a => mediaAsset(a.id)?.url.startsWith('/__l5e/assets-v1/'))).toBe(true);
    for (const q of PILOT_QUESTIONS.filter(q => q.assets.source_audio_required)) expect(contextById(q.context_id)?.display_policy).toBe('after_answer_only');
    for (const group of readingGroups(PILOT_QUESTIONS)) expect(group.questions.every(q => q.context_id === group.context.id)).toBe(true);
    const q = PILOT_QUESTIONS.find(q => q.assets.source_audio_required); if (!q) throw new Error('audio absent');
    expect(ineligibility({ ...q, assets: { ...q.assets, audio: 'missing' } })).toContain('unresolved_audio');
    expect(ineligibility({ ...q, requires_capabilities: ['unsupported'] })).toContain('unsupported_capability:unsupported');
  });
  it('per-game builders use only their declared eligible questions, standalone listening remains unavailable', () => {
    expect(quizItems(PILOT_QUESTIONS)).toHaveLength(200);
    expect(gapItems(PILOT_QUESTIONS)).toHaveLength(78);
    expect(forgeItems(PILOT_QUESTIONS)).toHaveLength(35);
    expect(sentenceItems(PILOT_QUESTIONS)).toHaveLength(16);
    expect(readingGroups(PILOT_QUESTIONS).flatMap(g => g.questions)).toHaveLength(17);
    expect(poolAvailability(PILOT_QUESTIONS).listening_lab.count).toBe(0);
  });
  it('fixed quizzes preserve complete 38/40 lists, source sections and no timer/marks', () => {
    expect(plannedAssessments.assessments).toHaveLength(244);
    expect(plannedAssessments.assessments.filter(a => a.status === 'awaiting_source')).toHaveLength(220);
    expect(PILOT.assessments).toHaveLength(24);
    PILOT.assessments.slice(0, 2).forEach((a, i) => {
      const s = assessmentSession(pack, a, contextById);
      expect(s.status).toBe('ready'); if (s.status !== 'ready') return;
      expect(s.sections.flatMap(s => s.questions.map(q => q.id))).toEqual(a.question_ids);
      expect(a.question_ids).toHaveLength(i === 0 ? 38 : 40);
      expect(s.sections.map(s => s.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(s.time_limit_seconds).toBeNull(); expect(s.official_max_marks).toBeNull();
      expect(assessmentSession({ ...pack, questions: pack.questions.filter(q => q.id !== a.question_ids[0]) }, a, contextById).status).toBe('incomplete');
    });
  });
  it('35 reviewed alignments are bidirectional, while the weak Unit11 link remains inactive', () => {
    expect(recommendedAlignments(ALIGNMENTS, catalogueIndex)).toHaveLength(35);
    const proposal = ALIGNMENTS.alignments.find(e => e.from_node_id === 'evolve-1.u011' && e.to_node_id === 'ows-elementary.u036');
    expect(proposal?.review_status).toBe('needs_review');
    expect(recommendedAlignments(ALIGNMENTS, catalogueIndex, { book: 'ows-elementary' })).toHaveLength(35);
  });
  it('book attempts retain null school fields, 10/5 rewards and resumable selection navigation', () => {
    const q = PILOT_QUESTIONS[0]; if (!q) throw new Error('pilot absent');
    const attempt = { id: 'a', qid: q.id, canonical: q.canonical_id, grade: null, term: null, scope: 'book', mode: 'quiz_sprint', correct: true, hinted: false, retry: false, ms: 100, response: q.answer.value ?? '' };
    expect(applyAttempt(structuredClone(DEFAULT), attempt, q.skill, new Date('2026-10-19T10:00:00Z')).xp).toBe(10);
    expect(applyAttempt(structuredClone(DEFAULT), { ...attempt, retry: true }, q.skill, new Date('2026-10-19T10:00:00Z')).xp).toBe(5);
    const b = { ...bookmark('evolve-1.u001', 'boss_exam', undefined, { mode: 'unit' }), selection: 'evolve-1.exam01.practice' };
    expect(restoreBookmark(b)).toEqual(b);
  });
});