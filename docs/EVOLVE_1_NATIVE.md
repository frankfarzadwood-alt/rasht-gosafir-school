# Evolve 1 native release

This source package continues the existing English Quest app in TypeScript, React, TanStack Start/Router, Vite and Tailwind. It is prepared for the user's existing Lovable project. No deployment or publication has been performed.

## Included

- All 12 Evolve 1 units and their four workbook sections.
- The original 639 workbook and 956 quiz question identities and answers, with a native presentation layer.
- Native replacements for all 127 questions that previously depended on a book-page image.
- Fresh photographic vocabulary tiles, native family and room diagrams, a cafe preference table, an interactive-response city map, grammar cues and reading extracts.
- 90 additional workbook listening questions, linked to the 12 supplied workbook recordings.
- All 24 supplied quiz recordings bundled locally. Evolve 1 no longer depends on Lovable's original page-image/audio pointers at runtime.
- Dedicated listening practice, picture-supported word building and grammar practice.
- An unscored writing prompt and self-review checklist for each unit, with drafts saved separately from objective progress.
- The user's 36 Oxford Elementary recommendations, shown in order within the 12 Evolve units. Section references such as 13A and 90B are preserved.

## Coverage and boundaries

The live Evolve 1 bank contains 1,685 unique graded items. The source pack remains unchanged; reviewed native overrides are applied by stable ID, preserving existing attempts and school records.

The fixed assessments preserve the existing 24 reviewed practice quizzes and their exact ordered question lists. They retain their practice-percentage policy; this release does not claim that they are complete original 50-mark papers. Personal/open writing is not automatically graded. The coverage manifest records the 48 workbook sections and their learning targets; a question total alone is not proof that every printed exercise has a graded equivalent.

The subsequent Oxford Elementary checkpoint now converts that book's screenshot-dependent activities and gives A/B recommendations their own practice scopes. See [Oxford native notes](OXFORD_ELEMENTARY_NATIVE.md). The earlier Evolve-only ZIP is an intermediate archive; the requested final ZIP will include the entire completed collection.

## Implementation

- `src/lib/content/evolve.ts`: immutable source-to-native presentation adapter.
- `src/data/evolve/`: native overrides, added listening content, local asset manifest, learning targets, coverage and recommendations.
- `src/components/NativeScene.tsx`: independent photo tiles and native diagrams.
- `src/components/ListeningLab.tsx`: recording-based listening sessions.
- `src/components/WritingStudio.tsx`: local, unscored writing drafts.
- `src/components/EvolveGuide.tsx`: unit guide and user-supplied Oxford links.
- `public/assets/evolve-1-native/`: four generated photo atlases and 36 supplied MP3 files.

The original school question bank and progress reducer are unchanged. Missing required media blocks answers without recording an attempt. A recording remains mounted when advancing between questions that share it. Fixed assessment preflight checks all required files before starting.

## Local checks

Install the project's existing dependencies, then run:

```sh
npm test -- --maxWorkers=2 --testTimeout=15000
npx tsc --noEmit
npm run build
npm run dev
```

The delivery excludes dependencies, local source PDFs, extracted references, caches and compiled output. The ZIP's root contains `package.json`, `src/`, `public/` and the existing Lovable build configuration.
