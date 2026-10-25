import {useEffect,useState} from 'react';
import {Button} from './ui/button';
import {mediaAsset} from '@/lib/content/pilot';
import type {Question} from '@/lib/bank';
export function QuestionMedia({q,onReady}:{q:Question;onReady:(ready:boolean)=>void}) {
 const audio=mediaAsset(q.assets.audio),refs=q.assets.images?.length?q.assets.images:q.assets.image?[q.assets.image]:[],images=refs.map(mediaAsset);
 const [audioReady,setAudioReady]=useState(!q.assets.source_audio_required),[loaded,setLoaded]=useState<Set<string>>(()=>new Set()),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 const imageReady=!q.assets.source_image_required||images.length>0&&images.every(a=>!!a&&loaded.has(a.id));
 const unresolved=(q.assets.source_audio_required&&!audio)||(q.assets.source_image_required&&(!images.length||images.some(a=>!a)));
 useEffect(()=>{onReady(audioReady&&imageReady&&!failed&&!unresolved);},[audioReady,imageReady,failed,unresolved,onReady]);
 return <div className="space-y-3" key={retry}>{audio&&<audio controls preload="metadata" className="w-full" aria-label="صدای سؤال" onLoadedMetadata={()=>setAudioReady(true)} onError={()=>{setAudioReady(false);setFailed(true);}} src={audio.url}/>}
 {images.map((a,i)=>a&&<details key={a.id} open className="space-y-2"><summary className="cursor-pointer text-sm font-bold">تصویر سؤال {images.length>1?`${i+1} / ${images.length}`:''}</summary><a href={a.url} target="_blank" rel="noreferrer"><img className="h-auto max-h-[48rem] w-full object-contain" src={a.url} alt={a.alt} onLoad={()=>setLoaded(s=>new Set([...s,a.id]))} onError={()=>{setLoaded(s=>{const n=new Set(s);n.delete(a.id);return n;});setFailed(true);}}/></a><a href={a.url} target="_blank" rel="noreferrer" className="block text-sm text-primary underline">باز کردن تصویر در اندازهٔ کامل ↗</a></details>)}
 {failed||unresolved?<div role="alert" className="space-y-2 border-r-4 border-destructive p-3"><p>فایل این سؤال بارگیری نشد؛ پاسخی ثبت نشده و امتیازی کم نمی‌شود.</p><Button variant="outline" onClick={()=>{setFailed(false);setLoaded(new Set());setAudioReady(!q.assets.source_audio_required);setRetry(r=>r+1);}}>تلاش دوباره</Button></div>:!(audioReady&&imageReady)&&<p role="status" className="text-sm text-muted-foreground">در حال بارگیری فایل سؤال…</p>}</div>;
}
