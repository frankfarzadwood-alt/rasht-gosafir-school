import { Link } from '@tanstack/react-router';
import { BookOpen, ArrowUpLeft, Headphones, PenLine } from 'lucide-react';
import { evolveGuideFor, oxfordDestination } from '@/lib/content/evolve-series';
import { LIVE_CATALOGUE } from '@/lib/content/pilot';
import type { CatalogueNode } from '@/lib/content/contracts';
import { fa } from '@/lib/fa';
import { comingSoonBook } from '@/lib/learning';
import { ComingSoonBadge } from './ComingSoon';

export function EvolveGuide({ node }: { node: CatalogueNode }) {
  const guide=evolveGuideFor(node.id);
  if(!guide)return null;
  const unit=Number(node.id.match(/\.u(\d+)/)?.[1])||null;
  const recommendations=guide.recommendations.find(m=>m.unit===unit);
  const lessons=guide.targets.filter(t=>t.unit===unit&&(node.kind!=='subunit'||node.ordinal===t.section));
  const oxfordBook=recommendations?.recommendations[0]?.book_id;
  const oxfordTitle=LIVE_CATALOGUE.nodes.find(n=>n.id===oxfordBook)?.title_en;
  return <>
    {node.kind==='book'&&<section className="space-y-3 rounded-3xl bg-secondary p-5">
      <p className="text-xs font-bold tracking-wide text-teal" dir="ltr">EVOLVE {guide.book} · LEARN BY DOING</p>
      <h2 className="text-xl font-extrabold">{guide.intro}</h2>
      <p className="text-sm leading-7 text-muted-foreground">دوازده درس با تصویرهای مستقل، بازی‌های واژگان و دستور، مکالمه، خواندن و شنیدن. از درس‌ها شروع کن یا محدودهٔ تمرین دلخواهت را انتخاب کن.</p>
      <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-card px-3 py-2">۱۲ درس</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><Headphones className="h-4 w-4" />{fa(guide.workbookTracks)} فایل ورک‌بوک + ۲۴ فایل آزمون</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><PenLine className="h-4 w-4" />نوشتن آزاد در هر درس</span></div>
    </section>}
    {lessons.length>0&&<section className="rounded-2xl border border-border p-4"><h2 className="mb-3 font-bold">در این درس تمرین می‌کنی</h2><div className="grid gap-3 sm:grid-cols-2">{lessons.map(lesson=><div key={lesson.section}><p dir="ltr" lang="en" className="text-left text-sm font-bold">{unit}.{lesson.section} · {lesson.title}</p><ul className="mt-1 space-y-1">{lesson.targets.map((target,i)=><li key={i} dir="ltr" lang="en" className="text-left text-xs leading-5 text-muted-foreground">{target.target}</li>)}</ul></div>)}</div></section>}
    {recommendations&&<section className="space-y-3 rounded-2xl border border-teal/30 bg-teal/5 p-4" aria-label="پیشنهادهای Oxford Word Skills این درس">
      <div className="flex items-center gap-2 font-bold text-teal"><BookOpen className="h-5 w-5" /><h2>Oxford Word Skills در کنار این درس</h2></div>
      <p className="text-xs text-muted-foreground">درس‌های پیشنهادی <span dir="ltr" className="inline-block">{oxfordTitle}</span></p>
      <div className="grid gap-2 sm:grid-cols-3">{recommendations.recommendations.map(r=>{
        const destination=oxfordDestination(r,LIVE_CATALOGUE.nodes);
        const label=<span>درس {fa(r.unit)}{r.section&&<span dir="ltr" className="ml-1 inline-block rounded bg-secondary px-2 py-1">{r.section}</span>}</span>;
        if (comingSoonBook(r.book_id)) return <div key={r.source_label} aria-disabled="true" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-sm">{label}<ComingSoonBadge /></div>;
        return destination?<Link key={r.source_label} to="/learn/$nodeId" params={{nodeId:r.unit_node_id}} search={{view:'practice',...(r.section?{section:r.section}:{}),from:recommendations.node_id}} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 text-sm font-bold hover:border-teal">{label}<ArrowUpLeft className="h-4 w-4 shrink-0" /></Link>
          :<div key={r.source_label} aria-disabled="true" className="space-y-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">{label}<span className="block text-xs">بازی‌های این بخش در حال آماده‌سازی است</span></div>;
      })}</div>
    </section>}
  </>;
}
