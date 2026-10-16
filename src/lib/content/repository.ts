/**
 * Read-only content repository. In-memory now; a future backend can implement the same interface.
 * Location (node), practice scope and game mode stay separate arguments.
 */
import type { Assessment, Catalogue, CatalogueNode, QuestionPack, Scope } from "./contracts";
import { indexCatalogue, selectQuestions, type CatalogueIndex } from "./core";

export type Availability = { ready: number; status: "playable" | "no_content_yet" };

export interface ContentRepository {
  node(id: string): CatalogueNode | null;
  children(id: string | null): CatalogueNode[];
  /** Ready canonical items for a scope, optionally intersected with a game. Throws for unknown nodes. */
  select(scope: Scope, gameId?: string): ReturnType<typeof selectQuestions>;
  /** Derived from compiled ready content only — never from catalogue expectations or assessment slots. */
  availability(nodeId: string): Availability;
  assessments(anchorNodeId: string): Assessment[];
}

export function createRepository(catalogue: Catalogue, packs: QuestionPack[], assessments: Assessment[] = []): ContentRepository {
  const ix: CatalogueIndex = indexCatalogue(catalogue);
  const merged: QuestionPack = {
    schema_version: "2.0.0", kind: "question_pack", pack_id: "merged", release_id: packs.map((p) => p.release_id).join("+"),
    content_revision: 1,
    questions: packs.flatMap((p) => p.questions), contexts: packs.flatMap((p) => p.contexts),
    sources: [], assets: packs.flatMap((p) => p.assets), vocabulary_entries: [],
    assessments: packs.flatMap((p) => p.assessments),
    id_aliases: Object.assign({}, ...packs.map((p) => p.id_aliases)),
  };
  const roots = catalogue.nodes.filter((n) => n.parent_id === null);
  const byOrd = (a: CatalogueNode, b: CatalogueNode) => (a.ordinal ?? 0) - (b.ordinal ?? 0);
  return {
    node: (id) => ix.nodes.get(id) ?? null,
    children: (id) => (id === null ? roots : (ix.children.get(id) ?? []).map((c) => ix.nodes.get(c)!)).slice().sort(byOrd),
    select: (scope, gameId) => selectQuestions(merged, ix, scope, gameId),
    availability: (nodeId) => {
      const ready = selectQuestions(merged, ix, { kind: "node", node_ids: [nodeId], include_descendants: true }).length;
      return { ready, status: ready ? "playable" : "no_content_yet" };
    },
    assessments: (anchor) => assessments.filter((a) => a.anchor_node_id === anchor),
  };
}
