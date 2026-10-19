import { useState, type ReactNode } from 'react';
import { Button } from './ui/button';
import { shuffle, type FlashcardItem } from '@/lib/bank';
import { fa } from '@/lib/fa';

/** Self-assessment only. This component deliberately has no learner-progress/reward writes. */
export function Flashcards({ cards, seed, back }: { cards: FlashcardItem[]; seed: number; back: ReactNode }) {
  const [reverse, setReverse] = useState(false);
  const [deck, setDeck] = useState<FlashcardItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 'again' | 'known'>>({});
  const card = deck?.[index];
  const begin = (items: FlashcardItem[]) => { setDeck(items); setIndex(0); setFlipped(false); };
  const rate = (rating: 'again' | 'known') => {
    if (!card || !flipped) return;
    setRatings(previous => ({ ...previous, [card.id]: rating }));
    setIndex(i => i + 1); setFlipped(false);
  };
  const again = cards.filter(c => ratings[c.id] === 'again');
  const known = Object.values(ratings).filter(r => r === 'known').length;
  return <section className="card-soft space-y-4 p-5" aria-label="فلش‌کارت واژگان">
    <p className="text-sm text-muted-foreground">این مرور با ارزیابی خودت انجام می‌شود؛ امتیاز، تسلط و نتیجهٔ آزمون را تغییر نمی‌دهد. ارزیابی‌ها فقط در همین نوبت نگه داشته می‌شوند.</p>
    {!deck ? <>
      <p>{fa(cards.length)} کارت واژه و معنی در این محدوده آماده است.</p>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={reverse} onChange={e => setReverse(e.target.checked)} />معنی ← یادآوری واژه</label>
      <div className="flex flex-wrap gap-3">
        {cards.length > 12 && <Button onClick={() => begin(shuffle(cards, seed).slice(0, 12))}>مرور کوتاه: ۱۲ کارت</Button>}
        <Button onClick={() => begin(shuffle(cards, seed))}>مرور همهٔ کارت‌ها</Button>
      </div>{back}
    </> : card ? <>
      <p role="status">کارت {fa(index + 1)} از {fa(deck.length)}</p>
      <button className="w-full rounded-2xl border-2 border-primary bg-accent/40 p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        aria-label={flipped ? 'کارت برگشته است' : reverse ? 'نمایش واژه' : 'نمایش معنی'} aria-expanded={flipped} onClick={() => setFlipped(f => !f)}>
        <span className="mb-3 block text-sm text-muted-foreground">{flipped ? (reverse ? 'واژه' : 'معنی') : (reverse ? 'معنی' : 'واژه')}</span>
        <span dir="ltr" lang="en" className="en block break-words text-2xl font-bold leading-relaxed">{flipped ? (reverse ? card.lemma : card.meaning) : (reverse ? card.meaning : card.lemma)}</span>
        {!flipped && <span className="mt-4 block text-sm">برای دیدن پاسخ روی کارت بزن</span>}
      </button>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={!flipped} onClick={() => rate('again')}>نیاز به تمرین دارم</Button>
        <Button disabled={!flipped} onClick={() => rate('known')}>بلد بودم</Button>
      </div>{back}
    </> : <>
      <h2 className="text-xl font-bold">مرور این نوبت تمام شد</h2>
      <p>ارزیابی خودت: {fa(known)} واژه را بلد بودی؛ {fa(again.length)} واژه به تمرین بیشتر نیاز دارد.</p>
      {again.length > 0 && <Button onClick={() => begin(again)}>مرور کارت‌های نیازمند تمرین</Button>}
      <Button variant="outline" onClick={() => { setDeck(null); setRatings({}); }}>یک نوبت تازه</Button>{back}
    </>}
  </section>;
}
