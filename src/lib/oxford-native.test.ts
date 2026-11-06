import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BOOK_CONTENT, LIVE_CATALOGUE, PILOT, mediaAsset } from './content/pilot';
import { OXFORD } from './content/oxford';
import { OXFORD_NATIVE, OXFORD_SECTIONS, oxfordSectionNode } from './content/oxford-native';
import { EVOLVE_RECOMMENDATIONS } from './content/evolve';
import { catalogueIndex, nodeScope, practiceScope, scopeQuestions } from './learning';
import { BUNDLED_QUESTIONS, correctText, gapItems, ineligibility, isAccepted, sentenceItems, tokensMatch } from './bank';
import { validateCatalogue } from './content/validate';

const ox=BUNDLED_QUESTIONS.filter(q=>q.placements?.some(p=>p.node_id.startsWith('ows-elementary.')));
describe('Oxford Elementary native release',()=>{
  it('keeps identities and reviewed answers while replacing every page-dependent activity',()=>{
    expect(ox).toHaveLength(3530);
    const original=[...PILOT.questions,...OXFORD.questions].filter(q=>q.id.startsWith('ows.'));
    for(const q of ox){
      const before=original.find(b=>b.id===q.id)!;
      expect(q.canonical_id,q.id).toBe(before.canonical_id);
      expect(q.answer,q.id).toEqual(before.answer);
      expect(q.revision,q.id).toBe(before.revision+1);
      expect(ineligibility(q),q.id).toEqual([]);
      expect(q.prompt_en,q.id).not.toMatch(/source image|source passage|this item in|Response:|Unit \d+, exercise/i);
      expect(q.native_presentation,q.id).toBe(true);
      if(q.assets.source_image_required) expect(mediaAsset(q.assets.image)?.path,q.id).toMatch(/native\//);
    }
    expect(ox.filter(q=>q.native_scene?.kind==='clock')).toHaveLength(16);
    expect(ox.filter(q=>q.native_scene?.kind==='colour_mix')).toHaveLength(8);
    expect(ox.filter(q=>q.native_scene?.kind==='table')).toHaveLength(12);
  });
  it('uses actual answer choices in matching tasks and keeps grading on stable option IDs',()=>{
    const matching=ox.filter(q=>(q as unknown as {native_authoring?:{group:number}}).native_authoring?.group===2);
    expect(matching.map(q=>correctText(q))).toEqual(['different','wrong','false','opposite']);
    expect(matching.every(q=>q.options.every(o=>!/^[a-j]$/.test(o.text)))).toBe(true);
    for(const q of sentenceItems(ox)) expect(tokensMatch(q),q.id).toBe(true);
    const personal=ox.find(q=>q.id==='ows.elem2.u013.e01.01')!;
    expect(isAccepted(personal,'I need some personal information.')).toBe(true);
    expect(isAccepted(personal,'I need some information personal.')).toBe(false);
    for(const {q} of gapItems(ox).filter(({q})=>q.native_presentation && (q as unknown as {native_authoring?:unknown}).native_authoring)) expect(q.prompt_en?.match(/_{2,}/g),q.id).toHaveLength(1);
  });
  it('opens the actual recommended section, with no questions from the other section',()=>{
    expect(validateCatalogue(LIVE_CATALOGUE)).toEqual([]);
    for(const [unit,letter,page] of [[13,'A',34],[13,'B',35],[90,'B',173]] as const){
      const id=oxfordSectionNode(`ows-elementary.u${String(unit).padStart(3,'0')}`,letter)!;
      const pool=scopeQuestions(practiceScope('subunit',id));
      expect(pool.length).toBeGreaterThan(5);
      expect(pool.every(q=>q.source.pages.includes(page))).toBe(true);
    }
    for(const m of EVOLVE_RECOMMENDATIONS)for(const r of m.recommendations){
      const id=r.section?oxfordSectionNode(r.unit_node_id,r.section):r.unit_node_id;
      expect(id,`${m.unit}: ${r.source_label}`).toBeTruthy();
      expect(scopeQuestions(nodeScope(id!)).length,`${m.unit}: ${r.source_label}`).toBeGreaterThan(0);
    }
    for(const s of OXFORD_SECTIONS){expect(catalogueIndex.nodes.get(s.id)?.kind).toBe('subunit');expect(scopeQuestions(nodeScope(s.id)).length,s.id).toBeGreaterThan(0);}
    const units=LIVE_CATALOGUE.nodes.filter(n=>n.parent_id==='ows-elementary'&&n.kind==='unit');
    expect(units).toHaveLength(100);
    expect(units.every(u=>scopeQuestions(practiceScope('unit',u.id)).length>=10)).toBe(true);
    expect(new Set(BOOK_CONTENT.questions.map(q=>q.id)).size).toBe(BOOK_CONTENT.questions.length);
  });
  it('bundles the independent artwork with verified bytes',()=>{
    expect(OXFORD_NATIVE.assets).toHaveLength(16);
    for(const a of OXFORD_NATIVE.assets){
      const bytes=readFileSync(new URL('../../public'+a.path,import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.sha256);
      expect(mediaAsset(a.id)?.url).toBe(a.path);
      expect(a['content_origin']).toBe('independent_generated_art');
    }
  });
});
