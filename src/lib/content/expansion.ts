import manifest from '@/data/expansion/manifest.json';
import coverage from '@/data/expansion/coverage.summary.json';
import type { QuestionPack } from './contracts';
export { EXERCISE_HOLDS } from './reviewHolds';
const files = import.meta.glob<string>('../../data/expansion/*.pack.json', { query: '?raw', import: 'default', eager: true });
const packs = manifest.books.map(book => JSON.parse(files[`../../data/expansion/${book}.pack.json`]!) as QuestionPack);
export const EXPANSION: QuestionPack = { ...packs[0]!, pack_id: 'english-quest-exercise-expansion-r2', release_id: manifest.release_id, questions: packs.flatMap(p => p.questions), contexts: [], assets: [], sources: [], vocabulary_entries: [], assessments: [], id_aliases: {} };
export type ExerciseCoverage = { inspected: number; converted: number; partial: number; pending: number; self_review: number; new_questions: number; previous_questions: number };
const rows = coverage as unknown as Record<string,Partial<ExerciseCoverage>>;
export function exerciseCoverage(nodeId: string): ExerciseCoverage {
 const total: ExerciseCoverage={ inspected:0, converted:0, partial:0, pending:0, self_review:0, new_questions:0, previous_questions:0 };
 for(const [id,row] of Object.entries(rows)) if(id===nodeId || id.startsWith(nodeId+'.')) for(const k of Object.keys(total) as (keyof ExerciseCoverage)[]) total[k]+=row[k]??0;
 return total;
}
