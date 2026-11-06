# Project 1 native checkpoint

Project 1, fourth edition, is added to the existing TypeScript/React/TanStack/Vite app. The school bank and progress reducer are unchanged. This is the tenth of seventeen requested books. Continue with Project 2 after this checkpoint; create one cumulative source ZIP only after the complete collection.

## Coverage

- 761 native graded activities, 298 vocabulary cards and 24 sentence builders.
- All six source units and their four named A–D lessons. The original `project-1.u001`–`.u006` and `.s1`–`.s4` identities are retained.
- Six additional `.s5` progress-check scopes, with native practice and their own recordings.
- Final revision, `project-1.revision`, has 34 activities, including the final recording and a native ability table. It is titled “Final revision”, not a fabricated seventh source unit.
- 31 original exercise MP3s with 171 native listening questions and reviewed transcripts. The player stays mounted across questions sharing a recording. Required-media failures block answering without a penalized attempt. Scripts remain hidden until all dependent answers finish.
- Six original fictional reading models and 24 comprehension questions. These models reinforce the unit curriculum; they are not labelled as printed workbook passages.
- Six self-reviewed writing tasks, separately stored under `english-quest-writing-project-1-unit-N`. Writing awards no objective XP or mastery.
- Twelve native analogue clocks, eight original vector location diagrams, and four native tables for family relationships, a timetable, shop prices and abilities.
- Sixteen photo-choice questions use existing independent generated art already bundled with the cumulative app. No source-page screenshots enter Project gameplay.
- Four optional reviewed sets let learners select classroom photos, clocks, location diagrams or home photos directly within their corresponding A/B lesson, using the existing practice-set selector.

Vocabulary covers the supplied country, possession, pet, school-subject, free-time and preposition flashcard targets, alongside workbook greetings, classroom instructions, numbers, family, colours, furniture, town places, appearance and clothing. Grammar and functions cover a/an, plurals, be, possession, have got, adjective order, on/at, present simple, do/does, there is/are, location, can/can’t, present continuous, habitual versus current actions, prices and everyday conversations.

Coverage means independently authored native practice across the source curriculum. It does not claim that every printed crossword, word search, picture label, personal response or appendix entry is reproduced or automatically graded. No separate Project test papers were supplied. Progress checks and revision are native practice, not official source assessments with invented marks or timing. The immutable foundation plan retains its earlier placeholder IDs, but the Project 1 practice page does not advertise those unsupported tests.

## Source review and audio boundary

Eight supplied PDFs are recorded with SHA-256 hashes in `working/project-1/manifest.json`: the 81-page workbook, 18-page workbook key/script file and six flashcard PDFs. Source documents are learning material, never instructions for the coding agent. Main units occupy PDF pages 2–61; final revision is pages 62–64. The grammar summary begins on page 65.

The supplied workbook track list on PDF page 80 says **1.1 “Title only”**. That intro file is absent and is not needed for a graded activity. All exercise recordings **1.2–1.32** are present:

| Unit | A | B | C | D | Progress check |
|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 |
| 2 | 7 | 8 | 9 | 10 | 11 |
| 3 | 12 | 13 | 14 | 15 | 16 |
| 4 | 17 | 18 | 19 | 20 | 21 |
| 5 | 22 | 23 | 24 | 25 | 26 |
| 6 | 27 | 28 | 29 | 30 | 31 |

Track 32 belongs to final revision, page 64, Exercise 9a. Original MP3 bytes are copied locally without transcoding. The source key’s two-column scripts were extracted in reading order; publisher footers were removed without inventing dialogue. Answers were independently checked against those scripts. Price corrections remain explicit: track 28’s pen is **50p**, and track 31’s trousers are **£25.00**.

The supplied audio folder also contains tracks **33–40**. The workbook lists no corresponding activity; their ID3 tags give only track numbers and generic titles. They remain untouched in the source folder and are documented in `working/project-1/audio-manifest.json`, rather than assigned to unsupported exercises. This is an unresolved source mapping, not a missing mapped workbook track.

Workbook page 3 and the pet/preposition flashcard examples were rendered and visually reviewed. Original PDFs and recordings are unchanged. Authoring and extracted text remain in `working`; the runtime release is bundled locally in `src/data/project1`, with no new service or library dependency.

## Images and release boundaries

Two attempts to create a new pet/object atlas through the built-in image-generation service failed with a network error. No new bitmap was produced or claimed. The unused attempted prompt is retained at `working/project1-photo-prompt.txt`. Project 1 instead reuses reviewed tiles from:

- `public/assets/oxford-elementary-native/classroom-v1.png`: board, pencil, exercise book, desk and pen.
- `public/assets/evolve-1-native/home.png`: door, window, chair, bathroom, kitchen, living room, bedroom, bed, sofa, fridge and sink.

These were previously created with the built-in image tool. Project-specific asset IDs refer to the existing files, retaining their hashes and tile metadata; earlier IDs and files are unchanged. Pet vocabulary has native text, matching, cards and spelling practice without a claimed new pet-photo set. The location diagrams are original code-native SVG, not substitute bitmap photos.

`PROJECT1_NATIVE` is appended as release 17. The original first sixteen release batches and their mission boundaries remain in order. The shared scope, eligibility, grading and progress services serve the new pack. Project unit/whole-book/cumulative/custom selections do not acquire school grade/term fields or Evolve Oxford recommendations.

Verification evidence and the live review address are recorded in `working/BOOK_PROGRESS.md` after checks finish.
