import { useMemo, useState, type ReactNode } from 'react';
import { GameRunner } from './GameRunner';
import type { Question } from '@/lib/bank';
import { contextById, dedupe } from '@/lib/bank';
import { fa } from '@/lib/fa';
import { mediaAsset } from '@/lib/content/pilot';

export function ListeningLab({ pool, scope, back }: { pool: Question[]; scope?: string; back: ReactNode }) {
  const groups = useMemo(() => {
    const recordings = new Map<string, Question[]>();
    for (const q of dedupe(pool)) {
      if (!/^(?:evolve[1-6]|project[1-5]|ieltsg|ieltsv65|ieltsv60)\./.test(q.id) || !q.assets.source_audio_required) continue;
      const id = typeof q.assets.audio === 'string' ? q.assets.audio : String((q.assets.audio as { asset_id?: string } | null)?.asset_id ?? '');
      recordings.set(id,[...(recordings.get(id) ?? []),q]);
    }
    return [...recordings].map(([id,questions]) => {
      const ielts=id.match(/^(?:ieltsg|ieltsv65|ieltsv60)\.native\.audio\.(\d+[a-d]?)$/),ieltsAsset=ielts?mediaAsset(id):null;
      if(ielts&&ieltsAsset)return{id,questions,unit:Number(ieltsAsset['unit']),order:Number(ieltsAsset['order']??parseInt(ielts[1]!,10)),label:`${fa(String(ieltsAsset['label_fa']))} · فایل ${fa(ielts[1]!)}`};
      const project = id.match(/^project([1-5])\.native\.audio\.(\d+)$/), asset = project ? mediaAsset(id) : null;
      if (project && asset) return {id,questions,unit:Number(asset['unit']) || (project[1]==='1'?7:0),order:Number(project[2]),label:`${fa(String(asset['label_fa']))} · فایل ${fa(project[2]!)}`};
      const workbook = id.match(/native\.wb\.audio\.(\d+)/), quiz = id.match(/quiz\.u(\d+)\.([ab])\.audio/);
      const exercise = id.match(/^evolve6\.native\.wb\.audio\.\d+\.(main|1C|2A)$/)?.[1];
      const suffix = exercise ? ` · ${exercise === 'main' ? 'فایل اصلی' : `تمرین ${exercise}`}` : '';
      return { id,questions,unit:Number(workbook?.[1] ?? quiz?.[1] ?? 0),order:workbook ? 0 : quiz?.[2] === 'a' ? 1 : 2,label:workbook ? `درس ${fa(workbook[1]!)} · ورک‌بوک${suffix}` : `درس ${fa(Number(quiz?.[1] ?? 0))} · آزمون ${quiz?.[2]?.toUpperCase() ?? ''}` };
    }).sort((a,b) => a.unit-b.unit || a.order-b.order);
  }, [pool]);
  const [selected, setSelected] = useState(groups[0]?.id ?? '');
  const current = groups.find(g => g.id === selected);
  if (!current) return <>{back}</>;
  const review=current.questions.some(q=>q.context_id&&contextById(q.context_id)?.['spoken_transcript']===false);
  return <div className="space-y-4"><label className="block space-y-2"><span className="font-bold">فایل شنیداری</span><select value={selected} onChange={e => setSelected(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-card px-3">{groups.map(g => <option key={g.id} value={g.id}>{g.label} · {fa(g.questions.length)} سؤال</option>)}</select></label><p className="text-sm text-muted-foreground">می‌توانی فایل را مکث کنی یا دوباره گوش بدهی. {review?'یادداشت‌های مرور پس از پاسخ به سؤال‌های وابسته نمایش داده می‌شوند؛ این یادداشت‌ها متن کلمه‌به‌کلمهٔ ضبط نیستند.':'متن فایل پس از پاسخ به سؤال‌های وابسته نمایش داده می‌شود.'}</p><GameRunner key={current.id} items={current.questions.map(q => ({ q,kind:'auto' as const }))} grade={null} term={null} {...(scope ? {scope} : {})} mode="listening_lab" nextHref={back} /></div>;
}
