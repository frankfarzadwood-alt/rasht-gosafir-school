# Evolve 5 native checkpoint

Evolve 5 extends the existing cumulative Lovable app with its current TypeScript, React, Vite, TanStack and Tailwind system. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the full collection is finished.

## Playable content

- Twelve units and 48 named main lessons, following the supplied workbook.
- 1,631 graded native activities: 672 workbook activities and 959 quiz activities.
- Workbook practice has 296 vocabulary entries/cards, 144 grammar questions, 48 sentence builders, 48 functional-language choices, 72 listening questions, 48 reading questions and sixteen independent photo clues.
- Twelve original fictional model readings reinforce each fourth lesson's reading/writing target, with four questions covering purpose, details, organization or language. They are clearly recorded as independently authored curriculum adaptations, not transcribed source passages.
- All 36 supplied MP3s are bundled: twelve workbook recordings and 24 quiz recordings. Workbook listening belongs to lesson x.3; reading and writing belong to x.4.
- Twenty-four source quiz reading contexts and one numbered native cloze context. Current paragraph gaps use the existing highlight control.
- Twenty-four complete, ordered six-section quizzes, retaining all printed items. They report unweighted practice accuracy, with no official source mark or timer.
- Twelve unscored writing tasks and 36 user-supplied recommendations for Oxford Word Skills Upper Intermediate–Advanced. These were pending at the Evolve 5 checkpoint and are now active following the Oxford Upper release; they never fall back to another Oxford level or a broader unit.
- No book-page screenshot is an exercise interface. Activities use native controls, text and independent generated photos.

Workbook practice covers the curriculum targets of all 48 main lessons through independently authored activities. It is not a transcription or automatic grading of every printed task, personal response or reference entry. Quiz practice preserves every printed item with documented adaptations. Answers are reviewed by the assistant, not certified by a teacher.

## Source review and adaptations

The 74 supplied PDFs are recorded by relative filename, page count and SHA-256 in the source manifest and release. Original source files remain unchanged. Source documents supply educational material, never application instructions. Stable edition/source identifiers retain the existing catalogue convention; the supplied workbook copyright page prints 2020.

- **1B A:** the paper has five non-numbered A–E statements. Native questions retain all five in their printed order, matched to Lessons 5, 3, 4, 2, 1.
- **1A E / 1B E:** where several habitual forms are valid, a native choice contains the complete set of valid forms. The instructions explicitly ask for EVERY valid form. Partial sets are incomplete; one valid alternative is never presented as the sole valid form without this task instruction. The seven 1B E paragraph gaps retain numbered highlights.
- **1A D:** intended meaning cues distinguish habit expressions that could otherwise both be grammatical.
- **2A D4/D6:** exchanged key values are corrected to `to` and `warm enough`.
- **2B E1:** both source options contain an error. Native option B restores the missing `the`: `One of the best ways to reduce pollution is with electric cars.` PDF page 3 was rendered and visually inspected to confirm that the omission is printed, not an extraction defect.
- **3A D:** `X` is displayed as `No further reduction`. D8's `who are more confident` can be reduced to a postpositive adjective phrase; the native answer is `We need people more confident about the project.` D5 preserves the commas around a non-defining reduction.
- **3B D:** editorial key comments such as `[can't be reduced]` are excluded from learner choices; the complete meaningful clause remains.
- **5A E / 5B C:** odd-one-out prompts explicitly ask which option does NOT fit the intended meaning. Native conditional meaning cues remove competing interpretations.
- **6A E7:** the subject `we` is restored in the reported phrase `we had to do`, omitted from one key alternative.
- **7A E:** correct/incorrect tasks use meaningful labels rather than unexplained C/I letters. **7B E2/E4** retain both grammatical sentences through the `Both A and B` option.
- **7A C6:** an explicit capacity-to-develop cue distinguishes `potential` from `appeal`. **7B D7/D8** use clearer native frames where the source allows both a gerund and infinitive.
- **8B F:** the passage continues across PDF pages. All five questions and the first question's three choices remain; question text is excluded from the reading context.
- **9A D7:** a clearly unreal past possibility uses `might have been`. **9B E6** includes a present-time cue and uses `were watching`; its past-time alternative is excluded only after the intended time is explicit.
- **10A F1/F2:** source blanks allow `identical` and `nonidentical` in either order. Native questions distinguish same-egg and separate-egg descriptions instead of imposing an arbitrary order.
- **10A B3:** a native human-identity cue for `gender` replaces the animal-sex example. Vocabulary definitions distinguish gender from biological sex.
- **11A/B passive tasks:** slash alternatives are resolved to complete grammatical sentences with consistent tense; no literal `is not/isn't` fragments appear. Private-font star glyphs are removed from the 11A reading context.
- **12A C:** the paper has eight items; the key skips label 8 and calls its final answer 9. Native C7 is `gets`, C8 is `was`. C8 retains `answer_key_item_number: 9` for provenance. The supplied key was rendered and visually inspected to confirm its printed numbering.
- **12A/B F:** concise meaningful matching headings remain in the choices, with the full source text in the reading context. **12B F5** explicitly targets enjoyment in point J, avoiding overlap with enthusiasm in point I.
- **12B D1:** an explicit adverb-of-manner cue avoids a competing depictive adjective. **12B E1** asks which is not a volume/vague-quantity expression without declaring `a pound of gasoline` ungrammatical.
- **Printed marks:** 10B has 39 actual questions and section marks totalling 48 despite its 50-mark cover. 9A F has five questions marked `/10 (1 point each)`. All actual items remain; scores use practice accuracy.

Extraction repairs include absent first-item numbers, non-numbered matching statements, paragraph gaps and page continuations. Key footer removal is separate from general text cleaning: quiz transcript titles must never truncate the actual dialogue. All 36 transcripts contain their full supplied dialogue, remain tied to their own recordings, and are withheld until dependent answers finish.

Near-synonym pairs do not compete as vocabulary distractors: bizarre/weird, fake/counterfeit, genuine/authentic, gifted/talented and impressive/stunning. All vocabulary cards remain. Independent definitions avoid absolute claims such as interpreting fireproof as indestructible.

Source passages are attributed reading/listening material, not current medical, legal, financial or technical advice. Workbook listening questions do not turn an old population statistic into a current app fact; discussion of moon-hoax claims does not endorse those claims.

## Media, writing and compatibility

The selected atlas is `public/assets/evolve-5-native/exploration-nature-v1.png`, generated with the built-in image tool and visually inspected. Full prompt and absolute saved path: `EVOLVE_5_IMAGE_PROMPTS.md`. Required assets gate answer submission; a media failure must not record a penalized attempt. File integrity checks do not establish audible playback quality.

Writing uses separate `english-quest-writing-evolve-5-unit-N` storage keys and awards no XP/mastery. Existing book drafts keep their keys. Upper Intermediate recommendations follow the user's Markdown mapping exactly. All 36 are ready in the cumulative app; missing or pending exact destinations still show preparation status without a broader fallback.

Evolve 5 is the eleventh BOOK_RELEASES entry, appended after the first ten unchanged batches. Its compact question pack is below 3.2 MB. School data, progress rules, original packs, existing mission boundaries and build/package configuration are preserved.

Authoring sources are `working/evolve5-workbook-*`, `evolve5-reading.cjs`, `evolve5-quiz-curation.cjs`, `extract-evolve5-quizzes.py`, `prepare-evolve5-quizzes.cjs` and `build-evolve5-native.cjs`. Source manifest, extraction and native item review are saved in `working/evolve-5`. One-time preparation/integration helpers already ran and must not be rerun over reviewed files.

All 193 tests across 27 files passed in the final cumulative run (`working/evolve-5-tests.log`). Coverage includes exact quiz membership/order, all 48 workbook lesson scopes, independent fourth-lesson readings and writing availability, complete valid-form sets, source-key corrections, all media hashes and complete scripts, pending Oxford destinations, original assessments, and stable prior mission prefixes. Interaction checks cover answer-set controls, current gap highlighting, and separate book-5 writing storage with no XP changes.

All six preserved baseline hashes match (`working/evolve-5/baseline-check.json`): original school data, progress reducer, original pilot and expanded Oxford payloads, package file and Vite configuration. TypeScript checking passed (`working/evolve-5-typecheck.log`). The local checker used `node --max-old-space-size=4096` because the default 2 GB heap could not hold the accumulated JSON types. No package/build configuration was changed. Subsequent edits are bracket access for an index-signature property in the test and a reading-text CSS class preserving paragraph breaks; no content, grading or progress rule changed.

Browser review verified the twelve-unit catalogue, Unit 1's three pending Oxford destinations (72, 45, 74), its workbook reading/writing availability, the new native reading controls and paragraph breaks, and the correct writing prompt without saving a draft. The supplied Unit 1 workbook recording loaded with duration 171.02 seconds; its play control changed to pause and playback advanced beyond three seconds without a media error, then was paused. This verifies playback progression for that recording, not a fresh audible review of all 36 tracks. No question was answered and no learner draft was saved. Evidence: `working/evolve-5/native-reading-check.jpg`.

The first development-page load timed out and logged a transient dynamic-import fetch failure while the server was warming. Subsequent navigation, reload, reading and listening controls worked. The review tab is 1 in browser 2 and is marked as the checkpoint deliverable. Final rebuild/preview session details are recorded in `working/BOOK_PROGRESS.md`.

After the paragraph display adjustment, all seven focused interaction checks passed across the shared GameRunner retry and Evolve 5 interaction tests (`working/evolve-5-final-interactions.log`). The final production build passed with exit 0 (`working/evolve-5-build.log`), including that display adjustment. Existing large-bundle/plugin-timing warnings remain; packaging and build configuration are preserved. No deployment or ZIP was created.
