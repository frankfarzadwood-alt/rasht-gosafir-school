import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { CataloguePage } from "@/components/LearningHub";
import { bookmark, nodeById, nodeTitle, rememberCourse } from "@/lib/learning";
import { pageMeta } from "@/lib/pageMeta";
export const Route = createFileRoute("/learn/$nodeId")({
  validateSearch: (s: Record<string, unknown>) => ({ view: typeof s["view"] === "string" ? s["view"] : "units" }),
  beforeLoad: ({ params }) => { if (!nodeById(params.nodeId)) throw notFound(); },
  head: ({ params }) => {
    const node = nodeById(params.nodeId);
    return pageMeta(node ? nodeTitle(node) : "بخش یادگیری", "درس‌ها، تمرین و پیشرفت واقعی این بخش از فهرست دوره‌های انگلیسی.");
  },
  component: NodePage,
});
function NodePage() {
  const { nodeId } = Route.useParams(); const { view } = Route.useSearch();
  const node = nodeById(nodeId);
  useEffect(() => { if (node && ["book", "term", "unit", "subunit"].includes(node.kind)) rememberCourse(bookmark(node.id)); }, [node]);
  if (!node) return null;
  return <CataloguePage node={node} view={["units", "practice", "progress"].includes(view) ? view : "units"} />;
}