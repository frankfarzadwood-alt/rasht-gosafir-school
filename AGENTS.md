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
- Question data lives in src/data/bank.json (the bundled reviewed release pack, ready-only, with content_version and id_aliases); all eligibility, game-item building and grading go through src/lib/bank.ts so every mode shares one rule set. A new reviewed release replaces bank.json with a new content_version; the bundled release wins over older browser-local copies.
- Browser-local reviewed packs: pure planning in src/lib/pack.ts, IndexedDB storage in src/lib/localBank.ts; baseline missions come from the bundled pack only and local additions are appended so mission IDs stay stable.
- Guest progress, XP and mastery rules are a pure reducer in src/lib/progress.ts (applyAttempt) stored in localStorage; tests in src/lib/progress.test.ts pin those rules.
- Tracks are filtered by numeric grade/term fields only, never by IDs or filenames, because source labels are unreliable.
- Admin screen is a local read-only/dry-run preview until a backend with role checks is connected.
