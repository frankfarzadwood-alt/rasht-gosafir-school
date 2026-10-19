import { useEffect, useState, type ReactNode } from 'react';
import { GameRunner } from './GameRunner';
import { Button } from './ui/button';
import { mediaAsset } from '@/lib/content/pilot';
import type { AssessmentSession } from '@/lib/scope';

/** Preflight every required asset before a fixed quiz; never run a shortened paper. */
export function FixedAssessment({ session, back }: { session: AssessmentSession; back: ReactNode }) {
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [started, setStarted] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (session.status !== 'ready') return;
    let active = true;
    const ids = [...new Set(session.sections.flatMap(s => s.questions.flatMap(q => q.assets.required_asset_ids ?? [])))];
    Promise.all(ids.map(async id => { const a = mediaAsset(id); if (!a) throw new Error('missing asset'); const response = await fetch(a.url, { headers: { Range: 'bytes=0-1023' } }); if (!response.ok) throw new Error('unavailable asset'); await response.arrayBuffer(); }))
      .then(() => { if (active) { setReady(true); setFailed(false); } }).catch(() => { if (active) { setReady(false); setFailed(true); } });
    return () => { active = false; };
  }, [session, retry]);
  if (session.status !== 'ready') return <section role="alert"><p>این آزمون کامل در دسترس نیست و کوتاه نمی‌شود.</p>{back}</section>;
  if (!started) return <section className="space-y-3"><p dir="ltr" lang="en" className="en font-bold">{session.title_en}</p><p>آزمون تمرینی با ترتیب ثابت؛ بدون زمان‌سنج و بارم رسمی.</p>{failed && <p role="alert">فایل آزمون بارگیری نشد؛ هیچ پاسخی ثبت نشده است.</p>}<Button disabled={!ready} onClick={() => setStarted(true)}>شروع آزمون کامل</Button>{failed && <Button variant="outline" onClick={() => setRetry(r => r + 1)}>تلاش دوباره</Button>}{back}</section>;
  return <GameRunner items={session.sections.flatMap(s => s.questions.map(q => ({ q, kind: 'auto' as const })))} grade={null} term={null} scope={`assessment:${session.id}`} mode="boss_exam" exam nextHref={back} sections={session.sections.map(s => ({ title_en: s.title_en, questionIds: s.questions.map(q => q.id) }))} />;
}