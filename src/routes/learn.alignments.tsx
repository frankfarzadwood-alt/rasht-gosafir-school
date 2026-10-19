import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { catalogueIndex, childrenOf, nodeById, nodeTitle } from "@/lib/learning";
import { ALIGNMENTS, recommendedAlignments } from "@/lib/scope";
import { pageMeta } from "@/lib/pageMeta";

type Search = { book?: string | undefined; unit?: string | undefined };
export const Route = createFileRoute("/learn/alignments")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    book: typeof s["book"] === "string" ? s["book"] : undefined,
    unit: typeof s["unit"] === "string" ? s["unit"] : undefined,
  }),
  head: () => pageMeta("ارتباط آکسفورد و ایوالو", "نقشهٔ دوطرفهٔ ارتباط درس‌های Oxford Word Skills و Evolve، فقط با ارتباط‌های بازبینی‌شده."),
  component: Alignments,
});
function Alignments() {
  const { book, unit } = Route.useSearch();
  const navigate = useNavigate({ from: "/learn/alignments" });
  const books = ["oxford", "evolve"].flatMap(id => childrenOf(id).filter(n => n.kind === "book"));
  const units = book ? childrenOf(book).filter(n => n.kind === "unit") : [];
  const edges = recommendedAlignments(ALIGNMENTS, catalogueIndex, { book, unit });
  return <div className="space-y-5">
    <nav className="text-sm"><Link to="/learn" className="btn px-2">یادگیری</Link></nav>
    <h1 className="text-2xl font-extrabold text-primary">ارتباط آکسفورد و ایوالو</h1>
    <p className="text-sm text-muted-foreground">ارتباط‌ها دوطرفه‌اند و فقط برای پیشنهاد مطالعه نشان داده می‌شوند؛ تکمیل یا تسلط از یک درس به درس دیگر منتقل نمی‌شود. سطح CEFR و سختی تمرین جدا از هم نگه داشته می‌شوند.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1"><span className="font-bold">کتاب</span><select className="h-12 w-full rounded-xl border border-input bg-card px-3" value={book ?? ""} onChange={e => navigate({ search: { book: e.target.value || undefined, unit: undefined } })}><option value="">همهٔ کتاب‌ها</option>{books.map(b => <option key={b.id} value={b.id}>{nodeTitle(b)} — {b.title_en}</option>)}</select></label>
      <label className="space-y-1"><span className="font-bold">درس</span><select className="h-12 w-full rounded-xl border border-input bg-card px-3" disabled={!book} value={unit ?? ""} onChange={e => navigate({ search: { book, unit: e.target.value || undefined } })}><option value="">همهٔ درس‌ها</option>{units.map(u => <option key={u.id} value={u.id}>{nodeTitle(u)}</option>)}</select></label>
    </div>
    {edges.length ? <ul className="space-y-2">{edges.map(e => { const from = nodeById(e.from_node_id)!, to = nodeById(e.to_node_id)!; return <li key={e.id} className="card-soft p-4"><span dir="ltr" lang="en">{from.title_en} ↔ {to.title_en}</span></li>; })}</ul>
      : <div role="status" className="space-y-2 border-r-4 border-gold bg-muted/50 p-4"><p className="font-bold">هنوز هیچ ارتباط بازبینی‌شده‌ای ثبت نشده است</p><p className="text-sm text-muted-foreground">ارتباط فقط وقتی نمایش داده می‌شود که ویرایش هر دو کتاب، هدف‌های مشترک و شواهد صفحهٔ منبع بازبینی شده باشد.</p></div>}
  </div>;
}
