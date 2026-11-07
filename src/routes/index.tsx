import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, RotateCcw, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityLink, DailyGoal, NodeCard } from "@/components/LearningHub";
import { useProgress, update, useHydrated } from "@/lib/progress";
import { missions, useBankVersion, MODES } from "@/lib/bank";
import { bookmark, comingSoonBook, courseTitle, legacyBookmark, nodeById, nodeScope, nodeTitle, restoreBookmark, safeScopeQuestions as scopeQuestions, savedStats, setLearning, useLearning, childrenOf } from "@/lib/learning";
import type { CatalogueNode } from "@/lib/content/contracts";
import { COMING_SOON } from "@/lib/presentation-mode";
import { pageMeta } from "@/lib/pageMeta";
import { fa } from "@/lib/fa";

export const Route = createFileRoute("/")({
  head: () => pageMeta("خانه", "ادامهٔ یادگیری، هدف روزانه، دوره‌های من و مرور اشتباهات با سؤال‌های واقعی انگلیسی."),
  component: Home,
});

function CourseOption({ book }: { book: CatalogueNode }) {
  const locked = Boolean(comingSoonBook(book.id));
  const status = locked ? COMING_SOON : scopeQuestions(nodeScope(book.id)).length ? "تمرین آماده" : "در حال آماده‌سازی";
  return <option value={book.id} disabled={locked}>{nodeTitle(book)} — {status}</option>;
}

function Home() {
  const p = useProgress(), learning = useLearning(), hydrated = useHydrated();
  useBankVersion();
  const [name, setName] = useState("");
  const [initial, setInitial] = useState("school");
  if (!hydrated) return null;
  if (!p.nickname) return <section className="card-soft mx-auto max-w-md space-y-5 p-6 sm:p-8">
    <span className="text-4xl" aria-hidden>🚀</span><h1 className="text-3xl font-extrabold text-primary">سلام! آماده‌ای؟</h1>
    <p className="text-sm text-muted-foreground">با نامی که دوست داری شروع کن. حساب کاربری ساخته نمی‌شود؛ یادگیری فقط روی همین دستگاه ذخیره می‌شود.</p>
    <form className="space-y-4" onSubmit={e => {
      e.preventDefault(); if (!name.trim() || comingSoonBook(initial)) return;
      update(s => ({ ...s, nickname: name.trim().slice(0, 24) }));
      setLearning(s => ({ ...s, current: bookmark(initial), saved: nodeById(initial)?.kind === "book" ? [...new Set([...s.saved, initial])] : s.saved }));
    }}>
      <div className="space-y-2"><label htmlFor="nick" className="font-bold">نام شما</label><input id="nick" autoComplete="off" value={name} onChange={e => setName(e.target.value)} maxLength={24} placeholder="مثلاً ستاره" className="h-12 w-full rounded-xl border-2 border-input bg-card px-4" /><p className="text-xs text-muted-foreground">نامی که دوست داری در برنامه نمایش داده شود.</p></div>
      <div className="space-y-2"><label htmlFor="initial-course" className="font-bold">از کجا شروع می‌کنی؟</label><select id="initial-course" className="h-12 w-full rounded-xl border border-input bg-card px-3" value={initial} onChange={e => setInitial(e.target.value)}><option value="school">انگلیسی مدرسه — انتخاب پایه و نوبت</option>{childrenOf("general").map(series => <optgroup label={nodeTitle(series)} key={series.id}>{childrenOf(series.id).map(book => <CourseOption key={book.id} book={book} />)}</optgroup>)}<optgroup label="آیلتس">{childrenOf("ielts").map(book => <CourseOption key={book.id} book={book} />)}</optgroup></select></div>
      <Button type="submit" className="btn w-full" disabled={!name.trim()}>شروع یادگیری<ArrowLeft /></Button>
    </form>
  </section>;
  const current = restoreBookmark(learning.current) ?? legacyBookmark(p);
  const activeNode = current ? nodeById(current.nodeId) : null;
  const isTrack = activeNode?.kind === "term" && activeNode.grade && activeNode.term;
  const available = current ? scopeQuestions(current.scope).length > 0 : false;
  const ids = new Set(current ? scopeQuestions(current.scope).map(q => q.canonical_id) : []);
  const mistakes = Object.entries(p.mastery).filter(([id, m]) => ids.has(id) && !m.lastCorrect).length;
  const mission = isTrack && current?.game === "quest_trail" ? missions(activeNode.grade ?? 0, activeNode.term ?? 0).find(m => !p.missionsDone.includes(m.id))?.id : current?.mission;
  const saved = [...new Set([...learning.saved, ...(!learning.current && p.grade ? [legacyBookmark(p)?.nodeId ?? ""] : [])])].map(nodeById).filter(n => n !== undefined);
  return <div className="space-y-6">
    <header><p className="text-sm font-bold text-teal">خانهٔ یادگیری تو</p><h1 className="mt-1 text-2xl font-extrabold">{p.nickname} جان، خوش برگشتی!</h1></header>
    <section className="quest-hero space-y-3" aria-label="ادامهٔ یادگیری"><div className="flex items-center gap-2 text-primary"><Play aria-hidden className="h-5 w-5" /><h2 className="text-lg font-extrabold">ادامهٔ یادگیری</h2></div>{current ? <><p className="text-xl font-extrabold">{courseTitle(current)}</p><p className="text-sm text-muted-foreground">{available ? MODES.find(m => m.id === current.game)?.fa ?? "مسیر یادگیری" : "محتوا در حال آماده‌سازی است"}</p><ActivityLink current={current} mission={mission} className="border-primary bg-primary text-primary-foreground">{available ? "ادامه" : "دیدن مسیر"}<ArrowLeft /></ActivityLink></> : <Button asChild className="btn"><Link to="/learn/$nodeId" params={{ nodeId: "school" }} search={{ view: "units" }}>انتخاب پایه و نوبت<ArrowLeft /></Link></Button>}</section>
    <DailyGoal />
    <section className="space-y-3"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">یادگیری من</h2>{saved.length > 0 && (() => { const st = savedStats(saved.map(n => n.id), p); return <p className="text-xs text-muted-foreground">{st.coverage === null ? "پیشرفت: نامشخص (محتوا در حال آماده‌سازی)" : `${fa(st.total)} سؤال یکتا · ${fa(st.attempted)} تمرین‌شده · ${fa(st.mastered)} مسلط`}</p>; })()}</div><Button asChild variant="ghost" className="btn"><Link to="/learn">افزودن دوره<BookOpen /></Link></Button></div>{saved.length ? <div className="grid gap-3 sm:grid-cols-2">{saved.map(n => <div key={n.id} className="space-y-1"><NodeCard node={n} /><Button variant="ghost" className="btn text-xs text-muted-foreground" aria-label={`حذف از یادگیری من: ${nodeTitle(n)}`} onClick={() => setLearning(s => ({ ...s, saved: s.saved.filter(id => id !== n.id), current: s.current ?? current }))}>حذف از یادگیری من</Button></div>)}</div> : <p className="border-y border-dashed border-border py-4 text-sm text-muted-foreground">هنوز دوره‌ای به یادگیری من اضافه نکرده‌ای.</p>}</section>
    <section className="grid gap-3 sm:grid-cols-2" aria-label="تمرین سریع">{isTrack && current ? <><ActivityLink current={current} game="quiz_sprint" className="h-16 border-teal bg-teal text-teal-foreground"><Zap />یک بازی کوتاه</ActivityLink><ActivityLink current={current} game="review" className="h-16 bg-coral"><RotateCcw />مرور اشتباهات ({fa(mistakes)})</ActivityLink></> : <><Button asChild variant="outline" className="btn h-16"><Link to="/games"><Zap />یک بازی کوتاه</Link></Button><Button asChild variant="outline" className="btn h-16"><Link to="/learn/$nodeId" params={{ nodeId: "school" }} search={{ view: "units" }}><RotateCcw />مرور اشتباهات — انتخاب محتوا</Link></Button></>}</section>
  </div>;
}
