/**
 * Compatibility layer: the bundled school release (legacy schema 1.0.0) seen through the 2.0.0 contract.
 * Current routes/games keep using src/lib/bank.ts; these selectors address the same content by catalogue node.
 * Not imported by learner routes in this stage, so the catalogue metadata stays out of the student bundle.
 */
import raw from "@/data/bank.json";
import catalogueRaw from "@/data/foundation/catalogue.json";
import planRaw from "@/data/foundation/assessment_plan.json";
import type { AssessmentPlan, Catalogue, LegacyPack, QuestionPack, Scope } from "./contracts";
import { adaptLegacySchoolPack, indexCatalogue, schoolTrackMap } from "./core";
import { createRepository, type ContentRepository } from "./repository";

export const CATALOGUE = catalogueRaw as unknown as Catalogue;
export const ASSESSMENT_PLAN = planRaw as unknown as AssessmentPlan;
/** Managed revision of the bundled reviewed school release (the original 308 baseline is revision 1). */
export const SCHOOL_RELEASE_REVISION = 2;

let cache: { pack: QuestionPack; repo: ContentRepository } | null = null;
export function schoolContent() {
  if (cache) return cache;
  const pack = adaptLegacySchoolPack(raw as unknown as LegacyPack, CATALOGUE,
    { questionRevision: SCHOOL_RELEASE_REVISION, contentRevision: SCHOOL_RELEASE_REVISION, packId: "school" });
  cache = { pack, repo: createRepository(CATALOGUE, [pack], ASSESSMENT_PLAN.assessments) };
  return cache;
}

const TRACKS = schoolTrackMap(indexCatalogue(CATALOGUE));
export const schoolTrackNode = (grade: number, term: number) => TRACKS.get(`${grade}/${term}`) ?? null;
export const trackScope = (grade: number, term: number): Scope => {
  const id = schoolTrackNode(grade, term);
  if (!id) throw new Error(`Unknown school track ${grade}/${term}`);
  return { kind: "node", node_ids: [id], include_descendants: true };
};
