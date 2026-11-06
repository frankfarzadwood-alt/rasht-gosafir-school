# Evolve 2 native checkpoint

The shared Lovable source now includes Evolve 2 in addition to the school release, Evolve 1 and Oxford Word Skills Elementary. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the requested collection is finished.

## What is playable

- 12 units and 48 named lessons checked against the supplied workbook.
- 1,575 graded questions: 608 native workbook activities and 967 quiz activities.
- 264 vocabulary entries for flashcards and matching; single-word targets also support Word Forge.
- Native word choices preserve the intended vocabulary in definition and word-box exercises, while Word Forge supplies letter tiles for spelling.
- 144 workbook grammar questions, 48 sentence-building activities, 48 practical conversation choices and 72 workbook listening questions.
- 32 additional workbook photo activities; two independent generated photo atlases also replace the quiz's object-page matching exercise.
- 36 local, original MP3s: 12 workbook tracks and 24 quiz tracks. Transcripts are withheld until dependent answers are finished.
- 24 fixed, ordered practice quizzes, each containing all six source sections. Results are unweighted practice accuracy, without an official timer or an official 50-mark score.
- 12 unscored writing tasks. Evolve 2 drafts use their own storage keys and cannot overwrite Evolve 1 drafts or objective learner progress.
- All 36 Oxford recommendations from the user's Evolve 2 Markdown file. Unit links and return links identify the correct Evolve book.

## Coverage and source adaptations

The workbook activities are independently authored around all 48 lessons' vocabulary, grammar, functional language and writing targets. This is curriculum coverage, not a claim that every printed workbook exercise has been transcribed or automatically graded. Reading practice uses the 24 supplied quiz passages, rendered as native text. Personal writing remains self-reviewed.

Quiz section letters and answer-key letters differ in three supplied sets. Reviewed mappings are:

| Paper | Paper sections A–F use key sections |
| --- | --- |
| Unit 1 B | B, C, D, E, A, F |
| Unit 3 A | E, A, B, C, D, F |
| Unit 4 B | B, C, D, E, A, F |

Unit 6 A section B has an unlettered word box, but the key supplies letters including H. Its seven native prompts are explicit adaptations with independently checked answers; they are not certified reconstructions of that inconsistent key. The original key letters remain in source metadata.

Unit 8 A's printed section marks sum to 52 although the cover says 50. This source inconsistency is another reason the native version reports practice accuracy rather than an official source-paper mark.

Other native changes include replacing object-page labels with independent photo choices; turning food/weather category tables into individual classification questions; putting paragraph gaps and conversation gaps into complete, readable sentence cues; combining the two-part cues in 4B A and 5B B; repairing extraction splits such as `keyc hain`; accepting valid contraction forms and concise listening responses; and changing the erroneous geography phrase “Antarctica is a country” to “Antarctica is a continent.” Printed source wording and model keys are source data, not application instructions.

## Compatibility

The release uses the existing TypeScript, React, Vite, Tailwind and TanStack structure and existing grading/progress services. The original source question packs stay immutable. The new release is appended to `BOOK_RELEASES`, preserving prior mission boundaries and identities. School grade/term identities are not assigned to book questions.

Word Forge now shuffles approved letter inventories at display time, rejects the answer and its reverse when another order exists, preserves repeated letters and holds its order while a question is being answered. Photo choices also distribute correct answers across A/B/C.

## Media

Generated with the built-in image generation tool and copied into this project:

- `public/assets/evolve-2-native/objects-v1.png`: 16 everyday and workspace objects.
- `public/assets/evolve-2-native/actions-v1.png`: 8 actions and 8 accessories.

No book-page screenshots are used by Evolve 2 gameplay. File digests, tile identities and recording pointers are stored in `src/data/evolve2/native.pack.json`. The final generation prompts are in `EVOLVE_2_IMAGE_PROMPTS.md`.

## Verification

Regression verification covered 147 tests across 19 files in batches: the full run passed 145 tests, and after updating two legacy cumulative-count assertions, both affected files passed all 18 tests on rerun. After the final vocabulary-choice and instruction refinements, all 20 focused release, display and interaction checks passed again. Final TypeScript and production build checks passed. Logs: `working/evolve-2-final-focused-tests.log`, `working/evolve-2-typecheck.log` and `working/evolve-2-build.log` in the authoring workspace.

The browser-control connection was unavailable during this checkpoint, so no fresh visual or audible browser check is claimed. The local normal development preview is the review entry point; the inherited `vite preview` output-path problem is not treated as successful production-preview validation.
