import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { GameSession } from "@/components/GameSession";
import { MODES, poolAvailability, poolMissions, useBankVersion } from "@/lib/bank";
import { useHydrated } from "@/lib/progress";
import { bookmark, nodeById, nodeTitle, practiceScope, remember, scopeKey, scopeQuestions } from "@/lib/learning";
import { PRACTICE_FA, type PracticeModeId } from "@/lib/scope";
import { pageMeta } from "@/lib/pageMeta";

type Search = { scope: string; units?: string | undefined; mission?: string | undefined };
export const Route = createFileRoute("/practice/$nodeId/$mode")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    scope: typeof s["scope"] === "string" ? s["scope"] : "",
    units: typeof s["units"] === "string" ? s["units"] : undefined,
    mission: typeof s["mission"] === "string" ? s["mission"] : undefined,
  }),
  beforeLoad: ({ params }) => { if (!nodeById(params.nodeId)) throw notFound(); },
  head: ({ params }) => {
    const n = nodeById(params.nodeId);
    const m = MODES.find((x) => x.id === params.mode)?.fa ?? "مرور اشتباهات";
    return pageMeta(`${m} · ${n ? nodeTitle(n) : "تمرین"}`, "تمرین با سؤال‌های تأییدشدهٔ همین بخش از کتاب.");
  },
  component: Practice,
});

function Practice() {
  const { nodeId, mode } = Route.useParams();
  const { scope: practice, units, mission } = Route.useSearch();
  const hydrated = useHydrated();
  const bankV = useBankVersion();
  const node = nodeById(nodeId)!;
  const custom = units ? units.split(",").filter(Boolean) : [];
  const built = useMemo(() => {
    try {
      const scope = practiceScope(practice as PracticeModeId, nodeId, custom);
      return { ok: true as const, pool: scopeQuestions(scope) };
    } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, nodeId, units, bankV]);
  useEffect(() => {
    if (built.ok) remember(bookmark(nodeId, mode, mission, { mode: practice as PracticeModeId, custom }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built.ok, nodeId, mode, mission, practice, units]);
  const info = MODES.find((m) => m.id === mode);
  const back = <Link to="/learn/$nodeId" params={{ nodeId }} search={{ view: "practice" }} className="btn bg-primary text-primary-foreground">بازگشت به تمرین‌ها</Link>;
  const header = (
    <header className="mb-4 flex items-center justify-between gap-2">
      <div>
        <h1 className="text-xl font-extrabold">{info?.icon ?? "🔁"} {info?.fa ?? "مرور اشتباهات"}</h1>
        <p className="text-sm font-bold text-teal">{nodeTitle(node)} · {PRACTICE_FA[practice as PracticeModeId] ?? "؟"}</p>
      </div>
      <Link to="/learn/$nodeId" params={{ nodeId }} search={{ view: "practice" }} className="btn border border-border text-sm">خروج</Link>
    </header>
  );
  if (!hydrated) return header;
  if (!built.ok) return <div>{header}<section role="alert" className="card-soft space-y-3 p-5"><p>این محدودهٔ تمرین معتبر نیست.</p><p dir="ltr" lang="en" className="text-xs text-muted-foreground">{built.error}</p>{back}</section></div>;
  const key = scopeKey(practice, nodeId, custom);
  const ms = poolMissions(key, built.pool);
  return <div>{header}
    <GameSession key={`${key}|${mode}|${mission ?? ""}`} mode={mode} pool={built.pool} avail={poolAvailability(built.pool, ms.length)} missions={ms} missionId={mission}
      grade={null} term={null} scope={key} back={back}
      missionLink={(id) => <Link to="/practice/$nodeId/$mode" params={{ nodeId, mode: "quest_trail" }} search={{ scope: practice, units, mission: id }} className="btn bg-primary text-primary-foreground">مأموریت بعدی ←</Link>} />
  </div>;
}
