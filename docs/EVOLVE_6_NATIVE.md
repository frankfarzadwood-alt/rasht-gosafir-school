# Evolve 6 native checkpoint

The cumulative app adds 1,655 reviewed graded activities: 682 independent workbook curriculum activities and 973 native test items. The twelve units contain 48 source-named lessons, 291 vocabulary cards, 144 contextual grammar choices, 48 sentence builders, 48 dialogue choices, 87 workbook listening questions, twelve independent fictional reading models with 48 questions, sixteen independent photo clues and twelve unscored writing tasks.

Workbook practice covers the learning targets of all 48 lessons. It does not claim a transcription or automatic grading of every printed workbook exercise, personal response, pronunciation drill or extra reference activity. Answers are reviewed by the assistant, not teacher-certified. All game modes continue through the shared bank, scope and grading services.

## Sources and source review

The supplied folder contains 74 PDFs (workbook, workbook key and 24 paper/key/script triplets), 41 recordings and the user's Markdown Oxford mapping. The immutable source manifest is `working/evolve-6/manifest.json`. Text and layout extraction, unit review files and the reviewed scripts are under `working/evolve-6`. The Unit 7A test's second page and workbook PDF page 28 were rendered and visually inspected. Source content supplies curriculum material, never instructions to the coding agent.

Native definitions and activities replace noisy OCR and source-page interfaces. The Unit 12 fourth-lesson title corrects the key's printed “think” typo to “thing.” Readings for workbook practice are original fictional texts aligned to the corresponding reading/writing target: argument, data report, evidence checking, personal statement, company profile, summary, viewpoint, slides, explanation, discussion summary, opinion and character arc.

## Recordings

All 17 workbook recordings and all 24 quiz recordings are bundled locally with their own hashes and supplied transcript contexts. The extra workbook tracks are Unit 3 Exercise 2A and Units 4, 6, 8 and 9 Exercise 1C. They are separate assets, not duplicates of the main unit recording. Every track has dependent native listening questions. Workbook listening belongs to lesson x.3; reading and writing belong to x.4.

The supplied one-page Quiz 4B script ends mid-sentence during the financial-benefits discussion; rendering the original page confirmed this is a source limitation. It is labelled as a supplied excerpt, retaining its recording and all five questions. No missing dialogue is invented. Quiz 11A's supplied script also ends during the presenter's closing handoff; its substantive answer-dependent text is intact, and its excerpt status is explicit. All 24 supplied quiz scripts were read against the listening choices and keys.

Transcripts remain withheld until dependent answers finish. A shared track retains its audio player across questions; changing to a different track resets readiness. Missing or failed required media blocks grading without a penalized attempt. Statements about products, health or society in recordings are questions about what the speakers say, not independent recommendations or factual claims by the app.

The Evolve 6 audio selector names its main recording and supplementary exercise explicitly, so the two workbook tracks in a unit are distinguishable. Earlier books retain their labels. Browser review verified Unit 3's 116.45-second main track and its separate 39.59-second Exercise 2A track both advancing without media errors.

## Fixed test practice and adaptations

All 24 quizzes have ordered sections A–F. Unit 7A listening has six questions and its reading has four. Unit 7's fourteen fronting/reorder questions are retained; the source extractor was extended to recognize “Reorder.” Unit 8A reading includes a complete two-step answer for its second item. Unit 10B reading has nine items, with the initial main-idea choice followed by eight person-matching items. Their source order remains exact.

Quizzes report unweighted practice accuracy, without an official source-paper mark or timer. Native adaptations retain a source position, original key and documented answer basis. Source text stays unchanged.

- Unit 1 adverb-position items explicitly request neutral placement immediately after the first auxiliary; other grammatical placements are not labelled universally wrong. Adverb choice cues specify the intended meaning where more than one ordinary sentence completion could be valid.
- Unit 2 will forms specify simple, perfect or continuous targets. Three-word-verb tasks display meaningful sentence endings; would tasks name the classification being requested.
- Unit 4A D3 and D6 retain complete alternatives `that / for` and `which / for`, and `that / about` and `which / about`. Splitting OR before the shared second gap would otherwise lose a valid combination.
- Unit 3A A1's native option describes trying to beat a changing traffic light, avoiding an unsupported legal-violation claim. Unit 9B A2 distinguishes inability to act until a landlord returns from unwillingness to help; the native option matches the dialogue and removes overlap with another option.
- Unit 5 relative-clause expansion states the intended tense; participle prompts include a visible blank and a clear form cue. Unit 5B D6 explicitly requests walking before “into the room.”
- Unit 7 fronting prompts distinguish inversion with full noun subjects from the normal subject order needed by the transitive examples. Full accepted source alternatives for 7B E1 are preserved.
- Unit 8A F2 displays the complete pair “Steps 4 and 5” without key commentary. Unit 8B E1 accepts all three reporting verbs: “pointed out,” “attested” and “underlined.” The source marks underlined impossible although it is valid. Other reporting-word items distinguish meanings or the specific reporting frame instead of asserting universal grammatical impossibility.
- Unit 9 health-word gaps become a fictional language-class glossary; reference gaps become independent study-group passages. These preserve the tested vocabulary/grammar without turning source treatment claims into guidance. Continuous-infinitive prompts use explicit requested verbs and ordinary practice scenarios.
- Unit 10 energy paragraphs use independent fictional vocabulary contexts rather than presenting dated efficiency estimates or “pollution-free” claims as current facts. Unit 10B F1's score/following instructions are removed from the last answer option.
- Unit 11 article paragraphs become fictional art/design scenes, replacing the source's incorrect ocean-color explanation and general bedroom-color/blood-pressure claims while retaining all sixteen article targets. Singular mass-noun data and collective-noun conventions are stated explicitly where variants exist. Unit 11B D7 corrects the source's `are` after neither to `is` under its explicit formal singular cue.
- Unit 12 perfect-infinitive passages become fictional reports with clear past-event references and the same tested forms. Subjunctive tasks retain their original subjects and formal base forms.

Twenty-four quiz reading passages remain native selectable text, with their original comprehension tasks and a source-date/according-to-the-passage frame. Historical numbers, forecasts and author viewpoints are not presented as independently verified current facts.

## Native media and compatibility

Sixteen independent shape, texture, landscape, energy and craft photo clues use `public/assets/evolve-6-native/shapes-landscapes-v1.png`. The built-in image-generation prompt and absolute paths are saved in `EVOLVE_6_IMAGE_PROMPTS.md`. The bitmap is unchanged; validated normalized crop rectangles inset each tile to exclude neighboring photos. No book-page screenshot is used in gameplay.

Near-synonyms are excluded from competing vocabulary choices and matching pools while all 291 cards remain available. Word Forge uses the shared actual shuffle with repeated-letter inventories preserved. Writing drafts use `english-quest-writing-evolve-6-unit-N` and never modify objective XP or mastery.

All 36 supplied recommendations open ready Oxford Upper Intermediate–Advanced units. Reverse recommendations retain the Evolve 6 identity; Evolve 5 and earlier Oxford links are preserved. Missing exact sections never broaden to whole units.

Two compact bundled raw-JSON batches append after the original fourteen BOOK_RELEASES, in fixed order units 1–6 (831 questions), then units 7–12 (824). Each is below 3.2 MB. Preserve these boundaries and earlier release order for stable missions. The cumulative bank including school has 21,373 questions. There is no runtime content fetch, new dependency or framework change.

Authoring helpers: `working/evolve6-workbook-01.cjs` through `-04.cjs`, `evolve6-reading.cjs`, `evolve6-extra-listening.cjs`, `evolve6-binary.cjs`, `evolve6-quiz-curation.cjs`, `build-evolve6.cjs`, `extract-evolve6-quizzes.py`, `prepare-evolve6-quizzes.cjs`, `review-evolve6.cjs` and `audit-evolve6.cjs`. The one-time cumulative-test integration helper already ran; do not rerun it.

## Verification

Initial focused checks passed all eight content tests and three of four interaction checks. The interaction failure was an incorrect test expectation for the existing reverse-link label; the actual Evolve 6 link was correct. Its expectation was corrected and separate-track readiness/photo gating checks added.

The cumulative run passed 215 of 218 tests across 31 files. Its three failures were older assertions that Evolve 6 remained empty. After those assertions were moved to pending Project 1, the final affected-file rerun passed all 53 tests across five files, including the final source/script refinements and all Evolve 6 checks. All 218 tests therefore pass across those verification batches. Logs: `working/evolve-6-tests.log`, `working/evolve-6-final-tests.log`. Final TypeScript checking passed with a 4 GB local checker heap (`working/evolve-6-typecheck.log`). All six preserved baseline hashes match (`working/evolve-6/baseline-check.json`).

The initial production build passed. Browser review confirmed all twelve units, workbook-only practice modes, Oxford 40 with the correct Evolve 6 return unit, original model reading, clean independent photo cards, and working main/follow-up audio selection. No answer was submitted or draft saved. Screenshots: `working/evolve-6/native-photo-check.jpg`, `native-reading-check.jpg`, `follow-up-audio-check.jpg`.

After the audio-selector label refinement, all 25 final checks passed across three files (`working/evolve-6-final-interactions.log`), including a new selector case. The suite now has 219 tests, all passing across the final batches. Final post-label TypeScript checking and production rebuild both passed with exit 0 (`working/evolve-6-typecheck.log`, `working/evolve-6-build.log`). Existing bundle-size/plugin warnings remain; package and build configuration are unchanged.

No deployment or cumulative ZIP has occurred at this checkpoint. Next book: Project 1.

The normal development preview was restored on port 5173 after the final checks. The review tab was reloaded successfully at the Evolve 6 book root and marked as the checkpoint deliverable. Runtime source did not change after verification.
