import { useEffect, useRef } from 'react';

/** Native paragraph gaps stay readable and keep the active item in view. */
export function ExercisePassage({text,active}:{text:string;active:number}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const current=ref.current?.querySelector<HTMLElement>('[aria-current="true"]');
    const container=ref.current?.closest('article');
    if(current&&container)container.scrollTop=Math.max(0,current.offsetTop-32);
  },[text,active]);
  return <div ref={ref} dir="ltr" lang="en" className="en relative whitespace-pre-line text-left leading-relaxed">{text.split(/(\[\d+\])/).map((part,i)=>{
    const n=part.match(/^\[(\d+)\]$/);
    return n?<mark key={i} aria-current={Number(n[1])===active?'true':undefined} aria-label={`Gap ${n[1]}${Number(n[1])===active?', current item':''}`} className={Number(n[1])===active?'mx-1 rounded bg-teal px-2 py-1 font-bold text-white':'bg-transparent font-bold text-foreground'}>{part}</mark>:<span key={i}>{part}</span>;
  })}</div>;
}
