import {Headphones,PenLine,Mic} from 'lucide-react';
import {ieltsGuideFor} from '@/lib/content/ielts-series';
import {fa} from '@/lib/fa';
import type {CatalogueNode} from '@/lib/content/contracts';
export function IELTSGuide({node}:{node:CatalogueNode}){
 const guide=ieltsGuideFor(node.id);if(!guide)return null;
 const unit=Number(node.id.match(/\.u(\d+)/)?.[1]),target=guide.targets.find(t=>t.unit===unit),showRules=node.kind==='unit'||node.ordinal===2||node.ordinal===3;
 return <>
  {node.kind==='book'&&<section className="space-y-3 rounded-3xl bg-secondary p-5">
   <p dir="ltr" className="text-xs font-bold tracking-wide text-teal">{guide.eyebrow}</p><h2 className="text-xl font-extrabold">{guide.heading}</h2>
   <p className="text-sm leading-7 text-muted-foreground">{guide.overview}</p>
   <div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-card px-3 py-2">{fa(guide.targets.length)} درس · {fa(guide.targets.reduce((n,t)=>n+t.sections.length,0))} بخش</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><Headphones className="h-4 w-4"/>{fa(guide.tracks)} فایل شنیداری</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><PenLine className="h-4 w-4"/>{fa(guide.writing.length)} تمرین نوشتن</span><span className="flex items-center gap-1 rounded-full bg-card px-3 py-2"><Mic className="h-4 w-4"/>{guide.speaking.length===1?`تمرین گفتاری درس ${fa(guide.speaking[0]!.unit)}`:`${fa(guide.speaking.length)} تمرین گفتاری`}</span></div>
  </section>}
  {target&&<section className="space-y-3 rounded-2xl border border-border p-4"><h2 className="font-bold">در این درس تمرین می‌کنی</h2>
   <p dir="ltr" className="text-left text-sm font-bold">{target.title} · {target.test}</p>
   {showRules&&<div className="grid gap-3 sm:grid-cols-2">{target.guide.map(g=><div key={g.title} dir="ltr" lang="en" className="space-y-1 rounded-xl bg-secondary/30 p-3 text-left"><h3 className="text-sm font-bold">{g.title}</h3><p className="text-xs leading-5">{g.rule}</p><p className="text-xs leading-5 text-muted-foreground">{g.example}</p></div>)}</div>}
   <p className="text-xs leading-6 text-muted-foreground">خواندن و نوشتن با متن‌ها و موقعیت‌های تمرینی همراه‌اند. نوشته و گفتار را خودت بازبینی می‌کنی؛ این بخش‌ها نمرهٔ خودکار یا نمرهٔ باند آیلتس ثبت نمی‌کنند.</p>
  </section>}
 </>;
}
