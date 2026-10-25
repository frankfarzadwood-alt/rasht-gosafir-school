/** Additive reviewed release. Canonical payloads in the original release stay untouched. */
import raw from '@/data/oxford/expanded.pack.json?raw';
import coverage from '@/data/oxford/coverage.json';
import type { QuestionPack } from './contracts';
export const OXFORD = JSON.parse(raw) as QuestionPack;
export const OXFORD_COVERAGE = coverage;
