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
- School question data lives in src/data/bank.json, while native book releases live in src/data/pilot and compose through src/lib/content/pilot.ts without rewriting canonical payloads; all eligibility, game-item building and grading go through src/lib/bank.ts so every mode shares one rule set. Bundled records win over browser-local copies.
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
