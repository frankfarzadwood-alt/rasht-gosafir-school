import { useMemo, useRef, useState } from "react";
import { type PairCard, shuffle } from "@/lib/bank";
import { recordAttempt } from "@/lib/progress";
import { fa } from "@/lib/fa";
import { Stat } from "./GameRunner";

function log(c: PairCard, correct: boolean, grade: number, term: number, mode: string, ms: number) {
  recordAttempt({ qid: c.key.split("#")[0]!, canonical: c.qid, grade, term, mode, correct, hinted: false, retry: false, ms, response: c.answer }, "vocabulary");
}

export function MatchArena({ set, grade, term, footer }: { set: PairCard[]; grade: number; term: number; footer: React.ReactNode }) {
  const rights = useMemo(() => shuffle(set), [set]);
  const [sel, setSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const t0 = useRef(Date.now());
  const pick = (r: PairCard) => {
    if (!sel) return;
    const clue = set.find((s) => s.key === sel)!;
    if (r.key === sel) {
      setMatched((m) => [...m, sel]);
      log(clue, !missed.includes(sel), grade, term, "match_arena", Date.now() - t0.current);
      setSel(null);
    } else {
      setMissed((m) => (m.includes(sel) ? m : [...m, sel]));
      setFlash(r.key); setTimeout(() => setFlash(null), 500);
    }
  };
  if (matched.length === set.length) {
    return (
      <section className="card-soft space-y-4 p-5">
        <h2 className="text-2xl font-extrabold">همه وصل شدند! 🔗</h2>
        <Stat label="درست در اولین تلاش" value={`${fa(set.length - missed.length)} از ${fa(set.length)}`} />
        {footer}
      </section>
    );
  }
  return (
    <section className="card-soft p-4">
      <p className="mb-3 text-sm text-muted-foreground">اول یک سرنخ را انتخاب کن، بعد جوابش را.</p>
      <div className="grid gap-3 sm:grid-cols-2" dir="ltr">
        <div className="space-y-2">{set.map((c) => (
          <button key={c.key} disabled={matched.includes(c.key)} aria-pressed={sel === c.key} onClick={() => setSel(c.key)}
            className={`chip en w-full text-left text-sm ${sel === c.key ? "border-primary bg-secondary" : ""} ${matched.includes(c.key) ? "border-success opacity-60" : ""}`}>{c.clue}</button>
        ))}</div>
        <div className="space-y-2">{rights.map((c) => (
          <button key={c.key} disabled={matched.includes(c.key) || !sel} onClick={() => pick(c)}
            className={`chip en w-full text-left ${flash === c.key ? "border-destructive bg-destructive/10" : ""} ${matched.includes(c.key) ? "border-success opacity-60" : ""}`}>{c.answer}</button>
        ))}</div>
      </div>
    </section>
  );
}

export function MemoryPairs({ set, grade, term, footer }: { set: PairCard[]; grade: number; term: number; footer: React.ReactNode }) {
  const cards = useMemo(() => shuffle(set.flatMap((c) => [{ id: c.key + "|c", key: c.key, text: c.clue, side: "سرنخ" }, { id: c.key + "|a", key: c.key, text: c.answer, side: "جواب" }])), [set]);
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [missedKeys, setMissedKeys] = useState<string[]>([]);
  const t0 = useRef(Date.now());
  const [end, setEnd] = useState<number | null>(null);
  const flip = (id: string) => {
    if (open.length === 2 || open.includes(id)) return;
    const nextOpen = [...open, id];
    setOpen(nextOpen);
    if (nextOpen.length === 2) {
      const [a, b] = nextOpen.map((x) => cards.find((c) => c.id === x)!) as [typeof cards[number], typeof cards[number]];
      if (a.key === b.key) {
        const pc = set.find((s) => s.key === a.key)!;
        log(pc, !missedKeys.includes(a.key), grade, term, "memory_pairs", Date.now() - t0.current);
        const f = [...found, a.key];
        setFound(f); setOpen([]);
        if (f.length === set.length) setEnd(Date.now());
      } else {
        // only count as a mistake when the card had been seen before (true recall failure)
        if (seen.includes(a.id) || seen.includes(b.id)) { setMistakes((m) => m + 1); setMissedKeys((k) => [...k, a.key, b.key]); }
        setTimeout(() => setOpen([]), 900);
      }
      setSeen((s) => [...new Set([...s, a.id, b.id])]);
    }
  };
  if (end) {
    return (
      <section className="card-soft space-y-4 p-5">
        <h2 className="text-2xl font-extrabold">حافظهٔ قوی! 🃏</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="دقت جفت‌سازی" value={`${fa(Math.round((set.length / (set.length + mistakes)) * 100))}٪`} />
          <Stat label="سرعت یادآوری (جدا از دقت)" value={`${fa(Math.round((end - t0.current) / 1000))} ثانیه`} />
        </div>
        {footer}
      </section>
    );
  }
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" dir="ltr">
      {cards.map((c) => {
        const up = open.includes(c.id) || found.includes(c.key);
        return (
          <button key={c.id} onClick={() => flip(c.id)} disabled={found.includes(c.key)} aria-label={up ? `${c.side}: ${c.text}` : "کارت بسته"}
            className={`min-h-28 rounded-2xl border-2 p-3 text-sm font-semibold transition ${up ? "en border-teal bg-card text-left" : "border-primary bg-primary text-primary-foreground"} ${found.includes(c.key) ? "opacity-60" : ""}`}>
            {up ? <><span className="block text-xs text-muted-foreground" dir="rtl">{c.side}</span>{c.text}</> : "?"}
          </button>
        );
      })}
    </section>
  );
}
