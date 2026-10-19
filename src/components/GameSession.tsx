import { useMemo, useState, type ReactNode } from "react";
import { Flashcards } from './Flashcards';
import { GameRunner } from "@/components/GameRunner";
import { MatchArena, MemoryPairs } from "@/components/PairGames";
import type { Item } from "@/components/QuestionView";
import {
  type Mission, type ModeAvailability, type ModeId, type Question, type CtxLookup, contextById,
  dedupe, shuffle, flashcardItems, quizItems, gapItems, forgeItems, sentenceItems, grammarItems, readingGroups, pairSet,
} from "@/lib/bank";
import { useProgress, dueCanonicals } from "@/lib/progress";
import { fa } from "@/lib/fa";
import { Button } from './ui/button';

const toItem = (q: Question): Item => ({ q, kind: "auto" });
const AUTO_START = ["quest_trail", "review", "gap_builder", "word_forge", "sentence_builder", "grammar_detective", "reading_explorer", "match_arena", "memory_pairs"];

/**
 * One session builder for every location: a school track and a book scope both pass their approved pool here.
 * Game-specific rules (banks, tokens, letters, pairs, passages) come from src/lib/bank.ts.
 */
export function GameSession({ mode, pool, avail, missions, missionId, grade, term, scope, back, missionLink, ctx = contextById }: {
  mode: string; pool: Question[]; avail: ModeAvailability; missions: Mission[]; missionId?: string | undefined;
  grade: number | null; term: number | null; scope?: string; back: ReactNode;
  missionLink: (id: string) => ReactNode; ctx?: CtxLookup;
}) {
  const p = useProgress();
  const [seed] = useState(() => Math.random());
  const [passage, setPassage] = useState(0);
  const pairs = useMemo(() => pairSet(pool.filter(q => q.eligible_games.includes(mode)), mode === "memory_pairs" ? 4 : 5, seed), [pool, mode, seed]);
  const [started, setStarted] = useState<null | { len?: number; timer?: boolean }>(AUTO_START.includes(mode) ? {} : null);
  const meta = { grade, term, ...(scope ? { scope } : {}) };
  const a = (avail as Record<string, { count: number; reason?: string }>)[mode];
  if (a && a.count === 0) return (
    <section className="card-soft space-y-3 p-5">
      <p>این بازی برای این بخش فعلاً در دسترس نیست. {a.reason}</p>
      <p className="text-sm text-muted-foreground">ما هیچ‌وقت جای خالی را با سؤال ساختگی پر نمی‌کنیم. یکی از بازی‌های در دسترس را انتخاب کن.</p>
      {back}
    </section>
  );
  const m = mode as ModeId | "review";
  if (m === "quest_trail") {
    const mi = missions.find((x) => x.id === missionId) ?? missions[0];
    if (!mi) return <>{back}</>;
    const qs = mi.questionIds.flatMap((id) => { const q = pool.find((q) => q.id === id); return q ? [q] : []; });
    const idx = missions.indexOf(mi), nx = missions[idx + 1];
    return <>
      <p className="mb-3 text-sm text-muted-foreground">مأموریت {fa(idx + 1)} از {fa(missions.length)}</p>
      <GameRunner key={mi.id} items={qs.map(toItem)} {...meta} mode="quest_trail" missionId={mi.id} nextHref={nx ? missionLink(nx.id) : back} />
    </>;
  }
  if (m === "flashcards") return <Flashcards cards={flashcardItems(pool)} seed={seed} back={back} />;
  if (m === "review") {
    const ids = new Set(pool.map((q) => q.canonical_id));
    const due = new Set(dueCanonicals(p, ids));
    const wrongEver = new Set(Object.entries(p.mastery).filter(([k, v]) => ids.has(k) && !v.lastCorrect).map(([k]) => k));
    const qs = dedupe(pool.filter((q) => due.has(q.canonical_id) || wrongEver.has(q.canonical_id))).slice(0, 8);
    return qs.length ? <GameRunner items={qs.map(toItem)} {...meta} mode="review" nextHref={back} />
      : <section className="card-soft space-y-3 p-5"><p>فعلاً اشتباهی برای مرور نداری. 🌟</p>{back}</section>;
  }
  if (m === "quiz_sprint") {
    if (!started) return (
      <section className="card-soft space-y-3 p-5">
        <p>{fa(Math.min(8, quizItems(pool).length))} سؤال چندگزینه‌ای. زمان‌سنج به‌طور پیش‌فرض خاموش است.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn bg-primary text-primary-foreground" onClick={() => setStarted({ timer: false })}>شروع بدون زمان</button>
          <button className="btn border border-border" onClick={() => setStarted({ timer: true })}>⏱ شروع با زمان‌سنج</button>
        </div>
        <p className="text-xs text-muted-foreground">سرعت فقط امتیاز جانبی است و روی دقت علمی اثری ندارد.</p>
      </section>
    );
    return <GameRunner items={dedupe(shuffle(quizItems(pool), seed)).slice(0, 8).map(toItem)} {...meta} mode="quiz_sprint" timer={!!started.timer} nextHref={back} />;
  }
  if (m === "gap_builder") return <GameRunner items={shuffle(gapItems(pool), seed).slice(0, 7).map((g) => ({ q: g.q, kind: "chips", pool: g.pool }))} {...meta} mode="gap_builder" nextHref={back} />;
  if (m === "word_forge") return <GameRunner items={shuffle(forgeItems(pool), seed).slice(0, 6).map((q) => ({ q, kind: "letters" }))} {...meta} mode="word_forge" nextHref={back} />;
  if (m === "sentence_builder") return <GameRunner items={shuffle(sentenceItems(pool), seed).slice(0, 6).map((q) => ({ q, kind: "tokens" }))} {...meta} mode="sentence_builder" nextHref={back} />;
  if (m === "grammar_detective") return <GameRunner items={shuffle(grammarItems(pool), seed).slice(0, 7).map(toItem)} {...meta} mode="grammar_detective" showGrammarTag nextHref={back} />;
  if (m === "reading_explorer") {
    const groups = readingGroups(pool, ctx);
    const g = groups[passage];
    if (!g) return <>{back}</>;
    return <>{groups.length > 1 && <nav aria-label="انتخاب متن" className="mb-3 flex flex-wrap gap-2">{groups.map((group, i) => <Button key={group.context.id} variant={i === passage ? 'default' : 'outline'} aria-pressed={i === passage} onClick={() => setPassage(i)}>متن {fa(i + 1)} · {fa(group.questions.length)} سؤال</Button>)}</nav>}<GameRunner key={g.context.id} items={g.questions.map(toItem)} {...meta} mode="reading_explorer" context={g.context} nextHref={back} /></>;
  }
  if (m === "match_arena" || m === "memory_pairs") {
    return m === "match_arena" ? <MatchArena set={pairs} {...meta} footer={back} /> : <MemoryPairs set={pairs} {...meta} footer={back} />;
  }
  if (m === "boss_exam") {
    const all = dedupe(pool);
    if (!started) return (
      <section className="card-soft space-y-3 p-5">
        <p>آزمون تمرینی از {fa(all.length)} سؤال تأییدشدهٔ این بخش. بازخورد بعد از پایان نشان داده می‌شود.</p>
        <div className="flex flex-wrap gap-2">
          {[10, 20].filter((n) => n < all.length).map((n) => <button key={n} className="btn border border-border" onClick={() => setStarted({ len: n })}>{fa(n)} سؤال</button>)}
          <button className="btn bg-primary text-primary-foreground" onClick={() => setStarted({ len: all.length })}>همهٔ {fa(all.length)} سؤال</button>
        </div>
        <p className="text-xs text-muted-foreground">سؤال‌ها تکرار نمی‌شوند؛ طول آزمون از تعداد سؤال‌های واقعی بیشتر نمی‌شود.</p>
      </section>
    );
    const chosen = shuffle(all, seed).slice(0, started.len);
    const ordered = [...chosen.filter((q) => !q.context_id), ...chosen.filter((q) => q.context_id)];
    return <GameRunner items={ordered.map(toItem)} {...meta} mode="boss_exam" exam nextHref={back} />;
  }
  return <section className="card-soft space-y-3 p-5"><p>این بازی شناخته نشد.</p>{back}</section>;
}
