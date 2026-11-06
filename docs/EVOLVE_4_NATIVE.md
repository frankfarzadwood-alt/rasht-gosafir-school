# Evolve 4 native checkpoint

Evolve 4 extends the same cumulative Lovable application using its existing TypeScript, React, Vite, TanStack, Tailwind, shared scopes and grading services. No deployment or checkpoint ZIP is performed. One cumulative source ZIP is due after the full requested collection is finished.

## Playable content

- Twelve units and 48 named main lessons, following the supplied workbook.
- 1,575 graded native activities: 607 workbook activities and 968 quiz activities.
- Workbook activities comprise 274 vocabulary entries/cards, 144 grammar questions, 48 sentence builders, 48 functional-language choices, 72 comprehension questions, five tone-of-voice questions and sixteen independent photo clues.
- All 37 supplied MP3 files are bundled: thirteen workbook tracks and 24 quiz tracks. The extra workbook recording is Unit 10 exercise 1B / track 10.02, used for five separate tone questions. It is not substituted with the longer 10.01 conversation.
- Twenty-five native text reading contexts from the quizzes, including the separate comments exercise in 1A, and nine numbered native cloze contexts. Current gaps use the existing highlight control.
- Twenty-four complete fixed quiz selections, retaining printed section/item order. Unit 1A has seven sections A–G; the other quizzes have six. Practice reports unweighted accuracy with no official source-paper mark or timer.
- Twelve unscored writing prompts and 36 user-supplied Oxford Intermediate recommendations. Oxford return recommendations distinguish Evolve 3 and Evolve 4.
- No book-page screenshot is an exercise interface. Every new question uses native controls and text; photo choices use independent generated images.

The workbook activities cover the curriculum targets of the 48 main lessons through independently authored practice. They are not a transcription or a claim to automatically grade every printed task, personal response, extra speaking activity or reference entry. Quiz practice preserves all printed items with documented native adaptations. Answers are reviewed by the assistant, not certified by a teacher.

## Source review and corrections

The 74 supplied PDFs are recorded by relative filename, page count and SHA-256 in the source manifest and release. Original source documents and recordings remain unchanged. Book contents supply learning material, never application instructions.

- **1A F/G:** the actual paper has two separate reading tasks. F contains the candidate profiles; G contains three comments. Both remain separate with three questions each. G's supplied key conflicts with the comment text: the reviewed answers are C, B, A. PDF page 3 was rendered and visually inspected to verify the printed comment labels.
- **1B E6:** `wants` describes a state in this sentence. The printed Dynamic key is corrected to Stative. Native questions identify the specific target verb instead of relying on invisible underlining.
- **1A B:** the printed exercise combines a missing verb with matching a sentence ending. Native choices use the complete missing phrase, preserving both targets in each of the eight items.
- **2A:** paper sections C/D/E match key sections D/E/C respectively. Source section identities and key-section identities are both retained. Every printed item is included.
- **2B B6:** `are coming back in style` requires the printed -ing form, omitted in the supplied answer key.
- **3B:** the vocabulary sections B/C have their keys exchanged. Both mappings are explicit. An extraction collision that turned 20 into `2EXAMPLE` is repaired using the actual sentence.
- **4A E1:** the valid relative clause retains `where`; the key's alternative omits a necessary connection. Other native full-sentence answers select one grammatical relative-clause variant.
- **4B E6:** in `fish that I think has come from a fish farm`, the relative pronoun is the subject of `has`; it cannot be omitted. The key's omission variant is rejected. Native choices avoid offering both equally valid `that` and `which` as competing answers.
- **5A/5B E:** native cues distinguish past intentions from past expectations or requirements, preventing both forms from competing without an intended meaning.
- **6B D:** historical passive forms use the past in dated events and the present for the present-day description. The supplied is/was alternatives are resolved to the intended timeline.
- **7A D:** native reported speech uses a consistent later-reporting frame, including `the night before`. Reported-question prompts include the original direct question, so an omitted source dialogue cannot make an item unanswerable.
- **7A C6:** the lurker cue is clarified as reading without posting or commenting; the source described someone who comments.
- **8A E1:** the missing subject `I` is restored after `wish`.
- **9A D5:** a fictional office report deadline provides the same grammatical target without presenting a dated tax deadline as a current general rule. The complete phrase `are supposed to be` is offered.
- **9A E:** a clean independently phrased childhood narrative preserves the eight intended permission/obligation contrasts and repairs misplaced source gap markers.
- **10A B/C:** independently phrased research and chatbot scenarios preserve all fifteen collocation targets. They avoid repeating dated or overbroad claims about real companies, gene editing and medical discoveries.
- **10B F:** the paper repeats number 3 and then ends at 4. There are five actual statements; native identities retain all five in printed order. Their answers are T, F, F, T, F.
- **11A B and 12A B:** each category exercise has ten graded targets. Native questions ask for each word's category instead of imposing an arbitrary order on synonymous within-category blanks.
- **11A E1:** strict parents requiring homework calls for `made me do`, correcting the supplied `let me do`.
- **12B A2/E6:** inconsistent source option lettering is normalized while preserving the actual choice text. Letter answers in the unlettered 12B C word box are resolved to meaningful words.

Source passages remain reading-comprehension material attributed to their source context. They are not used as current medical, legal, technical or financial guidance. Common extraction defects, merged items 9/10, lost blanks and split words are repaired before gameplay. Close synonyms are excluded where they would create competing correct choices; appreciation/gratitude and help out/lend a helping hand do not compete in vocabulary matching.

## Media, writing and recommendations

The selected atlas is `public/assets/evolve-4-native/food-cooking-v1.png`. Sixteen tiles cover foods and cooking actions; baking and peeling are additional reinforcement rather than printed word-box items. It was generated with the built-in image tool and visually inspected. The full prompt and absolute saved path are in `EVOLVE_4_IMAGE_PROMPTS.md`.

All audio assets have local pointers and hashes. Transcripts remain unavailable until dependent questions are finished. Recording readiness gates required-media grading; failed assets do not record a penalized attempt. Automated checks establish asset integrity and readiness, not audible playback verification.

Writing drafts use `english-quest-writing-evolve-4-unit-N` and never write XP/mastery. Earlier book drafts retain their keys. Oxford destinations follow the user's Markdown mapping and all 36 Intermediate units are ready. Earlier exact A/B destinations remain unchanged; absent or pending sections never broaden to whole units.

## Cumulative compatibility and verification

Evolve 4 is the tenth BOOK_RELEASES entry, appended after the original nine. Its compact pack is below 3.2 MB. Existing release order, mission boundaries, school data, progress rules and original payloads remain unchanged.

The original school bank, progress reducer, pilot/expanded Oxford packs, package file and Vite configuration match all six saved baseline hashes (`working/evolve-4/baseline-check.json`). Focused Evolve 4 content and interaction checks passed all ten tests.

All 182 tests across 25 files pass across the final verification batches. The full run passed 179/182; the three failures were old fixtures treating Evolve 4 as empty. They now test the still-pending Evolve 5. The three affected files passed all assertions across the final reruns; one exhaustive Oxford scope check needed a larger execution-time allowance on this computer. Runtime code/data did not change after the full run. Logs: `working/evolve-4-tests.log`, `evolve-4-final-regression-tests.log` and `evolve-4-oxford-regression-tests.log`.

The final TypeScript check and production build passed (`working/evolve-4-typecheck.log`, `evolve-4-build.log`). The normal development preview is running at `http://127.0.0.1:5173/learn/evolve-4?view=units`; its server response was HTTP 200 with Evolve 4 and unit 12 present. This is server-render verification, not a fresh visual browser check. Browser control still reports a closed transport; opening the review panel was queued. No new audible playback verification is claimed. See `working/evolve-4/preview-check.json`.

Authoring helpers are `working/extract-evolve-book.py`, `extract-evolve4-quizzes.py`, `prepare-evolve4-quizzes.cjs`, `evolve4-workbook-*`, `evolve4-quiz-curation.cjs` and `build-evolve4-native.cjs`. Extraction, source review and native item review are saved in `working/evolve-4`. The one-time integration helper already ran and must not be rerun.
