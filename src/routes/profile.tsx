import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress, useHydrated, update, badges, totalXp, exportProgress, resetProgress } from "@/lib/progress";
import { fa, SKILL_FA } from "@/lib/fa";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "پروفایل من — ماجراجویی انگلیسی" },
      { name: "description", content: "تسلط بر مهارت‌ها، نشان‌ها، زمان مرورها و تنظیمات." },
      { property: "og:title", content: "پروفایل — ماجراجویی انگلیسی" },
      { property: "og:description", content: "پیشرفت واقعی بر اساس پاسخ‌ها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const p = useProgress();
  if (!useHydrated()) return null;
  const skills: Record<string, { mastered: number; total: number; correct: number; attempts: number }> = {};
  Object.values(p.mastery).forEach((m) => { const s = (skills[m.skill] ??= { mastered: 0, total: 0, correct: 0, attempts: 0 }); s.total++; if (m.mastered) s.mastered++; });
  p.attempts.forEach((a) => { const sk = p.mastery[a.canonical]?.skill; if (!sk) return; const row = skills[sk]; if (!row) return; row.attempts++; if (a.correct && !a.retry && !a.hinted) row.correct++; });
  const upcoming = Object.entries(p.mastery).filter(([, m]) => !m.mastered).sort((a, b) => a[1].due.localeCompare(b[1].due)).slice(0, 6);
  const set = (k: "dark" | "sound", v: boolean) => update((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{p.nickname || "مهمان"} · ⭐ {fa(totalXp(p))} امتیاز</h1>
      <section className="card-soft p-4">
        <h2 className="mb-3 font-extrabold">تسلط بر مهارت‌ها</h2>
        {Object.keys(skills).length === 0 ? <p className="text-sm text-muted-foreground">هنوز تمرینی ثبت نشده. تسلط فقط از روی پاسخ‌های واقعی محاسبه می‌شود.</p> : (
          <ul className="space-y-3">{Object.entries(skills).map(([k, s]) => (
            <li key={k}>
              <div className="flex justify-between text-sm"><span className="font-bold">{SKILL_FA[k] ?? k}</span><span>{fa(s.mastered)} مسلط از {fa(s.total)} · دقت اولین تلاش {fa(Math.round((s.correct / Math.max(1, s.attempts)) * 100))}٪</span></div>
              <div className="mt-1 h-2.5 rounded-full bg-muted"><div className="h-full rounded-full bg-teal" style={{ width: `${(s.mastered / s.total) * 100}%` }} /></div>
            </li>
          ))}</ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">«مسلط» یعنی سه پاسخ درستِ بدون راهنما در دست‌کم دو روز مختلف.</p>
      </section>
      <section className="card-soft p-4">
        <h2 className="mb-3 font-extrabold">نشان‌ها</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{badges(p).map((b) => (
          <li key={b.id} className={`rounded-2xl p-3 ${b.earned ? "bg-gold/25" : "bg-muted text-muted-foreground"}`}>
            <div className="font-bold">{b.earned ? "🏅" : "🔒"} {b.fa}</div><div className="text-xs">{b.rule}</div>
          </li>
        ))}</ul>
      </section>
      <section className="card-soft p-4">
        <h2 className="mb-3 font-extrabold">مرورهای بعدی</h2>
        {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">مروری برنامه‌ریزی نشده.</p> :
          <ul className="space-y-1 text-sm">{upcoming.map(([k, m]) => <li key={k} className="flex justify-between"><span>{SKILL_FA[m.skill]} · مرحلهٔ {fa(m.box)}</span><span>{fa(new Date(m.due).toLocaleString("fa-IR"))}</span></li>)}</ul>}
      </section>
      <section className="card-soft space-y-3 p-4">
        <h2 className="font-extrabold">تنظیمات</h2>
        <label className="flex min-h-11 items-center justify-between"><span>🌙 حالت تیره</span><input type="checkbox" className="h-6 w-6" checked={p.settings.dark} onChange={(e) => set("dark", e.target.checked)} /></label>
        <label className="flex min-h-11 items-center justify-between"><span>🔊 صدا (پیش‌فرض خاموش)</span><input type="checkbox" className="h-6 w-6" checked={p.settings.sound} onChange={(e) => set("sound", e.target.checked)} /></label>
        <p className="text-xs text-muted-foreground">پیشرفت مهمان فقط روی همین دستگاه ذخیره می‌شود و امتیازها رقابتی یا تأییدشده نیستند.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn border border-border" onClick={exportProgress}>📤 خروجی گرفتن از پیشرفت</button>
          <button className="btn bg-destructive text-destructive-foreground" onClick={() => { if (confirm("همهٔ پیشرفت پاک شود؟")) resetProgress(); }}>🗑 پاک کردن پیشرفت</button>
          <Link to="/admin" className="btn border border-dashed border-border text-xs text-muted-foreground">🛠 ابزار بازبینی محتوا (فقط روی این دستگاه)</Link>
        </div>
      </section>
    </div>
  );
}
