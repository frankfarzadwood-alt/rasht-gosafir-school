import { Headphones, PenLine } from 'lucide-react';
import { projectGuideFor } from '@/lib/content/project-series';
import { fa } from '@/lib/fa';
import type { CatalogueNode } from '@/lib/content/contracts';

export function ProjectGuide({node}:{node:CatalogueNode}) {
  const guide=projectGuideFor(node.id);
  if (!guide) return null;
  const unit=Number(node.id.match(/\.u(\d+)/)?.[1]);
  const lessons=guide.targets.filter(t=>t.unit===unit&&(node.kind!=='subunit'||t.section===node.ordinal));
  return <>
    {node.kind==='book'&&<section className="space-y-3 rounded-3xl bg-secondary p-5">
      <p className="text-xs font-bold tracking-wide text-teal" dir="ltr">PROJECT {guide.book} · {guide.tagline}</p>
      <h2 className="text-xl font-extrabold">{guide.intro}</h2>
      <p className="text-sm leading-7 text-muted-foreground">{guide.overview}</p>
      <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-card px-3 py-2">۶ درس · ۲۴ بخش</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><Headphones className="h-4 w-4"/>{fa(guide.tracks)} فایل شنیداری</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><PenLine className="h-4 w-4"/>۶ تمرین نوشتن آزاد</span></div>
    </section>}
    {lessons.length>0&&<section className="rounded-2xl border border-border p-4"><h2 className="mb-3 font-bold">در این درس تمرین می‌کنی</h2><div className="grid gap-3 sm:grid-cols-2">{lessons.map(t=><div key={t.node_id} dir="ltr" lang="en"><p className="text-left text-sm font-bold">{unit}{String.fromCharCode(64+t.section)} · {t.title}</p>{t.targets.map(target=><p key={target} className="mt-1 text-left text-xs leading-5 text-muted-foreground">{target}</p>)}</div>)}</div></section>}
  </>;
}
