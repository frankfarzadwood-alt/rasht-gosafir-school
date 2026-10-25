import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';
import { mediaAsset } from '@/lib/content/pilot';
import { SOURCE_TASKS, type SourceTask } from '@/lib/content/library';
import { EMPTY_DRAFT,readSourceDraft,saveSourceDraft,type SourceDraft } from '@/lib/sourcePractice';
import { fa } from '@/lib/fa';
function Pages({ids,pages,label}:{ids:string[];pages:number[];label:string}) {
 const [page,setPage]=useState(0),[failed,setFailed]=useState(false);const a=mediaAsset(ids[page]);
 if(!ids.length)return null;
 return <section className="space-y-2" aria-label={label}><label className="flex items-center gap-3 text-sm font-bold">{label}<select aria-label={label} value={page} onChange={e=>{setPage(Number(e.target.value));setFailed(false);}} className="h-11 rounded-lg border border-input bg-card px-3">{ids.map((id,i)=><option key={id} value={i}>{fa(i+1)} / {fa(ids.length)} · PDF {fa(pages[i]??i+1)}</option>)}</select></label>{a&&!failed?<><a href={a.url} target="_blank" rel="noreferrer"><img key={a.id} className="h-auto w-full rounded-lg border border-border" src={a.url} alt={a.alt} onError={()=>setFailed(true)} /></a><a className="text-sm text-primary underline" href={a.url} target="_blank" rel="noreferrer">باز کردن صفحه در اندازهٔ کامل ↗</a></>:<p role="alert">صفحه بارگیری نشد. نوشتهٔ تو محفوظ است.<Button variant="outline" onClick={()=>setFailed(false)}>تلاش دوباره</Button></p>}</section>;
}
function TaskDraft({task}:{task:SourceTask}) {
 const [draft,setDraft]=useState<SourceDraft>(()=>{try{return typeof window==='undefined'?{...EMPTY_DRAFT,checks:[]}:readSourceDraft(task.id,window.localStorage);}catch{return {...EMPTY_DRAFT,checks:[]};}});
 const [saved,setSaved]=useState(true),[reveal,setReveal]=useState(false),[track,setTrack]=useState(0);
 const recording=mediaAsset(task.audio_ids[track]),shelf=SOURCE_TASKS.find(t=>t.book_id===task.book_id&&t.kind==='audio_reference');
 const change=(next:SourceDraft)=>{const value={...next,updatedAt:new Date().toISOString()};setDraft(value);try{setSaved(saveSourceDraft(task.id,value,window.localStorage));}catch{setSaved(false);}};
 const words=draft.text.trim()?draft.text.trim().split(/\s+/u).length:0;
 return <article className="space-y-5"><div><h2 className="text-lg font-extrabold" dir="ltr" lang="en">{task.title_en}</h2><p className="mt-2 text-sm" dir="ltr" lang="en">{task.prompt_en}</p></div>
 <p className="rounded-xl bg-secondary p-3 text-sm">تمرین و خودارزیابی با صفحات اصلی کتاب. پیش‌نویس روی همین دستگاه ذخیره می‌شود؛ امتیاز، تسلط و نمرهٔ آیلتس برای آن ثبت نمی‌شود.</p>
 {task.notice_en&&<p role="note" lang="en" dir="ltr" className="rounded-lg border border-gold p-3 text-sm">{task.notice_en}</p>}
 {!task.audio_ids.length&&shelf&&<Button asChild variant="outline"><Link to="/practice/$nodeId/$mode" params={{nodeId:task.book_id,mode:'workbook'}} search={{scope:'whole_book',activity:shelf.id}}>فایل‌های صوتی کتاب · انتخاب شمارهٔ چاپ‌شده</Link></Button>}
 {task.audio_ids.length>0&&<section className="space-y-2"><label className="block text-sm font-bold">فایل صوتی<select value={track} onChange={e=>setTrack(Number(e.target.value))} className="mt-1 h-12 w-full rounded-lg border border-input bg-card px-3" dir="ltr">{task.audio_ids.map((id,i)=><option key={id} value={i}>{mediaAsset(id)?.alt??`Track ${i+1}`}</option>)}</select></label>{recording&&<audio key={recording.id} aria-label={recording.alt} controls preload="metadata" className="w-full" src={recording.url}/>}<p className="text-xs text-muted-foreground">شماره و نام فایل را با دستور تمرین در کتاب تطبیق بده.</p></section>}
 <Pages key={task.id} ids={task.images} pages={task.source_pages} label="صفحهٔ تمرین"/>
 <label className="block space-y-2"><span className="font-bold">{task.kind==='writing'?'پیش‌نویس نوشتهٔ تو':'پاسخ‌ها و یادداشت‌های تو'}</span><textarea dir="ltr" lang="en" value={draft.text} onChange={e=>change({...draft,text:e.target.value,reviewed:false})} className="min-h-64 w-full rounded-xl border border-input bg-card p-4 text-left leading-relaxed" placeholder="Write your answers here…"/></label>
 <p role="status" className={`text-xs ${saved?'text-muted-foreground':'text-destructive'}`}>{fa(words)} واژه · {saved?'ذخیره روی این دستگاه':'ذخیره نشد؛ متن را پیش از خروج کپی کن.'}</p>
 <fieldset className="space-y-2"><legend className="mb-2 font-bold">چک‌لیست بازبینی</legend>{task.rubric.map((text,i)=><label key={text} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={draft.checks.includes(i)} onChange={()=>change({...draft,checks:draft.checks.includes(i)?draft.checks.filter(x=>x!==i):[...draft.checks,i]})}/><span lang="en" dir="ltr">{text}</span></label>)}</fieldset>
 {task.answer_images.length>0&&<section className="space-y-3 border-t border-border pt-4"><Button variant="outline" aria-expanded={reveal} onClick={()=>setReveal(x=>!x)}>{reveal?'بستن پاسخ‌نامه':'مقایسه با پاسخ‌نامهٔ کتاب'}</Button>{reveal&&<><p lang="en" dir="ltr" className="text-sm">{task.answer_reference_label??'Find the matching unit, exercise and item in the supplied key. Personal responses may have other valid answers.'}</p><Pages ids={task.answer_images} pages={task.key_pages} label="صفحهٔ پاسخ‌نامه"/></>}</section>}
 <Button variant={draft.reviewed?'secondary':'default'} disabled={!draft.text.trim()} onClick={()=>change({...draft,reviewed:!draft.reviewed})}>{draft.reviewed?'خودارزیابی ثبت شد ✓':'نوشته‌ام را خودم بازبینی کردم'}</Button></article>;
}
export function SourceStudio({tasks,writing,back,initialId}:{tasks:SourceTask[];writing:boolean;back:ReactNode;initialId?:string|undefined}) {
 const available=tasks.filter(t=>writing?t.kind==='writing':t.kind!=='writing');const [selected,setSelected]=useState(available.find(t=>t.id===initialId)?.id??available[0]?.id??'');const task=available.find(t=>t.id===selected)??available[0];
 if(!task)return <section className="space-y-3"><p>تمرین متناسب با این محدوده در دسترس نیست. برای تمرین‌های چندمهارتی، فیلتر مهارت را بردار.</p>{back}</section>;
 return <div className="space-y-5"><label className="block space-y-2"><span className="font-bold">انتخاب تمرین · {fa(available.length)} فعالیت</span><select className="h-12 w-full rounded-xl border border-input bg-card px-3" dir="ltr" value={task.id} onChange={e=>setSelected(e.target.value)}>{available.map(t=><option key={t.id} value={t.id}>{t.title_en}</option>)}</select></label><TaskDraft key={task.id} task={task}/>{back}</div>;
}
