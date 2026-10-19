import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { bookmark, remember } from "@/lib/learning";
import { schoolTrackNode } from "@/lib/content/school";
import { BackLink } from "@/components/GameRunner";
import { GameSession } from "@/components/GameSession";
import { MODES, trackQuestions, missions, modeAvailability, useBankVersion } from "@/lib/bank";
import { useHydrated, update } from "@/lib/progress";
import { gradeLabel, termLabel } from "@/lib/fa";

type Search = { mission?: string | undefined };
export const Route = createFileRoute("/play/$grade/$term/$mode")({
  validateSearch: (s: Record<string, unknown>): Search => ({ mission: typeof s["mission"] === "string" ? s["mission"] : undefined }),
  beforeLoad: ({ params }) => {
    if (![7, 8, 9, 10, 11, 12].includes(+params.grade) || ![1, 2].includes(+params.term)) throw notFound();
  },
  head: ({ params }) => {
    const m = MODES.find((x) => x.id === params.mode)?.fa ?? "مرور اشتباهات";
    return {
      meta: [
        { title: `${m} · ${gradeLabel(+params.grade)} ${termLabel(+params.term)}` },
        { name: "description", content: `بازی ${m} با سؤال‌های تأییدشدهٔ امتحان انگلیسی.` },
        { property: "og:title", content: `${m} — ماجراجویی انگلیسی` },
        { property: "og:description", content: "تمرین امتحان انگلیسی با بازی." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Play,
});

function Play() {
  const { grade: gs, term: ts, mode } = Route.useParams();
  const { mission } = Route.useSearch();
  const grade = +gs, term = +ts;
  const hydrated = useHydrated();
  const bankV = useBankVersion();
  const info = MODES.find((m) => m.id === mode);
  useEffect(() => {
    const id = schoolTrackNode(grade, term);
    if (id) remember(bookmark(id, mode, mission));
    update(s => s.grade === grade && s.term === term ? s : ({ ...s, grade, term }));
  }, [grade, term, mode, mission]);
  const title = info?.fa ?? "مرور اشتباهات";
  const track = useMemo(() => trackQuestions(grade, term), [grade, term, bankV]);
  const header = (
    <header className="mb-4 flex items-center justify-between gap-2">
      <div>
        <h1 className="text-xl font-extrabold">{info?.icon ?? "🔁"} {title}</h1>
        <p className="text-sm font-bold text-teal">{gradeLabel(grade)} · {termLabel(term)}</p>
      </div>
      <Link to="/track/$grade/$term" params={{ grade: gs, term: ts }} className="btn border border-border text-sm">خروج</Link>
    </header>
  );
  if (!hydrated) return header;
  return <div>{header}
    <GameSession key={`${mode}|${mission ?? ""}`} mode={mode} pool={track} avail={modeAvailability(grade, term)} missions={missions(grade, term)} missionId={mission}
      grade={grade} term={term} back={<BackLink grade={grade} term={term} />}
      missionLink={(id) => <Link to="/play/$grade/$term/$mode" params={{ grade: gs, term: ts, mode: "quest_trail" }} search={{ mission: id }} className="btn bg-primary text-primary-foreground">مأموریت بعدی ←</Link>} />
  </div>;
}
