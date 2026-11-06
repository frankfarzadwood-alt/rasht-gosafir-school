<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- School question data lives in src/data/bank.json, while native book releases live in src/data/pilot (one merged pack from the release manifest; asset pointers auto-resolved by file name from src/assets/pilot) and compose through src/lib/content/pilot.ts without rewriting canonical payloads; all eligibility, game-item building and grading go through src/lib/bank.ts so every mode shares one rule set. Bundled records win over browser-local copies.
- Browser-local reviewed packs: pure planning in src/lib/pack.ts, IndexedDB storage in src/lib/localBank.ts; baseline missions come from the bundled pack only and local additions are appended so mission IDs stay stable.
- Guest progress, XP and mastery rules are a pure reducer in src/lib/progress.ts (applyAttempt) stored in localStorage; tests in src/lib/progress.test.ts pin those rules.
- Tracks are filtered by numeric grade/term fields only, never by IDs or filenames, because source labels are unreliable.
- Admin screen is a local read-only/dry-run preview until a backend with role checks is connected.
- Catalogue contracts, validation and repository selectors live in src/lib/content; adapt the school release without mutating legacy records so catalogue navigation and existing gameplay retain the same identities.
- Learning navigation state lives separately from learner progress in src/lib/learning.ts; local course removal only edits navigation state and must never erase attempts or rewards.
- Course browsing uses rememberCourse while gameplay uses remember, so catalogue visits cannot overwrite a resumable game or mission.
- Catalogue pages share src/components/LearningHub.tsx; school availability uses the live bank selectors so browser-local reviewed additions appear in navigation too.
- Practice scopes (subunit, unit, through_unit, whole_book, custom) and fixed assessments go through src/lib/scope.ts, and learning.scopeQuestions is the single approved-question service, so every game, count and review uses the same eligibility rules.
- Every game session is built by src/components/GameSession.tsx from an approved pool; school routes and /practice book routes only supply the pool, so game-specific grading stays identical everywhere.
- Session pair pools are memoized by approved pool, mode and seed so progress-triggered rerenders cannot reshuffle visible memory cards.
- Book-scope attempts store grade/term as null plus a scope key; school grades are never fabricated for non-school content.
- Scope test fixtures live in src/test/fixtures and are never imported by app code, so they cannot enter production packs.
- Catalogue metadata merges by stable ID; native book placements are never passed through the school grade/term adapter, preventing fabricated school identities.
- Supplied binary book media uses immutable asset pointers, resolved by content/pilot.ts; QuestionMedia gates required-media answers and GameRunner respects phase-dependent transcript policies.
- Exact reviewed selections can narrow practice scopes; FixedAssessment preserves complete ordered sections and preflights every required asset, never taking the shuffled or shortened practice-exam path.

- Additional reviewed book content is additive: src/data/oxford/expanded.pack.json composes with the original immutable pack through BOOK_CONTENT; keep its JSON whitespace compact to fit the repository file-size limit without changing parsed payloads. BOOK_RELEASES is ordered and append-only so existing book mission IDs, boundaries and contents cannot shift. Preserve this order for future releases.
- LIVE_SELECTIONS expands Oxford catalogue memberships and counts; fixed Evolve assessment membership and PILOT baseline exports remain unchanged.
- Oxford question images are bundled under public/assets/oxford-elementary-r2 with file hashes in the pack. Original Lovable media pointers are preserved. Required-image failures must still block grading without penalty.
- Flashcards use approved vocabulary_entry_id links via bank.flashcardItems; flip and self-ratings are session-local, award no XP/mastery and never write english-quest-progress-v1. Empty scopes hide this mode.

## Evolve 1 native release
- Preserve the original source JSON. Apply Evolve 1 presentation revisions through src/lib/content/evolve.ts and src/data/evolve/native.overrides.json, keeping canonical IDs and answers stable.
- Evolve 1 gameplay must use native controls, independent generated photo tiles, and native diagrams; never restore book-page screenshots as exercise interfaces.
- The additive native pack includes workbook listening questions and local assets. Asset IDs deduplicate with the local native release winning over earlier media pointers.
- Reviewed Evolve workbook selections include the new listening items by their actual unit/section. Fixed quiz selections and question order stay exact.
- Native photo tiles live in public/assets/evolve-1-native; metadata identifies each tile within a four-by-four atlas. Required-media failures must block submission without recording attempts.
- Writing drafts use separate local storage and award no XP or mastery. Oxford recommendations follow the user's Markdown mapping, including section letters; see docs/EVOLVE_1_NATIVE.md for coverage boundaries.

## Oxford Elementary native checkpoint
- Keep both original Oxford releases immutable. Apply live presentation revisions through src/lib/content/oxford-native.ts and src/data/oxford/native.overrides.json; retain canonical IDs and answer objects.
- Never restore book-page crop references to live Oxford activities. Independent generated art and native diagrams/tables supply visual clues.
- Native matching choices display meaningful text, while their stable option IDs preserve grading. Do not grade the displayed text against the legacy answer-key letter.
- Oxford section nodes reuse existing .s1/.s2 identities. Supplementary section placements must match source pages; a 13A recommendation must never silently broaden to the whole unit.
- Multi-gap native items use ordered choices. The single-gap tile game must not insert a semicolon-separated answer group into its first blank.
- The shared app is cumulative. Give a small checkpoint per book, and create one source ZIP only after the full collection is finished.

## Oxford Intermediate native checkpoint
- Keep the first six BOOK_RELEASES unchanged. Append OXFORD_INTERMEDIATE_RELEASES in its existing order (units 1–34, 35–67, 68–100); keep these batch boundaries stable for future missions.
- Intermediate is independently authored native curriculum practice. Do not restore source-page images or expose OCR fragments in gameplay. Coverage boundaries and source adaptations are in docs/OXFORD_INTERMEDIATE_NATIVE.md.
- Preserve all 132 A/B nodes and exact source section placements. Evolve 3 recommendations 31A and 54A open .s1 only; their B material must never enter those scopes.
- Oxford reverse recommendations filter by book and section. Ready Evolve 3 links use Intermediate; Evolve 1/2 links continue to use Elementary.

## Evolve 4 native checkpoint
- Append Evolve 4 after the original nine BOOK_RELEASES. Keep all earlier content batches and mission boundaries stable.
- Evolve 4 Quiz 1A has seven sections A–G. Preserve its separate F and G contexts and all 968 printed quiz items; never assume all quizzes have six sections.
- Keep the separate Unit 10 tone recording and its five questions on their own audio asset. The book has thirteen workbook recordings and 24 quiz recordings.
- Preserve documented source-key corrections and category adaptations in docs/EVOLVE_4_NATIVE.md. Source PDFs remain unchanged, and no book-page screenshots enter native gameplay.
- Evolve 4 recommendations use Oxford Intermediate and reverse links retain the Evolve 4 unit. Drafts use book-specific storage keys and never award objective XP.

## Evolve 5 native checkpoint
- Append Evolve 5 after the original ten BOOK_RELEASES. Preserve earlier batches and mission boundaries.
- Workbook listening is lesson x.3; independent model reading and writing practice is x.4. Preserve all twelve native workbook readings so unit workbook selections offer reading and writing without adding quiz questions to their practice pool.
- Keep all 959 printed quiz items in 24 ordered six-section assessments. Unit 12A C8 maps to the source key's item 9. Source corrections and native meaning cues are documented in docs/EVOLVE_5_NATIVE.md.
- Habit-form questions in 1A E / 1B E ask for the complete set of valid forms. Keep the explicit EVERY-form instruction; partial-set choices are incomplete. Both grammatical sentences in 7B E2/E4 remain valid together.
- Keep transcript cleaning separate from answer-key footer cleaning. A transcript title containing Unit Quiz must never truncate its dialogue. Preserve all 36 recording/transcript pairs and required-media gating.
- Evolve 5 Oxford recommendations use the supplied Upper Intermediate mapping. Pending or missing exact destinations never fall back to another level or whole unit. Writing drafts use book-5 keys and award no objective XP.

## Oxford Upper Intermediate–Advanced checkpoint
- Preserve the first eleven BOOK_RELEASES. Append OXFORD_UPPER_RELEASES in the fixed order units 1–34, 35–67, 68–100, with boundaries unchanged after this checkpoint.
- The 100-unit release uses independent native curriculum practice and 134 page-specific A/B nodes. Source coverage and adaptations are in docs/OXFORD_UPPER_NATIVE.md; never restore source-page screenshots in gameplay.
- Keep all 36 Evolve 5 recommendations active at their supplied Upper Intermediate units. Reverse links must retain the Oxford level and Evolve 5 return unit. Evolve 6 remains pending until its own release is implemented; an absent section never falls back to a whole unit.
- Raw JSON imports in content/oxford-upper.ts are synchronously parsed bundled data to bound compiler type generation. Preserve the shared bank/scope services and do not add runtime fetch dependencies or change canonical payloads.
- Upper source meanings and source sections remain separate. Primary contextual targets were reviewed across A/B; Unit 51's resident-representation dialogues belong to A. Keep all word-family and multiple-meaning variants and their explicit meaning cues.
- Upper photo assets have normalized native_crop rectangles because generated grid rows are unequal. NativePhoto validates and uses these rectangles without modifying bitmaps; assets without a rectangle retain their original uniform-grid rendering. Keep crops within one source tile so neighbouring photographs never bleed into cards.

## Evolve 6 native checkpoint
- Append the two Evolve 6 batches after the original fourteen BOOK_RELEASES, in the fixed order units 1–6 then 7–12. Keep all previous mission boundaries and fixed assessments stable.
- Preserve all 973 ordered test positions in sections A–F, including six Unit 7A listening questions, fourteen Unit 7 fronting tasks and nine Unit 10B reading items. Documented answer/meaning adaptations are in docs/EVOLVE_6_NATIVE.md.
- The book has seventeen workbook recordings and 24 quiz recordings. Unit 3 Exercise 2A and Units 4/6/8/9 Exercise 1C have distinct assets and transcripts. Never replace them with their unit's main track.
- Keep Evolve 6 main/exercise labels distinct in ListeningLab without changing earlier book labels. Supplied Quiz 4B and 11A script excerpts are marked explicitly; never invent their missing endings or remove required audio to hide the source limitation.
- Workbook listening is lesson x.3; original fictional reading/writing models are x.4. Keep Evolve 6 drafts separate and unscored. Native photos use the optional validated crop metadata; never restore book-page gameplay.
- All 36 Evolve 6 recommendations use ready Oxford Upper units from the user's mapping. Reverse links must preserve book 6 while retaining earlier Evolve mappings.

## Project 1 native checkpoint
- Append Project 1 after the original sixteen BOOK_RELEASES. Preserve earlier batches, school payloads, progress rules and mission boundaries.
- Retain the six existing unit IDs and all A–D section IDs. The new .s5 nodes are progress checks; project-1.revision is explicitly final revision, not a fabricated seventh source unit. Source revision is PDF pages 62–64; grammar summary starts on page 65.
- The workbook's track list maps all activity recordings 2–32. Track 1 is title only. Extra supplied tracks 33–40 remain unassigned until a verified source mapping exists; never attach them to invented exercises.
- Keep transcripts hidden until dependent answers finish and preserve audio element continuity and required-media failure gating. Track 28's corrected pen price is 50p; track 31's corrected trousers price is £25.00.
- Project writing uses english-quest-writing-project-1-unit-N and awards no objective XP. D-lesson placements enable writing; progress-check/final-revision-only pools do not fall back to Evolve 1 tasks.
- Project 1 uses independent native curriculum practice, original vector clocks/location diagrams/tables and reused independent generated photo tiles. Never add book-page gameplay or label native progress checks as supplied official tests. See docs/PROJECT_1_NATIVE.md.

## Project 2 native checkpoint
- Append Project 2 after the original seventeen BOOK_RELEASES. Preserve earlier release data, order, missions, school progress and existing Project 1/Evolve writing keys.
- Retain the six unit IDs and A–D identities. New .s5 nodes are progress checks; project-2.introduction and project-2.revision are separately titled review scopes, not invented numbered units.
- The supplied PDF duplicates printed page 52 at PDF pages 52 and 53. Exclude PDF 53 from question sources; printed page 53 onward maps to PDF page +1. Final revision is PDF 65–66, and Unit 6 begins at PDF 55. Never assume printed and PDF page numbers remain equal.
- All 32 exercise tracks 2–33 are supplied. Track 2 belongs to the opening review and 33 to final revision. Track 12 contains animal sounds: preserve the explicitly labelled non-speech answer-key review and never invent spoken dialogue. Its sequence is duck, frog, cow, monkey, pig, sheep, tiger.
- The track 1.5 filename says 1C Ex 4, but verified workbook/script/track list identify printed page 8 Exercise 3. Keep the original source filename while following the verified activity identity.
- Keep all recording groups distinct, required-media gates, element continuity and after-answer script locks. Historical measurements, city figures and travel opinions in tracks 23/25/26/27 are source-recording comprehension, not claims about current statistics or safe travel.
- Project-series guides and writing recognize released books 1 and 2. D-lesson placements enable writing; review-only pools cannot show an unrelated unit’s task. Project 2 keys are english-quest-writing-project-2-unit-N and writing remains unscored.
- Native calendars, clocks, weather/temperature diagrams and tables are code-native interfaces. Photo clues reuse reviewed independent generated assets with their existing hashes/crops. Never restore source-page images or fabricate official Project test papers. Coverage: docs/PROJECT_2_NATIVE.md.

## Project 3 native checkpoint
- Append Project 3 after the earlier eighteen BOOK_RELEASES. Preserve earlier payloads, missions, school progress, Project 1/2 writing keys and existing Evolve/Oxford recommendations.
- Printed pages map to PDF page +1 because there are two cover scans. Opening is PDF 3-4, units PDF 5-64, revision PDF 65-66; grammar summary begins PDF 67. Do not reuse Project 2's duplicate-page exception.
- Retain six unit and 24 A-D IDs; .s5 are native progress checks. Introduction and revision are separately named review scopes, not invented numbered source units. No official Project test papers are claimed.
- All 27 supplied tracks 2-28 stay distinct. Unit 4C has tracks 16/17; Unit 6A has 23/24; Unit 6D has 27/28. There is no Unit 1A, progress-check or final-revision audio to fabricate.
- Sixteen supplied scripts and eleven workbook/key answer reviews remain explicitly different. Reviews have spoken_transcript false and state they are not verbatim audio transcriptions. Required audio, continuity and after-answer review locks must remain intact.
- Keep source-period London/space-hotel context explicit. Doctor dialogues are language-comprehension scenes, not personalized health guidance. Original direction/sign SVGs, tables and independent photo tiles replace all source-page gameplay.
- Released Project-series guides/writing cover books 1-3. Draft keys are english-quest-writing-project-3-unit-N and remain unscored; review-only scopes cannot leak a task from another book. Coverage and source boundaries: docs/PROJECT_3_NATIVE.md.

## Project 4 native checkpoint
- Append Project 4 after the earlier nineteen BOOK_RELEASES. Preserve earlier payloads, missions, school progress and existing book writing/recommendation identities.
- This workbook has one cover: printed pages equal PDF pages. Opening is 2-3, units 4-63, final revision 64-65 and grammar summary begins 66. Do not reuse the earlier Project page exceptions. The English/Spanish supplement on 80-83 is not Persian course material.
- All 32 supplied tracks 2-33 have supplied scripts. Keep the opening, A-D, progress-check and final-revision labels distinct, along with required-audio gates, playback continuity and after-answer script locks.
- Track 4 is the character’s memory/opinion. Doctor/accident recordings are fictional language scenes; do not turn nutrition claims or source treatments into personalized guidance. Award recipient Doctor Marcus Teal and presenter Professor Jane Briggs stay distinct. New environment models use fictional projects, not dated population forecasts as current facts.
- Body dots, clothing patterns/sleeves, fixed fictional duration timelines and process charts are code-native. Do not add source-page gameplay or official Project test papers. Keep valid relative-pronoun alternatives and overlapping vocabulary senses unambiguous. Coverage: docs/PROJECT_4_NATIVE.md.
- Released Project guides/writing cover books 1-4. Project 4 drafts use english-quest-writing-project-4-unit-N and remain unscored. Review-only scopes cannot show an unrelated writing task.

## Project 5 native checkpoint
- Append Project 5 after the earlier twenty BOOK_RELEASES. Preserve original pack payloads, school progress, earlier writing keys and recommendation identities.
- The complete workbook is Project-5-4th-Work-Book.pdf (82 pages), with printed page +1 = PDF page. Project_5_Workbook.pdf is a 54-page annotated excerpt and cannot supply the complete course or canonical page mapping. Opening PDF 3-4, units 5-64, revision 65-66; grammar summary begins 67.
- All 32 tracks 2-33 remain distinct. Twenty-four have supplied spoken scripts. Tracks 9/10/12/20/22/29/31/32 have honest workbook/key answer reviews with spoken_transcript false, never fabricated dialogue. Preserve after-answer locks, media gating and playback continuity.
- Track 10's initial activity wording differs across the full scan/key; questions use unambiguous corrected appointment details. Do not turn old Cumbre Vieja forecasts, diet/population claims, computer-game claims, historical superlatives or travel details into current factual advice. New readings/tables are explicitly fictional. See docs/PROJECT_5_NATIVE.md.
- Object-problem SVGs, practice clocks/calendars and fictional timetables are native clues. Project writing now covers books 1-5; book 5 drafts use english-quest-writing-project-5-unit-N and remain separate and unscored. Review-only pools cannot leak another task.

## Shared native photo presentation
- Picture choices shuffle once per question and display position labels A/B/C; never expose the canonical option text A as the permanently correct visible letter. Grading uses the original option ID. New attempt responses and correct-answer feedback name the image rather than its canonical letter; do not rewrite historical attempts or canonical answers.
- Preserve picture order across media loading, retry and feedback. Every required tile must load before answering; failures cannot record penalized attempts.
- Live asset resolution may apply reviewed presentation refinements without mutating release JSON. native-art.ts corrects unequal lower rows of the city/materials atlas only when there is no explicit crop. Explicit crops and image bytes remain immutable.

## IELTS collection and grammar checkpoint
- The user added Speaking Maximizer, bringing the requested collection to eighteen books. It is pending under IELTS as ielts-speaking-maximizer until its own reviewed release. Preserve full audio group paths because its filenames repeat. Give one checkpoint per book and create one cumulative source ZIP after all eighteen.
- IELTS Grammar appends after the earlier twenty-one BOOK_RELEASES. Retain its existing twenty-five unit IDs; A-D sections preserve context listening, grammar focus, grammar practice and test skills. Source printed page +11 = PDF page. Modals 1 starts PDF 114; Modals 2 PDF 122. Unit 8 B continues through PDF 75; C starts PDF 76.
- All exercise tracks 2-33 stay separate; track 1 is title only. Unit 3 tracks 5/6 have separate conversation parts. Unit 15 tracks 20/21 are the interview and reported news, with a separate test-practice track 22. Keep thirty-two supplied scripts, after-answer locks, required-media gates and audio continuity.
- Grammar choices must not reject valid alternative forms. Keep source-accepted singular/plural agreement for suitable neither/either-of and none-of phrases. Exclude zero-article and complete slash-separated answer groups from literal single-gap insertion. Future overlap and context-sensitive backshift remain explicit.
- Independent readings, original data charts and tables supply native clues; never restore textbook-page screenshot gameplay. The two fixed fifty-question reviews reuse canonical curriculum questions and have no official marks, band-score claim or fabricated source-test identity. Preserve their order after this checkpoint.
- IELTS writing keys and speaking-note keys stay separate from earlier drafts and objective progress. Personal tasks belong to actual D sections. The speaking rehearsal's timer and self-review award no XP/mastery or automatic band score; it appears only where a released task exists. Full coverage and source boundaries: docs/IELTS_GRAMMAR_NATIVE.md.

## IELTS Vocabulary 6.5 and above checkpoint
- Append IELTS_VOCABULARY65_NATIVE after the earlier twenty-two BOOK_RELEASES; preserve previous batches, canonical payloads, mission boundaries and school progress. Keep all twenty-five existing unit IDs. The four learning groups per unit are native organisation, with unit-level source pages and source_section_claim false, not fabricated printed A-D sections.
- Source printed page +2 = PDF page. Units are PDF 10-131 with separate five-group source reviews; key PDF 134-157, scripts 158-169 and wordlist 170-174. The five native thirty-question reviews reuse canonical curriculum questions; they are not source-test reproductions or IELTS band scores. Keep their exact lists and order.
- All mapped exercise tracks 2-44 have supplied scripts. Track 38 belongs to Unit 20; tracks 39-44 belong to Unit 24, not Unit 25. Track 1 is unassigned. Unit 4 exercise 3.1 at PDF 26 has no supplied recording; the user confirmed it cannot be found. Keep written medicine vocabulary, and never fabricate its audio/script or misattach another track. Unit 4's actual audio is Science Centre track 9.
- Keep pronunciation-list order assumptions out of grading. Track 8's numbered sequence was visually checked; track 30's duplicated inconsistent script tail is omitted. Audio bytes remain unchanged. Preserve required-media gates, continuity and after-answer scripts. Research views, forecasts and prices in recordings remain edition-specific comprehension, not current advice.
- Preserve contextual senses and documented source repairs, including astronomical for a large cost and drought rather than the wordlist's draft typo. Exclude overlapping synonym clusters from distractors and pair games. Word Forge must retain its real shuffle.
- Use responsive native chart text and accessible tables without screenshot gameplay. IELTS guides distinguish their book. Vocabulary writing keys are english-quest-writing-ielts-vocabulary-65-unit-N, and speaking notes include the book/task IDs. Personal practice is unscored and belongs only to released application nodes. See docs/IELTS_VOCABULARY65_NATIVE.md.
- Next book is IELTS Vocabulary up to band 6.0, then Speaking Maximizer. Keep one cumulative Lovable source ZIP for the end of all eighteen books.

## IELTS Vocabulary up to band 6.0 checkpoint
- Append IELTS_VOCABULARY60_RELEASES after the earlier twenty-three BOOK_RELEASES. Freeze its two boundaries at Units 1-10 / 11-25 (808 / 1,164 questions); preserve earlier canonical payloads, mission boundaries, school progress and recommendations.
- Keep twenty-five existing units and one hundred populated native learning groups. Their unit-level source alignment and source_section_claim false must remain explicit: these groups are not printed A-D sections. Source printed page +2 = PDF page; key 134-158, scripts 159-168, four-column wordlists 169-175, tracklist 177.
- All forty-eight supplied recordings have distinct identities. Recording labels 1a through 22b correspond to source CD tracks 2-49; the filenames use recording labels. CD title track 1 is not supplied. Preserve multipart letters, numeric order and all required-media gates, audio continuity and after-answer locks.
- Thirteen visually checked pronunciation lists use spoken_transcript true; thirty-five independently authored listening reviews use false and explicitly say they are not word-for-word transcripts. ListeningLab and game recap labels must respect that distinction for this and earlier Project books. Recording 13b contains sceptical, not identical. Raw OCR remains audit data and never appears as accurate dialogue.
- Preserve reviewed contextual senses, curated synonym exclusions and real letter shuffling. All 1,421 cards retain their distinct IDs, including contextual repeats; reused meanings do not mutate earlier entries. Native diagrams and reviewed independent photo tiles replace page screenshots, with required-image loading gates and safe crop metadata intact.
- Five fixed forty-question reviews reuse canonical questions for successive five-unit groups. Preserve exact membership and order, with no official mark scheme, source-test reproduction or band-score claim. Writing keys use english-quest-writing-ielts-vocabulary-60-unit-N; speaking notes include book/task identity. Personal work is unscored and restricted to actual application nodes. Coverage: docs/IELTS_VOCABULARY60_NATIVE.md.
- Seventeen of eighteen books are implemented. Speaking Maximizer is next and final; retain its full recording group paths because filenames repeat. Produce the single cumulative Lovable source ZIP only after the final book checkpoint.

## Speaking Maximizer and complete collection
- All eighteen requested books are implemented. Append MAXIMIZER_RELEASES after the earlier twenty-five BOOK_RELEASES, with fixed boundaries Part 1 + Part 2 (694 questions) / Part 3 (626). Preserve all twenty-seven batches, earlier missions, school progress and recommendations.
- Keep the three source speaking parts, nineteen interview themes and both numbered sequences of one hundred cards/topics. The extra three native toolkits are not source Card 101 or Topic 101. The scan pairs 73/74, 172/173, 185/186 and 201/202 are out of order; preserve the reviewed topic-level PDF page mappings. Coverage: docs/SPEAKING_MAXIMIZER_NATIVE.md.
- The user confirmed all forty-four MP3s are unrelated extras. Keep full group identities, including the three 01.mp3 files and 12-1/12-2. Bonus recordings have no book-topic mappings, invented transcript, graded listening answers or objective rewards. Bonus notes remain separate per asset ID.
- SpeakingStudio supports brief interview answers, cue-card preparation/long turns and discussion answers. Forty-five/ninety-second answer timers are practice choices, not official part durations. Retain old IELTS rehearsal behaviour and storage keys. New task activation requires its application question; vocabulary-only pools cannot leak personal tasks. Personal opinions are self-reviewed, never automatically band-scored.
- Keep 888 contextual card placements, 225 builders, twenty independent fictional extracts and native reasoning visuals. Avoid pair-only synonym ambiguity while retaining full vocabulary targets. Do not turn the source's dated, stereotyped or health/policy claims into graded facts or mandatory personal views.
- Deliver one cumulative source ZIP with package.json at the root, source/data/docs and all local runtime media. Exclude node_modules, build outputs, caches, credentials and raw source PDFs; record and verify the packaged file hashes. No source ZIP depends on the external working folder. See LOVABLE_IMPORT.md.
