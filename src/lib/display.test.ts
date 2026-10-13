import { describe, it, expect } from "vitest";
import { summarize, topicLabels } from "./display";
import { applyAttempt } from "./progress";

describe("wrong → correct retry → result", () => {
  it("keeps the original mistake and does not count retry as first-attempt success", () => {
    const r = summarize("g08_t2_e001_q0029", [
      { response: "His son", correct: false, hinted: false },
      { response: "His wife", correct: true, hinted: false },
    ]);
    expect(r.firstResponse).toBe("His son");
    expect(r.firstCorrect).toBe(false);
    expect(r.correctedOnRetry).toBe(true);
    expect(r.finalCorrect).toBe(true);
  });
  it("3-question session: 2/3 first-attempt", () => {
    const rs = [
      summarize("a", [{ response: "Five", correct: true, hinted: false }]),
      summarize("b", [{ response: "His son", correct: false, hinted: false }, { response: "His wife", correct: true, hinted: false }]),
      summarize("c", [{ response: "Cows, sheep and horses", correct: true, hinted: false }]),
    ];
    expect(rs.filter((r) => r.firstCorrect).length).toBe(2);
  });
  it("hides unmapped tags", () => {
    expect(topicLabels(["nationality_places", "family_jobs", "grammar_form", "unclassified"])).toEqual(["ملیت و مکان‌ها", "خانواده و شغل‌ها"]);
  });
});
void applyAttempt;
