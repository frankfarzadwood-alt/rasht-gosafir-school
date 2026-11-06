import { createFileRoute } from "@tanstack/react-router";
import { childrenOf } from "@/lib/learning";
import { NodeCard } from "@/components/LearningHub";
import { useBankVersion } from "@/lib/bank";
import { pageMeta } from "@/lib/pageMeta";
import { Gamepad2, Sparkles, Star } from "lucide-react";
export const Route = createFileRoute("/learn/")({ head: () => pageMeta("یادگیری", "مسیرهای انگلیسی مدرسه، زبان عمومی و آیلتس."), component: Learn });
function Learn() {
  useBankVersion();
  return <div className="space-y-6"><header className="quest-hero flex items-center justify-between gap-3"><div className="relative z-10"><span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-4 w-4" aria-hidden />بخون، بازی کن، پیشرفت کن</span><h1 className="text-2xl font-extrabold text-primary sm:text-3xl">انتخاب محتوا</h1><p className="mt-2 text-sm text-muted-foreground">کتابت را بردار؛ ماجراجویی از همین‌جا شروع می‌شود!</p></div><div aria-hidden className="quest-emblem hidden shrink-0 items-center justify-center sm:flex"><Gamepad2 className="h-14 w-14" strokeWidth={1.8} /><Star className="quest-star h-6 w-6 fill-gold text-gold" /></div></header><div className="grid gap-4">{childrenOf(null).map(n => <NodeCard key={n.id} node={n} />)}</div></div>;
}
