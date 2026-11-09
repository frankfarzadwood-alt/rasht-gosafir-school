import { describe, expect, it } from "vitest";
import { learnerAnswerCase, sentenceTileLabels } from "./answer-case";
import type { Question } from "./bank";

function item(prompt_en: string, value: string, options: string[] = [], reorder_tokens: string[] = []): Question {
  return { prompt_en, options: options.map((text, i) => ({ id: String(i), text })), reorder_tokens, answer: { value } } as Question;
}

describe("learner-facing capitalization", () => {
  it("formats every sentence-opening choice while keeping middle blanks and vocabulary lower-case", () => {
    const opening = item("____ for the event begins at 10 a.m.", "Registration", ["Registration", "permission", "limit"]);
    expect(opening.options.map(o => learnerAnswerCase(opening, o.text))).toEqual(["Registration", "Permission", "Limit"]);
    const continuation = item("I bought a ____ yesterday.", "notebook");
    expect(learnerAnswerCase(continuation, "notebook")).toBe("notebook");
    expect(learnerAnswerCase(item("What is this?", "notebook"), "notebook")).toBe("notebook");
    expect(learnerAnswerCase(item("The witness said ... ____", "she was there"), "she was there")).toBe("she was there");
  });

  it("handles a speaker turn and multiple blanks without capitalizing a continuation", () => {
    const dialogue = item("A: What colour is it? B: ____", "it is blue.");
    expect(learnerAnswerCase(dialogue, "it is blue.")).toBe("It is blue.");
    const gaps = item("____ you know where the shop ____?", "Do; is");
    expect(learnerAnswerCase(gaps, "do; is")).toBe("Do; is");
    expect(learnerAnswerCase(item("At 8 p.m. ____ will finish", "we"), "we")).toBe("we");
  });

  it("preserves choices that differ by case and the canonical capitalization of fragments", () => {
    const contrast = item("____ is a country.", "Turkey", ["Turkey", "turkey"]);
    expect(learnerAnswerCase(contrast, "turkey")).toBe("turkey");
    expect(sentenceTileLabels(item("Build the sentence.", "We met in London.", [], ["in", "london", "we", "met"])))
      .toEqual(["in", "London", "We", "met"]);
    expect(sentenceTileLabels(item("Do you know ...?", "where Maria lives", [], ["where", "Maria", "lives"])))
      .toEqual(["where", "Maria", "lives"]);
  });
});
