# Stage 02
- [x] Repair strict type errors in shared learning navigation without changing content or reward rules.
- [x] Build five Persian destinations, Home and local onboarding.
- [x] Connect catalogue browsing, shared course views and local My Learning/bookmarks.
- [x] Preserve school games and progress; verify Continue, refresh, back navigation and phone layouts.
- [x] Run tests and inspect automatic production/type-check results; leave unpublished and Cloud disabled.
# Stage 03
- [x] Shared approved-question service for every game; subunit, unit, through-unit, whole-book and custom scopes.
- [x] Fixed assessments keep exact order/sections; incomplete when any item is missing.
- [x] Oxford–Evolve mapping view (reviewed edges only; none exist yet).
- [x] Progress: unique items, coverage vs mastery vs assessment; unknown when empty; My Learning summary.
- [x] Tests, type check and production build.
# Stage 04 pilot
- [x] Record available baseline validations; integrate only the 200 native-v2 reviewed questions and preserve school identities.
- [x] Merge six catalogue nodes; wire exact practice selections, two fixed practice quizzes and reviewed alignment links.
- [x] Serve supplied media; gate failures and delay transcripts until submission; enforce renderer capabilities.
- [x] Run regression tests and platform validation; verify fresh-browser book gameplay, media and persistence; report limitations, leave Cloud off and unpublished.

## Verification boundaries
- 99 tests passed across 10 files; latest automatic build/type-check signal reports build OK. Standalone builds/typechecks are platform-managed and were not invoked.
- Browser: both ordered quizzes completed 38/40 at 100%; both audio files played; images fetched and rendered; transcripts withheld until dependent submissions; failed audio blocked answers with unchanged progress and retry recovered.
- Phone: all playable game families exercised; memory matches stayed stable across reward updates; all three reading passages selectable. Continue, refresh, catalogue navigation and school answering verified.
- Preserved 1,801 school records, mission identities, progress/reward rules, 244 planned assessment slots; total approved bundled questions 2,001.
- Reapplying pilot revisions/conflicts and import XP checked through pure regression tests, not the device-import UI: native-v2 pilot activation is a bundled release, not an IndexedDB import.
- Media uses immutable Lovable static asset pointers; published delivery and deployments outside Lovable remain unverified because this update stays unpublished.
- Listening Lab, Writing Studio and flashcards have no supported renderer; audio questions remain available in compatible games. No full-release upgrade, Cloud enablement or publication performed.
# Full Evolve 1 + Oxford content upgrade
- [x] Bundled 2,163 ready book questions (639/956/568) over the 200 pilot records; 3,964 loaded with 1,801 school.
- [x] 58 media assets as immutable pointers; 24 source-bound plan slots; 24 ordered practice quizzes; 35 active alignment links.
- [x] Upgrade regression (totals, pilot retention, idempotency, dependencies); tests, type check, build; smoke-tested new audio/image/text.
