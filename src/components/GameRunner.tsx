import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { QuestionView, hintFor, En, type Item } from "./QuestionView";
import { correctText, contextById, type Context } from "@/lib/bank";
import { recordAttempt, update } from "@/lib/progress";
import { fa, SKILL_FA } from "@/lib/fa";
import { summarize, learnerExplanation, type Attempt } from "@/lib/display";

type Result = { item: Item; attempts: readonly Attempt[]; first: boolean; finalCorrect: boolean; correctedOnRetry: boolean; firstResponse: string; response: string; ms: number };

export function GameRunner({
  items, grade, term, scope, mode, exam = false, timer = false, context, missionId, showGrammarTag, nextHref,
}: {
  items: Item[]; grade: number | null; term: number | null; scope?: string; mode: string; exam?: boolean; timer?: boolean;
  context?: Context | null; missionId?: string; showGrammarTag?: boolean; nextHref?: React.ReactNode;
}) {
  const [queue, setQueue] = useState(items);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"answer" | "feedback">("answer");
  const [tries, setTries] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [last, setLast] = useState<{ correct: boolean; response: string; xp: number } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [isRetryRound, setRetryRound] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => { started.current = Date.now(); setElapsed(0); }, [idx, renderKey]);
  useEffect(() => {
    if (!timer || phase !== "answer") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [timer, phase, idx]);

  const done = idx >= queue.length;
  const item = queue[idx]!;

  function submit(response: string, correct: boolean) {
    const ms = Date.now() - started.current;
    const retry = tries > 0 || isRetryRound;
    const xp = exam ? 0 : recordAttempt(
      { qid: item.q.id, canonical: item.q.canonical_id, grade, term, ...(scope ? { scope } : {}), mode, correct, hinted, retry, ms, response },
      item.q.skill,
    );
    if (exam) recordAttempt({ qid: item.q.id, canonical: item.q.canonical_id, grade, term, ...(scope ? { scope } : {}), mode, correct, hinted: false, retry: isRetryRound, ms, response }, item.q.skill);
    const prior = results.find((r) => r.item.q.id === item.q.id);
    const attempts = Object.freeze([...(prior?.attempts ?? []), Object.freeze({ response, correct, hinted })]);
    const s = summarize(item.q.id, attempts);
    const r: Result = { item, attempts, first: s.firstCorrect, finalCorrect: s.finalCorrect, correctedOnRetry: s.correctedOnRetry, firstResponse: s.firstResponse, response, ms };
    setResults((rs) => [...rs.filter((x) => x.item.q.id !== item.q.id), r]);
    if (exam) return next();
    setLast({ correct, response, xp });
    setPhase("feedback");
  }
  function next() {
    setPhase("answer"); setTries(0); setHinted(false); setLast(null); setIdx((i) => i + 1);
  }
  function retryNow() { setTries((t) => t + 1); setPhase("answer"); setLast(null); setRenderKey((k) => k + 1); }

  useEffect(() => {
    if (done && missionId && results.length) update((p) => (p.missionsDone.includes(missionId) ? p : { ...p, missionsDone: [...p.missionsDone, missionId] }));
    if (done) update((p) => ({ ...p, sessions: p.sessions + 1 }));
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    const firstAcc = results.filter((r) => r.first).length;
    const wrong = results.filter((r) => !r.finalCorrect || !r.first);
    const bySkill: Record<string, [number, number]> = {};
    results.forEach((r) => { const s = (bySkill[r.item.q.skill] ??= [0, 0]); s[1]++; if (exam ? r.finalCorrect : r.first) s[0]++; });
    const examCorrect = results.filter((r) => r.finalCorrect).length;
    return (
      <section className="card-soft animate-pop space-y-5 p-5" aria-live="polite">
        <h2 className="text-2xl font-extrabold">پایان {exam ? "آزمون" : "جلسه"} 🎉</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={exam ? "دقت تمرینی" : "دقت در اولین تلاش"} value={`${fa(Math.round(((exam ? examCorrect : firstAcc) / Math.max(1, results.length)) * 100))}٪`} />
          <Stat label="تعداد سؤال" value={fa(results.length)} />
        </div>
        {exam && <p className="text-sm text-muted-foreground">نمرهٔ ۲۰ نمایش داده نمی‌شود چون بارم رسمی سؤال‌ها در منبع موجود نیست؛ این عدد فقط دقت تمرینی است.</p>}
        <div>
          <h3 className="mb-2 font-bold">مهارت‌ها</h3>
          <ul className="space-y-1">{Object.entries(bySkill).map(([s, [c, t]]) => <li key={s} className="flex justify-between text-sm"><span>{SKILL_FA[s] ?? s}</span><span>{fa(c)} از {fa(t)}</span></li>)}</ul>
        </div>
        {wrong.length > 0 && (
          <div>
            <h3 className="mb-2 font-bold">برای مرور</h3>
            <ul className="space-y-2">{wrong.map((r) => (
              <li key={r.item.q.id} className="rounded-xl bg-muted p-3 text-sm">
                <En className="font-semibold">{r.item.q.prompt_en}</En>
                <div className="mt-1">پاسخ درست: <En className="font-bold text-success">{correctText(r.item.q)}</En></div>
                {r.firstResponse && <div className="mt-1">پاسخ اول تو: <En className="text-destructive">{r.firstResponse}</En></div>}
                {r.correctedOnRetry && <div className="mt-1 font-bold text-teal">✔ در تلاش دوباره درست شد (در دقت اولین تلاش حساب نمی‌شود)</div>}
                {exam && learnerExplanation(r.item.q).fa && <div className="mt-1 text-muted-foreground">{learnerExplanation(r.item.q).fa}</div>}
              </li>
            ))}</ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {wrong.length > 0 && (
            <button className="btn bg-coral text-foreground" onClick={() => { setQueue(wrong.map((w) => w.item)); setResults([]); setIdx(0); setRetryRound(true); }}>
              🔁 تمرین دوبارهٔ اشتباه‌ها
            </button>
          )}
          {nextHref}
        </div>
      </section>
    );
  }

  const q = item.q;
  const ctx = context ?? contextById(q.context_id);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3" aria-label="پیشرفت جلسه">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={idx} aria-valuemax={queue.length}>
          <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${(idx / queue.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold">{fa(idx + 1)}/{fa(queue.length)}</span>
        {timer && <span className="rounded-full bg-gold/30 px-2 text-sm" aria-label="زمان">⏱ {fa(elapsed)}</span>}
      </div>
      {ctx && (
        <article className="card-soft sticky top-16 z-10 max-h-56 overflow-auto p-4" aria-label="متن درک مطلب">
          <p dir="ltr" lang="en" className="en text-left leading-relaxed">{ctx.text}</p>
          {ctx.content_origin === "faithful_paraphrase_of_source" && <p className="mt-2 text-xs text-muted-foreground">بازنویسی وفادار به متن امتحان؛ نقل‌قول عین متن اصلی نیست.</p>}
        </article>
      )}
      <section className="card-soft p-5" key={`${q.id}-${renderKey}`}>
        {showGrammarTag && q.grammar_tag && <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">🔍 <En>{q.grammar_tag}</En></span>}
        <QuestionView item={item} mode={mode} locked={phase === "feedback"} onSubmit={submit} />
        {phase === "answer" && !exam && (
          <div className="mt-3">
            {hinted ? <p className="rounded-xl bg-gold/20 p-3 text-sm">💡 {hintFor(q, item.kind)}</p>
              : <button className="btn text-sm text-primary underline" onClick={() => setHinted(true)}>💡 راهنمایی</button>}
          </div>
        )}
        {phase === "feedback" && last && (
          <div className={`animate-pop mt-4 rounded-2xl p-4 ${last.correct ? "bg-success/15" : "bg-coral/15"}`} role="status">
            <p className="font-bold">{last.correct ? "آفرین! درست بود ✅" : "این بار نشد، اشکالی ندارد 🌱"} {last.xp > 0 && <span className="text-gold">+{fa(last.xp)} امتیاز</span>}</p>
            {!last.correct && <p className="mt-1">پاسخ مورد انتظار: <En className="font-bold">{correctText(q)}</En></p>}
            {learnerExplanation(q).fa && <p className="mt-1 text-sm">{learnerExplanation(q).fa}</p>}
            {learnerExplanation(q).en && <p dir="ltr" lang="en" className="en mt-1 text-left text-sm text-muted-foreground">{learnerExplanation(q).en}</p>}
            {!last.correct && q.format === "short_answer" && <p className="mt-1 text-xs text-muted-foreground">اگر جواب تو هم از نظر معنا درست است، ممکن است فقط با پاسخ‌های ثبت‌شده فرق داشته باشد.</p>}
            <div className="mt-3 flex gap-2">
              {!last.correct && tries === 0 && <button className="btn border border-border" onClick={retryNow}>دوباره امتحان کن</button>}
              <button autoFocus className="btn flex-1 bg-primary text-primary-foreground" onClick={next}>ادامه ←</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-secondary p-3 text-center"><div className="text-2xl font-extrabold text-primary">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}

export const BackLink = ({ grade, term }: { grade: number; term: number }) => (
  <Link to="/track/$grade/$term" params={{ grade: String(grade), term: String(term) }} className="btn bg-primary text-primary-foreground">بازگشت به داشبورد</Link>
);
