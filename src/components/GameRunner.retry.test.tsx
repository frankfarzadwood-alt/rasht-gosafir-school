import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameRunner } from "./GameRunner";
import { PILOT_QUESTIONS, type Question } from "@/lib/bank";
import { recordAttempt } from "@/lib/progress";

vi.mock("@/lib/progress", () => ({
  recordAttempt: vi.fn(() => 0),
  update: vi.fn(),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const examples = PILOT_QUESTIONS.filter(q => q.format === "mcq" && !q.context_id && !q.assets.source_audio_required && !q.assets.source_image_required);
const first = examples[0]!;
const second = examples.find(q => q.canonical_id !== first.canonical_id)!;
const answer = (q: Question, correct: boolean) => q.options.find(o => (o.id === q.answer.correct_option_id) === correct)!;
function choose(q: Question, correct: boolean) {
  fireEvent.click(screen.getByRole("radio", { name: answer(q, correct).text }));
}
function next() { fireEvent.click(screen.getByRole("button", { name: "ادامه ←" })); }
function retryMistakes() { fireEvent.click(screen.getByRole("button", { name: /تمرین دوبارهٔ اشتباه‌ها/ })); }
function accuracy(value: string) {
  expect(screen.getByText("دقت در اولین تلاش").parentElement?.firstElementChild).toHaveTextContent(new RegExp(`^${value}$`));
}
function start(questions: Question[] = [first]) {
  render(<GameRunner items={questions.map(q => ({ q, kind: "auto" as const }))} grade={null} term={null} scope="retry-regression" mode="quiz_sprint" />);
}

describe("completed-session mistake retries", () => {
  it("keeps the original wrong answer and zero first-try accuracy after a correct retry", () => {
    start();
    choose(first, false); next();
    accuracy("۰٪");
    retryMistakes();
    choose(first, true); next();
    accuracy("۰٪");
    expect(screen.getByText(/در تلاش دوباره درست شد/)).toBeInTheDocument();
    expect(screen.getByText(answer(first, false).text, { selector: "span.text-destructive" })).toBeInTheDocument();
    expect(vi.mocked(recordAttempt).mock.calls.map(([attempt]) => ({ correct: attempt.correct, retry: attempt.retry }))).toEqual([
      { correct: false, retry: false }, { correct: true, retry: true },
    ]);
  });

  it("retains the first mistake across more than one completed retry round", () => {
    start();
    choose(first, false); next();
    retryMistakes();
    choose(first, false); next();
    retryMistakes();
    choose(first, true); next();
    accuracy("۰٪");
    expect(screen.getByText(/در تلاش دوباره درست شد/)).toBeInTheDocument();
  });

  it("keeps histories separate when only one of two questions needs another round", () => {
    start([first, second]);
    choose(first, false); next();
    choose(second, true); next();
    accuracy("۵۰٪");
    retryMistakes();
    choose(first, true); next();
    accuracy("۰٪");
    expect(screen.getByText(/در تلاش دوباره درست شد/)).toBeInTheDocument();
  });

  it("preserves the existing immediate-retry behavior", () => {
    start();
    choose(first, false);
    fireEvent.click(screen.getByRole("button", { name: "دوباره امتحان کن" }));
    choose(first, true); next();
    accuracy("۰٪");
    expect(screen.getByText(/در تلاش دوباره درست شد/)).toBeInTheDocument();
  });
});
