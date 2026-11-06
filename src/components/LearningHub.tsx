import { Link } from "@tanstack/react-router";
import { useEffect,useMemo,useState, type ReactNode } from "react";
import planRaw from "@/data/foundation/assessment_plan.json";
import { BookOpen, ChevronLeft, Plus, Check, Minus, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress, todayCount, update } from "@/lib/progress";
import { useBankVersion, MODES, modeAvailability, poolAvailability, poolMissions, pairInventoryCount, readingGroups, trackQuestions, type ModeAvailability, type Question } from "@/lib/bank";
import { modesFor, PRACTICE_FA, ScopeError, type PracticeModeId } from "@/lib/scope";
import { fa, SKILL_FA } from "@/lib/fa";
import { ancestorsOf, bookmark, catalogueIndex, childrenOf, nodeById, nodeScope, nodeTitle, practiceScope, scopeKey, scopeQuestions, scopeStats, setLearning, toggleSaved, useLearning, type Bookmark } from "@/lib/learning";
import type { AssessmentPlan, CatalogueNode } from "@/lib/content/contracts";
import { BOOK_CONTENT, LIVE_SELECTIONS } from '@/lib/content/pilot';
import { EvolveGuide } from './EvolveGuide';
import { OxfordGuide } from './OxfordGuide';
import { ProjectGuide } from './ProjectGuide';
import { IELTSGuide } from './IELTSGuide';
import { MaximizerGuide } from './MaximizerGuide';
import { evolveGuideFor } from '@/lib/content/evolve-series';
import { COURSE_ART, courseFamily } from '@/lib/course-presentation';
const PLAN = planRaw as unknown as AssessmentPlan;
const topicQuery=(value:string)=>value.toLowerCase().replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632));

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
  const bankVersion = useBankVersion();
  const stats = useMemo(() => scopeStats(nodeScope(node.id), p), [node.id, p, bankVersion]);
  const art = COURSE_ART[node.id], english = node.kind === 'book' || node.kind === 'series';
  return <Link to="/learn/$nodeId" params={{ nodeId: node.id }} search={{ view: "units" }} data-family={courseFamily(node.id)} className={`card-soft course-card flex items-center gap-4 p-4 ${art ? 'min-h-36' : 'min-h-24'}`}>
    {art ? <span className={`course-art ${art.collection ? 'collection-art' : ''}`}><img src={art.src} alt={node.kind === 'book' ? `${node.title_en} cover` : art.alt} width="96" height="120" loading="lazy" /></span> : <span className="course-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"><BookOpen aria-hidden /></span>}
    <span className="min-w-0 flex-1 space-y-2"><span lang={english ? 'en' : undefined} dir={english ? 'ltr' : undefined} className="block text-start text-lg font-extrabold leading-snug">{nodeTitle(node)}</span>
      {(!english && (/^(?:evolve-[1-6]|project-[1-5]|ielts-grammar-65|ielts-vocabulary-65|ielts-vocabulary-60|ielts-speaking-maximizer)\./.test(node.id) || /^ows-(elementary|intermediate|upper-intermediate)\./.test(node.id))) && <span lang="en" dir="ltr" className="block text-sm text-muted-foreground">{node.title_en}</span>}
      <span className="block text-xs leading-relaxed text-muted-foreground">{stats.total ? `${fa(stats.total)} سؤال آماده · ${fa(stats.attempted)} تمرین‌شده` : "محتوا در حال آماده‌سازی است"}</span>
    </span><span className="course-arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-full"><ChevronLeft aria-hidden className="h-4 w-4" /></span>
  </Link>;
}
export function DailyGoal() {
  const p = useProgress(), today = todayCount(p), goal = p.settings.dailyGoal;
  return <section className="card-soft flex flex-wrap items-center gap-4 border-teal/30 p-5" aria-label="هدف روزانه">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10"><Target className="h-8 w-8 text-teal" aria-hidden /></span>
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
  </>}{BOOK_CONTENT.assessments.filter(a => a.anchor_node_id === node.id).map(a => {
    const attempts = p.attempts.filter(x => x.scope === `assessment:${a.id}` && !x.retry).slice(-a.question_ids.length);
    const complete = attempts.length === a.question_ids.length && attempts.every((x, i) => x.qid === a.question_ids[i]);
    return <p key={a.id} className="text-sm text-muted-foreground"><span dir="ltr" lang="en">{a.title_en}</span> · {complete ? `دقت تمرینی: ${fa(Math.round(attempts.filter(x => x.correct).length / attempts.length * 100))}٪` : 'نتیجهٔ کامل هنوز ثبت نشده است'}</p>;
  })}<p className="text-sm text-muted-foreground">عملکرد آزمون ثابت جدا از پوشش و تسلط سؤال‌هاست.</p></section>;
}
function modeLabel(id: string, a: { count: number }, readingQs: number, pairAnswers: number) {
  if (id === "match_arena" || id === "memory_pairs") return `${fa(pairAnswers)} پاسخ در بانک · تا ${fa(id === "match_arena" ? 5 : 4)} جفت در هر دور`;
  if (id === "flashcards") return `${fa(a.count)} کارت`;
  if (id === 'writing_studio') return `${fa(a.count)} موضوع نوشتن آزاد`;
  if (id === 'speaking_studio') return `${fa(a.count)} کارت گفتاری با بازبینی خودت`;
  return id === "reading_explorer" ? `${fa(a.count)} متن · ${fa(readingQs)} سؤال` : `${fa(a.count)} ${["match_arena", "memory_pairs"].includes(id) ? "جفت" : id === "quest_trail" ? "مأموریت" : "سؤال"}`;
}
function ModeGrid({ avail, readingQs, pairAnswers, link }: { avail: ModeAvailability; readingQs: number; pairAnswers: number; link: (mode: string, body: ReactNode) => ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{MODES.map(m => {
    const a = avail[m.id];
    if ((m.id === "flashcards"||m.id === 'speaking_studio') && !a.count) return null;
    const body = <><span aria-hidden className="game-icon mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl">{m.icon}</span><h2 className="font-extrabold">{m.fa}</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{a.count ? modeLabel(m.id, a, readingQs, pairAnswers) : a.reason ?? "محتوا در حال آماده‌سازی است"}</p></>;
    return a.count ? <div key={m.id} className="game-card" data-mode={m.id}>{link(m.id, body)}</div> :
      <div key={m.id} aria-disabled="true" className="min-w-0 rounded-2xl border border-dashed border-border p-4 text-muted-foreground">{body}</div>;
  })}</div>;
}
export function GameChoices({ node }: { node: CatalogueNode }) {
  useBankVersion();
  if (node.kind === "term" && node.grade && node.term) {
    const t = trackQuestions(node.grade, node.term);
    return <ModeGrid pairAnswers={pairInventoryCount(t)} avail={modeAvailability(node.grade, node.term)} readingQs={readingGroups(t).reduce((n, g) => n + g.questions.length, 0)}
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
  const selections = LIVE_SELECTIONS.filter(s => s.anchor_node_id === node.id && s.selection_type !== 'reviewed_quiz_practice');
  try { const chosen = selections.find(s => s.id === selection)?.scope ?? practiceScope(mode, node.id, custom); pool = scopeQuestions({ ...chosen, ...(skill ? { skills: [skill] } : {}) }); }
  catch (e) { if (e instanceof ScopeError && mode === "custom") error = "حداقل یک درس را انتخاب کن."; else throw e; }
  const key = scopeKey(mode, node.id, custom);
  const units = node.kind === "book" ? childrenOf(node.id).filter(n => n.kind === "unit") : [];
  // Released Project books were supplied as workbook + audio, with native progress-check scopes.
  // Keep the immutable foundation plan, but do not advertise its unsupported test placeholders.
  const planned = /^(?:project-[1-5]|ielts-grammar-65|ielts-vocabulary-65|ielts-vocabulary-60|ielts-speaking-maximizer)(?:\.|$)/.test(node.id) ? [] : PLAN.assessments.filter(a => a.anchor_node_id === node.id);
  const assessments = [...planned, ...BOOK_CONTENT.assessments.filter(a => a.anchor_node_id === node.id || planned.some(p => a.id === `${p.id}.practice`))];
  return <div className="space-y-4">
    <fieldset className="space-y-2"><legend className="font-bold">محدودهٔ تمرین</legend><div className="flex flex-wrap gap-2">{modes.map(m => <Button key={m} variant={m === mode ? "default" : "outline"} className="btn" aria-pressed={m === mode} onClick={() => { setMode(m); setSelection(''); }}>{PRACTICE_FA[m]}</Button>)}</div></fieldset>
    {selections.length > 0 && <label className="block space-y-1"><span className="text-sm font-bold">مجموعهٔ بازبینی‌شده</span><select value={selection} onChange={e => setSelection(e.target.value)} className="h-12 w-full border border-input bg-card px-3"><option value="">محدودهٔ انتخاب‌شده</option>{selections.map(s => <option key={s.id} value={s.id}>{s.title_en}</option>)}</select></label>}
    {mode === "custom" && <fieldset className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border p-3"><legend className="px-1 text-sm font-bold">درس‌ها</legend>{units.map(u => <label key={u.id} className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={custom.includes(u.id)} onChange={() => setCustom(c => c.includes(u.id) ? c.filter(x => x !== u.id) : [...c, u.id])} />{nodeTitle(u)}</label>)}</fieldset>}
    <label className="block space-y-1"><span className="text-sm font-bold">مهارت</span><select value={skill} onChange={e => setSkill(e.target.value)} className="h-12 w-full border border-input bg-card px-3"><option value="">همهٔ مهارت‌ها</option>{['vocabulary', 'grammar', 'reading', 'listening', 'spelling', 'conversation'].map(s => <option key={s} value={s}>{SKILL_FA[s] ?? (s === 'spelling' ? 'املا' : 'مکالمه')}</option>)}</select></label>
    <p role="status" className="text-sm font-bold">{error ?? (pool.length ? `${fa(pool.length)} سؤال آمادهٔ یکتا در این محدوده` : "محتوا در حال آماده‌سازی است — هنوز سؤال تأییدشده‌ای در این محدوده نیست.")}</p>
    {!error && <ModeGrid pairAnswers={pairInventoryCount(pool)} avail={poolAvailability(pool, poolMissions(key, pool).length)} readingQs={readingGroups(pool).reduce((n, g) => n + g.questions.length, 0)}
      link={(game, body) => <Link to="/practice/$nodeId/$mode" params={{ nodeId: node.id, mode: game }} search={{ scope: mode, units: custom.length ? custom.join(",") : undefined, selection: selection || undefined, skills: skill || undefined }} className="card-soft block h-full min-w-0 p-4 hover:border-primary">{body}</Link>} />}
    {assessments.length > 0 && <section className="space-y-2 border-t border-border pt-4"><h2 className="font-bold">آزمون‌های ثابت کتاب</h2><p className="text-xs text-muted-foreground">این آزمون‌ها فهرست و ترتیب ثابت دارند و هرگز با سؤال دیگری پر یا کوتاه نمی‌شوند.</p>
      <ul className="grid gap-2 sm:grid-cols-2">{assessments.map(a => <li key={a.id} aria-disabled={a.status !== 'ready'} className="rounded-xl border border-dashed border-border p-3 text-muted-foreground"><span dir="ltr" lang="en" className="block font-bold">{a.title_en}</span>{a.status === 'ready' ? <><p className="text-xs">نسخهٔ تمرینی بازبینی‌شده؛ نتیجه به‌صورت دقت پاسخ‌ها ثبت می‌شود.</p><Button asChild variant="outline" className="mt-2"><Link to="/practice/$nodeId/$mode" params={{ nodeId: a.anchor_node_id, mode: 'boss_exam' }} search={{ scope: nodeById(a.anchor_node_id)?.kind === 'book' ? 'whole_book' : 'unit', selection: a.id }}>آزمون تمرینی · {fa(a.question_ids.length)} سؤال</Link></Button></> : <span className="text-xs">در انتظار منبع بازبینی‌شده — هنوز در دسترس نیست</span>}</li>)}</ul></section>}
  </div>;
}
export function CataloguePage({ node, view }: { node: CatalogueNode; view: string }) {
  useBankVersion();
  const p = useProgress();
  const trail = ancestorsOf(node.id), children = childrenOf(node.id);
  const [topicSearch,setTopicSearch]=useState('');useEffect(()=>setTopicSearch(''),[node.id]);
  const maxiPart=/^ielts-speaking-maximizer\.u\d{3}$/.test(node.id),query=topicQuery(topicSearch.trim()),shownChildren=maxiPart&&query?children.filter(n=>topicQuery(`${n.title_en} ${n.title_fa}`).includes(query)):children;
  const course = ["book", "term", "unit", "subunit"].includes(node.kind);
  const mapping = trail.some(n => ["oxford", "evolve"].includes(n.id)) && course && !evolveGuideFor(node.id) && !/^ows-(elementary|intermediate)(?=\.|$)/.test(node.id);
  return <div className="space-y-5">
    <nav aria-label="مسیر یادگیری" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"><Link to="/learn" className="btn px-2">یادگیری</Link>{trail.map(n => <span key={n.id} className="flex items-center"><ChevronLeft className="h-4 w-4" aria-hidden />{n.id === node.id ? <span aria-current="page">{nodeTitle(n)}</span> : <Link className="btn px-2" to="/learn/$nodeId" params={{ nodeId: n.id }} search={{ view: "units" }}>{nodeTitle(n)}</Link>}</span>)}</nav>
    <header className={`flex flex-wrap items-center justify-between gap-4 ${node.kind === 'book' ? 'book-heading card-soft p-5' : ''}`}><div className="flex min-w-0 flex-1 basis-56 items-center gap-4">{node.kind === 'book' && COURSE_ART[node.id] && <img src={COURSE_ART[node.id]!.src} alt={`${node.title_en} cover`} width="72" height="100" className="h-25 w-18 shrink-0 rounded-md object-contain" />}<div className="min-w-0"><h1 dir={node.kind === 'book' || node.kind === 'series' ? 'ltr' : undefined} lang={node.kind === 'book' || node.kind === 'series' ? 'en' : undefined} className="text-2xl font-extrabold text-primary">{nodeTitle(node)}</h1>{course && node.kind !== 'book' && <p dir="ltr" lang="en" className="mt-1 text-muted-foreground">{node.title_en}</p>}</div></div><SaveCourse node={node} /></header>
    <EvolveGuide node={node} />
    <OxfordGuide node={node} />
    <ProjectGuide node={node} />
    <IELTSGuide node={node} />
    <MaximizerGuide key={node.id} node={node}/>
    {node.kind === "term" && <ActivityLink current={bookmark(node.id)} className="bg-primary text-primary-foreground">نقشهٔ ماجراجویی<ChevronLeft /></ActivityLink>}
    {course && <nav className="flex gap-1 rounded-2xl bg-secondary/50 p-1.5" aria-label="نمای دوره">{([["units", "درس‌ها"], ["practice", "تمرین"], ["progress", "پیشرفت"]] as const).map(([id, title]) => <Button key={id} variant="ghost" asChild className={`btn flex-1 ${view === id ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><Link to="/learn/$nodeId" params={{ nodeId: node.id }} search={{ view: id }}>{title}</Link></Button>)}</nav>}
    {view === "progress" && course ? <ScopeProgress node={node} /> : view === "practice" && course ? <GameChoices node={node} /> : <>
      {course && !scopeStats(nodeScope(node.id), p).total && <Preparation />}
      {maxiPart&&<label className="block space-y-2"><span className="font-bold">جست‌وجوی موضوع</span><input aria-label="جست‌وجوی موضوع" value={topicSearch} onChange={e=>setTopicSearch(e.target.value)} type="search" className="h-12 w-full rounded-xl border border-input bg-card px-3"/><span role="status" className="block text-xs text-muted-foreground">{fa(shownChildren.length)} از {fa(children.length)} موضوع و ابزار</span></label>}
      {children.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{shownChildren.map(n => <NodeCard key={n.id} node={n} />)}</div>}
      {node.kind === "subunit" && <GameChoices node={node} />}
    </>}
    {mapping && <section className="border-t border-border pt-4"><h2 className="font-bold">ارتباط Oxford Word Skills و Evolve</h2><p className="mt-1 text-sm text-muted-foreground">پیشنهادهای مطالعهٔ بازبینی‌شده توسط دستیار</p><Link to="/learn/alignments" search={{ book: trail.find(n => n.kind === "book")?.id, unit: node.kind === "unit" ? node.id : undefined }} className="btn mt-2 inline-flex border border-border text-sm">نقشهٔ ارتباط درس‌ها</Link></section>}
  </div>;
}
