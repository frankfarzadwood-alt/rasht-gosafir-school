import type { NativeScene } from '@/lib/content/evolve';

export function CalendarScene({scene}:{scene:Extract<NativeScene,{kind:'calendar'}>}) {
  if(!Number.isInteger(scene.days)||scene.days<28||scene.days>31||!Number.isInteger(scene.startWeekday)||scene.startWeekday<0||scene.startWeekday>6)return null;
  const cells=Array.from({length:Math.ceil((scene.startWeekday+scene.days)/7)*7},(_,i)=>i>=scene.startWeekday&&i<scene.startWeekday+scene.days?i-scene.startWeekday+1:null);
  return <div dir="ltr" className="mx-auto mb-3 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card"><table className="w-full table-fixed text-center text-sm"><caption className="bg-secondary p-3 font-bold">{scene.title}</caption><thead><tr>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><th key={day} scope="col" className="border-b border-border py-2 text-xs">{day}</th>)}</tr></thead><tbody>{Array.from({length:cells.length/7},(_,r)=><tr key={r}>{cells.slice(r*7,r*7+7).map((day,c)=><td key={c} className={`border-b border-border/50 py-1.5 ${c>=5?'bg-secondary/40':''}`}>{day??<span aria-hidden> </span>}</td>)}</tr>)}</tbody></table></div>;
}
