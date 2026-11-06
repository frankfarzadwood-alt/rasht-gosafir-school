import {useState} from 'react';
import {Button} from './ui/button';

type Props={title:string;unit:string;values:{label:string;value:number}[];maximum?:number|undefined};
/** Original data diagrams; the values remain available as an accessible table. */
export function DataChartScene({title,unit,values,maximum}:Props){
 const [table,setTable]=useState(false),max=Math.max(maximum??0,...values.map(v=>v.value),1);
 return <figure dir="ltr" className="mb-3 space-y-2 rounded-2xl border border-border bg-secondary/30 p-3">
  <figcaption className="text-center text-sm font-bold">{title}</figcaption>
  <div role="img" aria-label={`${title}. ${values.map(v=>`${v.label}: ${v.value} ${unit}`).join('; ')}`} className="space-y-3 py-2">
   {values.map((v,i)=><div key={v.label} className="space-y-1"><div className="flex items-baseline justify-between gap-3 text-sm"><span>{v.label}</span><b>{v.value}</b></div><div className="h-6 overflow-hidden rounded-lg border border-border bg-card"><div className={`h-full rounded-md ${i%2?'bg-primary':'bg-teal'}`} style={{width:`${100*v.value/max}%`}}/></div></div>)}
   <div className="flex justify-between text-xs text-muted-foreground">{[0,1,2,3,4,5].map(i=><span key={i}>{Math.round(max*i/5)}</span>)}</div><p className="text-xs text-muted-foreground">{unit}</p>
  </div>
  <div dir="rtl"><Button variant="ghost" size="sm" aria-expanded={table} onClick={()=>setTable(v=>!v)}>{table?'پنهان کردن جدول داده‌ها':'نمایش جدول داده‌ها'}</Button></div>
  {table&&<table className="w-full text-left text-sm"><caption className="sr-only">{title} · values</caption><thead><tr><th scope="col" className="p-2">Group</th><th scope="col" className="p-2">{unit}</th></tr></thead><tbody>{values.map(v=><tr key={v.label}><th scope="row" className="p-2">{v.label}</th><td className="p-2">{v.value}</td></tr>)}</tbody></table>}
 </figure>;
}
