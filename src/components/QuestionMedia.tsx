import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { mediaAsset } from '@/lib/content/pilot';
import type { Question } from '@/lib/bank';

/** Explicit native audio controls; metadata loading gates answers, never autoplays. */
export function QuestionMedia({ q, onReady }: { q: Question; onReady: (ready: boolean) => void }) {
  const audio = mediaAsset(q.assets.audio), image = mediaAsset(q.assets.image);
  const [audioReady, setAudioReady] = useState(!q.assets.source_audio_required);
  const [imageReady, setImageReady] = useState(!q.assets.source_image_required);
  const [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => { onReady(audioReady && imageReady && !failed); }, [audioReady, imageReady, failed, onReady]);
  return <div className="space-y-3" key={retry}>
    {audio && <audio controls preload="metadata" className="w-full" aria-label="صدای سؤال" onLoadedMetadata={() => setAudioReady(true)} onError={() => { setAudioReady(false); setFailed(true); }} src={audio.url} />}
    {image && <details open className="space-y-2"><summary className="cursor-pointer text-sm font-bold">تصویر سؤال</summary><a href={image.url} target="_blank" rel="noreferrer"><img className="h-auto max-h-96 w-full object-contain" src={image.url} alt={image.alt} onLoad={() => setImageReady(true)} onError={() => { setImageReady(false); setFailed(true); }} /></a></details>}
    {failed ? <div role="alert" className="space-y-2 border-r-4 border-destructive p-3"><p>فایل این سؤال بارگیری نشد؛ پاسخی ثبت نشده و امتیازی کم نمی‌شود.</p><Button variant="outline" onClick={() => { setFailed(false); setRetry(r => r + 1); }}>تلاش دوباره</Button></div> : !(audioReady && imageReady) && <p role="status" className="text-sm text-muted-foreground">در حال بارگیری فایل سؤال…</p>}
  </div>;
}