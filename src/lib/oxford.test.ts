import { EXPANSION } from './content/expansion';
import { LIBRARY } from './content/library';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { OXFORD, OXFORD_COVERAGE } from './content/oxford';
import { BOOK_CONTENT, LIVE_CATALOGUE, LIVE_SELECTIONS, PILOT, PILOT_SELECTIONS, mediaAsset } from './content/pilot';
import { validateQuestionPack } from './content/validate';
import { indexCatalogue, mergeQuestionRevisions } from './content/core';
import { ALL_QUESTIONS, BUNDLED_QUESTIONS, PILOT_QUESTIONS, contextById, dedupe, flashcardItems, forgeItems, gapItems, grammarItems, isAccepted, isEligible, pairCandidates, pairInventoryCount, pairSet, playableCounts, poolMissions, sentenceItems, type Question } from './bank';
import { catalogueIndex, practiceScope, scopeQuestions } from './learning';
const ox = OXFORD.questions as unknown as Question[];
const allOx = BUNDLED_QUESTIONS.filter(q => q.id.startsWith('ows.'));
const hash = (s: Buffer) => createHash('sha256').update(s).digest('hex');

describe('reviewed Oxford expansion', () => {
  it('composes all additions once, preserving every original payload and identity', () => {
    expect(OXFORD.questions).toHaveLength(2962);
    expect(OXFORD.vocabulary_entries).toHaveLength(639);
    expect(OXFORD_COVERAGE.ready_oxford_questions).toBe(3530);
    expect(BUNDLED_QUESTIONS).toHaveLength(6926 + LIBRARY.questions.length + EXPANSION.questions.length);
    expect(dedupe(BUNDLED_QUESTIONS)).toHaveLength(6926 + LIBRARY.questions.length + EXPANSION.questions.length);
    expect(PILOT.questions).toHaveLength(2163);
    expect(ALL_QUESTIONS).toHaveLength(1801);
    const live = new Map(BOOK_CONTENT.questions.map(q => [q.id, q]));
    for (const q of PILOT.questions) expect(live.get(q.id)).toEqual(q);
    const once = mergeQuestionRevisions(PILOT.questions, OXFORD.questions);
    expect(once.counts.added).toBe(2962);
    expect(mergeQuestionRevisions(once.questions, OXFORD.questions).counts).toEqual({ added: 0, updated: 0, unchanged: 2962, stale: 0, conflicts: 0 });
    expect(playableCounts()).toEqual({ '7-1':114,'7-2':113,'8-1':99,'8-2':137,'9-1':164,'9-2':68,'10-1':203,'10-2':258,'11-1':200,'11-2':127,'12-1':151,'12-2':167 });
  });
  it('passes native contracts, declared media capabilities and answer builders', () => {
    expect(validateQuestionPack(OXFORD, indexCatalogue(LIVE_CATALOGUE))).toEqual([]);
    expect(ox.filter(q => !isEligible(q)).map(q => q.id)).toEqual([]);
    for (const q of ox) {
      expect(q.answer.verification_status).toBe('reviewed_by_assistant');
      expect(q.grade).toBeUndefined(); expect(q.term).toBeUndefined();
      if (q.options.length) {
        expect(new Set(q.options.map(o => o.text.trim().toLowerCase())).size, q.id).toBe(q.options.length);
        if (q.format === 'mcq' || q.format === 'true_false') expect(q.options.find(o => o.id === q.answer.correct_option_id)?.text, q.id).toBe(q.answer.value);
      }
    }
    for (const { q, pool } of gapItems(ox)) expect(pool.filter(w => isAccepted(q, w)), q.id).toHaveLength(1);
    for (const q of forgeItems(ox)) expect(q.letter_pool!.map(x => x.toLowerCase()).sort().join(''), q.id).toBe(q.answer.value!.toLowerCase().split('').sort().join(''));
    expect(grammarItems(ox)).toHaveLength(9);
    expect(grammarItems(ox).every(q => q.error_sentence_en && q.corrected_sentence_en === q.answer.value)).toBe(true);
    for (const q of sentenceItems(ox)) expect(isAccepted(q, q.reorder_tokens!.join(' ')), q.id).toBe(true);
    const saved = ox.find(q => q.id === 'ows.elem2.u027.e05.06')!;
    expect(isAccepted(saved, 'saved')).toBe(true); expect(isAccepted(saved, 'paid')).toBe(false);
    expect(pairCandidates(ox).every(c => !ox.find(q => q.id === c.qid)?.assets.source_image_required)).toBe(true);
  });
  it('bundles the real question crops with matching hashes, excluding answer-key images', () => {
    expect(OXFORD.assets).toHaveLength(291);
    for (const a of OXFORD.assets) {
      expect(mediaAsset(a.id)?.url).toBe(a.path);
      const bytes = readFileSync(new URL('../../public' + a.path, import.meta.url));
      expect(bytes.length, a.id).toBeGreaterThan(100);
      expect(bytes.subarray(0,4).toString(), a.id).toBe('RIFF');
      expect(bytes.subarray(8,12).toString(), a.id).toBe('WEBP');
      expect(hash(bytes), a.id).toBe(a.sha256);
      expect((a['source_pages'] as number[]).every(n => n >= 12 && n <= 193)).toBe(true);
    }
    const imageQuestion = ox.find(q => q.assets.source_image_required)!;
    expect(isEligible({ ...imageQuestion, assets: { ...imageQuestion.assets, image: { asset_id: 'absent' } } })).toBe(false);
  });
  it('uses real vocabulary links for 1072 cards and rejects unavailable, context or media cards', () => {
    expect(flashcardItems(allOx)).toHaveLength(1072);
    expect(pairInventoryCount(allOx)).toBeGreaterThan(433);
    expect(pairSet(allOx, 5, .2)).toHaveLength(5); expect(pairSet(allOx, 4, .2)).toHaveLength(4);
    const q = ox.find(q => q.eligible_games.includes('flashcards'))!;
    expect(flashcardItems([q, q])).toHaveLength(1);
    expect(flashcardItems([{ ...q, review_status: 'needs_review' }])).toEqual([]);
    expect(flashcardItems([{ ...q, vocabulary_entry_id: 'missing' }])).toEqual([]);
    expect(flashcardItems([{ ...q, assets: { ...q.assets, source_image_required: true } }])).toEqual([]);
    expect(flashcardItems([{ ...q, context_id: 'unknown' }])).toEqual([]);
    expect(flashcardItems(scopeQuestions(practiceScope('whole_book', 'evolve-2')))).toEqual([]);
  });
  it('preserves all old Oxford mission contents and appends additions in every existing scope', () => {
    for (const node of LIVE_CATALOGUE.nodes.filter(n => n.kind === 'unit' && n.id.startsWith('ows-elementary'))) {
      const pool = scopeQuestions(practiceScope('unit', node.id));
      const old = pool.filter(q => PILOT_QUESTIONS.some(b => b.id === q.id));
      const before = poolMissions(node.id, old);
      const after = poolMissions(node.id, pool);
      expect(after.slice(0, before.length), node.id).toEqual(before);
      expect(new Set(after.flatMap(m => m.questionIds)).size).toBe(after.flatMap(m => m.questionIds).length);
    }
  });
  it('keeps unit, cumulative, custom and Evolve fixed selections exact', () => {
    const unit = scopeQuestions(practiceScope('unit', 'ows-elementary.u002'));
    expect(unit.every(q => (q.source as unknown as { unit:number }).unit === 2)).toBe(true);
    const cumulative = scopeQuestions(practiceScope('through_unit', 'ows-elementary.u003'));
    expect(cumulative.every(q => Number((q.source as unknown as { unit:number }).unit) <= 3)).toBe(true);
    const custom = scopeQuestions(practiceScope('custom', 'ows-elementary', ['ows-elementary.u002', 'ows-elementary.u003', 'ows-elementary.u003']));
    expect(custom.every(q => [2,3].includes((q.source as unknown as { unit:number }).unit))).toBe(true);
    expect(new Set(custom.map(q => q.id)).size).toBe(custom.length);
    for (const s of LIVE_SELECTIONS) {
      const qs = scopeQuestions(s.scope);
      expect(qs.map(q => q.canonical_id).sort(), s.id).toEqual([...s.counted_canonical_question_ids].sort());
      expect(qs.length).toBe(s.expected_ready_count);
      if (!s.anchor_node_id.startsWith('ows-elementary')) expect(s).toEqual(PILOT_SELECTIONS.find(b => b.id === s.id));
    }
    expect(catalogueIndex.nodes.size).toBe(932);
    expect(contextById('missing')).toBeNull();
  });
});
