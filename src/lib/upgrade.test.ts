import { describe, expect, it } from 'vitest';
import { PILOT, ASSET_POINTERS, mediaAsset, LIVE_CATALOGUE } from './content/pilot';
import { mergeQuestionRevisions, stableStringify } from './content/core';
import { livePack, assessmentSession } from './scope';
import { ALL_QUESTIONS, PILOT_QUESTIONS, contextById, isEligible, missions } from './bank';
import { OXFORD } from './content/oxford';
import snapshot from '@/test/fixtures/pilot200.pack.json';
import plan from '@/data/foundation/assessment_plan.json';
import bindings from '@/data/pilot/source_bindings.json';
import type { Question } from './content/contracts';

const pack = livePack(LIVE_CATALOGUE, 0);
const pilot = snapshot.questions as unknown as Question[];

describe('full Evolve 1 + Oxford upgrade', () => {
  it('loads 2163 book questions (639/956/568) plus 1801 school = 3964', () => {
    expect(PILOT.questions).toHaveLength(2163);
    expect(new Set(PILOT.questions.map(q => q.canonical_id)).size).toBe(2163);
    expect(PILOT.questions.filter(q => q.id.startsWith('evolve1.wb.'))).toHaveLength(639);
    expect(PILOT.questions.filter(q => q.id.startsWith('evolve1.quiz.'))).toHaveLength(956);
    expect(PILOT.questions.filter(q => q.id.startsWith('ows.'))).toHaveLength(568);
    expect(ALL_QUESTIONS).toHaveLength(1801);
    expect(pack.questions).toHaveLength(3964 + OXFORD.questions.length);
    expect(PILOT.questions.every(q => q.answer.verification_status === 'reviewed_by_assistant')).toBe(true);
  });
  it('upgrading from the pilot adds 1963 and leaves all 200 pilot records unchanged', () => {
    const r = mergeQuestionRevisions(pilot, PILOT.questions);
    expect(r.counts).toEqual({ added: 1963, updated: 0, unchanged: 200, stale: 0, conflicts: 0 });
  });
  it('re-importing the release is idempotent and leaves school missions intact', () => {
    const before = stableStringify(missions(10, 2));
    const once = mergeQuestionRevisions(pilot, PILOT.questions);
    const twice = mergeQuestionRevisions(once.questions, PILOT.questions);
    expect(twice.counts).toEqual({ added: 0, updated: 0, unchanged: 2163, stale: 0, conflicts: 0 });
    expect(twice.questions).toHaveLength(2163);
    expect(stableStringify(missions(10, 2))).toBe(before);
  });
  it('every required context and media dependency resolves; nothing is gated by missing files', () => {
    expect(Object.keys(ASSET_POINTERS)).toHaveLength(58);
    expect(PILOT.assets.every(a => mediaAsset(a.id)?.url.startsWith('/__l5e/assets-v1/'))).toBe(true);
    for (const q of PILOT_QUESTIONS) if (q.context_id) expect(contextById(q.context_id), q.id).toBeTruthy();
    expect(PILOT_QUESTIONS.filter(q => !isEligible(q)).map(q => q.id)).toEqual([]);
  });
  it('24 bound slots keep source items, 220 slots stay awaiting source, 24 practice quizzes stay ordered', () => {
    expect(bindings).toHaveLength(24);
    const bound = new Set(bindings.map(b => b.planning_slot_id));
    expect(plan.assessments.filter(a => bound.has(a.id)).every(a => a.question_ids.length > 0)).toBe(true);
    expect(plan.assessments.filter(a => !bound.has(a.id)).every(a => a.status === 'awaiting_source' && a.question_ids.length === 0)).toBe(true);
    for (const a of PILOT.assessments) {
      const s = assessmentSession(pack, a, contextById);
      expect(s.status, a.id).toBe('ready'); if (s.status !== 'ready') continue;
      expect(s.sections.flatMap(x => x.questions.map(q => q.id))).toEqual(a.question_ids);
      expect(s.time_limit_seconds).toBeNull(); expect(s.official_max_marks).toBeNull();
    }
  });
});
