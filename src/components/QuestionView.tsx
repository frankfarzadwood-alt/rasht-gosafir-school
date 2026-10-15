import { useMemo, useState } from "react";
import { learnerInstruction } from "@/lib/display";
import { useId } from "react";
import { type Question, gradeChoice, isAccepted, isChoice, shuffle, letterPool, correctText } from "@/lib/bank";

export type Kind = "auto" | "chips" | "letters" | "tokens";
export type Item = { q: Question; kind: Kind; pool?: string[] };

export function En({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span dir="ltr" lang="en" className={`en inline-block text-left ${className}`}>{children}</span>;
}

function Prompt({ text, fill }: { text: string; fill?: string | null }) {
  if (fill === undefined) return <p dir="ltr" lang="en" className="en text-left text-xl font-semibold leading-relaxed">{text}</p>;
  const parts = text.split(/_{2,}/);
  return (
    <p dir="ltr" lang="en" className="en text-left text-xl font-semibold leading-relaxed">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-20 rounded-lg border-b-4 border-teal bg-accent px-2 text-center text-accent-foreground">
              {i === 0 && fill ? fill : "\u00a0"}
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

export function hintFor(q: Question, kind: Kind) {
  if (q.hint_fa) return q.hint_fa;
  if (kind === "letters" || q.format === "spelling") return `حرف اول کلمه: «${(q.answer.value ?? "")[0] ?? ""}»`;
  if (q.format === "word_form") return "به کلمهٔ داخل پرانتز و جای آن در جمله دقت کن: اسم، صفت، فعل یا قید؟";
  if (q.format === "reorder_words") return "اول فاعل را پیدا کن، بعد فعل را.";
  if (q.skill === "grammar") return "به فاعل، زمان جمله و کلمه‌های نشانه دقت کن.";
  if (q.format === "odd_one_out") return "دنبال گروهی بگرد که سه کلمه در آن مشترک‌اند.";
  return "جمله را کامل بخوان و معنی کلی آن را در نظر بگیر.";
}

type Props = { item: Item; mode?: string; locked: boolean; onSubmit: (response: string, correct: boolean) => void };

export function QuestionView({ item, mode, locked, onSubmit }: Props) {
  const { q, kind } = item;
  const ins = learnerInstruction(q, mode);
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">{ins.fa ?? <En>{ins.en}</En>}</p>
      {kind === "chips" ? <ChipGap key={q.id} item={item} locked={locked} onSubmit={onSubmit} />
        : kind === "letters" ? <Builder key={q.id} q={q} tiles={(q as { letter_pool?: string[] }).letter_pool?.length ? (q as { letter_pool?: string[] }).letter_pool! : letterPool(q.answer.value ?? "")} joiner="" locked={locked} onSubmit={onSubmit} clue />
        : kind === "tokens" || q.format === "reorder_words" ? <Builder key={q.id} q={q} tiles={shuffle(q.reorder_tokens ?? [])} joiner=" " locked={locked} onSubmit={onSubmit} />
        : q.format === "matching" ? <PairsInline key={q.id} q={q} locked={locked} onSubmit={onSubmit} />
        : isChoice(q) ? <Choices key={q.id} q={q} locked={locked} onSubmit={onSubmit} />
        : <Typed key={q.id} q={q} locked={locked} onSubmit={onSubmit} />}
    </div>
  );
}

function Choices({ q, locked, onSubmit }: { q: Question; locked: boolean; onSubmit: Props["onSubmit"] }) {
  const opts = useMemo(() => shuffle(q.options), [q.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      {q.prompt_en && <Prompt text={q.prompt_en} />}
      <div role="radiogroup" aria-label="گزینه‌ها" className="grid gap-3 sm:grid-cols-2" dir="ltr">
        {opts.map((o) => {
          const state = locked && picked ? (o.id === q.answer.correct_option_id ? "border-success bg-success/10" : o.id === picked ? "border-destructive bg-destructive/10" : "") : picked === o.id ? "border-primary bg-secondary" : "";
          return (
            <button key={o.id} role="radio" aria-checked={picked === o.id} disabled={locked}
              onClick={() => { setPicked(o.id); onSubmit(o.text, gradeChoice(q, o.id)); }}
              className={`chip en text-left text-lg ${state}`} lang="en">
              {o.text}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Typed({ q, locked, onSubmit }: { q: Question; locked: boolean; onSubmit: Props["onSubmit"] }) {
  const [v, setV] = useState("");
  const id = useId();
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSubmit(v, isAccepted(q, v)); }}>
      {q.prompt_en && <Prompt text={q.prompt_en} />}
      <label htmlFor={id} className="block text-sm font-bold">پاسخ انگلیسی</label>
      <input id={id} autoFocus dir="ltr" lang="en" value={v} maxLength={120} disabled={locked} autoComplete="off" spellCheck={false}
        onChange={(e) => setV(e.target.value)}
        className="en h-12 w-full rounded-xl border-2 border-input bg-card px-4 text-left text-lg focus:border-primary focus:outline-none" />
      {!locked && <button className="btn w-full bg-primary text-primary-foreground" disabled={!v.trim()}>بررسی پاسخ</button>}
    </form>
  );
}

function ChipGap({ item, locked, onSubmit }: Props) {
  const { q } = item;
  const [fill, setFill] = useState<string | null>(null);
  return (
    <>
      <Prompt text={q.prompt_en ?? ""} fill={fill} />
      <div className="flex flex-wrap gap-2" dir="ltr" aria-label="بانک کلمات">
        {item.pool!.map((w) => (
          <button key={w} disabled={locked} aria-pressed={fill === w} onClick={() => setFill(w)}
            className={`chip en ${fill === w ? "border-primary bg-secondary" : ""}`} lang="en">{w}</button>
        ))}
      </div>
      {!locked && <button className="btn w-full bg-primary text-primary-foreground" disabled={!fill} onClick={() => fill && onSubmit(fill, isAccepted(q, fill))}>قرار بده و بررسی کن</button>}
    </>
  );
}

function Builder({ q, tiles, joiner, locked, onSubmit, clue }: { q: Question; tiles: string[]; joiner: string; locked: boolean; onSubmit: Props["onSubmit"]; clue?: boolean }) {
  const [init] = useState(() => tiles.map((t, i) => ({ t, i })));
  const [placed, setPlaced] = useState<number[]>([]);
  const left = init.filter((x) => !placed.includes(x.i));
  const text = placed.map((i) => init[i]!.t).join(joiner);
  return (
    <>
      {q.prompt_en && (clue ? <Prompt text={q.prompt_en} /> : <p dir="ltr" lang="en" className="en text-left text-sm text-muted-foreground">{q.prompt_en}</p>)}
      <div dir="ltr" aria-live="polite" aria-label="پاسخ ساخته‌شده" className="flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-teal bg-accent/40 p-3">
        {placed.length === 0 && <span className="text-sm text-muted-foreground" dir="rtl">روی کارت‌ها بزن تا اینجا قرار بگیرند</span>}
        {placed.map((i, k) => (
          <button key={k} disabled={locked} onClick={() => setPlaced(placed.filter((p) => p !== i))} aria-label={`برداشتن ${init[i]!.t}`}
            className="chip en border-primary bg-secondary" lang="en">{init[i]!.t}</button>
        ))}
      </div>
      <div dir="ltr" className="flex flex-wrap gap-2">
        {left.map((x) => (
          <button key={x.i} disabled={locked} onClick={() => setPlaced([...placed, x.i])} className="chip en min-w-11" lang="en">{x.t}</button>
        ))}
      </div>
      {!locked && (
        <div className="flex gap-2">
          <button className="btn border border-border" onClick={() => setPlaced(placed.slice(0, -1))} disabled={!placed.length}>↩ برگرداندن</button>
          <button className="btn flex-1 bg-primary text-primary-foreground" disabled={left.length > 0}
            onClick={() => onSubmit(text, joiner === "" ? isAccepted(q, text) : isAccepted(q, text))}>بررسی</button>
        </div>
      )}
    </>
  );
}

function PairsInline({ q, locked, onSubmit }: { q: Question; locked: boolean; onSubmit: Props["onSubmit"] }) {
  const pairs = q.pairs ?? [];
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [q.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sel, setSel] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, string>>({});
  const done = Object.keys(map).length === pairs.length;
  return (
    <>
      <Prompt text={q.prompt_en ?? ""} />
      <div className="grid grid-cols-2 gap-3" dir="ltr">
        <div className="space-y-2">{pairs.map((p) => (
          <button key={p.left} disabled={locked} aria-pressed={sel === p.left} onClick={() => setSel(p.left)}
            className={`chip en w-full text-left ${sel === p.left ? "border-primary bg-secondary" : ""}`}>{p.left}{map[p.left] && <span className="text-teal"> → {map[p.left]}</span>}</button>
        ))}</div>
        <div className="space-y-2">{rights.map((r) => (
          <button key={r} disabled={locked || !sel || Object.values(map).includes(r)} onClick={() => { if (sel) { setMap({ ...map, [sel]: r }); setSel(null); } }}
            className="chip en w-full text-left">{r}</button>
        ))}</div>
      </div>
      {!locked && <button className="btn w-full bg-primary text-primary-foreground" disabled={!done}
        onClick={() => onSubmit(pairs.map((p) => `${p.left} -> ${map[p.left]}`).join("; "), pairs.every((p) => map[p.left] === p.right))}>بررسی</button>}
    </>
  );
}

export { correctText };
