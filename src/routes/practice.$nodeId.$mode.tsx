import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { GameSession } from "@/components/GameSession";
import { MODES, poolAvailability, poolMissions, useBankVersion } from "@/lib/bank";
import { useHydrated } from "@/lib/progress";
import { bookmark, nodeById, nodeTitle, practiceScope, remember, scopeKey, scopeQuestions, scopeActivities } from "@/lib/learning";
import { PRACTICE_FA, type PracticeModeId } from "@/lib/scope";
import { pageMeta } from "@/lib/pageMeta";
import { BOOK_CONTENT, LIVE_SELECTIONS, LIVE_CATALOGUE } from '@/lib/content/pilot';
import { assessmentSession, livePack } from '@/lib/scope';
import { contextById } from '@/lib/bank';
import { FixedAssessment } from '@/components/FixedAssessment';

import { SourceStudio } from '@/components/SourceStudio';
import type { Scope } from '@/lib/content/contracts';
type Search = { scope: string; units?: string | undefined; mission?: string | undefined; selection?: string | undefined; skills?: string | undefined; activity?: string | undefined };
export const Route = createFileRoute("/practice/$nodeId/$mode")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    scope: typeof s["scope"] === "string" ? s["scope"] : "",
    units: typeof s["units"] === "string" ? s["units"] : undefined,
    mission: typeof s["mission"] === "string" ? s["mission"] : undefined,
    selection: typeof s['selection'] === 'string' ? s['selection'] : undefined,
    activity: typeof s['activity'] === 'string' ? s['activity'] : undefined,
    skills: typeof s['skills'] === 'string' ? s['skills'] : undefined,
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
  const { scope: practice, units, mission, selection, skills, activity } = Route.useSearch();
  const hydrated = useHydrated();
  const bankV = useBankVersion();
  const node = nodeById(nodeId);
  const custom = units ? units.split(",").filter(Boolean) : [];
  const built = useMemo(() => {
    try {
      const selected = selection ? LIVE_SELECTIONS.find(s => s.id === selection && s.anchor_node_id === nodeId) : null;
      const fixed = selection ? BOOK_CONTENT.assessments.find(a => a.id === selection && a.anchor_node_id === nodeId) : null;
      if (selection && !selected && !fixed) throw new Error('Unknown selection for this section');
      if (fixed && skills) throw new Error('A fixed quiz cannot be shortened by skill filters');
      const base: Scope = fixed ? { kind: 'assessment', node_ids: [], include_descendants: false, assessment_id: fixed.id } : selected?.scope ?? practiceScope(practice as PracticeModeId, nodeId, custom);
      const scope = { ...base, ...(skills ? { skills: skills.split(',').filter(Boolean) } : {}) };
      return { ok: true as const, pool: fixed ? [] : scopeQuestions(scope), scope, fixed: fixed ? assessmentSession(livePack(LIVE_CATALOGUE, bankV), fixed, contextById) : null };
    } catch (e) { return { ok: false as const, error: (e as Error).message }; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, nodeId, units, bankV, selection, skills]);
  useEffect(() => {
    if (built.ok) remember({ ...bookmark(nodeId, mode, mission, { mode: practice as PracticeModeId, custom }), scope: built.scope, ...(selection ? { selection } : {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built.ok, nodeId, mode, mission, practice, units, selection, skills]);
  const info = MODES.find((m) => m.id === mode);
  const back = <Link to="/learn/$nodeId" params={{ nodeId }} search={{ view: "practice" }} className="btn bg-primary text-primary-foreground">بازگشت به تمرین‌ها</Link>;
  const header = (
    <header className="mb-4 flex items-center justify-between gap-2">
      <div>
        <h1 className="text-xl font-extrabold">{info?.icon ?? "🔁"} {info?.fa ?? "مرور اشتباهات"}</h1>
        <p className="text-sm font-bold text-teal">{node ? nodeTitle(node) : 'تمرین'} · {PRACTICE_FA[practice as PracticeModeId] ?? "؟"}</p>
      </div>
      <Link to="/learn/$nodeId" params={{ nodeId }} search={{ view: "practice" }} className="btn border border-border text-sm">خروج</Link>
    </header>
  );
  if (!hydrated) return header;
  if (!built.ok) return <div>{header}<section role="alert" className="card-soft space-y-3 p-5"><p>این محدودهٔ تمرین معتبر نیست.</p><p dir="ltr" lang="en" className="text-xs text-muted-foreground">{built.error}</p>{back}</section></div>;
  if (built.fixed) return <div>{header}<FixedAssessment key={selection} session={built.fixed} back={back} /></div>;
  const key = `${selection ?? scopeKey(practice, nodeId, custom)}${skills ? `:skills:${skills}` : ''}`;
  const ms = poolMissions(key, built.pool);
  if (mode === 'workbook' || mode === 'writing_studio') return <div>{header}<SourceStudio key={`${key}|${mode}|${activity ?? ''}`} initialId={activity} tasks={scopeActivities(built.scope)} writing={mode === 'writing_studio'} back={back} /></div>;
  return <div>{header}
    <GameSession key={`${key}|${mode}|${mission ?? ""}`} mode={mode} pool={built.pool} avail={poolAvailability(built.pool, ms.length)} missions={ms} missionId={mission}
      grade={null} term={null} scope={key} back={back}
      missionLink={(id) => <Link to="/practice/$nodeId/$mode" params={{ nodeId, mode: "quest_trail" }} search={{ scope: practice, units, mission: id, selection, skills }} className="btn bg-primary text-primary-foreground">مأموریت بعدی ←</Link>} />
  </div>;
}
