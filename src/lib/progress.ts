import { useSyncExternalStore } from "react";

export type Attempt = {
  id: string; at: string; qid: string; canonical: string;
  /** School grade/term when played on a school track; null for book scopes (never fabricated). */
  grade: number | null; term: number | null;
  mode: string; scope?: string; correct: boolean; hinted: boolean; retry: boolean; ms: number; response: string;
};
export type MasteryRow = { box: number; due: string; unassistedDates: string[]; mastered: boolean; lastCorrect: boolean; skill: string; seen: number };
export type Settings = { dark: boolean; sound: boolean; timer: boolean; dailyGoal: number; intervalsDays: number[]; wrongDelayMin: number };
export type Progress = {
  version: 1; nickname: string; grade: number | null; term: number;
  settings: Settings; attempts: Attempt[]; mastery: Record<string, MasteryRow>;
  xpLedger: Record<string, number>; dailyXp: Record<string, number>;
  missionsDone: string[]; correctedMistakes: number; sessions: number;
};

const KEY = "english-quest-progress-v1";
export const DEFAULT: Progress = {
  version: 1, nickname: "", grade: null, term: 1,
  settings: { dark: false, sound: false, timer: false, dailyGoal: 10, intervalsDays: [1, 3, 7, 14, 30], wrongDelayMin: 10 },
  attempts: [], mastery: {}, xpLedger: {}, dailyXp: {}, missionsDone: [], correctedMistakes: 0, sessions: 0,
};

let state: Progress = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const s = localStorage.getItem(KEY);
    if (s) state = { ...DEFAULT, ...JSON.parse(s), settings: { ...DEFAULT.settings, ...JSON.parse(s).settings } };
  } catch { /* keep default */ }
}
function set(next: Progress) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  listeners.forEach((l) => l());
}
export function update(fn: (p: Progress) => Progress) { load(); set(fn(state)); }
export function getProgress() { load(); return state; }

export function useProgress() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => DEFAULT,
  );
}
export function useHydrated() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

export const XP_FIRST = 10;
export const XP_RETRY = 5;
export const XP_DAILY_CAP_PER_QUESTION = 10;

/** Pure reducer so the reward/mastery rules are testable. */
export function applyAttempt(p: Progress, a: Omit<Attempt, "id" | "at"> & { id?: string; at?: string }, skill: string, now = new Date()) {
  const attempt: Attempt = { ...a, id: a.id ?? uid(), at: a.at ?? now.toISOString() };
  if (p.xpLedger[attempt.id] !== undefined) return { next: p, xp: 0 }; // idempotent per attempt ID
  const day = localDate(now);
  const capKey = `${attempt.canonical}|${day}`;
  let xp = 0;
  if (attempt.correct && !attempt.hinted) xp = attempt.retry ? XP_RETRY : XP_FIRST;
  else if (attempt.correct && attempt.retry) xp = XP_RETRY;
  const used = p.dailyXp[capKey] ?? 0;
  xp = Math.max(0, Math.min(xp, XP_DAILY_CAP_PER_QUESTION - used));

  const prev = p.mastery[attempt.canonical] ?? { box: 0, due: now.toISOString(), unassistedDates: [], mastered: false, lastCorrect: false, skill, seen: 0 };
  const m: MasteryRow = { ...prev, skill, seen: prev.seen + 1 };
  if (!attempt.correct) {
    m.box = 0; m.lastCorrect = false;
    m.due = new Date(now.getTime() + p.settings.wrongDelayMin * 60000).toISOString();
  } else if (!attempt.hinted && !attempt.retry) {
    // One unassisted retrieval per day counts, so replaying in another game doesn't inflate mastery.
    if (!m.unassistedDates.includes(day)) {
      m.unassistedDates = [...m.unassistedDates, day];
      m.box = Math.min(m.box + 1, p.settings.intervalsDays.length);
      m.due = new Date(now.getTime() + (p.settings.intervalsDays[m.box - 1] ?? 30) * 86400000).toISOString();
    }
    m.lastCorrect = true;
  } else {
    m.lastCorrect = true;
  }
  m.mastered = m.unassistedDates.length >= 3 && new Set(m.unassistedDates).size >= 2;
  const corrected = attempt.correct && attempt.retry ? 1 : 0;
  return {
    xp,
    next: {
      ...p,
      attempts: [...p.attempts, attempt],
      mastery: { ...p.mastery, [attempt.canonical]: m },
      xpLedger: { ...p.xpLedger, [attempt.id]: xp },
      dailyXp: { ...p.dailyXp, [capKey]: used + xp },
      correctedMistakes: p.correctedMistakes + corrected,
    },
  };
}
export function recordAttempt(a: Parameters<typeof applyAttempt>[1], skill: string) {
  let xp = 0;
  update((p) => { const r = applyAttempt(p, a, skill); xp = r.xp; return r.next; });
  return xp;
}

export const totalXp = (p: Progress) => Object.values(p.xpLedger).reduce((s, x) => s + x, 0);
export const todayCount = (p: Progress) => { const d = localDate(); return p.attempts.filter((a) => localDate(new Date(a.at)) === d).length; };
export const dueCanonicals = (p: Progress, ids: Set<string>, now = new Date()) =>
  Object.entries(p.mastery).filter(([k, m]) => ids.has(k) && !m.mastered && new Date(m.due) <= now && (!m.lastCorrect || m.box > 0)).map(([k]) => k);

export type Badge = { id: string; fa: string; rule: string; earned: boolean };
export function badges(p: Progress): Badge[] {
  const firstCorrect = p.attempts.filter((a) => a.correct && !a.retry && !a.hinted).length;
  const mastered = Object.values(p.mastery).filter((m) => m.mastered).length;
  const days = new Set(p.attempts.map((a) => localDate(new Date(a.at)))).size;
  return [
    { id: "first_mission", fa: "اولین قدم", rule: "یک مأموریت را کامل کن", earned: p.missionsDone.length >= 1 },
    { id: "five_missions", fa: "کاشف مسیر", rule: "۵ مأموریت را کامل کن", earned: p.missionsDone.length >= 5 },
    { id: "ten_corrected", fa: "درس از اشتباه", rule: "۱۰ اشتباه را درست کن", earned: p.correctedMistakes >= 10 },
    { id: "fifty_correct", fa: "پنجاه درست", rule: "۵۰ پاسخ درستِ بدون راهنما", earned: firstCorrect >= 50 },
    { id: "first_mastery", fa: "استاد کوچک", rule: "یک سؤال را کاملاً یاد بگیر", earned: mastered >= 1 },
    { id: "three_days", fa: "پیوسته", rule: "در ۳ روز مختلف تمرین کن", earned: days >= 3 },
  ];
}

export function exportProgress() {
  const blob = new Blob([JSON.stringify(getProgress(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "english-quest-progress.json";
  a.click();
}
export function resetProgress() { set({ ...DEFAULT }); }
