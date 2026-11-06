# Complete cumulative source for Lovable

This is the complete cumulative source backup for your existing Lovable app. The archive includes about 1.44 GB of runtime media and exceeds Lovable’s 250 MB ZIP-import limit; do not attempt to import it directly or create a replacement project. Extract the archive and transfer its contents through the existing project’s connected GitHub repository, with the original project history retained. package.json is at the archive root. Keep this app's existing TypeScript, React, TanStack Start, Vite and Tailwind setup; the package is not a replacement framework or a compiled-only deployment.

## Included collection

| Series | Included books |
| --- | --- |
| Evolve | 1, 2, 3, 4, 5, 6; native workbook practice, ordered tests and mapped audio |
| Project | 1, 2, 3, 4, 5; native workbooks, reviews and mapped audio |
| Oxford Word Skills | Elementary, Intermediate, Upper Intermediate-Advanced |
| IELTS | Grammar 6.5+, Vocabulary 6.5+, Vocabulary up to 6.0, Speaking Maximizer |

All eighteen books share the existing app, alongside the completed school section. The objective bank has 31,000 questions including school. Personal writing, speaking rehearsals, flashcard self-ratings and bonus shadowing notes do not award objective XP or mastery.

Keep all src/data files and public/assets folders. These contain the native questions, curriculum catalogue, exact review/test selections, independent images and local recordings. Source PDFs and the author's external working folder are not required to build or run the app. Assets must be served at their existing /assets paths.

The source package excludes installed dependencies, temporary caches, generated build output, local credentials and original research/source folders. Install the project's dependencies in the target environment and use its existing commands:

```sh
npm install
npm run dev
npm run build
```

The original bun.lock is also retained. Do not replace package/build settings or rewrite existing canonical content to import the new books. The build retains the existing large-bundle/plugin notices; final verification evidence is recorded in the delivery report accompanying the ZIP.

## Content and progress to retain

- The completed school payloads and progress reducer; existing learner attempts and personal-work storage keys.
- The twenty-seven append-only book release batches and their fixed mission boundaries.
- Fixed Evolve assessment membership and order, plus each book's native curriculum reviews.
- The user's Evolve-to-Oxford recommendations, level distinctions and exact A/B destinations.
- Native game interfaces, required-media failure gates, audio continuity and after-answer transcript/review locks.
- Unscored writing/speaking saves and the distinction between an exact script and a clearly labelled listening review.

Speaking Maximizer has three parts, 100 cue cards, 100 discussion topics and nineteen interview themes, with three native toolkits. Its forty-four MP3s were confirmed by the user to be unrelated extras. Keep them in the grouped bonus listening/shadowing library; never invent book-topic mappings or graded listening answers for them.

Source coverage and specific material limitations are documented separately for each book in docs. In particular, the unavailable natural-medicine recording in IELTS Vocabulary 6.5+ remains omitted while written vocabulary is covered. Source-key corrections and incomplete excerpts remain documented in their respective Evolve/Project notes. Do not silently fabricate missing source media or restore page screenshots to gameplay.

The SOURCE_MANIFEST.json in the delivered archive records the packaged file hashes. The accompanying delivery report records the archive SHA-256, file count and verification results. Importing this package and publishing through Lovable are separate steps from creating the source ZIP.

## Safir presentation and transfer status

The updated source includes the supplied Safir logo, white default background, real covers for all eighteen books, English book names and the requested Persian wording. See docs/VISUAL_POLISH.md.

Creating and verifying this ZIP does not upload, synchronize or publish it. The local app has been checked; a completed transfer must be confirmed separately in the existing Lovable project. The GitHub repository identified from that project is frankfarzadwood-alt/rasht-gosafir-school. Read its current branch before any update, preserve remote-only files and append commits without force pushing.

Official guidance: https://docs.lovable.dev/features/projects/import-project and https://docs.lovable.dev/integrations/github.
