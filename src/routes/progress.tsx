import { createFileRoute } from "@tanstack/react-router";
import { useProgress, useHydrated, totalXp, badges } from "@/lib/progress";
import { useBankVersion } from "@/lib/bank";
import { childrenOf, nodeScope, scopeStats } from "@/lib/learning";
import { ScopeProgress } from "@/components/LearningHub";
import { fa } from "@/lib/fa";
import { pageMeta } from "@/lib/pageMeta";
export const Route = createFileRoute("/progress")({ head: () => pageMeta("پیشرفت", "پوشش تمرین، تسلط و نشان‌ها بر اساس پاسخ‌های ذخیره‌شده روی این دستگاه."), component: ProgressPage });
function ProgressPage() {
  const p = useProgress(); useBankVersion(); const hydrated = useHydrated();
  if (!hydrated) return null;
  const school = childrenOf(null).find(n => n.id === "school");
  const total = school ? scopeStats(nodeScope(school.id), p) : null;
  return <div className="space-y-6"><h1 className="text-2xl font-extrabold text-primary">پیشرفت من</h1><dl className="grid grid-cols-3 gap-2 border-y border-border py-5 text-center"><div><dt className="text-sm text-muted-foreground">امتیاز</dt><dd className="text-2xl font-extrabold text-primary">{fa(totalXp(p))}</dd></div><div><dt className="text-sm text-muted-foreground">پاسخ ثبت‌شده</dt><dd className="text-2xl font-extrabold">{fa(p.attempts.length)}</dd></div><div><dt className="text-sm text-muted-foreground">مسلط در انتشار فعلی</dt><dd className="text-2xl font-extrabold text-teal">{fa(total?.mastered ?? 0)}</dd></div></dl>{school && <ScopeProgress node={school} />}<section><h2 className="mb-3 text-lg font-extrabold">نشان‌های من</h2><ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{badges(p).map(b => <li key={b.id} className={`card-soft p-3 ${b.earned ? "bg-gold/20" : "text-muted-foreground"}`}><p className="font-bold">{b.earned ? "🏅" : "🔒"} {b.fa}</p><p className="text-xs">{b.rule}</p></li>)}</ul></section></div>;
}