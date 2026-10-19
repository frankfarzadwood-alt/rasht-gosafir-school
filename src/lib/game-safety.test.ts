import { describe, expect, it } from "vitest";
import { PILOT_QUESTIONS, pairCandidates, pairSet, poolAvailability, poolMissions, readingGroups, type Question } from "./bank";

const safe = PILOT_QUESTIONS.find(q => q.eligible_games.includes("match_arena") && !q.context_id && !q.assets.source_image_required && !q.assets.source_audio_required)!;

describe("book game counts and pairing dependencies", () => {
  it("distinguishes mission, passage and round counts from total question eligibility", () => {
    expect(PILOT_QUESTIONS).toHaveLength(2163);
    const missions = poolMissions("audit", PILOT_QUESTIONS);
    expect(missions).toHaveLength(301);
    expect(missions.flatMap(m => m.questionIds)).toHaveLength(1809);
    const groups = readingGroups(PILOT_QUESTIONS);
    expect(groups).toHaveLength(35);
    expect(groups.flatMap(g => g.questions)).toHaveLength(183);
    expect(PILOT_QUESTIONS.filter(q => q.eligible_games.includes("match_arena"))).toHaveLength(558);
    expect(poolAvailability(PILOT_QUESTIONS).match_arena.count).toBe(6);
    expect(pairSet(PILOT_QUESTIONS, 5, 0.25)).toHaveLength(5);
    expect(pairSet(PILOT_QUESTIONS, 4, 0.25)).toHaveLength(4);
  });

  it("keeps the eight real listening items out of pair-only runners while retaining them in the bank", () => {
    const listening = PILOT_QUESTIONS.filter(q => q.eligible_games.includes("match_arena") && q.assets.source_audio_required);
    expect(listening).toHaveLength(8);
    expect(pairCandidates(listening)).toEqual([]);
    expect(pairCandidates(PILOT_QUESTIONS)).toHaveLength(550);
    const blocked = new Set(listening.map(q => q.canonical_id));
    for (const seed of [0.1, 0.25, 0.5, 0.9]) {
      expect(pairSet(PILOT_QUESTIONS, 6, seed).every(card => !blocked.has(card.qid))).toBe(true);
    }
  });

  const dependencies: [string, (q: Question) => Question][] = [
    ["required audio", q => ({ ...q, assets: { ...q.assets, source_audio_required: true } })],
    ["required image", q => ({ ...q, assets: { ...q.assets, source_image_required: true } })],
    ["required asset list", q => ({ ...q, assets: { ...q.assets, required_asset_ids: ["required-media"] } })],
    ["required context", q => ({ ...q, context_id: "evolve1.quiz.u03.a.audio.transcript" })],
  ];
  it.each(dependencies)("does not present a pair without its %s", (_name, change) => {
    expect(pairCandidates([change(safe)])).toEqual([]);
    expect(pairCandidates([safe])).toHaveLength(1);
  });
});
