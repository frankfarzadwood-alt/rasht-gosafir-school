import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { ALL_QUESTIONS, CONTEXTS, ineligibility, BASELINE_VERSION, playableCounts, overlaySize, useBankVersion, type Question } from "@/lib/bank";
import { validateEnvelope, type DryRun } from "@/lib/importer";
import { dryRunPack, importPack, clearLocalPacks } from "@/lib/localBank";
import type { PackPlan } from "@/lib/pack";
import { QuestionView } from "@/components/QuestionView";
import { fa, GRADES, TERMS, gradeLabel, termLabel, SKILL_FA } from "@/lib/fa";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "مدیریت بانک سؤال — ماجراجویی انگلیسی" },
      { name: "description", content: "پوشش منابع، صف بازبینی و اعتبارسنجی ورود داده." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "مدیریت بانک سؤال" },
      { property: "og:description", content: "فضای کار بازبین." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [tab, setTab] = useState<"coverage" | "review" | "import">("coverage");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">🛠 فضای کار مدیریت</h1>
      <p className="rounded-xl bg-gold/20 p-3 text-sm">پیش‌نمایش محلی: ورود معلم/مدیر، انتشار، ثبت تغییرات و گزارش بازبینی نیاز به اتصال سرور دارد و هنوز فعال نیست. اینجا فقط مشاهده و اعتبارسنجی آزمایشی انجام می‌شود.</p>
      <div role="tablist" className="inline-flex rounded-2xl bg-muted p-1">
        {([["coverage", "پوشش"], ["review", "صف بازبینی"], ["import", "ورود داده"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn px-4 ${tab === k ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>
        ))}
      </div>
      {tab === "coverage" ? <Coverage /> : tab === "review" ? <Review /> : <Import />}
    </div>
  );
}

function Coverage() {
  const sources = new Set(ALL_QUESTIONS.map((q) => q.source_id));
  const pdfs = new Set(ALL_QUESTIONS.map((q) => q.source.pdf_url));
  const ready = ALL_QUESTIONS.filter((q) => ineligibility(q).length === 0).length;
  const teacher = ALL_QUESTIONS.filter((q) => q.answer.verification_status === "reviewed_by_teacher").length;
  const keyMapped = ALL_QUESTIONS.filter((q) => q.answer.key_candidates.length > 0).length;
  const disagree = ALL_QUESTIONS.filter((q) => q.answer.original_mapped_key && q.answer.original_mapped_key.toLowerCase() !== (q.answer.value ?? "").toLowerCase()).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
        {[["رکورد بانک شروع", ALL_QUESTIONS.length], ["فایل PDF منبع", pdfs.size], ["منبع امتحان", sources.size], ["آمادهٔ بازی", ready],
          ["کلید منبع نگاشت‌شده", keyMapped], ["کلید منبع ≠ پاسخ بازبینی", disagree], ["تأیید معلم", teacher], ["متن مشترک", CONTEXTS.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-secondary p-3"><div className="text-xl font-bold">{fa(v as number)}</div><div className="text-xs">{l}</div></div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">همهٔ پاسخ‌ها «بازبینی‌شده توسط دستیار» هستند، نه «تأییدشده توسط معلم». صفحات پردازش‌شده و صفحات حل‌نشدهٔ پیکرهٔ کامل تا ورود question_bank.json در دسترس نیست.</p>
      <table className="w-full text-sm">
        <thead><tr className="text-right"><th className="p-2">مسیر</th><th>رکورد</th><th>آماده</th><th>مهارت‌ها</th></tr></thead>
        <tbody>{GRADES.flatMap((g) => TERMS.map((t) => {
          const qs = ALL_QUESTIONS.filter((q) => q.grade === g && q.term === t);
          return <tr key={`${g}${t}`} className="border-t border-border"><td className="p-2">{gradeLabel(g)} · {termLabel(t)}</td><td>{fa(qs.length)}</td><td>{fa(qs.filter((q) => !ineligibility(q).length).length)}</td><td className="text-xs">{[...new Set(qs.map((q) => SKILL_FA[q.skill]))].join("، ")}</td></tr>;
        }))}</tbody>
      </table>
    </div>
  );
}

function Review() {
  const [f, setF] = useState({ grade: "", term: "", skill: "", format: "", issue: "" });
  const [open, setOpen] = useState<string | null>(null);
  const formats = [...new Set(ALL_QUESTIONS.map((q) => q.format))];
  const skills = [...new Set(ALL_QUESTIONS.map((q) => q.skill))];
  const issues = [...new Set(ALL_QUESTIONS.flatMap((q) => [...q.review_issues, ...ineligibility(q)]))];
  const list = useMemo(() => ALL_QUESTIONS.filter((q) =>
    (!f.grade || q.grade === +f.grade) && (!f.term || q.term === +f.term) && (!f.skill || q.skill === f.skill) &&
    (!f.format || q.format === f.format) && (!f.issue || [...q.review_issues, ...ineligibility(q)].includes(f.issue))), [f]);
  const sel = (k: keyof typeof f, opts: [string, string][], label: string) => (
    <label className="text-xs">{label}
      <select value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 block h-11 w-full rounded-xl border border-input bg-card px-2">
        <option value="">همه</option>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select></label>
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {sel("grade", GRADES.map((g) => [String(g), gradeLabel(g)]), "پایه")}
        {sel("term", TERMS.map((t) => [String(t), termLabel(t)]), "نوبت")}
        {sel("skill", skills.map((s) => [s, SKILL_FA[s] ?? s]), "مهارت")}
        {sel("format", formats.map((s) => [s, s]), "قالب")}
        {sel("issue", issues.map((s) => [s, s]), "مشکل")}
      </div>
      <p className="text-sm">{fa(list.length)} مورد</p>
      <ul className="space-y-2">{list.slice(0, 80).map((q) => (
        <li key={q.id} className="card-soft p-3">
          <button className="w-full text-right" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id}>
            <span dir="ltr" className="en block text-left text-sm font-semibold">{q.prompt_en}</span>
            <span className="text-xs text-muted-foreground">{q.id} · {gradeLabel(q.grade)} {termLabel(q.term)} · {q.format} · {q.review_status}</span>
          </button>
          {open === q.id && <Detail q={q} />}
        </li>
      ))}</ul>
      {list.length > 80 && <p className="text-xs text-muted-foreground">فقط ۸۰ مورد اول نمایش داده شده؛ فیلتر را دقیق‌تر کن.</p>}
    </div>
  );
}

function Detail({ q }: { q: Question }) {
  const rows: [string, React.ReactNode][] = [
    ["منبع", <a className="text-primary underline" href={q.source.pdf_url} target="_blank" rel="noreferrer">PDF · صفحه {q.source.pages.join(", ")}</a>],
    ["صفحهٔ فهرست", <a className="text-primary underline" href={q.source.listing_url} target="_blank" rel="noreferrer">لینک</a>],
    ["شمارهٔ سؤال در منبع", q.source_question_number ?? "—"],
    ["متن استخراج‌شدهٔ اصلی", <span dir="ltr" className="en">{q.original_extracted_prompt_en ?? "—"}</span>],
    ["متن بازبینی‌شده", <span dir="ltr" className="en">{q.prompt_en}</span>],
    ["پاسخ", <span dir="ltr" className="en">{q.answer.value} {q.answer.correct_option_id && `(${q.answer.correct_option_id})`}</span>],
    ["پاسخ‌های پذیرفته", <span dir="ltr" className="en">{q.answer.accepted_answers.join(" | ")}</span>],
    ["منشأ پاسخ", q.answer.provenance],
    ["وضعیت تأیید", q.answer.verification_status === "reviewed_by_teacher" ? "تأیید معلم" : "بازبینی دستیار (نه معلم)"],
    ["کلیدهای منبع", <span dir="ltr" className="en">{q.answer.key_candidates.map((k) => `${k.value} (p${k.page})`).join(" | ") || "—"}</span>],
    ["درس", q.lesson_id ?? "نامشخص"],
    ["سختی", q.difficulty ? `${q.difficulty} (${q.difficulty_status === "assistant_estimate" ? "تخمین دستیار، نه سطح رسمی" : q.difficulty_status})` : "نامشخص"],
    ["پایهٔ سایت منبع", q.listing_grade ?? "—"],
    ["عضویت‌ها", (q.memberships ?? []).map((m) => `${m.grade}/${m.term}`).join("، ")],
    ["بازی‌ها", q.eligible_games.join(", ")],
    ["مشکلات", [...q.review_issues, ...ineligibility(q)].join(", ") || "—"],
  ];
  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <dl className="grid gap-1 text-xs sm:grid-cols-[10rem_1fr]">{rows.map(([k, v]) => <Fragment key={k}><dt className="font-bold">{k}</dt><dd className="break-words">{v}</dd></Fragment>)}</dl>
      <div className="rounded-2xl bg-muted p-3"><p className="mb-2 text-xs font-bold">پیش‌نمایش بازی</p><QuestionView item={{ q, kind: "auto" }} locked={false} onSubmit={() => {}} /></div>
    </div>
  );
}

function PackImport() {
  useBankVersion();
  const [env, setEnv] = useState<unknown>(null);
  const [plan, setPlan] = useState<PackPlan | null>(null);
  const [msg, setMsg] = useState("");
  const counts = playableCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="card-soft space-y-3 p-4 text-sm">
      <h2 className="font-bold">افزودن بستهٔ سؤال‌های آماده (فقط همین مرورگر)</h2>
      <p>نسخهٔ بستهٔ منتشرشده: <span className="en" dir="ltr">{BASELINE_VERSION}</span> · سؤال‌های قابل بازی: {fa(total)} (افزوده‌شده در این مرورگر: {fa(overlaySize())})</p>
      <ul className="grid grid-cols-3 gap-1 text-xs sm:grid-cols-4">{Object.entries(counts).map(([k, v]) => { const [g, t] = k.split("-").map(Number); return <li key={k}>{gradeLabel(g!)} · {termLabel(t!)}: {fa(v)}</li>; })}</ul>
      <p className="text-xs text-muted-foreground">فقط سؤال‌های «آماده» با پاسخ بازبینی‌شده و متن/فایل لازم وارد بازی می‌شوند. این کار برای بقیهٔ کاربران چیزی را تغییر نمی‌دهد و پیشرفت و امتیاز را دست نمی‌زند.</p>
      <input type="file" accept="application/json" aria-label="فایل بستهٔ سؤال آماده" className="block min-h-11"
        onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          setMsg(""); setPlan(null);
          try { const j = JSON.parse(await file.text()); setEnv(j); setPlan(await dryRunPack(j)); }
          catch (x) { setMsg("فایل JSON معتبر نیست: " + (x as Error).message); }
        }} />
      {plan && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[["کل ردیف‌ها", plan.total], ["جدید", plan.newIds.length], ["به‌روزرسانی", plan.updated.length], ["بدون تغییر", plan.unchanged], ["تکراری", plan.duplicates], ["نیاز به بازبینی", plan.notReady], ["کنارگذاشته", plan.excluded], ["تعارض", plan.conflicts.length], ["خطا", plan.errors.length]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-secondary p-2"><div className="text-lg font-bold">{fa(v as number)}</div><div className="text-xs">{l}</div></div>
            ))}
          </div>
          <button className="btn bg-primary text-primary-foreground" disabled={!plan.accept.length}
            onClick={async () => {
              try { const r = await importPack(env); setPlan(r); setMsg(`${fa(r.newIds.length + r.updated.length)} سؤال به بازی‌های این مرورگر اضافه شد.`); }
              catch (x) { setMsg("ذخیره نشد (شاید فضای مرورگر پر است). چیزی از بانک فعلی یا پیشرفت حذف نشد. " + (x as Error).message); }
            }}>افزودن {fa(plan.accept.length)} سؤال به بازی‌ها</button>
          {[...plan.conflicts.map((c) => `${c.id} — conflict: ${c.reason}`), ...plan.errors.map((e) => `${e.id} — ${e.message}`)].length > 0 && (
            <ul className="max-h-60 overflow-auto text-xs" dir="ltr">{[...plan.conflicts.map((c) => `${c.id} — conflict: ${c.reason}`), ...plan.errors.map((e) => `${e.id} — ${e.message}`)].slice(0, 300).map((s, i) => <li key={i} className="en">{s}</li>)}</ul>
          )}
        </div>
      )}
      {msg && <p role="status">{msg}</p>}
      {overlaySize() > 0 && <button className="btn border border-border text-xs" onClick={async () => { await clearLocalPacks(); setMsg("بسته‌های این مرورگر حذف شد؛ پیشرفت دست نخورد."); }}>حذف بسته‌های افزوده در این مرورگر</button>}
    </div>
  );
}

function Import() {
  const [res, setRes] = useState<DryRun | null>(null);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-3">
      <PackImport />
      <h2 className="font-bold">اعتبارسنجی آزمایشی بانک کامل</h2>
      <p className="text-sm">یک فایل JSON (بانک کامل، بانک شروع یا تکه‌ای از یک پایه/نوبت) انتخاب کن. اعتبارسنجی آزمایشی روی همین دستگاه انجام می‌شود و چیزی منتشر نمی‌شود.</p>
      <input type="file" accept="application/json" aria-label="فایل بانک سؤال" className="block min-h-11"
        onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return;
          setErr(""); setRes(null);
          try { setRes(validateEnvelope(JSON.parse(await file.text()), new Set(ALL_QUESTIONS.map((q) => q.id)))); }
          catch (x) { setErr("فایل JSON معتبر نیست: " + (x as Error).message); }
        }} />
      {err && <p className="text-destructive">{err}</p>}
      {res && (
        <div className="card-soft space-y-3 p-4 text-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
            {[["کل ردیف‌ها", res.total], ["تکراری (همان شناسه)", res.duplicates], ["قابل انتشار", res.ready], ["نیاز به بازبینی", res.needsReview], ["کنارگذاشته", res.excluded], ["خطادار", res.errors.length], ["جدید", res.newIds], ["به‌روزرسانی", res.updates]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-secondary p-2"><div className="text-lg font-bold">{fa(v as number)}</div><div className="text-xs">{l}</div></div>
            ))}
          </div>
          <h3 className="font-bold">به تفکیک پایه/نوبت/وضعیت</h3>
          <ul className="grid grid-cols-2 gap-1 text-xs">{Object.entries(res.byTrack).sort().map(([k, v]) => <li key={k}>{k}: {fa(v)}</li>)}</ul>
          {res.errors.length > 0 && (<><h3 className="font-bold text-destructive">گزارش خطا</h3>
            <ul className="max-h-60 overflow-auto text-xs" dir="ltr">{res.errors.slice(0, 200).map((e, i) => <li key={i} className="en">{e.row}: {e.id ?? "(no id)"} — {e.message}</li>)}</ul></>)}
        </div>
      )}
    </div>
  );
}
