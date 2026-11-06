import raw from '@/data/oxford/native.pack.json';
import overrides from '@/data/oxford/native.overrides.json';
import sections from '@/data/oxford/native.sections.json';
import coverage from '@/data/oxford/native.coverage.json';
import { OXFORD } from './oxford';
import type { Question, QuestionPack } from './contracts';

export const OXFORD_NATIVE = raw as unknown as QuestionPack;
export const OXFORD_NATIVE_COVERAGE = coverage;
export const OXFORD_SECTIONS = sections.sections;

/** Presentation revisions preserve source payloads, canonical identities and graded answers. */
export function nativeOxfordQuestion(q: Question): Question {
  if (!q.id.startsWith('ows.')) return q;
  const patch = (overrides as unknown as Record<string, Partial<Question>>)[q.id];
  const membership = (sections.membership as Record<string, string[]>)[q.id] ?? [];
  const placements = [...q.placements];
  for (const id of membership) if (!placements.some(p => p.node_id === id)) placements.push({ node_id: id, relation: 'supplementary' });
  const prompt = q.prompt_en?.replace(/^From this unit's word bank, which word or phrase means: /, 'Which word or phrase means: ').replace(/in the source (?:image|list)/g, 'in this activity') ?? null;
  return { ...q, ...patch, revision: q.revision + 1, placements, native_presentation: true, prompt_en: patch?.prompt_en ?? prompt };
}
export const NATIVE_OXFORD: QuestionPack = { ...OXFORD, questions: OXFORD.questions.map(nativeOxfordQuestion) };

export function oxfordSectionNode(unitNodeId: string, letter: string) {
  return OXFORD_SECTIONS.find(s => s.id.startsWith(`${unitNodeId}.`) && s.letter === letter)?.id;
}
