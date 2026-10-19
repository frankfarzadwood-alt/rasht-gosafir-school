import { useSyncExternalStore } from "react";
import raw from "@/data/bank.json";

export type Option = { id: string; text: string };
export type Pair = { left: string; right: string };
export type Normalization = {
  unicode?: string; case_sensitive?: boolean; collapse_whitespace?: boolean;
  ignore_terminal_punctuation?: boolean; fuzzy_matching?: boolean; preserve_internal_apostrophes?: boolean;
};
export type Question = {
  id: string; canonical_id: string; grade: number; listing_grade?: number | null; term: number;
  source_id: string; source_question_number: string | null; granularity: string; skill: string;
  topic_tags: string[]; lesson_id: string | null; lesson_status?: string; format: string;
  difficulty: number | null; difficulty_status?: string; instruction_en: string; instruction_fa: string;
  prompt_en: string | null; original_extracted_prompt_en?: string | null; options: Option[];
  context_id: string | null;
  assets: { image: unknown; audio: unknown; source_image_required: boolean; source_audio_required: boolean };
  review_status: string; review_issues: string[]; eligible_games: string[];
  reorder_tokens: string[] | null; pairs: Pair[] | null; word_bank: string[] | null;
  hint_fa: string | null; explanation_fa: string | null; explanation_en: string | null; grammar_tag: string | null;
  memberships?: { grade: number; term: number; source_id: string; question_id: string }[];
  answer: {
    value: string | null; correct_option_id: string | null; accepted_answers: string[];
    provenance: string; verification_status: string; original_mapped_key?: string | null;
    key_candidates: { value: string; page?: number }[]; normalization?: Normalization;
  };
  source: { listing_url: string; pdf_url: string; pages: number[] };
};
export type Context = {
  id: string; kind: string; text: string | null; review_status: string; content_origin?: string;
  source_id?: string; source_page?: number; source_pdf_url?: string;
};

export const ALL_QUESTIONS = (raw as unknown as { questions: Question[] }).questions;
/** Duplicate record IDs → the canonical ID that is played instead (from the reviewed release). */
export const ID_ALIASES: Record<string, string> = (raw as unknown as { id_aliases?: Record<string, string> }).id_aliases ?? {};
export const RAW_RELEASE = raw as unknown as Record<string, unknown>;
export const CONTEXTS = (raw as unknown as { contexts: Context[] }).contexts;

// ---------- Device-local overlay (items approved in the local review workspace) ----------
let overlayQ: Question[] = [];
let overlayC: Context[] = [];
let bankVersion = 0;
const bankSubs = new Set<() => void>();
/** Only items approved on this device enter play here; they replace a starter item with the same stable ID. */
export function setLocalOverlay(qs: Question[], cs: Context[]) {
  overlayQ = qs; overlayC = cs; bankVersion++;
  bankSubs.forEach((l) => l());
}
export const overlayContexts = () => overlayC;
export const getBankVersion = () => bankVersion;
export function useBankVersion() {
  return useSyncExternalStore((l) => { bankSubs.add(l); return () => bankSubs.delete(l); }, () => bankVersion, () => 0);
}
export function playableSource(): Question[] {
  if (!overlayQ.length) return ALL_QUESTIONS;
  const m = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
  for (const q of overlayQ) m.set(q.id, q);
  return [...m.values()];
}
export type CtxLookup = (id: string | null) => Context | null;
export const contextById: CtxLookup = (id) => overlayC.find((c) => c.id === id) ?? CONTEXTS.find((c) => c.id === id) ?? null;
export const REVIEWED_STATUSES = ["reviewed_by_assistant", "reviewed_by_teacher", "reviewed_locally"];

const CHOICE_FORMATS = ["mcq", "odd_one_out", "true_false"];
const TYPED_FORMATS = ["fill_blank", "word_form", "spelling", "short_answer", "cloze"];

/** Student eligibility rule from the brief. Returns reasons when not eligible. */
export function ineligibility(q: Question, ctx: CtxLookup = contextById): string[] {
  const r: string[] = [];
  if (q.review_status !== "ready") r.push("review_status_not_ready");
  if (q.granularity !== "atomic") r.push("not_atomic");
  if (["source_review", "free_writing"].includes(q.format)) r.push("not_auto_gradable_format");
  if (!q.prompt_en || !q.prompt_en.trim()) r.push("empty_prompt");
  const a = q.answer;
  if (!REVIEWED_STATUSES.includes(a.verification_status)) r.push("answer_not_reviewed");
  if (!a.value) r.push("no_answer");
  if (CHOICE_FORMATS.includes(q.format)) {
    if (q.options.length < 2 || !q.options.some((o) => o.id === a.correct_option_id)) r.push("invalid_choices");
  }
  if (q.format === "reorder_words" && !tokensMatch(q)) r.push("tokens_do_not_match_answer");
  if (q.format === "matching" && !(q.pairs && q.pairs.length >= 2)) r.push("invalid_pairs");
  if (q.context_id) {
    const c = ctx(q.context_id);
    if (!c || c.review_status !== "ready" || !c.text) r.push("context_not_ready");
  }
  if (q.assets?.source_image_required && !q.assets.image) r.push("missing_image");
  if (q.assets?.source_audio_required && !q.assets.audio) r.push("missing_audio");
  if (q.skill === "listening" && !q.assets?.audio) r.push("missing_audio");
  return r;
}
export const isEligible = (q: Question, ctx: CtxLookup = contextById) => ineligibility(q, ctx).length === 0;
export const isChoice = (q: Question) => CHOICE_FORMATS.includes(q.format);
export const isTyped = (q: Question) => TYPED_FORMATS.includes(q.format);

// ---------- Normalization & grading ----------
export function normalize(s: string, n: Normalization = {}) {
  let t = s.normalize("NFKC").replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"').trim();
  if (n.collapse_whitespace !== false) t = t.replace(/\s+/g, " ");
  if (n.ignore_terminal_punctuation !== false) t = t.replace(/[.!?,;:]+$/g, "").trim();
  if (!n.case_sensitive) t = t.toLowerCase();
  return t;
}
export function isAccepted(q: Question, response: string) {
  const n = q.answer.normalization;
  const r = normalize(response, n);
  const list = [q.answer.value ?? "", ...q.answer.accepted_answers];
  return r.length > 0 && list.some((a) => normalize(a, n) === r);
}
export function gradeChoice(q: Question, optionId: string) {
  return optionId === q.answer.correct_option_id;
}
export function tokensMatch(q: Question) {
  if (!q.reorder_tokens?.length || !q.answer.value) return false;
  const words = (s: string) => normalize(s).replace(/[.!?,]/g, "").split(" ").filter(Boolean).sort().join(" ");
  const target = [q.answer.value, ...q.answer.accepted_answers];
  return target.some((t) => words(t) === words(q.reorder_tokens!.join(" ")));
}
export function gradeTokens(q: Question, order: string[]) {
  return isAccepted(q, order.join(" "));
}
export const correctText = (q: Question) =>
  isChoice(q) ? q.options.find((o) => o.id === q.answer.correct_option_id)?.text ?? q.answer.value ?? "" : q.answer.value ?? "";

// ---------- Track queries ----------
export const trackQuestions = (grade: number, term: number) =>
  playableSource().filter((q) => q.grade === grade && q.term === term && isEligible(q));

/** One representative per canonical ID so a session never repeats a learning item. */
export function dedupe(qs: Question[]) {
  const seen = new Set<string>();
  return qs.filter((q) => (seen.has(q.canonical_id) ? false : (seen.add(q.canonical_id), true)));
}

export function shuffle<T>(a: T[], seed = Math.random()): T[] {
  const arr = [...a];
  let s = Math.floor(seed * 2 ** 31) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

// ---------- Mode-specific item builders ----------
export type GapItem = { q: Question; pool: string[] };
export function gapItems(track: Question[]): GapItem[] {
  const typedAnswers = track.filter((q) => isTyped(q) && q.answer.value && !q.answer.value.includes(" ")).map((q) => q.answer.value!);
  const out: GapItem[] = [];
  for (const q of track) {
    if (!q.eligible_games.includes("gap_builder")) continue;
    if (!q.prompt_en?.includes("_")) continue;
    let pool: string[];
    if (isChoice(q)) pool = q.options.map((o) => o.text);
    else if (q.word_bank?.length) pool = q.word_bank;
    else {
      const distract = shuffle([...new Set(typedAnswers)]).filter((w) => !isAccepted(q, w)).slice(0, 3);
      if (distract.length < 2) continue;
      pool = [q.answer.value!, ...distract];
    }
    // exactly one pool entry must be accepted
    if (pool.filter((p) => isAccepted(q, p)).length !== 1) continue;
    out.push({ q, pool: shuffle(pool) });
  }
  return out;
}

export function forgeItems(track: Question[]) {
  return track.filter((q) => q.eligible_games.includes("word_forge") && /^[A-Za-z]{3,14}$/.test(q.answer.value ?? ""));
}
export const letterPool = (word: string) => shuffle(word.split(""));

export function sentenceItems(track: Question[]) {
  return track.filter((q) => q.eligible_games.includes("sentence_builder") && q.format === "reorder_words" && tokensMatch(q));
}

export type PairCard = { key: string; qid: string; clue: string; answer: string };
export function pairCandidates(track: Question[]): PairCard[] {
  const out: PairCard[] = [];
  for (const q of track) {
    if (q.format === "matching" && q.pairs && (q.eligible_games.includes("match_arena") || q.eligible_games.includes("memory_pairs"))) {
      q.pairs.forEach((p, i) => out.push({ key: `${q.id}#${i}`, qid: q.canonical_id, clue: p.left, answer: p.right }));
    } else if ((q.eligible_games.includes("match_arena") || q.eligible_games.includes("memory_pairs")) && q.answer.value && q.prompt_en) {
      if (q.prompt_en.length > 90) continue;
      out.push({ key: q.id, qid: q.canonical_id, clue: q.prompt_en, answer: correctText(q) });
    }
  }
  return out;
}
/** Builds a one-to-one set: unique answers and no clue accepts another card's answer. */
export function pairSet(track: Question[], size: number): PairCard[] {
  const set: PairCard[] = [];
  const used = new Set<string>();
  for (const c of shuffle(pairCandidates(track))) {
    const a = normalize(c.answer);
    if (used.has(a) || set.some((s) => s.qid === c.qid && s.key.split("#")[0] !== c.key.split("#")[0])) continue;
    used.add(a);
    set.push(c);
    if (set.length >= size) break;
  }
  return set.length >= 2 ? set : [];
}

export const grammarItems = (track: Question[]) => track.filter((q) => q.eligible_games.includes("grammar_detective") && q.skill === "grammar" && isChoice(q));
export const quizItems = (track: Question[]) => track.filter((q) => isChoice(q) && q.eligible_games.includes("quiz_sprint"));
/** Each passage keeps only its own questions; a passage whose context cannot be resolved is left out. */
export function readingGroups(track: Question[], ctx: CtxLookup = contextById) {
  const m = new Map<string, Question[]>();
  for (const q of track) if (q.context_id && q.eligible_games.includes("reading_explorer")) m.set(q.context_id, [...(m.get(q.context_id) ?? []), q]);
  return [...m.entries()].flatMap(([id, qs]) => { const context = ctx(id); return context ? [{ context, questions: qs }] : []; });
}

// ---------- Missions for Quest Trail ----------
export type Mission = { id: string; index: number; skill: string; topics: string[]; questionIds: string[] };
function chunkMissions(qs: Question[], grade: number, term: number, start: number, mergeTail: boolean): Mission[] {
  const out: Mission[] = [];
  const size = 6;
  for (let i = 0; i < qs.length; i += size) {
    const chunk = qs.slice(i, i + size);
    if (mergeTail && chunk.length < 5 && out.length) { out[out.length - 1]!.questionIds.push(...chunk.map((c) => c.id)); break; }
    const counts: Record<string, number> = {};
    chunk.forEach((c) => (counts[c.skill] = (counts[c.skill] ?? 0) + 1));
    const skill = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0];
    const topics = [...new Set(chunk.flatMap((c) => c.topic_tags).filter((t) => t !== "unclassified"))].slice(0, 2);
    const n = start + out.length;
    out.push({ id: `g${grade}t${term}m${n + 1}`, index: n, skill, topics, questionIds: chunk.map((c) => c.id) });
  }
  return out;
}
/**
 * Baseline missions are built from the bundled pack only, so their IDs and contents never shift.
 * Questions added later by a reviewed pack are appended as new missions in import order.
 */
export function missions(grade: number, term: number): Mission[] {
  const playable = dedupe(trackQuestions(grade, term)).filter((q) => !q.context_id);
  const baseIds = new Set(ALL_QUESTIONS.map((q) => q.id));
  const base = playable.filter((q) => baseIds.has(q.id)).sort((a, b) => a.id.localeCompare(b.id));
  const order = new Map(overlayQ.map((q, i) => [q.id, i]));
  const baseCanon = new Set(base.map((q) => q.canonical_id));
  const extra = playable.filter((q) => !baseIds.has(q.id) && !baseCanon.has(q.canonical_id))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  const out = chunkMissions(base, grade, term, 0, true);
  return [...out, ...chunkMissions(extra, grade, term, out.length, false)];
}

/** Missions for a non-school scope: namespaced by scope key so they never collide with school mission IDs. */
export function poolMissions(scopeKey: string, pool: Question[]): Mission[] {
  const qs = dedupe(pool).filter((q) => !q.context_id).sort((a, b) => a.id.localeCompare(b.id));
  return chunkMissions(qs, 0, 0, 0, true).map((m) => ({ ...m, id: `${scopeKey}:m${m.index + 1}` }));
}

// ---------- Mode catalogue ----------
export type ModeId =
  | "quest_trail" | "quiz_sprint" | "gap_builder" | "word_forge" | "sentence_builder" | "match_arena"
  | "memory_pairs" | "grammar_detective" | "reading_explorer" | "listening_lab" | "boss_exam" | "writing_studio";
export const MODES: { id: ModeId; fa: string; desc: string; icon: string }[] = [
  { id: "quest_trail", fa: "مسیر ماجراجویی", desc: "مأموریت‌های کوتاه ترکیبی", icon: "🗺️" },
  { id: "quiz_sprint", fa: "دوی سرعت", desc: "۶ تا ۸ تست چندگزینه‌ای", icon: "⚡" },
  { id: "gap_builder", fa: "جای خالی", desc: "جمله را با کارت کلمه کامل کن", icon: "🧩" },
  { id: "word_forge", fa: "کارگاه کلمه", desc: "کلمه را با حروف بساز", icon: "🔤" },
  { id: "sentence_builder", fa: "جمله‌ساز", desc: "کلمه‌ها را مرتب کن", icon: "🧱" },
  { id: "match_arena", fa: "میدان جفت‌ها", desc: "سرنخ و جواب را وصل کن", icon: "🔗" },
  { id: "memory_pairs", fa: "کارت‌های حافظه", desc: "کارت‌ها را برگردان و جفت کن", icon: "🃏" },
  { id: "grammar_detective", fa: "کارآگاه گرامر", desc: "جواب و دلیلش را پیدا کن", icon: "🔍" },
  { id: "reading_explorer", fa: "کاوشگر متن", desc: "متن را بخوان و جواب بده", icon: "📖" },
  { id: "listening_lab", fa: "آزمایشگاه شنیداری", desc: "فایل صوتی تأییدشده", icon: "🎧" },
  { id: "boss_exam", fa: "امتحان نهایی", desc: "آزمون کامل با بازخورد در پایان", icon: "🏆" },
  { id: "writing_studio", fa: "استودیوی نوشتن", desc: "نوشتن آزاد با معیار ارزیابی", icon: "✍️" },
];

export type ModeAvailability = Record<ModeId, { count: number; reason?: string }>;
export function modeAvailability(grade: number, term: number): ModeAvailability {
  return poolAvailability(trackQuestions(grade, term), missions(grade, term).length);
}
/** Same game rules for any approved pool (school track, unit, cumulative, book or custom scope). */
export function poolAvailability(t: Question[], missionCount = poolMissions("x", t).length): ModeAvailability {
  const pc = pairSet(t, 6).length;
  return {
    quest_trail: { count: missionCount },
    quiz_sprint: { count: quizItems(t).length },
    gap_builder: { count: gapItems(t).length },
    word_forge: { count: forgeItems(t).length },
    sentence_builder: { count: sentenceItems(t).length },
    match_arena: { count: pc >= 3 ? pc : 0, reason: "جفت‌های تأییدشدهٔ کافی در این نوبت نیست." },
    memory_pairs: { count: pc >= 3 ? pc : 0, reason: "جفت‌های تأییدشدهٔ کافی در این نوبت نیست." },
    grammar_detective: { count: grammarItems(t).length },
    reading_explorer: { count: readingGroups(t).length, reason: "متن درک مطلب تأییدشده‌ای برای این نوبت وارد نشده است." },
    listening_lab: { count: 0, reason: "هنوز هیچ فایل صوتی تأییدشده‌ای وارد نشده است." },
    boss_exam: { count: dedupe(t).length },
    writing_studio: { count: 0, reason: "هنوز تمرین نوشتاری بازبینی‌شده با معیار ارزیابی وارد نشده است." },
  };
}

// ---------- Catalogue summary ----------
export const BASELINE_VERSION: string = (raw as unknown as { content_version?: string }).content_version ?? "0";
export function playableCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of [7, 8, 9, 10, 11, 12]) for (const t of [1, 2]) out[`${g}-${t}`] = dedupe(trackQuestions(g, t)).length;
  return out;
}
export const overlaySize = () => overlayQ.length;
