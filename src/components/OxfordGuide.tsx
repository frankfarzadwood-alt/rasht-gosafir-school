import { Link } from '@tanstack/react-router';
import { BookOpen, ArrowUpLeft } from 'lucide-react';
import type { CatalogueNode } from '@/lib/content/contracts';
import { ALL_EVOLVE_RECOMMENDATIONS } from '@/lib/content/evolve-series';
import { OXFORD_SECTIONS } from '@/lib/content/oxford-native';
import { OXFORD_INTERMEDIATE_SECTIONS } from '@/lib/content/oxford-intermediate';
import { OXFORD_UPPER_SECTIONS } from '@/lib/content/oxford-upper';
import { fa } from '@/lib/fa';

export function OxfordGuide({ node }: { node: CatalogueNode }) {
  const bookId=node.id.match(/^ows-(elementary|intermediate|upper-intermediate)(?=\.|$)/)?.[0];
  if(!bookId)return null;
  const section=[...OXFORD_SECTIONS,...OXFORD_INTERMEDIATE_SECTIONS,...OXFORD_UPPER_SECTIONS].find(s=>s.id===node.id);
  const unit=Number(node.id.match(/\.u(\d+)/)?.[1]);
  const recommended=ALL_EVOLVE_RECOMMENDATIONS.filter(m=>m.recommendations.some(r=>r.book_id===bookId&&r.unit===unit&&(!section||!r.section||r.section===section.letter)));
  return <>
    {node.kind==='book'&&node.availability==='ready'&&<section className="space-y-3 rounded-3xl bg-secondary p-5"><p dir="ltr" className="text-xs font-bold tracking-wide text-teal">{node.title_en.toUpperCase()}</p><h2 className="text-xl font-extrabold">واژه‌ها را در موقعیت‌های واقعی تمرین کن</h2><p className="text-sm leading-7 text-muted-foreground">درس دلخواهت را انتخاب کن یا با تصویرهای مستقل، ساختن کلمه و جمله، مکالمه و فلش‌کارت‌ها مرور کن.</p></section>}
    {section&&<section className="rounded-2xl border border-teal/30 bg-teal/5 p-4"><p className="text-sm font-bold">تمرین‌های همین بخش</p><p lang="en" dir="ltr" className="mt-1 text-left font-bold">{section.letter} · {section.title}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">بازی‌ها و پیشرفت این صفحه مربوط به همین بخش‌اند. برای مرور همهٔ بخش‌ها، به صفحهٔ درس برو.</p></section>}
    {recommended.length>0&&<section className="space-y-3 rounded-2xl border border-border p-4"><div className="flex items-center gap-2 font-bold text-teal"><BookOpen className="h-5 w-5" /><h2>در کنار Evolve</h2></div><p className="text-xs text-muted-foreground">این بخش برای درس‌های زیر پیشنهاد شده است.</p><div className="flex flex-wrap gap-2">{recommended.map(r=><Link key={r.node_id} to="/learn/$nodeId" params={{nodeId:r.node_id}} search={{view:'units'}} className="btn inline-flex items-center gap-2 border border-border text-sm"><span lang="en" dir="ltr">Evolve {r.evolve_book_id.split('-')[1]}</span> · درس {fa(r.unit)}<ArrowUpLeft className="h-4 w-4" /></Link>)}</div></section>}
  </>;
}
