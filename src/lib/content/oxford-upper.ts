import first from '@/data/oxford-upper/native.1.pack.json?raw';
import second from '@/data/oxford-upper/native.2.pack.json?raw';
import third from '@/data/oxford-upper/native.3.pack.json?raw';
import catalogue from '@/data/oxford-upper/catalogue.json';
import sections from '@/data/oxford-upper/sections.json';
import coverage from '@/data/oxford-upper/coverage.json';
import recommendations from '@/data/oxford-upper/recommendations.json';
import type { CatalogueNode, QuestionPack } from './contracts';

// Keep synchronous shared-bank composition. Raw JSON avoids generating thousands
// of inferred per-record compiler types; it does not fetch content at runtime.
export const OXFORD_UPPER_RELEASES=[first,second,third].map(s=>JSON.parse(s) as QuestionPack);
export const OXFORD_UPPER:QuestionPack={
  ...OXFORD_UPPER_RELEASES[0]!,pack_id:'ows-upper-native',release_id:'ows-upper-native-r1',
  questions:OXFORD_UPPER_RELEASES.flatMap(p=>p.questions),
  contexts:OXFORD_UPPER_RELEASES.flatMap(p=>p.contexts),
  sources:OXFORD_UPPER_RELEASES.flatMap(p=>p.sources),
  assets:OXFORD_UPPER_RELEASES.flatMap(p=>p.assets),
  vocabulary_entries:OXFORD_UPPER_RELEASES.flatMap(p=>p.vocabulary_entries),
};
export const OXFORD_UPPER_NODES=catalogue as unknown as CatalogueNode[];
export const OXFORD_UPPER_SECTIONS=sections;
export const OXFORD_UPPER_COVERAGE=coverage;
export const OXFORD_UPPER_RECOMMENDATIONS=recommendations;
