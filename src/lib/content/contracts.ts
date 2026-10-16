/**
 * Content contract 2.0.0 (see foundation.schema.json in the English_Quest_Foundation package).
 * Storage-independent types. Grade/term are optional on canonical questions: book content has none.
 */
export type NodeKind = "category" | "series" | "book" | "grade" | "term" | "unit" | "subunit";
export interface CatalogueNode {
  id: string; kind: NodeKind; parent_id: string | null;
  title_en: string; title_fa: string; ordinal: number | null; edition_id: string | null;
  availability?: string; structure_status?: string; source_label?: string | null;
  grade?: number; term?: 1 | 2; known_reference_question_count?: number;
  [key: string]: unknown;
}
export interface Catalogue { schema_version: "2.0.0"; kind: "catalogue"; nodes: CatalogueNode[]; [key: string]: unknown }

export interface Placement { node_id: string; relation: "primary" | "supplementary" }
export interface Answer {
  value: string | null; correct_option_id: string | null; accepted_answers: string[];
  provenance: string; verification_status: string; normalization?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface Assets { source_image_required: boolean; source_audio_required: boolean; image?: unknown; audio?: unknown; required_asset_ids?: string[] }
export interface LegacyQuestion {
  id: string; canonical_id: string; grade: number; term: number; source_id: string;
  skill: string; format: string; granularity: string; prompt_en: string | null;
  options: { id: string; text: string }[]; answer: Answer; context_id: string | null;
  assets: Assets; review_status: string; eligible_games: string[];
  source: { pages: number[]; pdf_url?: string | null; [key: string]: unknown };
  [key: string]: unknown;
}
export interface Question extends Omit<LegacyQuestion, "grade" | "term"> {
  grade?: number; term?: number; revision: number; placements: Placement[];
}
export interface Context { id: string; kind: string; text: string | null; review_status: string; [key: string]: unknown }
export interface Asset { id: string; kind: string; path: string; sha256: string; review_status: string; [key: string]: unknown }
export interface Assessment {
  id: string; anchor_node_id: string; title_en: string; status: string;
  coverage_node_ids: string[]; question_ids: string[];
  time_limit_seconds?: number | null; official_max_marks?: number | null; [key: string]: unknown;
}
export interface AssessmentPlan { schema_version: "2.0.0"; kind: "assessment_plan"; assessments: Assessment[]; [key: string]: unknown }
export interface Alignment {
  id: string; from_node_id: string; to_node_id: string;
  relationship: "substantial_overlap" | "partial_overlap" | "extension";
  review_status: string; [key: string]: unknown;
}
export interface AlignmentPack { schema_version: "2.0.0"; kind: "alignment_pack"; alignments: Alignment[]; [key: string]: unknown }

export interface LegacyPack {
  schema_version: "1.0.0"; release_id?: string; questions: LegacyQuestion[];
  contexts?: Context[]; sources?: Record<string, unknown>[]; id_aliases?: Record<string, string>;
  [key: string]: unknown;
}
export interface QuestionPack {
  schema_version: "2.0.0"; kind: "question_pack"; pack_id: string; release_id: string;
  content_revision: number; questions: Question[]; contexts: Context[];
  sources: Record<string, unknown>[]; assets: Asset[];
  vocabulary_entries: Record<string, unknown>[]; assessments: Assessment[];
  id_aliases: Record<string, string>;
}
/** Where practice draws from. Separate from location (catalogue node) and game mode. */
export interface Scope {
  kind: "node" | "custom" | "through_unit" | "assessment";
  node_ids: string[]; include_descendants: boolean;
  through_unit_id?: string | null; assessment_id?: string | null;
  skills?: string[]; question_ids?: string[];
}
