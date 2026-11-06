import first from '@/data/oxford-intermediate/native.1.pack.json';
import second from '@/data/oxford-intermediate/native.2.pack.json';
import third from '@/data/oxford-intermediate/native.3.pack.json';
import catalogue from '@/data/oxford-intermediate/catalogue.json';
import sections from '@/data/oxford-intermediate/sections.json';
import coverage from '@/data/oxford-intermediate/coverage.json';
import recommendations from '@/data/oxford-intermediate/recommendations.json';
import type { CatalogueNode, QuestionPack } from './contracts';

/** Append these batches in this order; their boundaries preserve future mission identities. */
export const OXFORD_INTERMEDIATE_RELEASES=[first,second,third] as unknown as QuestionPack[];
export const OXFORD_INTERMEDIATE:QuestionPack={
  ...OXFORD_INTERMEDIATE_RELEASES[0]!,pack_id:'ows-intermediate-native',release_id:'ows-intermediate-native-r1',
  questions:OXFORD_INTERMEDIATE_RELEASES.flatMap(p=>p.questions),
  contexts:OXFORD_INTERMEDIATE_RELEASES.flatMap(p=>p.contexts),
  sources:OXFORD_INTERMEDIATE_RELEASES.flatMap(p=>p.sources),
  assets:OXFORD_INTERMEDIATE_RELEASES.flatMap(p=>p.assets),
  vocabulary_entries:OXFORD_INTERMEDIATE_RELEASES.flatMap(p=>p.vocabulary_entries),
};
export const OXFORD_INTERMEDIATE_NODES=catalogue as unknown as CatalogueNode[];
export const OXFORD_INTERMEDIATE_SECTIONS=sections;
export const OXFORD_INTERMEDIATE_COVERAGE=coverage;
export const OXFORD_INTERMEDIATE_RECOMMENDATIONS=recommendations;
