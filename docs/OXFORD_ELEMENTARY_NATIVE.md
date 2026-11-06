# Oxford Elementary native checkpoint

This checkpoint is part of the shared cumulative app. The user requested a small review checkpoint per book and one source ZIP after the complete collection. No ZIP or deployment is produced for this checkpoint.

## Result

- All 100 units retain their reviewed bank of 3,530 unique graded questions. Existing canonical IDs and answer objects stay stable.
- All 2,323 questions that required book-page crops now have native presentations: individual picture clues, word building, sentence building, dialogues, cloze choices, meaning comparisons, spelling and word forms.
- Native scenes include sixteen analogue clocks, eight colour combinations and twelve readable table instances. Multi-gap answers use ordered choices; the single-gap tile game excludes multi-gap items.
- Matching activities show actual meanings and replies instead of asking learners to pick an unexplained answer-key letter. Stable option IDs still determine grading.
- Sixteen independent classroom picture tiles share one generated atlas. Five existing Evolve photo tiles are also reused where the lexical target matches.
- 1,072 approved vocabulary flashcards remain available.
- 138 section nodes represent verified A/B page divisions in 69 units. Existing section identities are reused; new section placements supplement existing primary placements.
- All 36 recommendations from the user's Evolve 1 mapping reach the intended Oxford unit or exact section. A recommendation such as 13A now opens only section A practice, with a route back to Evolve. Oxford pages also expose the relevant Evolve links.

## Coverage boundaries

This converts the existing reviewed bank across all 100 units. It does not claim that every printed exercise, glossary entry, pronunciation task or open response has an automatically graded equivalent. The supplied Elementary PDF and its answer key are reference material; adaptations are not a claim of teacher verification. Some native contexts are freshly worded around the same target instead of reproducing the printed page. The train timetable is explicitly a practice timetable. No Oxford audio was supplied, so no Oxford listening content is advertised as ready.

## Source and compatibility

The original school bank, progress reducer, original pilot and expanded Oxford JSON, package manifest and Vite configuration remain unchanged. The original book crops remain available as immutable reference assets, but live Oxford activities never use them. The runtime composes presentation revisions through `src/lib/content/oxford-native.ts`, with assets appended after the existing releases so mission batches retain their order.

The app still uses the original React/TypeScript, TanStack, Vite and Tailwind/Lovable system. Native objective attempts use the shared grading and progress rules; no school grades are fabricated for book activity. The build still reports a large shared content chunk (about 19.3 MB before compression); final collection delivery should review loading costs as further books are added.

Use `npm run dev` for local review. The existing `vite preview` integration looks for `dist/server/server.js`, while this project's Nitro build writes Cloudflare output under `.output`; that local preview command is not verified as usable. The production build itself succeeds. No build configuration was changed to work around this inherited mismatch.

## Authoring and review trail

The local working folder contains `extract-oxford.py`, `prepare-oxford.cjs`, `oxford-curation.cjs` and `build-oxford-native.cjs`. Extracted text and exercise rectangles remain under `working/oxford-elementary`. The curation file records manual repairs for missing OCR, multi-column text and key/context mismatches. Runtime originals are not rewritten.

Native records declare their authoring group, printed item and source page. Source IDs, canonical IDs, answer objects and source evidence remain available for review.

## Generated artwork

- Tool mode: built-in image generation.
- Final workspace asset: `public/assets/oxford-elementary-native/classroom-v1.png`.
- SHA-256: `c89250403e03e418872631b706f1a37b32fb827fc612f1eae84437ee60ee482c`.
- The atlas is rendered as independent square cards with CSS; it is never shown as a book-page substitute. No source PDF image was used as the generation reference.

Final prompt:

Create a single square 4 by 4 atlas of sixteen independent photorealistic vocabulary picture cards for an English-learning app. Exactly 4 equal columns and 4 equal rows, edge-to-edge equal square cells, no gutters, no borders, NO TEXT, no letters, no captions, no numbers. Each cell has one clear centered subject completely within its own cell with generous white or warm pale neutral background. Clean friendly studio product photography, sharp, natural colors. Reading order left to right then top to bottom: row 1: (1) classroom whiteboard on a stand with no writing, (2) one whiteboard dry-erase marker pen with cap, (3) cork noticeboard with several pinned blank colored notices, (4) open thick dictionary showing tiny unreadable print; row 2: (5) closed colorful school coursebook with no readable lettering, (6) one yellow sharpened pencil, (7) open lined spiral notebook with blank pages, (8) a simple student's school desk; row 3: (9) a school backpack, (10) blue ballpoint pen, (11) a single blank white sheet of paper, (12) plain silver compact disc; row 4: (13) small portable CD player with circular lid open, (14) pair of steel scissors with rounded handles, (15) a straight transparent ruler with small ticks and no readable numbers, (16) a rectangular pink pencil eraser. Images must be clearly distinct and recognizeable at mobile card size. No collage inside a cell. Do not include classroom scenes or book pages. This is a sprite atlas for CSS crop into individual cards.

## Verification

See `working/BOOK_PROGRESS.md` for final test results and browser observations. The automated checks cover native eligibility for all 3,530 Oxford questions, unchanged answers and identities, independent asset bytes, section scope isolation, all user-supplied Evolve 1 recommendations, all 100 unit pools, stable existing missions, school counts and progress behavior. Interaction tests include meaningful matching choices and a corrected sentence built from shuffled cards.
