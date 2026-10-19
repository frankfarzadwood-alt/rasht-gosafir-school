import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import planRaw from "@/data/foundation/assessment_plan.json";
import { BookOpen, ChevronLeft, Plus, Check, Minus, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress, todayCount, update } from "@/lib/progress";
import { useBankVersion, MODES, modeAvailability, poolAvailability, poolMissions, readingGroups, trackQuestions, type ModeAvailability, type Question } from "@/lib/bank";
import { modesFor, PRACTICE_FA, ScopeError, type PracticeModeId } from "@/lib/scope";
import { fa, SKILL_FA } from "@/lib/fa";
import { ancestorsOf, bookmark, catalogueIndex, childrenOf, nodeById, nodeScope, nodeTitle, practiceScope, scopeKey, scopeQuestions, scopeStats, setLearning, toggleSaved, useLearning, type Bookmark } from "@/lib/learning";
import type { AssessmentPlan, CatalogueNode } from "@/lib/content/contracts";
import { PILOT, PILOT_SELECTIONS } from '@/lib/content/pilot';
const PLAN = planRaw as unknown as AssessmentPlan;

export function ActivityLink({ current, game, children, className = "", mission }: { current: Bookmark; game?: string | null; children: ReactNode; className?: string; mission?: string | undefined }) {
  const n = nodeById(current.nodeId);
  const mode = game === undefined ? current.game : game;
  return <Button asChild className={`btn ${className}`} variant="outline">{n?.kind === "term" && n.grade && n.term ? mode ?
    <Link to="/play/$grade/$term/$mode" params={{ grade: String(n.grade), term: String(n.term), mode }} search={{ mission: mission ?? current.mission }}>{children}</Link> :
    <Link to="/track/$grade/$term" params={{ grade: String(n.grade), term: String(n.term) }}>{children}</Link> :
    current.practice && mode ? <Link to="/practice/$nodeId/$mode" params={{ nodeId: current.nodeId, mode }} search={{ scope: current.practice, units: current.custom?.join(","), mission: mission ?? current.mission, selection: current.selection, skills: current.scope.skills?.join(',') }}>{children}</Link> :
    <Link to="/learn/$nodeId" params={{ nodeId: current.nodeId }} search={{ view: current.practice ? "practice" : "units" }}>{children}</Link>}
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
    <progress className="h-3 w-full accent-teal" max={stats.total} value={stats.attempted} aria-label="پوشش تمرین" /><p className="text-sm text-muted-foreground">پوشش تمرین: {fa(Math.round(stats.coverage * 100))}٪ · تسلط جدا از پوشش شمرده می‌شود.</p>
  </>}{PILOT.assessments.filter(a => a.anchor_node_id === node.id).map(a => {
    const attempts = p.attempts.filter(x => x.scope === `assessment:${a.id}` && !x.retry).slice(-a.question_ids.length);
    const complete = attempts.length === a.question_ids.length && attempts.every((x, i) => x.qid === a.question_ids[i]);
    return <p key={a.id} className="text-sm text-muted-foreground"><span dir="ltr" lang="en">{a.title_en}</span> · {complete ? `دقت تمرینی: ${fa(Math.round(attempts.filter(x => x.correct).length / attempts.length * 100))}٪` : 'نتیجهٔ کامل هنوز ثبت نشده است'}</p>;
  })}<p className="text-sm text-muted-foreground">عملکرد آزمون ثابت جدا از پوشش و تسلط سؤال‌هاست.</p></section>;
}
function modeLabel(id: string, a: { count: number }, readingQs: number) {
  return id === "reading_explorer" ? `${fa(a.count)} متن · ${fa(readingQs)} سؤال` : `${fa(a.count)} ${["match_arena", "memory_pairs"].includes(id) ? "جفت" : id === "quest_trail" ? "مأموریت" : "سؤال"}`;
}
function ModeGrid({ avail, readingQs, link }: { avail: ModeAvailability; readingQs: number; link: (mode: string, body: ReactNode) => ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{MODES.map(m => {
    const a = avail[m.id];
    const body = <><span aria-hidden className="text-2xl">{m.icon}</span><h2 className="font-bold">{m.fa}</h2><p className="text-xs text-muted-foreground">{a.count ? modeLabel(m.id, a, readingQs) : a.reason ?? "محتوا در حال آماده‌سازی است"}</p></>;
    return a.count ? <div key={m.id}>{link(m.id, body)}</div> :
      <div key={m.id} aria-disabled="true" className="min-w-0 rounded-2xl border border-dashed border-border p-4 text-muted-foreground">{body}</div>;
  })}</div>;
}
export function GameChoices({ node }: { node: CatalogueNode }) {
  useBankVersion();
  if (node.kind === "term" && node.grade && node.term) {
    const t = trackQuestions(node.grade, node.term);
    return <ModeGrid avail={modeAvailability(node.grade, node.term)} readingQs={readingGroups(t).reduce((n, g) => n + g.questions.length, 0)}
      link={(mode, body) => <Link to="/play/$grade/$term/$mode" params={{ grade: String(node.grade), term: String(node.term), mode }} search={{}} className="card-soft block h-full min-w-0 p-4 hover:border-primary">{body}</Link>} />;
  }
  return <ScopePractice node={node} />;
}
/** Book / unit / subunit practice: choose a scope, see the real count, then pick a game. Empty scopes stay disabled. */
export function ScopePractice({ node }: { node: CatalogueNode }) {
  const modes = modesFor(catalogueIndex, node.id);
  const [mode, setMode] = useState<PracticeModeId | null>(modes[0] ?? null);
  const [custom, setCustom] = useState<string[]>([]);
  const [selection, setSelection] = useState('');
  const [skill, setSkill] = useState('');
  if (!mode) return <><Preparation /><Button disabled className="btn"><Play />شروع تمرین</Button></>;
  let pool: Question[] = [], error: string | null = null;
  const selections = PILOT_SELECTIONS.filter(s => s.anchor_node_id === node.id && s.selection_type !== 'reviewed_quiz_practice');
  try { const chosen = selections.find(s => s.id === selection)?.scope ?? practiceScope(mode, node.id, custom); pool = scopeQuestions({ ...chosen, ...(skill ? { skills: [skill] } : {}) }); }
  catch (e) { if (e instanceof ScopeError && mode === "custom") error = "حداقل یک درس را انتخاب کن."; else throw e; }
  const key = scopeKey(mode, node.id, custom);
  const units = node.kind === "book" ? childrenOf(node.id).filter(n => n.kind === "unit") : [];
  const assessments = [...PLAN.assessments, ...PILOT.assessments].filter(a => a.anchor_node_id === node.id);
  return <div className="space-y-4">
    <fieldset className="space-y-2"><legend className="font-bold">محدودهٔ تمرین</legend><div className="flex flex-wrap gap-2">{modes.map(m => <Button key={m} variant={m === mode ? "default" : "outline"} className="btn" aria-pressed={m === mode} onClick={() => { setMode(m); setSelection(''); }}>{PRACTICE_FA[m]}</Button>)}</div></fieldset>
    {selections.length > 0 && <label className="block space-y-1"><span className="text-sm font-bold">مجموعهٔ بازبینی‌شده</span><select value={selection} onChange={e => setSelection(e.target.value)} className="h-12 w-full border border-input bg-card px-3"><option value="">محدودهٔ انتخاب‌شده</option>{selections.map(s => <option key={s.id} value={s.id}>{s.title_en}</option>)}</select></label>}
    {mode === "custom" && <fieldset className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border p-3"><legend className="px-1 text-sm font-bold">درس‌ها</legend>{units.map(u => <label key={u.id} className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={custom.includes(u.id)} onChange={() => setCustom(c => c.includes(u.id) ? c.filter(x => x !== u.id) : [...c, u.id])} />{nodeTitle(u)}</label>)}</fieldset>}
    <label className="block space-y-1"><span className="text-sm font-bold">مهارت</span><select value={skill} onChange={e => setSkill(e.target.value)} className="h-12 w-full border border-input bg-card px-3"><option value="">همهٔ مهارت‌ها</option>{['vocabulary', 'grammar', 'reading', 'listening', 'spelling', 'conversation'].map(s => <option key={s} value={s}>{SKILL_FA[s] ?? (s === 'spelling' ? 'املا' : 'مکالمه')}</option>)}</select></label>
    <p role="status" className="text-sm font-bold">{error ?? (pool.length ? `${fa(pool.length)} سؤال آمادهٔ یکتا در این محدوده` : "محتوا در حال آماده‌سازی است — هنوز سؤال تأییدشده‌ای در این محدوده نیست.")}</p>
    {!error && <ModeGrid avail={poolAvailability(pool, poolMissions(key, pool).length)} readingQs={readingGroups(pool).reduce((n, g) => n + g.questions.length, 0)}
      link={(game, body) => <Link to="/practice/$nodeId/$mode" params={{ nodeId: node.id, mode: game }} search={{ scope: mode, units: custom.length ? custom.join(",") : undefined, selection: selection || undefined, skills: skill || undefined }} className="card-soft block h-full min-w-0 p-4 hover:border-primary">{body}</Link>} />}
    {assessments.length > 0 && <section className="space-y-2 border-t border-border pt-4"><h2 className="font-bold">آزمون‌های ثابت کتاب</h2><p className="text-xs text-muted-foreground">این آزمون‌ها فهرست و ترتیب ثابت دارند و هرگز با سؤال دیگری پر یا کوتاه نمی‌شوند.</p>
      <ul className="grid gap-2 sm:grid-cols-2">{assessments.map(a => <li key={a.id} aria-disabled={a.status !== 'ready'} className="rounded-xl border border-dashed border-border p-3 text-muted-foreground"><span dir="ltr" lang="en" className="block font-bold">{a.title_en}</span>{a.status === 'ready' ? <Button asChild variant="outline" className="mt-2"><Link to="/practice/$nodeId/$mode" params={{ nodeId: node.id, mode: 'boss_exam' }} search={{ scope: mode, selection: a.id }}>آزمون تمرینی · {fa(a.question_ids.length)} سؤال</Link></Button> : <span className="text-xs">در انتظار منبع بازبینی‌شده — هنوز در دسترس نیست</span>}</li>)}</ul></section>}
  </div>;
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
    {course && <nav className="flex gap-1 border-b border-border" aria-label="نمای دوره">{([["units", "درس‌ها"], ["practice", "تمرین"], ["progress", "پیشرفت"]] as const).map(([id, title]) => <Button key={id} variant="ghost" asChild className={`btn rounded-b-none ${view === id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}><Link to="/learn/$nodeId" params={{ nodeId: node.id }} search={{ view: id }}>{title}</Link></Button>)}</nav>}
    {view === "progress" && course ? <ScopeProgress node={node} /> : view === "practice" && course ? <GameChoices node={node} /> : <>
      {course && !scopeStats(nodeScope(node.id), p).total && <Preparation />}
      {children.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{children.map(n => <NodeCard key={n.id} node={n} />)}</div>}
      {node.kind === "subunit" && <GameChoices node={node} />}
    </>}
    {mapping && <section className="border-t border-border pt-4"><h2 className="font-bold">ارتباط آکسفورد و ایوالو</h2><p className="mt-1 text-sm text-muted-foreground">پیشنهادهای مطالعهٔ بازبینی‌شده توسط دستیار</p><Link to="/learn/alignments" search={{ book: trail.find(n => n.kind === "book")?.id, unit: node.kind === "unit" ? node.id : undefined }} className="btn mt-2 inline-flex border border-border text-sm">نقشهٔ ارتباط درس‌ها</Link></section>}
  </div>;
}