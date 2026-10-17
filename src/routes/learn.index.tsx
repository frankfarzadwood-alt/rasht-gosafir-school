import { createFileRoute } from "@tanstack/react-router";
import { childrenOf } from "@/lib/learning";
import { NodeCard } from "@/components/LearningHub";
import { useBankVersion } from "@/lib/bank";
import { pageMeta } from "@/lib/pageMeta";
export const Route = createFileRoute("/learn/")({ head: () => pageMeta("یادگیری", "مسیرهای انگلیسی مدرسه، زبان عمومی و آیلتس."), component: Learn });
function Learn() {
  useBankVersion();
  return <div className="space-y-5"><header><h1 className="text-2xl font-extrabold text-primary">یادگیری</h1><p className="mt-2 text-sm text-muted-foreground">مسیر خودت را انتخاب کن</p></header><div className="grid gap-3">{childrenOf(null).map(n => <NodeCard key={n.id} node={n} />)}</div></div>;
}