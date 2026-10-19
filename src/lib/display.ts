// Learner-facing display adaptations. Source data in bank.json is never mutated;
// original strings stay available to the admin provenance view.
import type { Question } from "./bank";

/** Reviewed topic-tag dictionary. Unmapped tags are hidden, never guessed. */
export const TOPIC_FA: Record<string, string> = {
  family_jobs: "خانواده و شغل‌ها",
  nationality_places: "ملیت و مکان‌ها",
  travel_services: "سفر و خدمات",
  appreciation: "قدردانی",
  dates_numbers: "تاریخ و عددها",
  health_lifestyle: "سلامت و سبک زندگی",
  greetings_identity: "احوال‌پرسی و معرفی",
  language_communication: "زبان و ارتباط",
  personality: "شخصیت",
  abilities_hobbies: "توانایی‌ها و سرگرمی‌ها",
  festivals_culture: "جشن‌ها و فرهنگ",
  nature_conservation: "حفاظت از طبیعت",
  energy_environment: "انرژی و محیط زیست",
};
export const topicLabels = (tags: string[]) => tags.map((t) => TOPIC_FA[t]).filter((x): x is string => !!x);

/** Per-mode Persian instruction shown to learners. */
export const MODE_INSTRUCTION_FA: Record<string, string> = {
  reading_explorer: "متن را بخوان و به انگلیسی پاسخ بده.",
  gap_builder: "کلمهٔ مناسب را انتخاب کن و در جای خالی قرار بده.",
  word_forge: "با حرف‌ها کلمهٔ درست را بساز.",
  sentence_builder: "کلمه‌ها را به ترتیب درست بچین.",
  grammar_detective: "گزینهٔ درست از نظر دستوری را پیدا کن.",
  quiz_sprint: "گزینهٔ درست را انتخاب کن.",
};
const GENERIC = ["Review this source question.", "این سؤال نیاز به بازبینی دارد."];
export const isGenericInstruction = (s: string | null | undefined) => !s || GENERIC.includes(s.trim()) || s.includes("بازبینی");

export function learnerInstruction(q: Question, mode?: string): { fa?: string; en?: string } {
  if (q.assets.source_audio_required) return { fa: 'فایل صوتی را گوش بده و به انگلیسی پاسخ بده.' };
  if (mode === 'grammar_detective' && q.format === 'reorder_words') return { fa: 'جملهٔ خطادار را بخوان و با کارت‌ها شکل درست آن را بساز.' };
  const m = mode ? MODE_INSTRUCTION_FA[mode] : undefined;
  if (m) return { fa: m };
  if (!isGenericInstruction(q.instruction_fa)) return { fa: q.instruction_fa! };
  if (q.context_id) return { fa: "متن را بخوان و به انگلیسی پاسخ بده." };
  if (!isGenericInstruction(q.instruction_en)) return { en: q.instruction_en };
  return { fa: "به این سؤال پاسخ بده." };
}

/** Passage-based explanation adaptations, with audit trail. */
export type Adaptation = { explanation_fa: string; explanation_en: null; provenance: string; date: string; replaces: string };
export const EXPLANATION_ADAPTATIONS: Record<string, Adaptation> = {
  g08_t2_e001_q0028: { explanation_fa: "آقای براون و همسرش دو نفر هستند؛ دو پسر و یک دختر هم دارند، پس خانواده پنج نفر است.", explanation_en: null, provenance: "assistant_review_display_adaptation", date: "2026-10-13", replaces: "generic explanation" },
  g08_t2_e001_q0029: { explanation_fa: "در متن گفته شده همسرش در کار به او کمک می‌کند.", explanation_en: null, provenance: "assistant_review_display_adaptation", date: "2026-10-13", replaces: "generic explanation" },
  g08_t2_e001_q0030: { explanation_fa: "حیوان‌های نام‌برده در متن گاو، گوسفند و اسب هستند.", explanation_en: null, provenance: "assistant_review_display_adaptation", date: "2026-10-13", replaces: "generic explanation" },
};
export function learnerExplanation(q: Question): { fa: string | null; en: string | null } {
  const a = EXPLANATION_ADAPTATIONS[q.id];
  return a ? { fa: a.explanation_fa, en: a.explanation_en } : { fa: q.explanation_fa, en: q.explanation_en };
}

/** Immutable per-question attempt history → session result. */
export type Attempt = { response: string; correct: boolean; hinted: boolean };
export type SessionResult = { qid: string; attempts: readonly Attempt[]; firstResponse: string; firstCorrect: boolean; finalCorrect: boolean; correctedOnRetry: boolean };
export function summarize(qid: string, attempts: readonly Attempt[]): SessionResult {
  const f = attempts[0]!, l = attempts[attempts.length - 1]!;
  const firstCorrect = f.correct && !f.hinted;
  return { qid, attempts, firstResponse: f.response, firstCorrect, finalCorrect: l.correct, correctedOnRetry: !f.correct && l.correct };
}
