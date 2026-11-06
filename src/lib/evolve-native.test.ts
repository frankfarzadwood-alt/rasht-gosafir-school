import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import original from '@/data/pilot/question_pack.pilot.json';
import school from '@/data/bank.json';
import { EVOLVE_NATIVE, EVOLVE_RECOMMENDATIONS, EVOLVE_TARGETS } from './content/evolve';
import { BOOK_CONTENT, LIVE_CATALOGUE, mediaAsset } from './content/pilot';
import { ALL_QUESTIONS, BUNDLED_QUESTIONS, contextById, grammarItems, ineligibility, poolAvailability } from './bank';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { validateQuestionPack } from './content/validate';
import { assessmentSession, livePack } from './scope';

const evolve = BUNDLED_QUESTIONS.filter(q => q.id.startsWith('evolve1.'));
describe('native Evolve 1 release', () => {
  it('preserves every original identity and answer while removing all page-image dependencies', () => {
    expect(evolve).toHaveLength(1685);
    const live = new Map(evolve.map(q => [q.id,q]));
    for (const q of original.questions.filter(q => q.id.startsWith('evolve1.'))) {
      expect(live.get(q.id)?.canonical_id).toBe(q.canonical_id);
      expect(live.get(q.id)?.answer).toEqual(q.answer);
      const assets = live.get(q.id)!.assets;
      for (const ref of assets.required_asset_ids ?? []) expect(mediaAsset(ref)?.url).toMatch(/^\/assets\/evolve-1-native\//);
    }
    expect(evolve.filter(q => ineligibility(q).length)).toEqual([]);
    expect(validateQuestionPack(BOOK_CONTENT,catalogueIndex)).toEqual([]);
    expect(ALL_QUESTIONS).toEqual(school.questions);
  });
  it('has working grammar, listening, and writing coverage in every unit', () => {
    expect(EVOLVE_TARGETS).toHaveLength(48);
    for (let unit=1;unit<=12;unit++) {
      const pool=scopeQuestions(practiceScope('unit',`evolve-1.u${String(unit).padStart(3,'0')}`));
      const availability=poolAvailability(pool);
      expect(grammarItems(pool).length).toBeGreaterThan(0);
      expect(availability.listening_lab.count).toBeGreaterThan(0);
      expect(availability.writing_studio.count).toBe(1);
      expect(pool.some(q=>q.id.startsWith('evolve1.native.wb.'))).toBe(true);
    }
  });
  it('bundles every recording and generated visual with a verified digest', () => {
    expect(EVOLVE_NATIVE.assets.filter(a=>a.kind==='audio')).toHaveLength(36);
    const checked=new Map<string,string>();
    for(const asset of EVOLVE_NATIVE.assets) {
      let digest=checked.get(asset.path);
      if(!digest) { const bytes=readFileSync(new URL('../../public'+asset.path,import.meta.url)); digest=createHash('sha256').update(bytes).digest('hex'); checked.set(asset.path,digest); }
      expect(digest,asset.id).toBe(asset.sha256);
      expect(mediaAsset(asset.id)?.url).toBe(asset.path);
    }
  });
  it('keeps all fixed test orders and all supplied Oxford section references', () => {
    const pack=livePack(LIVE_CATALOGUE,0);
    for(const assessment of original.assessments) {
      const session=assessmentSession(pack,assessment,contextById);
      expect(session.status).toBe('ready');
      if(session.status==='ready') expect(session.sections.flatMap(s=>s.questions.map(q=>q.id))).toEqual(assessment.question_ids);
    }
    expect(EVOLVE_RECOMMENDATIONS).toHaveLength(12);
    expect(EVOLVE_RECOMMENDATIONS.flatMap(m=>m.recommendations)).toHaveLength(36);
    expect(EVOLVE_RECOMMENDATIONS[0]!.recommendations.map(r=>r.source_label)).toEqual(['UNIT 13A','UNIT 1','UNIT 5']);
    expect(EVOLVE_RECOMMENDATIONS[8]!.recommendations[0]!.section).toBe('B');
    for(const mapping of EVOLVE_RECOMMENDATIONS) for(const recommendation of mapping.recommendations) expect(catalogueIndex.nodes.has(recommendation.unit_node_id)).toBe(true);
  });
});
