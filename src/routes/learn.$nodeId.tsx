import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { CataloguePage } from "@/components/LearningHub";
import { ComingSoonPage } from "@/components/ComingSoon";
import { bookmark, childrenOf, comingSoonBook, nodeById, nodeTitle, rememberCourse } from "@/lib/learning";
import { pageMeta } from "@/lib/pageMeta";
type NodeSearch = { view: string; section?: string | undefined; from?: string | undefined };
export const Route = createFileRoute("/learn/$nodeId")({
  validateSearch: (s: Record<string, unknown>): NodeSearch => ({ view: typeof s["view"] === "string" ? s["view"] : "units", section: typeof s['section'] === 'string' && /^[A-Z]$/.test(s['section']) ? s['section'] : undefined, from: typeof s['from'] === 'string' && /^evolve-[1-6]\.u\d{3}$/.test(s['from']) ? s['from'] : undefined }),
  beforeLoad: ({ params }) => { if (!nodeById(params.nodeId)) throw notFound(); },
  head: ({ params }) => {
    const node = nodeById(params.nodeId);
    return pageMeta(node ? nodeTitle(node) : "بخش یادگیری", "درس‌ها، تمرین و پیشرفت واقعی این بخش از فهرست دوره‌های انگلیسی.");
  },
  component: NodeEntry,
});
function NodeEntry() {
  const { nodeId } = Route.useParams();
  const locked = comingSoonBook(nodeId);
  return locked ? <ComingSoonPage title={nodeTitle(locked)} /> : <NodePage />;
}
function NodePage() {
  const { nodeId } = Route.useParams(); const { view, section, from } = Route.useSearch();
  const requested=nodeById(nodeId);
  const sectionId=section?(requested?.kind==='subunit'&&requested.source_label===section?nodeId:childrenOf(nodeId).find(n=>n.kind==='subunit'&&n.source_label===section)?.id):undefined;
  const node = nodeById(sectionId ?? nodeId);
  useEffect(() => { if (node && ["book", "term", "unit", "subunit"].includes(node.kind)) rememberCourse(bookmark(node.id)); }, [node]);
  if (!node) return null;
  if(section&&!sectionId)return <section role="status" className="card-soft space-y-3 p-5"><p>تمرین آماده‌ای برای بخش <strong dir="ltr">{section}</strong> وجود ندارد.</p><Link to="/learn/$nodeId" params={{nodeId}} search={{view:'units'}} className="font-bold text-primary underline">بازگشت به درس</Link></section>;
  return <>{from && !comingSoonBook(from) && <aside className="mb-4 space-y-2 rounded-2xl bg-secondary p-4 text-sm">{sectionId && <p>پیشنهاد این درس Evolve: بخش <strong dir="ltr">{section}</strong>. بازی‌های پایین فقط همین بخش را تمرین می‌کنند.</p>}<Link to="/learn/$nodeId" params={{nodeId:from}} search={{view:'units'}} className="font-bold text-primary underline">بازگشت به درس Evolve</Link></aside>}<CataloguePage key={node.id} node={node} view={["units", "practice", "progress"].includes(view) ? view : "units"} /></>;
}
