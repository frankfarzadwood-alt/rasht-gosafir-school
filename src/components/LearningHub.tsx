import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, Plus, Check, Minus, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress, todayCount, update } from "@/lib/progress";
import { useBankVersion, MODES, modeAvailability, readingGroups, trackQuestions } from "@/lib/bank";
import { fa } from "@/lib/fa";
import { ancestorsOf, bookmark, childrenOf, nodeById, nodeScope, nodeTitle, scopeStats, setLearning, toggleSaved, useLearning, type Bookmark } from "@/lib/learning";
import type { CatalogueNode } from "@/lib/content/contracts";

export function ActivityLink({ current, game, children, className = "", mission }: { current: Bookmark; game?: string | null; children: React.ReactNode; className?: string; mission?: string }) {
  const n = nodeById(current.nodeId);
  const mode = game === undefined ? current.game : game;
  return <Button asChild className={`btn ${className}`} variant="outline">{n?.kind === "term" && n.grade && n.term ? mode ?
    <Link to="/play/$grade/$term/$mode" params={{ grade: String(n.grade), term: String(n.term), mode }} search={{ mission: mission ?? current.mission }}>{children}</Link> :
    <Link to="/track/$grade/$term" params={{ grade: String(n.grade), term: String(n.term) }}>{children}</Link> :
    <Link to="/learn/$nodeId" params={{ nodeId: current.nodeId }} search={{ view: "units" }}>{children}</Link>}
  </Button>;
}
export function SaveCourse({ node }: { node: CatalogueNode }) {
  const learning = useLearning();
  if (!["book", "term"].includes(node.kind)) return null;
  const saved = learning.saved.includes(node.id);
  return <Button variant={saved ? "secondary" : "outline"} className="btn shrink-0" onClick={() => setLearning(s => toggleSaved(s, node.id))} aria-label={`${saved ? "حذف از" : "افزودن به"} یادگیری من: ${nodeTitle(node)}`}>
    {saved ? <Check /> : <Plus />}{saved ? "در یادگیری من" : "افزودن به یادگیری من"}
  </Button>;
}
export function NodeCard({ node }: { node: CatalogueNode }) {
  const p = useProgress();
  const stats = scopeStats(nodeScope(node.id), p);
  return <Link to="/learn/$nodeId" params={{ nodeId: node.id }} search={{ view: "units" }} className="card-soft flex min-h-24 items-center gap-3 p-4 hover:border-primary">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><BookOpen aria-hidden /></span>
    <span className="min-w-0 flex-1"><span className="block font-extrabold">{nodeTitle(node)}</span>
      {node.kind === "book" && <span lang="en" dir="ltr" className="block text-sm text-muted-foreground">{node.title_en}</span>}
      <span className="block text-xs text-muted-foreground">{stats.total ? `${fa(stats.total)} سؤال آماده · ${fa(stats.attempted)} تمرین‌شده` : "محتوا در حال آماده‌سازی است"}</span>
    </span><ChevronLeft aria-hidden className="h-5 w-5 shrink-0 text-muted-foreground" />
  </Link>;
}
export function DailyGoal() {
  const p = useProgress(), today = todayCount(p), goal = p.settings.dailyGoal;
  return <section className="flex flex-wrap items-center gap-4 border-y border-border py-4" aria-label="هدف روزانه">
    <Target className="h-8 w-8 text-teal" aria-hidden />
    <div className="min-w-0 flex-1"><h2 className="font-extrabold">هدف روزانه</h2><p className="text-sm text-muted-foreground">{fa(today)} از {fa(goal)} پاسخ امروز</p>
      <progress className="mt-2 h-2 w-full accent-teal" max={goal} value={Math.min(today, goal)} aria-label="پاسخ‌های امروز" /></div>
    <div className="flex gap-1"><Button variant="outline" className="h-11 w-11" aria-label="کم کردن هدف" onClick={() => update(s => ({ ...s, settings: { ...s.settings, dailyGoal: Math.max(3, goal - 1) } }))}><Minus /></Button>
      <Button variant="outline" className="h-11 w-11" aria-label="زیاد کردن هدف" onClick={() => update(s => ({ ...s, settings: { ...s.settings, dailyGoal: Math.min(50, goal + 1) } }))}><Plus /></Button></div>
  </section>;
}
export function Preparation() {
  return <div role="status" className="space-y-2 border-r-4 border-gold bg-muted/50 p-4"><p className="font-bold">محتوا در حال آماده‌سازی است</p><p className="text-sm text-muted-foreground">هنوز سؤال تأییدشده‌ای برای این بخش منتشر نشده است.</p></div>;
}
export function ScopeProgress({ node }: { node: CatalogueNode }) {
  const p = useProgress();
  const stats = scopeStats(nodeScope(node.id), p);
  return <section className="space-y-3"><h2 className="text-lg font-extrabold">پیشرفت این بخش</h2>{stats.coverage === null ? <Preparation /> : <>
    <dl className="grid grid-cols-3 gap-2 text-center"><div><dt className="text-sm text-muted-foreground">سؤال آماده</dt><dd className="text-xl font-extrabold">{fa(stats.total)}</dd></div><div><dt className="text-sm text-muted-foreground">تمرین‌شده</dt><dd className="text-xl font-extrabold">{fa(stats.attempted)}</dd></div><div><dt className="text-sm text-muted-foreground">مسلط</dt><dd className="text-xl font-extrabold text-teal">{fa(stats.mastered)}</dd></div></dl>
    <progress className="h-3 w-full accent-teal" max={stats.total} value={stats.attempted} aria-label="پوشش تمرین" /><p className="text-sm text-muted-foreground">پوشش تمرین: {fa(Math.round(stats.coverage * 100))}٪</p>
  </>}</section>;
}
export function GameChoices({ node }: { node: CatalogueNode }) {
  useBankVersion();
  if (node.kind !== "term" || !node.grade || !node.term) return <><Preparation /><Button disabled className="btn" aria-describedby="unavailable-play"><Play />شروع تمرین</Button><p id="unavailable-play" className="text-sm text-muted-foreground">تمرین پس از انتشار محتوای تأییدشده فعال می‌شود.</p></>;
  const available = modeAvailability(node.grade, node.term);
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{MODES.map(m => {
    const a = available[m.id];
    const label = m.id === "reading_explorer" ? `${fa(a.count)} متن · ${fa(readingGroups(trackQuestions(node.grade ?? 0, node.term ?? 0)).reduce((n, g) => n + g.questions.length, 0))} سؤال` : `${fa(a.count)} ${["match_arena", "memory_pairs"].includes(m.id) ? "جفت" : "سؤال"}`;
    return a.count ? <Link key={m.id} to="/play/$grade/$term/$mode" params={{ grade: String(node.grade), term: String(node.term), mode: m.id }} search={{}} className="card-soft min-w-0 p-4 hover:border-primary"><span aria-hidden className="text-2xl">{m.icon}</span><h2 className="font-bold">{m.fa}</h2><p className="text-xs text-muted-foreground">{label}</p></Link> :
      <div key={m.id} aria-disabled="true" className="min-w-0 rounded-2xl border border-dashed border-border p-4 text-muted-foreground"><span aria-hidden className="text-2xl">{m.icon}</span><h2 className="font-bold">{m.fa}</h2><p className="text-xs">{a.reason ?? "محتوا در حال آماده‌سازی است"}</p></div>;
  })}</div>;
}
export function CataloguePage({ node, view }: { node: CatalogueNode; view: string }) {
  useBankVersion();
  const p = useProgress();
  const trail = ancestorsOf(node.id), children = childrenOf(node.id);
  const course = ["book", "term", "unit", "subunit"].includes(node.kind);
  const mapping = trail.some(n => ["oxford", "evolve"].includes(n.id)) && course;
  return <div className="space-y-5">
    <nav aria-label="مسیر یادگیری" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"><Link to="/learn" className="btn px-2">یادگیری</Link>{trail.map(n => <span key={n.id} className="flex items-center"><ChevronLeft className="h-4 w-4" aria-hidden />{n.id === node.id ? <span aria-current="page">{nodeTitle(n)}</span> : <Link className="btn px-2" to="/learn/$nodeId" params={{ nodeId: n.id }} search={{ view: "units" }}>{nodeTitle(n)}</Link>}</span>)}</nav>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-primary">{nodeTitle(node)}</h1>{course && <p dir="ltr" lang="en" className="mt-1 text-muted-foreground">{node.title_en}</p>}</div><SaveCourse node={node} /></header>
    {node.kind === "term" && <ActivityLink current={bookmark(node.id)} className="bg-primary text-primary-foreground">نقشهٔ ماجراجویی<ChevronLeft /></ActivityLink>}
    {course && <nav className="flex gap-1 border-b border-border" aria-label="نمای دوره">{[["units", "درس‌ها"], ["practice", "تمرین"], ["progress", "پیشرفت"]].map(([id, title]) => <Button key={id} variant="ghost" asChild className={`btn rounded-b-none ${view === id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}><Link to="/learn/$nodeId" params={{ nodeId: node.id }} search={{ view: id }}>{title}</Link></Button>)}</nav>}
    {view === "progress" && course ? <ScopeProgress node={node} /> : view === "practice" && course ? <GameChoices node={node} /> : <>
      {course && !scopeStats(nodeScope(node.id), p).total && <Preparation />}
      {children.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{children.map(n => <NodeCard key={n.id} node={n} />)}</div>}
      {node.kind === "subunit" && <GameChoices node={node} />}
    </>}
    {mapping && <section className="border-t border-border pt-4"><h2 className="font-bold">ارتباط آکسفورد و ایوالو</h2><p className="mt-1 text-sm text-muted-foreground">ارتباط‌های بازبینی‌شده در حال آماده‌سازی است.</p></section>}
  </div>;
}