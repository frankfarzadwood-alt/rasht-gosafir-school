import { createFileRoute, Link } from "@tanstack/react-router";
import { GameChoices, NodeCard } from "@/components/LearningHub";
import { useProgress, useHydrated } from "@/lib/progress";
import { childrenOf, legacyBookmark, nodeById, restoreBookmark, useLearning, courseTitle } from "@/lib/learning";
import { pageMeta } from "@/lib/pageMeta";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/games")({ head: () => pageMeta("بازی‌ها", "بازی‌های انگلیسی در مسیر انتخاب‌شده با سؤال‌های تأییدشده."), component: Games });
function Games() {
  const p = useProgress(), l = useLearning(), hydrated = useHydrated();
  const b = restoreBookmark(l.current) ?? legacyBookmark(p), node = b ? nodeById(b.nodeId) : null;
  if (!hydrated) return null;
  return <div className="space-y-5"><header className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-2xl font-extrabold text-primary">بازی‌ها</h1>{b && <p className="mt-1 text-sm text-teal">{courseTitle(b)}</p>}</div><Button asChild variant="outline" className="btn"><Link to="/learn">انتخاب مسیر</Link></Button></header>{node ? <GameChoices node={node} /> : <div className="grid gap-3">{childrenOf(null).map(n => <NodeCard key={n.id} node={n} />)}</div>}</div>;
}