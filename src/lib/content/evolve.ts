import raw from '@/data/evolve/native.pack.json';
import overrides from '@/data/evolve/native.overrides.json';
import mappings from '@/data/evolve/recommendations.json';
import targets from '@/data/evolve/learning-targets.json';
import type { Question, QuestionPack } from './contracts';

export const EVOLVE_NATIVE = raw as unknown as QuestionPack;
export const EVOLVE_RECOMMENDATIONS = mappings;
export const EVOLVE_TARGETS = targets;
export type NativeScene =
  | { kind:'data_chart';title:string;unit:string;values:{label:string;value:number}[];maximum?:number }
  | { kind: 'family' | 'preferences' | 'map' | 'room' }
  | { kind: 'quote'; text: string; focus: string }
  | { kind: 'clock'; hour: number; minute: number }
  | { kind: 'body_part'; part:'forehead'|'eye'|'nose'|'ear'|'neck'|'shoulder'|'elbow'|'wrist'|'hand'|'chest'|'stomach'|'knee'|'ankle'|'foot' }
  | { kind: 'clothing'; pattern:'plain'|'striped'|'checked'; sleeve:'short'|'long' }
  | { kind: 'duration'; startYear:number; endYear:number }
  | { kind: 'process_sequence'; title:string; steps:string[] }
  | { kind:'object_problem'; problem:'bent_key'|'cracked_glass'|'torn_shirt'|'flat_tyre'|'missing_piece'|'unplugged_lamp'|'off_lamp'|'scratched_screen' }
  | { kind: 'direction_arrow'; turn:'left'|'right'|'straight'|'round' }
  | { kind: 'practice_route' }
  | { kind: 'rule_sign'; symbol:'no_phone'|'no_ball'|'no_touch'|'no_entry'|'stop'|'shoes'|'belt'|'bin' }
  | { kind: 'calendar'; title:string; startWeekday:number; days:number }
  | { kind: 'weather'; condition:'sunny'|'cloudy'|'raining'|'snowing'|'windy'|'foggy'|'hot'|'cold' }
  | { kind: 'position'; relation: 'in'|'on'|'under'|'in front of'|'opposite'|'next to'|'behind'|'between' }
  | { kind: 'colour_mix'; colours: string[] }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; note?: string }
  | { kind: 'sentence_cue'; subject: string; verb: string; object: string; polarity: string };

/** An explicit, reviewed presentation layer. Original release files and stable IDs stay intact. */
export function nativeEvolveQuestion(q: Question): Question {
  if (!q.id.startsWith('evolve1.')) return q;
  const patch = (overrides as unknown as Record<string, Partial<Question>>)[q.id];
  const next = patch ? { ...q, ...patch } : q;
  const pictureSpelling = !!patch && next.assets.source_image_required && q.skill === 'vocabulary' && /^[A-Za-z]{3,14}$/.test(q.answer.value ?? '');
  const games = [...new Set([...next.eligible_games, ...(q.skill === 'grammar' ? ['grammar_detective'] : []), ...(q.assets.source_audio_required ? ['listening_lab'] : []), ...(pictureSpelling ? ['word_forge'] : [])])];
  const prompt = next.prompt_en?.replace(/According to the source passage: /g, '').replace(/in the source list/g, '').replace(/In this source sense,/g, 'In this meaning,') ?? null;
  const changed = games.length !== q.eligible_games.length || prompt !== q.prompt_en;
  return {
    ...next, revision: patch ? next.revision : changed ? q.revision + 1 : q.revision, eligible_games: games, prompt_en: prompt,
    ...(pictureSpelling ? {letter_pool:[...q.answer.value!].reverse()} : {}),
  };
}

export function evolveUnitNumbers(pool: { placements?: { node_id: string }[] }[], writingOnly = false, book?: number) {
  return [...new Set(pool.flatMap(q => (q.placements ?? []).flatMap(p => {
    const m = p.node_id.match(writingOnly ? /^evolve-([1-6])\.u(\d+)\.s4$/ : /^evolve-([1-6])\.u(\d+)/);
    return m && (!book || Number(m[1]) === book) ? [Number(m[2])] : [];
  })))].sort((a, b) => a - b);
}
