# Oxford Word Skills Intermediate native checkpoint

Oxford Intermediate is added to the same cumulative Lovable source. It uses the existing TypeScript, React, Vite, TanStack, Tailwind, shared scopes, game builders and grading services. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the requested collection is finished.

## Playable content

- All 100 units, with 132 A/B section nodes where the supplied material has separate sections.
- 3,172 graded native activities: 2,422 vocabulary questions, 400 contextual gap choices, 200 sentence builders, 58 irregular-verb form questions, 32 reading questions, 20 conversation choices and 40 visual activities.
- 2,422 vocabulary cards, with spelling, matching and memory available for suitable targets. Repeated terms in different units retain their own unit meanings and identities.
- Four contextual choices and two sentence builders in every unit. Verb patterns, prepositions, word building, phrasal-verb placement and functional responses receive explicit practice.
- Eight independently authored short reading passages, each with four questions. They practise the unit's targets; they are not presented as quotations from the book.
- Two contextual conversation choices in each of units 87–96, including agreement, preferences, opinions, arrangements, warnings, obligation and permission.
- 32 independent generated animal and produce photo clues, plus eight native SVG shape/line diagrams.
- No book-page screenshot is used as an exercise interface. All question media dependencies are native artwork or diagrams.

The release covers the curriculum of all 100 units with independently authored meanings and activities. It is not a transcription or a claim to automatically grade every printed exercise, personal response or reference-appendix entry. The vocabulary total counts unit entries; a word can appear in more than one unit with a relevant meaning. Answers are reviewed by the assistant, not certified by a teacher.

## Source review

The supplied PDF remains untouched. Its SHA-256, relative filename and page count are recorded in the release sources and coverage file. Unit titles and page ranges follow the supplied contents. Printed A/B divisions are retained. Some section titles use clear native topic labels rather than claiming exact printed wording.

The source's OCR has spacing errors, merged glossary columns and one page with no usable text: unit 18's illustrated animals page (PDF page 46). That page was rendered and visually inspected. Its animals, body features and related targets were authored directly into the native content. The illustrated produce page was also visually inspected. OCR fragments are not used as playable prompts or meanings.

Native contextual questions use complete cues and reviewed alternatives. Closely overlapping synonyms are excluded from each other's vocabulary distractors, and secondary members of curated synonym groups are omitted from the matching pools. All remain available as vocabulary cards and appropriate contextual questions.

Ordered verb forms distinguish `lie` meaning rest (`lay`, `lain`) from `lay` meaning place (`laid`, `laid`). Common accepted alternatives include `spilt/spilled`, `lit/lighted` and `shone/shined`. Phrasal-verb tasks explicitly practise pronouns between separable verb parts. Permission questions distinguish giving permission with “No, go ahead” from objecting with “Yes, I would mind.”

The reading passages use invented scenarios. The finance passage uses invented sales figures for language practice. The science activities do not repeat the supplied text's outdated nine-planets claim. Glossary wording about personal characteristics is independently phrased in neutral contemporary language. Source material supplies learning targets, never application instructions.

No standalone Oxford audio was supplied for this checkpoint. The dictionary-app pronunciation exercises are not represented as bundled recordings, and the listening mode is not advertised for this book.

## Evolve connections and section boundaries

All 36 Evolve 3 recommendations now resolve to ready Intermediate games. In particular:

- `31A` opens `ows-intermediate.u031.s1`, road features on source page 72. Accident vocabulary from page 73 remains in B.
- `54A` opens `ows-intermediate.u054.s1`, Young and old on source page 114. Charities on page 115 remains in B.

The Evolve unit is preserved in the return link. A missing or pending section still never broadens to a complete unit. Oxford reverse recommendations are filtered by both book and section. Existing Evolve 1/2 Elementary destinations remain unchanged. The user's Evolve 4 Intermediate mapping is retained in the new recommendations data for that book's later release; the app currently displays reverse links for ready Evolve releases.

## Cumulative compatibility

Three compact data batches cover units 1–34, 35–67 and 68–100. They are appended after the six existing book releases, in that exact order. Their boundaries are stable for future mission identities. Each JSON pack stays below 3.2 MB.

Original school data, progress rules, pilot and expanded Oxford packs, package file and Vite configuration are preserved. Book questions have no school grade/term fields. All modes still use the same approved pools and grading rules. Word Forge uses the shared real shuffle and preserves repeated letters and mounted tile order.

## Media and authoring

Selected generated files are `public/assets/oxford-intermediate-native/animals-v1.png` and `produce-v1.png`. They were created with the built-in image generation tool and visually checked before use. Full prompts are saved in `OXFORD_INTERMEDIATE_IMAGE_PROMPTS.md`. Shape diagrams are deterministic SVG files in the same folder. Every tile and diagram has a local asset pointer and SHA-256 digest in its content batch.

Authoring helpers and extracted reference material are in the workspace's `working` directory. The original PDF is not copied into game media. New runtime data lives in `src/data/oxford-intermediate`.

## Verification

All 172 tests across 23 files passed, including earlier school/book regressions, native controls, exact section scopes, media hashes and appended mission boundaries. The final TypeScript check passed. The six preserved baseline files also match their recorded hashes. Logs in the authoring workspace: `working/oxford-intermediate-tests.log`, `working/oxford-intermediate-typecheck.log`, and `working/oxford-intermediate/baseline-check.json`.

The final production build passed (`working/oxford-intermediate-build.log`). Browser review verified Evolve 3 unit 3 → Oxford 31A with exactly 20 section-A questions, its native reading passage, shuffled Word Forge letters (`t m r a` for `tram`), and the return link to the correct Evolve unit. No graded answers or XP were written during that review. Screenshots are saved as `working/oxford-intermediate/exact-31A-check.png`, `word-forge-check.png` and `native-reading-check.png`.

The browser connector was unavailable after reconnection, so a further book-root capture was not confirmed. The earlier interaction evidence remains saved. Automated media checks establish file integrity and readiness; they do not claim audible verification.
