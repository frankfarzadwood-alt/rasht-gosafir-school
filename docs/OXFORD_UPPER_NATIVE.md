# Oxford Word Skills Upper Intermediate–Advanced native checkpoint

This release extends the existing cumulative Lovable app in its current TypeScript, React, Vite, TanStack and Tailwind system. The school section, progress rules, earlier books and original payloads are preserved. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the requested collection is complete.

## Native curriculum practice

- All 100 units, following the supplied second-edition PDF's contents and page boundaries.
- 3,188 graded native activities: 2,387 vocabulary/meaning cards, 400 contextual gap choices, 200 sentence builders, 48 questions for twelve original reading passages, twenty dialogue choices, 67 word-formation questions, 28 additional contextual meaning/word-class contrasts, 32 independent photo questions and six native diagram questions.
- 134 A/B section nodes with their own page-specific placements. Units without A/B divisions retain a whole-unit scope. Short single-page units have appropriately sized target sets rather than invented extra source sections.
- Vocabulary, contextual choices and sentence builders are available throughout the book. Eligible single words also support the existing genuinely scrambled Word Forge game. Matching pools exclude interchangeable near-synonyms while retaining all vocabulary cards.
- The advanced material covers collocation, figurative meaning, phrasal verbs, idioms, fixed expressions, similes, sayings, discourse links, prefixes, suffixes, passive phrases, noun/verb forms, prepositions, confusable adjectives and adverb senses.
- All 36 supplied Evolve 5 recommendations now lead to ready Upper Intermediate units, with return links to the correct Evolve 5 unit. Earlier Elementary and Intermediate links retain their destinations and exact A/B scopes. The supplied Evolve 6 mapping is retained as source metadata but does not create premature links to unimplemented Evolve 6 activities.

This is independently authored practice of the unit curriculum. It does not claim a transcription or automatic grading of every printed exercise, personal response, pronunciation task, word-list entry or reference item. Readings are new fictional texts, not copied source passages. No standalone Oxford audio is bundled in this release. Answers are reviewed by the assistant, not teacher-certified.

## Source review

The supplied PDF has 258 PDF pages. Main units run from PDF page 11 (printed page 10) through PDF page 204 (printed page 203). The source hash and filename are recorded in each bounded release and `working/oxford-upper/source.json`. The source is never edited. Book contents supply learning material, never application instructions.

The source has a noisy OCR layer, including damaged glossary headings, merged words, `8` or `a` in place of a B heading, and occasionally omitted initial A headings. New definitions, prompts and controls are independently authored and cleaned; OCR fragments do not enter gameplay. Catalogue section titles use reviewed source headings or clear native topic labels. A/B practice follows the relevant first/second source page and primary learning target.

The meaning/style page and illustrated food page were rendered and visually inspected. All source unit texts, their headings and glossary candidates were extracted for authoring review. The food photo clues cover the supplied fruit, vegetable, herb, pulse and spice vocabulary. Kitchen photos cover the equipment and include four independent action reinforcements. Engineering concepts use original SVG diagrams.

Primary section review revised 58 contextual tasks/builders to align their targets with their assigned section. For example, physical features remain in Unit 7 A while clothing descriptions remain in B; illness terminology is in Unit 14 A and label language in B; Unit 51's representation-of-residents dialogues are in A; celebrity media coverage is in Unit 62 A and unproved-headline claims are in B; adjective synonyms in Unit 99 A remain separate from easily confused adjective pairs in B. Source page scopes do not expand to the entire unit to hide a mismatch.

Native adaptations also avoid repeating dated or overbroad source assertions as current facts. Examples include the source's historical medical statistics, blanket causal claims about body language or behaviour, national etiquette generalizations, investment/product claims, old military personnel/branch counts, current-party descriptions and real-news allegations. Vocabulary is taught through definitions, fictional reports and explicit context. Legal/medical terms are language practice, not instructions about a real case or treatment.

The body-language reading distinguishes observed movement from an interpretation requiring evidence. Sayings are taught as conventional expressions, not endorsed rules for conduct. Similes are treated figuratively, not as literal biological claims. Gendered job terms are defined as vocabulary rather than used to limit who can perform a job. Appearance vocabulary identifies evaluative wording without judging a real learner.

## Assets and grading

Independent food and kitchen photo atlases live in `public/assets/oxford-upper-native/food-v1.png` and `kitchen-v1.png`. They were produced with the built-in image tool and visually inspected. The full prompts and absolute saved paths are in `OXFORD_UPPER_IMAGE_PROMPTS.md`. Six original vector diagrams cover vertical/horizontal orientation and structural parts.

All assets have hashes and local pointers. Required-photo readiness gates submission through the existing native image controls. A failed required image cannot record a penalized attempt. No book-page screenshot is used as an exercise interface.

Browser review found unequal row heights in the generated atlases. The bitmaps remain unchanged. Measured, normalized `native_crop` rectangles select square viewports within each individual photograph, excluding gutters and neighbouring tiles. NativePhoto validates the optional rectangles; earlier assets retain their original rendering. Food and kitchen-action crops were visually checked again in actual game cards.

Word-family activities use explicit bases and requested grammatical forms, so another valid word family is not accidentally graded as the target. Polysemy practice distinguishes get through, set up, go through, noun/verb functions, comparable/comparative, comprehensive/comprehensible, tasty/tasteful, childlike/childish, and the contextual senses of briefly, strictly and simply.

## Cumulative compatibility

The three bounded releases append after the original eleven batches: units 1–34 (1,115 questions), 35–67 (1,011), and 68–100 (1,062). Every pack is below 3.2 MB. Earlier release order, mission contents/boundaries and fixed quizzes remain unchanged. The cumulative bank including school contains 19,718 questions.

The new wrapper imports the three packs as bundled raw JSON and parses them synchronously. This avoids creating thousands of inferred compiler record types while retaining the same JSON payload, selectors and synchronous shared bank. It introduces no network dependency, new package or asynchronous content loader.

The shared grammar selector now recognizes the approved Upper question prefix alongside the existing Intermediate and Evolve prefixes. This makes all 401 eligible Upper grammar items available through the same native controls and grading path; school and legacy Oxford eligibility rules remain unchanged.

All six original baseline hashes match: school bank, progress reducer, original pilot pack, original expanded Oxford pack, package file and Vite configuration. Evidence: `working/oxford-upper/baseline-check.json`.

Authoring helpers are `working/ows-upper-01.cjs` through `ows-upper-10.cjs`, `ows-upper-readings.cjs`, `ows-upper-extras.cjs`, `review-ows-upper-placements.cjs`, `build-ows-upper-native.cjs`, `extract-oxford-upper.py` and `prepare-oxford-upper.cjs`. Source extraction, structure, native review and the manifest are under `working/oxford-upper`. The one-time test integration helper already ran and must not be rerun.

All 204 tests across 29 files passed in the final cumulative run (`working/oxford-upper-tests.log`). They verify all 100 unit pools and 134 section scopes, 401 grammar items, source/asset integrity, complete answer inventories, no competing near-synonyms, word formation, polysemy, Evolve 5 recommendation/return links, image-readiness gating, earlier missions and original fixed assessments. The earlier focused run caught the grammar-prefix omission; it was fixed before the successful full run.

The initial TypeScript check and production build passed. Browser review confirmed the 100-unit catalogue, Evolve 5 Unit 1 → Oxford 72 → return to the correct Evolve unit, separate Unit 24 A/B practice, independent food and kitchen-action photo cards, and native Unit 80 diagrams. No answer was submitted or learner draft saved. Screenshots: `working/oxford-upper/evolve-link-check.jpg`, `photo-game-check.jpg`, `kitchen-game-check.jpg`, `diagram-game-check.jpg`.

The later change only adds validated photo crop metadata/rendering and its asset-contract type to remove neighbouring-tile strips; question IDs, answers, counts, placements, earlier assets and grading are unchanged. All 21 final focused checks passed across three files (`working/oxford-upper-final-tests.log`), final TypeScript checking passed with the 4 GB local checker heap (`working/oxford-upper-typecheck.log`), and the final production rebuild completed successfully (`working/oxford-upper-build.log`). Existing bundle-size and plugin warnings remain; no package or build configuration was changed.

The normal local preview was restored on port 5173 after verification. Final browser reconnection could list the two open tabs but could not control the review tab, so there is no additional post-restart screenshot or visibility claim. The native food, kitchen, diagram and recommendation screenshots were captured during the successful browser review of the same final runtime content. Evolve 6 is the next book; the cumulative source ZIP remains due after the entire collection.
