import { describe, expect, it } from "vitest";
import { bookmark, EMPTY_LEARNING, legacyBookmark, restoreBookmark, scopeQuestions, selectCourse, toggleSaved } from "./learning";
import { DEFAULT, type Progress } from "./progress";
import { missions } from "./bank";
import { schoolTrackNode } from "./content/school";

describe("Learning navigation", () => {
  it("catalogue browsing preserves a returning learner's game and mission", () => {
    const id = schoolTrackNode(7, 1);
    if (!id) throw new Error("Expected a school term node");
    const state = { ...EMPTY_LEARNING, current: bookmark(id, "quest_trail", "g7t1m2") };
    expect(selectCourse(state, bookmark("school"))).toBe(state);
    expect(selectCourse(state, bookmark(id))).toBe(state);
    expect(selectCourse(EMPTY_LEARNING, bookmark(id)).current?.nodeId).toBe(id);
  });
  it("omits an absent mission and preserves an explicit mission", () => {
    expect(bookmark("school")).not.toHaveProperty("mission");
    expect(bookmark("school", "quest_trail", "saved-mission").mission).toBe("saved-mission");
  });

  it("restores a returning school learner's activity and next incomplete mission", () => {
    const first = missions(7, 1)[0];
    const next = missions(7, 1)[1];
    if (!first || !next) throw new Error("Expected existing school missions");
    const progress: Progress = { ...DEFAULT, nickname: "Learner", grade: 7, term: 1, missionsDone: [first.id] };
    const current = legacyBookmark(progress);
    expect(current?.nodeId).toBe(schoolTrackNode(7, 1));
    expect(current?.game).toBe("quest_trail");
    expect(current?.mission).toBe(next.id);
    expect(restoreBookmark(current)).toEqual(current);
  });

  it("keeps all 1,801 school questions available through the catalogue", () => {
    expect(scopeQuestions(bookmark("school").scope)).toHaveLength(1801);
  });

  it("saving and removing a course keeps the current activity unchanged", () => {
    const id = schoolTrackNode(7, 1);
    if (!id) throw new Error("Expected a school term node");
    const current = bookmark(id, "quiz_sprint");
    const saved = toggleSaved({ ...EMPTY_LEARNING, current }, id);
    expect(saved.saved).toEqual([id]);
    const removed = toggleSaved(saved, id);
    expect(removed.saved).toEqual([]);
    expect(removed.current).toEqual(current);
  });
});