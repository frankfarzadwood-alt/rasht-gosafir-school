import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProgress, update, useHydrated } from "@/lib/progress";
import { trackQuestions, dedupe, missions } from "@/lib/bank";
import { fa, GRADES, TERMS, gradeLabel, termLabel, SKILL_FA } from "@/lib/fa";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ماجراجویی انگلیسی — انتخاب پایه و نوبت" },
      { name: "description", content: "نام مستعار بنویس، پایه و نوبت امتحان را انتخاب کن و با سؤال‌های واقعی امتحان انگلیسی تمرین کن." },
      { property: "og:title", content: "ماجراجویی انگلیسی — English Quest" },
      { property: "og:description", content: "تمرین امتحان انگلیسی پایهٔ هفتم تا دوازدهم با بازی." },
    ],
  }),
  component: Home,
});

function Home() {
  const p = useProgress();
  const hydrated = useHydrated();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [term, setTerm] = useState(1);
  if (!hydrated) return null;

  if (!p.nickname) {
    return (
      <section className="card-soft mx-auto max-w-md space-y-4 p-6">
        <h1 className="text-3xl font-extrabold text-primary">سلام! آماده‌ای؟ 🚀</h1>
        <p className="text-muted-foreground">برای شروع فقط یک نام مستعار لازم است. حساب کاربری ساخته نمی‌شود و پیشرفتت فقط روی همین دستگاه ذخیره می‌شود.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) update((s) => ({ ...s, nickname: name.trim().slice(0, 24) })); }} className="space-y-3">
          <label className="block font-bold" htmlFor="nick">نام مستعار</label>
          <input id="nick" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="مثلاً ستاره"
            className="h-12 w-full rounded-xl border-2 border-input bg-card px-4 focus:border-primary focus:outline-none" />
          <p className="text-xs text-muted-foreground">نام واقعی، تاریخ تولد یا شماره تلفن وارد نکن.</p>
          <button className="btn w-full bg-primary text-primary-foreground" disabled={!name.trim()}>ادامه</button>
        </form>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">{p.nickname} جان، پایه‌ات را انتخاب کن</h1>
        <p className="text-sm text-muted-foreground">هر پایه دو مسیر امتحانی جدا دارد.</p>
      </div>
      <div role="tablist" aria-label="نوبت امتحان" className="inline-flex rounded-2xl bg-muted p-1">
        {TERMS.map((t) => (
          <button key={t} role="tab" aria-selected={term === t} onClick={() => setTerm(t)}
            className={`btn px-6 ${term === t ? "bg-primary text-primary-foreground" : ""}`}>{termLabel(t)}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {GRADES.map((g) => {
          const qs = dedupe(trackQuestions(g, term));
          const ids = new Set(qs.map((q) => q.canonical_id));
          const ms = missions(g, term);
          const done = ms.filter((m) => p.missionsDone.includes(m.id)).length;
          const due = Object.entries(p.mastery).filter(([k, m]) => ids.has(k) && !m.mastered && new Date(m.due) <= new Date()).length;
          const recent = [...new Set(p.attempts.filter((a) => a.grade === g && a.term === term).slice(-20).map((a) => qs.find((q) => q.id === a.qid)?.skill).filter(Boolean))] as string[];
          return (
            <button key={g} data-band={g >= 10 ? "senior" : "junior"}
              onClick={() => { update((s) => ({ ...s, grade: g, term })); nav({ to: "/track/$grade/$term", params: { grade: String(g), term: String(term) } }); }}
              className="card-soft group relative overflow-hidden p-4 text-right transition hover:-translate-y-0.5">
              <span aria-hidden className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-accent" />
              <span aria-hidden className="absolute -bottom-4 left-8 h-8 w-8 rounded-full bg-gold/40" />
              <div className="relative">
                <div className="text-xl font-extrabold text-primary">{gradeLabel(g)}</div>
                <div className="text-sm text-muted-foreground">{termLabel(term)}</div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-secondary p-2"><dt>سؤال آماده</dt><dd className="text-lg font-bold">{fa(qs.length)}</dd></div>
                  <div className="rounded-xl bg-secondary p-2"><dt>مأموریت</dt><dd className="text-lg font-bold">{fa(done)}/{fa(ms.length)}</dd></div>
                  <div className="rounded-xl bg-secondary p-2"><dt>مرور</dt><dd className="text-lg font-bold">{fa(due)}</dd></div>
                </dl>
                {recent.length > 0 && <p className="mt-2 text-xs text-muted-foreground">اخیراً: {recent.map((s) => SKILL_FA[s]).join("، ")}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
