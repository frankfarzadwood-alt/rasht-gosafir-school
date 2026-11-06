import {useEffect,useState} from 'react';
import {Link} from '@tanstack/react-router';
import audio from '@/data/ielts-maximizer/bonus-audio.json';
import {mediaAsset} from '@/lib/content/pilot';
import type {CatalogueNode} from '@/lib/content/contracts';
import {fa} from '@/lib/fa';
import {Button} from './ui/button';

function ShadowingTrack({id}:{id:string}){
 const asset=mediaAsset(id),key=`english-quest-maximizer-bonus-notes-${id}`;
 const [notes,setNotes]=useState(''),[saved,setSaved]=useState(false),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{try{setNotes(localStorage.getItem(key)??'');}catch{setNotes('');}},[key]);
 return <div className="space-y-3">
  {asset&&<audio key={retry} aria-label="صدای اضافه برای سایه‌خوانی" controls preload="metadata" src={asset.url} onError={()=>setFailed(true)} onLoadedMetadata={()=>setFailed(false)} className="w-full"/>}
  {(failed||!asset)&&<div role="alert" className="space-y-2"><p>فایل صوتی بارگذاری نشد. دوباره تلاش کن.</p><Button variant="outline" onClick={()=>{setFailed(false);setRetry(n=>n+1);}}>بارگذاری دوباره</Button></div>}
  <p className="text-sm leading-7 text-muted-foreground">بخش کوتاهی را گوش بده، مکث کن و با صدای بلند تکرار کن. دوباره گوش بده و به آهنگ جمله و پیوند واژه‌ها توجه کن. این تمرین امتیاز یا نمرهٔ خودکار ندارد.</p>
  <label className="block space-y-2"><span className="font-bold">یادداشت سایه‌خوانی این فایل</span><textarea dir="ltr" lang="en" value={notes} maxLength={4000} rows={3} onChange={e=>{setNotes(e.target.value);setSaved(false);}} className="en w-full rounded-xl border-2 border-input bg-card p-3 text-left"/></label>
  <Button variant="outline" onClick={()=>{try{localStorage.setItem(key,notes);setSaved(true);}catch{setSaved(false);}}}>ذخیرهٔ یادداشت فایل</Button>{saved&&<p role="status" className="text-sm text-teal">یادداشت روی همین مرورگر ذخیره شد.</p>}
 </div>;
}
export function MaximizerBonusAudio(){
 const [selected,setSelected]=useState(audio[0]!.id);
 return <div className="space-y-3"><p className="text-sm leading-7 text-muted-foreground">این ۴۴ فایل، تمرین اضافه‌اند و به درس یا کارت مشخصی از کتاب تعلق ندارند. فایل‌ها با نام و گروه اصلی مرتب شده‌اند.</p>
  <label className="block space-y-2"><span className="font-bold">فایل اضافه</span><select value={selected} onChange={e=>setSelected(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-card px-3" dir="ltr">{audio.map(a=><option key={a.id} value={a.id}>{a.group} · {a.filename}</option>)}</select></label>
  <ShadowingTrack key={selected} id={selected}/>
 </div>;
}
export function MaximizerGuide({node}:{node:CatalogueNode}){
 const [open,setOpen]=useState(false);if(!node.id.startsWith('ielts-speaking-maximizer'))return null;
 const part=Number(node.id.match(/\.u(\d{3})/)?.[1]);
 if(node.kind==='book')return <section className="space-y-4 rounded-3xl bg-secondary p-5">
  <p dir="ltr" className="text-xs font-bold tracking-wide text-teal">IELTS · SPEAKING MAXIMIZER</p><h2 className="text-xl font-extrabold">از پاسخ کوتاه تا گفت‌وگوی روشن</h2>
  <p className="text-sm leading-7 text-muted-foreground">۱۹ موضوع مصاحبه، ۱۰۰ کارت صحبت و ۱۰۰ موضوع بحث؛ واژه‌ها، جمله‌سازی، دلیل‌آوردن و مقایسه را تمرین کن و بعد با تایمر و بازبینی خودت صحبت کن. سه بخش ابزارهای گفتار هم برای پیوند جمله‌ها و بررسی استدلال آماده‌اند.</p>
  <div className="flex flex-wrap gap-2 text-xs font-bold">{['۳ بخش · ۲۲۲ موضوع و ابزار','۸۸۸ کارت واژگان','۲۲۲ تمرین گفتاری','۴۴ فایل صوتی اضافه'].map(s=><span key={s} className="rounded-full bg-card px-3 py-2">{s}</span>)}</div>
  <p className="text-xs leading-6 text-muted-foreground">سه مرور ۲۰ پرسشی برای زبان و مهارت پاسخ‌دادن آماده‌اند. نظر شخصی و گفتار تو نمرهٔ خودکار یا باند آیلتس نمی‌گیرند.</p>
  <Button variant="outline" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?'بستن فایل‌های اضافه':'گوش‌دادن و سایه‌خوانی · ۴۴ فایل اضافه'}</Button>{open&&<MaximizerBonusAudio/>}
 </section>;
 if(node.kind==='unit')return <section className="space-y-2 rounded-2xl border border-border p-4"><h2 className="font-bold">{part===1?'پاسخ مستقیم، سپس یک جزئیات مرتبط':part===2?'یک دقیقه برنامه‌ریزی، سپس صحبت با جزئیات':'دیدگاه، دلیل، مثال و نگاه دیگر'}</h2><p className="text-sm leading-7 text-muted-foreground">{part===1?'موضوع را پیدا کن، واژه و جمله را تمرین کن و به پرسش‌های مصاحبه با بیان خودت پاسخ بده. ۱۰۰ پرسش مستقل در موضوع‌ها و ابزار مصاحبه آماده‌اند.':part===2?'هر کارت واژه و جملهٔ مرتبط دارد. کارت‌های ۱ تا ۲۰ متن‌های کوتاه مستقلی هم برای بررسی شیوهٔ گسترش پاسخ دارند. متن را حفظ نکن؛ تجربه یا موقعیت قابل‌تصورت را با بیان خودت توضیح بده.':'زبان مقایسه، پیشنهاد و بیان محدودیت را در ۱۰۰ موضوع تمرین کن. در گفت‌وگو به بیش از یک دیدگاه توجه کن؛ پاسخ شخصی تو کلید درست و غلط ثابت ندارد.'}</p></section>;
 return <div className="flex flex-wrap items-center gap-3"><Button asChild><Link to="/practice/$nodeId/$mode" params={{nodeId:node.id,mode:'speaking_studio'}} search={{scope:'subunit'}}>تمرین گفتاری این موضوع</Link></Button><p className="text-xs text-muted-foreground">{fa(part)} · با تایمر و بازبینی خودت</p></div>;
}
