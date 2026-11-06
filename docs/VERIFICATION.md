# Verification for Evolve 1 native release

- Complete regression suite: 131 tests passed across 17 files.
- Final native interaction checks after the mobile family-tree adjustment: 5 tests passed.
- TypeScript: `tsc --noEmit` passed.
- Production client and server build: passed using the original Lovable Vite/TanStack configuration.
- School question JSON, original book release JSON, Oxford expansion JSON, progress reducer, package configuration and Vite configuration match their supplied baseline hashes. See `PRESERVED_BASELINE.json`.
- All 100 native asset manifest entries resolve to packaged files with matching SHA-256 digests: 64 photo tiles sharing four atlas files, plus 36 recordings.
- All 24 fixed practice quizzes preserve their ordered question IDs and sections.
- All 12 unit practice scopes include the new workbook listening questions; 36 Oxford recommendations retain their original order and section letters.

## Browser checks performed

- Opened the native Evolve 1 catalogue and unit pages.
- Verified independent job photos, correct-answer feedback and picture-supported letter building.
- Verified the generated image layout at a 390-by-844 phone viewport.
- Inspected the family-tree activity for phone-width overflow.
- Played the supplied Unit 1 workbook recording and submitted an answer. Advancing to the next question preserved active playback and its position.
- Verified saved unit progress after navigating between activities.
- Followed the Oxford 13A recommendation, confirmed its section notice and return-to-Evolve link.

These checks are not a claim that every question was manually played or every recording listened to in full. The inherited shared content bundle still triggers Vite's large-chunk advisory. No Lovable upload, deployment or publication was performed.
