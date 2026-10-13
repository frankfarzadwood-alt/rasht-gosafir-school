import { topicLabels } from "@/lib/display";
import { readingGroups } from "@/lib/bank";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useProgress, update, todayCount, useHydrated, dueCanonicals } from "@/lib/progress";
import { missions, modeAvailability, MODES, trackQuestions } from "@/lib/bank";
import { fa, gradeLabel, termLabel, SKILL_FA } from "@/lib/fa";

export const Route = createFileRoute("/track/$grade/$term")({
  beforeLoad: ({ params }) => {
    const g = Number(params.grade), t = Number(params.term);
    if (![7, 8, 9, 10, 11, 12].includes(g) || ![1, 2].includes(t)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${gradeLabel(+params.grade)} · ${termLabel(+params.term)} — ماجراجویی انگلیسی` },
      { name: "description", content: "مسیر مأموریت‌ها، مرور اشتباهات و بازی‌های این نوبت امتحان." },
      { property: "og:title", content: `${gradeLabel(+params.grade)} · ${termLabel(+params.term)}` },
      { property: "og:description", content: "مسیر تمرین امتحان انگلیسی." },
    ],
  }),
  component: Track,
});

function Track() {
  const { grade: gs, term: ts } = Route.useParams();
  const grade = +gs, term = +ts;
  const p = useProgress();
  const hydrated = useHydrated();
  const ms = missions(grade, term);
  const avail = modeAvailability(grade, term);
  const ids = new Set(trackQuestions(grade, term).map((q) => q.canonical_id));
  const due = hydrated ? dueCanonicals(p, ids).length : 0;
  const nextMission = ms.find((m) => !p.missionsDone.includes(m.id)) ?? ms[0];
  const today = hydrated ? todayCount(p) : 0;
  const goal = p.settings.dailyGoal;
  const ps = { grade: gs, term: ts };

  return (
    <div className="space-y-6" data-band={grade >= 10 ? "senior" : "junior"}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{gradeLabel(grade)}</h1>
          <p className="font-bold text-teal">{termLabel(term)}</p>
        </div>
        <Link to="/" className="btn border border-border text-sm">تغییر پایه</Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/play/$grade/$term/$mode" params={{ ...ps, mode: "quest_trail" }} search={{ mission: nextMission?.id }} className="btn h-16 bg-primary text-lg text-primary-foreground">🗺️ ادامهٔ مسیر</Link>
        <Link to="/play/$grade/$term/$mode" params={{ ...ps, mode: "review" }} search={{}} className="btn h-16 bg-coral text-lg text-foreground">🔁 مرور اشتباهات {due > 0 && `(${fa(due)})`}</Link>
        <Link to="/play/$grade/$term/$mode" params={{ ...ps, mode: "quiz_sprint" }} search={{}} className="btn h-16 bg-teal text-lg text-teal-foreground">⚡ یک بازی کوتاه</Link>
      </div>

      <section className="card-soft flex items-center gap-4 p-4" aria-label="هدف روزانه">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden><circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" className="stroke-muted" /><circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" strokeLinecap="round" className="stroke-teal" strokeDasharray={`${Math.min(1, today / goal) * 94} 94`} /></svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{fa(today)}/{fa(goal)}</span>
        </div>
        <div className="flex-1">
          <p className="font-bold">هدف مرور امروز</p>
          <p className="text-xs text-muted-foreground">جا ماندن یک روز چیزی را پاک نمی‌کند.</p>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="کم کردن هدف" className="btn h-11 w-11 border border-border p-0" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, dailyGoal: Math.max(3, goal - 1) } }))}>−</button>
          <button aria-label="زیاد کردن هدف" className="btn h-11 w-11 border border-border p-0" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, dailyGoal: Math.min(50, goal + 1) } }))}>+</button>
        </div>
      </section>

      <section aria-label="نقشهٔ مسیر">
        <h2 className="mb-3 text-lg font-extrabold">نقشهٔ ماجراجویی</h2>
        <ol className="relative space-y-3 pr-6">
          <span aria-hidden className="absolute bottom-4 right-[1.05rem] top-4 w-1 rounded bg-border" />
          {ms.map((m, i) => {
            const done = p.missionsDone.includes(m.id);
            const unlocked = i === 0 || done || p.missionsDone.includes(ms[i - 1]!.id);
            return (
              <li key={m.id} className={`relative ${i % 2 ? "sm:mr-16" : ""}`}>
                <span aria-hidden className={`absolute -right-6 top-3 flex h-8 w-8 items-center justify-center rounded-full border-4 border-background text-xs font-bold ${done ? "bg-teal text-teal-foreground" : unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{done ? "✓" : fa(i + 1)}</span>
                {unlocked ? (
                  <Link to="/play/$grade/$term/$mode" params={{ ...ps, mode: "quest_trail" }} search={{ mission: m.id }} className="card-soft mr-4 flex min-h-14 items-center justify-between p-3 hover:border-primary">
                    <span><b>مأموریت {fa(i + 1)}</b> · {SKILL_FA[m.skill]}{topicLabels(m.topics).length > 0 && <span className="mr-2 text-xs text-muted-foreground">{topicLabels(m.topics).join("، ")}</span>}</span>
                    <span className="text-xs text-muted-foreground">{fa(m.questionIds.length)} سؤال</span>
                  </Link>
                ) : (
                  <div className="mr-4 rounded-2xl border border-dashed border-border p-3 text-muted-foreground">🔒 مأموریت {fa(i + 1)} — با تمام کردن قبلی باز می‌شود</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">بازی‌ها</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MODES.filter((m) => m.id !== "quest_trail").map((m) => {
            const a = avail[m.id];
            const on = a.count > 0;
            return on ? (
              <Link key={m.id} to="/play/$grade/$term/$mode" params={{ ...ps, mode: m.id }} search={{}} className="card-soft p-3 hover:border-primary">
                <div className="text-2xl" aria-hidden>{m.icon}</div>
                <div className="font-bold">{m.fa}</div>
                <div className="text-xs text-muted-foreground">{m.desc} · {countLabel(m.id, a.count, grade, term)}</div>
              </Link>
            ) : (
              <div key={m.id} className="rounded-2xl border border-dashed border-border p-3 text-muted-foreground" aria-disabled>
                <div className="text-2xl opacity-50" aria-hidden>{m.icon}</div>
                <div className="font-bold">{m.fa}</div>
                <div className="text-xs">{a.reason ?? "محتوای تأییدشده برای این نوبت نیست."}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function countLabel(mode: string, n: number, grade?: number, term?: number) {
  if (mode === "reading_explorer" && grade) {
    const qn = readingGroups(trackQuestions(grade, term!)).reduce((s, g) => s + g.questions.length, 0);
    return `${fa(n)} متن · ${fa(qn)} سؤال`;
  }
  if (mode === "match_arena" || mode === "memory_pairs") return `${fa(n)} جفت`;
  return `${fa(n)} سؤال`;
}
