import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Question} from '@/lib/bank';
import {ieltsSpeakingTasks} from '@/lib/content/ielts-series';
import {fa} from '@/lib/fa';
import {Button} from './ui/button';
type Task=ReturnType<typeof ieltsSpeakingTasks>[number];
function Rehearsal({task}:{task:Task}){
 const [phase,setPhase]=useState<'intro'|'prepare'|'speak'|'discuss'>('intro'),[remaining,setRemaining]=useState(task.preparation_seconds),[running,setRunning]=useState(false),[notes,setNotes]=useState(''),[checks,setChecks]=useState<number[]>([]),[saved,setSaved]=useState(false),deadline=useRef(0);
 const [questionIndex,setQuestionIndex]=useState(0),part=task.practice_part??2,questions=part===1?task.intro_questions:task.followups;
 const key=`english-quest-speaking-${task.book_id}-${task.id}`;
 useEffect(()=>{try{setNotes(localStorage.getItem(key)??'');}catch{setNotes('');}},[key]);
 useEffect(()=>{if(!running)return;const tick=()=>{const left=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setRemaining(left);if(!left)setRunning(false);};const timer=window.setInterval(tick,200);return()=>window.clearInterval(timer);},[running]);
 const begin=(next:'prepare'|'speak')=>{const seconds=next==='prepare'?task.preparation_seconds:task.speaking_seconds;setPhase(next);setRemaining(seconds);deadline.current=Date.now()+seconds*1000;setRunning(true);};
 const toggle=()=>{if(running){setRemaining(Math.max(0,Math.ceil((deadline.current-Date.now())/1000)));setRunning(false);}else{deadline.current=Date.now()+remaining*1000;setRunning(true);}};
 return <div className="space-y-4">
  <p className="text-sm leading-7 text-muted-foreground">پاسخت را بلند بگو و با فهرست بازبینی بررسی کن. این تمرین نمرهٔ خودکار، امتیاز یا تسلط ثبت نمی‌کند.</p>
  <div dir="ltr" lang="en" className="space-y-3 text-left"><h2 className="text-xl font-extrabold">{task.title}</h2>
   {part!==2&&<section className="space-y-3 rounded-2xl bg-secondary/50 p-4"><h3 className="font-bold">{part===1?'Interview question':'Discussion question'} · {questionIndex+1}/{questions.length}</h3><p className="text-lg font-bold" aria-live="polite">{questions[questionIndex]}</p><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={questionIndex===0} onClick={()=>{setQuestionIndex(i=>i-1);setRunning(false);setPhase('intro');}}>پرسش قبلی</Button><Button variant="outline" disabled={questionIndex>=questions.length-1} onClick={()=>{setQuestionIndex(i=>i+1);setRunning(false);setPhase('intro');}}>پرسش بعدی</Button></div><p className="text-sm">{task.cue}</p></section>}
   {part===2&&<>{phase==='intro'&&task.intro_questions.length>0&&<section className="space-y-2"><h3 className="font-bold">Warm-up questions</h3><ul className="list-disc space-y-2 pl-5">{task.intro_questions.map(q=><li key={q}>{q}</li>)}</ul></section>}
   <section className="space-y-2 rounded-2xl bg-secondary/50 p-4"><h3 className="font-bold">Your cue card</h3><p>{task.cue}</p><ul className="list-disc space-y-1 pl-5">{task.points.map(p=><li key={p}>{p}</li>)}</ul></section>
   {phase==='discuss'&&<section className="space-y-2"><h3 className="font-bold">Develop the discussion</h3><ol className="list-decimal space-y-2 pl-5">{task.followups.map(q=><li key={q}>{q}</li>)}</ol></section>}</>}
  </div>
  {(phase==='prepare'||phase==='speak')&&<div className="space-y-2 rounded-2xl border border-border p-4 text-center"><p className="text-sm font-bold">{phase==='prepare'?'زمان آماده‌سازی':'زمان صحبت'}</p><output aria-label="زمان باقی‌مانده" className="block text-3xl font-extrabold tabular-nums" dir="ltr">{fa(Math.floor(remaining/60))}:{fa(String(remaining%60).padStart(2,'0'))}</output><Button variant="outline" disabled={!remaining} onClick={toggle}>{running?'مکث تایمر':'ادامهٔ تایمر'}</Button>{remaining===0&&<p role="status" className="text-sm">زمان این مرحله تمام شد؛ هر وقت آماده‌ای ادامه بده.</p>}</div>}
  <div className="flex flex-wrap gap-2">{task.preparation_seconds>0&&<Button onClick={()=>begin('prepare')}>شروع آماده‌سازی · {fa(task.preparation_seconds)} ثانیه</Button>}<Button onClick={()=>begin('speak')}>شروع صحبت · {fa(task.speaking_seconds)} ثانیه</Button>{part===2&&<Button variant="outline" onClick={()=>{setRunning(false);setPhase('discuss');}}>پرسش‌های تکمیلی</Button>}</div>
  {part!==2&&<p className="text-xs text-muted-foreground">این زمان برای هر پاسخ تمرینی است؛ مدت رسمی بخش آزمون یا نمرهٔ گفتار را نشان نمی‌دهد.</p>}
  <label className="block space-y-2"><span className="font-bold">یادداشت‌های آماده‌سازی</span><textarea dir="ltr" lang="en" value={notes} maxLength={4000} rows={4} onChange={e=>{setNotes(e.target.value);setSaved(false);}} className="en w-full rounded-2xl border-2 border-input bg-card p-3 text-left"/></label>
  <fieldset className="space-y-2"><legend className="mb-2 font-bold">گفتارت را بازبینی کن</legend>{task.checks.map((text,i)=><label key={text} className="flex min-h-11 items-start gap-3 rounded-xl bg-secondary/50 p-3"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={checks.includes(i)} onChange={()=>setChecks(c=>c.includes(i)?c.filter(n=>n!==i):[...c,i])}/><span dir="ltr" lang="en" className="flex-1 text-left text-sm">{text}</span></label>)}</fieldset>
  <Button variant="outline" onClick={()=>{try{localStorage.setItem(key,notes);setSaved(true);}catch{setSaved(false);}}}>ذخیرهٔ یادداشت</Button>{saved&&<p role="status" className="text-sm text-teal">یادداشت روی همین مرورگر ذخیره شد.</p>}
 </div>;
}
export function SpeakingStudio({pool,back}:{pool:Question[];back:ReactNode}){
 const tasks=ieltsSpeakingTasks(pool),[selected,setSelected]=useState(tasks[0]?.id??''),task=tasks.find(t=>t.id===selected);
 if(!task)return <section className="card-soft space-y-3 p-5"><p>تمرین گفتاری این محدوده در حال آماده‌سازی است.</p>{back}</section>;
 return <section className="card-soft space-y-4 p-5">{tasks.length>1&&<label className="block space-y-2"><span className="font-bold">کارت گفتاری</span><select value={selected} onChange={e=>setSelected(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-card px-3">{tasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}<Rehearsal key={task.id} task={task}/>{back}</section>;
}
