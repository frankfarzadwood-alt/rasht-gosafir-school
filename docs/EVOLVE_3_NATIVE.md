# Evolve 3 native checkpoint

Evolve 3 is added to the shared Lovable source using the existing TypeScript, React, Vite, TanStack and Tailwind system. School data, progress rules and original question packs are preserved. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the requested collection is finished.

## Playable content

- 12 units and 48 named lessons aligned to the supplied 2019 workbook.
- 1,561 graded questions: 605 independently authored workbook activities and 956 native quiz activities.
- 277 vocabulary flashcards, 144 workbook grammar tasks, 48 sentence builders, 48 conversation choices and 72 workbook listening questions.
- 16 photo activities using independent generated photo tiles. Matching avoids co-presenting the curated near-synonym pairs as interchangeable answers.
- All 36 local MP3s: 12 workbook recordings and 24 quiz recordings. Dependent listening questions retain the same audio element; transcripts remain hidden until those questions finish.
- 24 fixed practice quizzes with complete, ordered A–F sections. Results are unweighted practice accuracy, without an official 50-mark score or timer.
- 24 native reading passages and 31 numbered paragraph exercises. The current gap is highlighted; printed inline alternatives are presented through native choice controls.
- 12 self-reviewed writing tasks with separate Evolve 3 draft storage. Writing awards no objective XP or mastery.

The workbook activities cover all 48 lessons' vocabulary, grammar, functional language and writing targets. They are curriculum adaptations, not a transcription or an automatically graded equivalent of every printed workbook exercise. Quiz activities cover the printed items with the corrections and adaptations below. Answers are reviewed by the assistant, not certified by a teacher.

## Source review and key corrections

Supplied PDFs and recordings remain untouched. Source identifiers, page references and hashes are retained in the new pack. PDF text is treated as exercise material, never as instructions for the application or authoring process.

| Source | Native handling |
| --- | --- |
| Unit 12B | The supplied key is a duplicate of 12A and is explicitly marked unusable. With the user's authorization, all 41 answers are independently derived from the actual B paper, B audio transcript and B reading passage. Their original key is null and their answer basis records the independent review. |
| 6A key | Numeric headings 1–6 map to printed sections A–F. |
| 1A D and 2B D | Missing first item labels are recovered without shifting later answers. |
| 2A D7 | The paper has seven items and the key six. The missing answer is independently reviewed as `since`. |
| 5A D7 | The paper has seven items and the key six. The missing answer is independently reviewed as `searched`. |
| 5A E5 | Lucas's walking/storm item maps to key item 6. The unmatched key item 5 is not added as a fabricated paper question. |
| 7A B1 | The 1950s albums clue requires `jazz`; the supplied `EDM` answer is rejected. |
| 8B F | The reading passage matches key section G, giving c, c, a, b, a. The unrelated F list is rejected. |
| 10A D2 | The cue `drop` requires `is dropped`; the supplied `is put` is corrected. |
| 10B C6 | `have ___ this packet` requires `designed`; the supplied `design` is corrected. |
| 10B D1 | The plural Olympic Games subject takes `are watched`; the unsuitable singular alternative is rejected. |
| 11A E4 | Missing forms are ordered as `had / would read` to match the printed blanks. |
| 11B E7 | The subject is outside the blanks, so the missing forms are `would / go`. |
| 4B E1 | The spontaneous-offer item has two unsuitable printed alternatives. Native choices supply the intended future offer. |
| 5B E3/E9/E10 | Complete verb phrases and native cues avoid inserting a second `was` before an ongoing action. |
| 11A B7 | A repeated identical printed alternative is deduplicated. |

Paragraph text is reflowed and OCR spacing is repaired. Ordered multi-part answers have corresponding native blanks; actual conversation subjects and complements are retained. Workbook script 4 includes its continuation onto key page 14. Workbook unit 9 listening correctly references printed page 73 (PDF page 75).

## Oxford recommendations

All 36 supplied Evolve 3 recommendations are stored, including exact sections 31A and 54A, and point to **Oxford Word Skills Intermediate**. That book is pending native conversion at this checkpoint. Its recommendation cards display preparation status until the exact target becomes ready; a missing section never broadens to the whole unit. Oxford Elementary recommendations for Evolve 1 and 2 remain playable. Reverse recommendations are filtered by Oxford book level so identical unit numbers cannot mix levels.

Oxford Intermediate is the next book checkpoint, which will activate these recommendations.

## Compatibility and media

The release is appended after the previous five `BOOK_RELEASES`; earlier mission identities and fixed quiz lists are retained. Book questions have no fabricated school grade or term. All games continue through the shared question, scope, grading and progress services. Word Forge uses the shared real shuffle, including repeated letters and stable order during an answer.

The generated atlas is `public/assets/evolve-3-native/city-materials-v1.png`. Tile identities and SHA-256 hashes are recorded in `src/data/evolve3/native.pack.json`. No Evolve 3 exercise uses book-page screenshots. The final generation prompt is saved in `EVOLVE_3_IMAGE_PROMPTS.md`.

## Verification

All 162 tests across 21 files passed on the final content and interactions. The final TypeScript check and production build passed. The source-metadata type in the new test was corrected after the runtime suite; no runtime content or behavior changed afterward. Logs in the authoring workspace: `working/evolve-3-tests.log`, `working/evolve-3-typecheck.log` and `working/evolve-3-build.log`.

Hashes of the original school bank, progress reducer, pilot pack, expanded Oxford pack, package file and Vite configuration match the preserved baseline (`working/evolve-3-baseline-check.json`). Browser review is reported separately; local media integrity checks do not assert audible playback verification.

The normal development preview was reopened at `http://127.0.0.1:5173/learn/evolve-3?view=units`. Browser checks confirmed the twelve-unit catalogue, unit 3 targets, the pending exact 31A Intermediate recommendation, and a native Word Forge activity displaying `bridge` as `e b i r d g`, rather than in reverse order. Screenshot: `working/evolve-3/word-forge-check.png`. No fresh audible playback check is claimed. The inherited production-preview output-path mismatch is separate from the successful production build.
