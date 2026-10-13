import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameRunner, BackLink } from "@/components/GameRunner";
import { MatchArena, MemoryPairs } from "@/components/PairGames";
import type { Item } from "@/components/QuestionView";
import {
  MODES, type ModeId, trackQuestions, dedupe, shuffle, missions, quizItems, gapItems, forgeItems,
  sentenceItems, grammarItems, readingGroups, pairSet, modeAvailability, isChoice,
} from "@/lib/bank";
import { useProgress, useHydrated, dueCanonicals } from "@/lib/progress";
import { fa, gradeLabel, termLabel } from "@/lib/fa";

type Search = { mission?: string };
export const Route = createFileRoute("/play/$grade/$term/$mode")({
  validateSearch: (s: Record<string, unknown>): Search => ({ mission: typeof s.mission === "string" ? s.mission : undefined }),
  beforeLoad: ({ params }) => {
    if (![7, 8, 9, 10, 11, 12].includes(+params.grade) || ![1, 2].includes(+params.term)) throw notFound();
  },
  head: ({ params }) => {
    const m = MODES.find((x) => x.id === params.mode)?.fa ?? "مرور اشتباهات";
    return {
      meta: [
        { title: `${m} · ${gradeLabel(+params.grade)} ${termLabel(+params.term)}` },
        { name: "description", content: `بازی ${m} با سؤال‌های تأییدشدهٔ امتحان انگلیسی.` },
        { property: "og:title", content: `${m} — ماجراجویی انگلیسی` },
        { property: "og:description", content: "تمرین امتحان انگلیسی با بازی." },
      ],
    };
  },
  component: Play,
});

const toItem = (q: ReturnType<typeof trackQuestions>[number]): Item => ({ q, kind: "auto" });

function Play() {
  const { grade: gs, term: ts, mode } = Route.useParams();
  const { mission } = Route.useSearch();
  const grade = +gs, term = +ts;
  const hydrated = useHydrated();
  const p = useProgress();
  const info = MODES.find((m) => m.id === mode);
  const title = info?.fa ?? "مرور اشتباهات";
  const [seed] = useState(() => Math.random());
  const [started, setStarted] = useState<null | { len?: number; timer?: boolean }>(mode === "quest_trail" || mode === "review" || mode === "gap_builder" || mode === "word_forge" || mode === "sentence_builder" || mode === "grammar_detective" || mode === "reading_explorer" || mode === "match_arena" || mode === "memory_pairs" ? {} : null);

  const track = useMemo(() => trackQuestions(grade, term), [grade, term]);
  const back = <BackLink grade={grade} term={term} />;
  const header = (
    <header className="mb-4 flex items-center justify-between gap-2">
      <div>
        <h1 className="text-xl font-extrabold">{info?.icon ?? "🔁"} {title}</h1>
        <p className="text-sm font-bold text-teal">{gradeLabel(grade)} · {termLabel(term)}</p>
      </div>
      <Link to="/track/$grade/$term" params={{ grade: gs, term: ts }} className="btn border border-border text-sm">خروج</Link>
    </header>
  );
  if (!hydrated) return header;

  const avail = info ? modeAvailability(grade, term)[info.id as ModeId] : null;
  if (info && avail && avail.count === 0) {
    return (
      <div>{header}
        <section className="card-soft space-y-3 p-5">
          <p>این بازی برای این نوبت فعلاً در دسترس نیست. {avail.reason}</p>
          <p className="text-sm text-muted-foreground">ما هیچ‌وقت جای خالی را با سؤال ساختگی پر نمی‌کنیم. یکی از بازی‌های در دسترس را انتخاب کن.</p>
          {back}
        </section>
      </div>
    );
  }

  let body: React.ReactNode = null;
  const ms = missions(grade, term);

  if (mode === "quest_trail") {
    const m = ms.find((x) => x.id === mission) ?? ms[0];
    const qs = m.questionIds.map((id) => track.find((q) => q.id === id)!).filter(Boolean);
    const idx = ms.indexOf(m);
    const nx = ms[idx + 1];
    body = (
      <>
        <p className="mb-3 text-sm text-muted-foreground">مأموریت {fa(idx + 1)} از {fa(ms.length)}</p>
        <GameRunner key={m.id} items={qs.map(toItem)} grade={grade} term={term} mode="quest_trail" missionId={m.id}
          nextHref={nx ? <Link to="/play/$grade/$term/$mode" params={{ grade: gs, term: ts, mode: "quest_trail" }} search={{ mission: nx.id }} className="btn bg-primary text-primary-foreground">مأموریت بعدی ←</Link> : back} />
      </>
    );
  } else if (mode === "review") {
    const ids = new Set(track.map((q) => q.canonical_id));
    const due = new Set(dueCanonicals(p, ids));
    const wrongEver = new Set(Object.entries(p.mastery).filter(([k, v]) => ids.has(k) && !v.lastCorrect).map(([k]) => k));
    const qs = dedupe(track.filter((q) => due.has(q.canonical_id) || wrongEver.has(q.canonical_id))).slice(0, 8);
    body = qs.length ? <GameRunner items={qs.map(toItem)} grade={grade} term={term} mode="review" nextHref={back} />
      : <section className="card-soft space-y-3 p-5"><p>فعلاً اشتباهی برای مرور نداری. 🌟</p>{back}</section>;
  } else if (mode === "quiz_sprint") {
    if (!started) body = (
      <section className="card-soft space-y-3 p-5">
        <p>{fa(Math.min(8, quizItems(track).length))} سؤال چندگزینه‌ای. زمان‌سنج به‌طور پیش‌فرض خاموش است.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn bg-primary text-primary-foreground" onClick={() => setStarted({ timer: false })}>شروع بدون زمان</button>
          <button className="btn border border-border" onClick={() => setStarted({ timer: true })}>⏱ شروع با زمان‌سنج</button>
        </div>
        <p className="text-xs text-muted-foreground">سرعت فقط امتیاز جانبی است و روی دقت علمی اثری ندارد.</p>
      </section>
    );
    else body = <GameRunner items={dedupe(shuffle(quizItems(track), seed)).slice(0, 8).map(toItem)} grade={grade} term={term} mode="quiz_sprint" timer={started.timer} nextHref={back} />;
  } else if (mode === "gap_builder") {
    body = <GameRunner items={shuffle(gapItems(track), seed).slice(0, 7).map((g) => ({ q: g.q, kind: "chips", pool: g.pool }))} grade={grade} term={term} mode="gap_builder" nextHref={back} />;
  } else if (mode === "word_forge") {
    body = <GameRunner items={shuffle(forgeItems(track), seed).slice(0, 6).map((q) => ({ q, kind: "letters" }))} grade={grade} term={term} mode="word_forge" nextHref={back} />;
  } else if (mode === "sentence_builder") {
    body = <GameRunner items={shuffle(sentenceItems(track), seed).slice(0, 6).map((q) => ({ q, kind: "tokens" }))} grade={grade} term={term} mode="sentence_builder" nextHref={back} />;
  } else if (mode === "grammar_detective") {
    body = <GameRunner items={shuffle(grammarItems(track), seed).slice(0, 7).map(toItem)} grade={grade} term={term} mode="grammar_detective" showGrammarTag nextHref={back} />;
  } else if (mode === "reading_explorer") {
    const g = readingGroups(track)[0];
    body = <GameRunner items={g.questions.map(toItem)} grade={grade} term={term} mode="reading_explorer" context={g.context} nextHref={back} />;
  } else if (mode === "match_arena" || mode === "memory_pairs") {
    const set = pairSet(track, mode === "memory_pairs" ? 4 : 5);
    body = mode === "match_arena" ? <MatchArena set={set} grade={grade} term={term} footer={back} /> : <MemoryPairs set={set} grade={grade} term={term} footer={back} />;
  } else if (mode === "boss_exam") {
    const pool = dedupe(track);
    if (!started) body = (
      <section className="card-soft space-y-3 p-5">
        <p>آزمون کامل از {fa(pool.length)} سؤال تأییدشدهٔ این نوبت. بازخورد بعد از پایان نشان داده می‌شود.</p>
        <div className="flex flex-wrap gap-2">
          {[10, 20].filter((n) => n < pool.length).map((n) => <button key={n} className="btn border border-border" onClick={() => setStarted({ len: n })}>{fa(n)} سؤال</button>)}
          <button className="btn bg-primary text-primary-foreground" onClick={() => setStarted({ len: pool.length })}>همهٔ {fa(pool.length)} سؤال</button>
        </div>
        <p className="text-xs text-muted-foreground">سؤال‌ها تکرار نمی‌شوند؛ طول آزمون از تعداد سؤال‌های واقعی بیشتر نمی‌شود.</p>
      </section>
    );
    else {
      const chosen = shuffle(pool, seed).slice(0, started.len);
      const ordered = [...chosen.filter((q) => !q.context_id), ...chosen.filter((q) => q.context_id)];
      body = <GameRunner items={ordered.map(toItem)} grade={grade} term={term} mode="boss_exam" exam nextHref={back}
        context={ordered.some((q) => q.context_id) && ordered.every((q) => q.context_id) ? readingGroups(track)[0]?.context : null} />;
      void isChoice;
    }
  }
  return <div>{header}{body}</div>;
}
