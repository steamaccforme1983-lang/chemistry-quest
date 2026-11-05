# Chemistry Quest functional test report

Tested and fixed on 5 November 2026. This is a bounded functional test pass, not a guarantee that every possible bug has been found.

## Findings fixed

| Finding | Before | Fix |
|---|---|---|
| Cloud progress lost when browser storage was unavailable | Account loading depended on writing and rereading localStorage; failed storage could replace the cloud snapshot with fresh progress. | Hydrate snapshots directly in memory and keep syncing. Preserve guest progress in memory when switching accounts. Explain tab-only persistence accurately. |
| Late online refresh overwrote new answers | A slow Sync now response could replace work entered while the request was pending. | Detect intervening changes and preserve them. Apply the same protection to online-copy loading and guest importing. |
| Expired online challenge did not sync its finished state | An expired challenge loaded from the cloud finished locally while saves were suppressed during hydration. | Queue a cloud save after hydration when expiry changes the attempt. |
| Accidental early challenge submission | One click on Finish attempt immediately ended the challenge. | Ask for confirmation with the answered count. Keep solving cancels safely; timeout closes any pending finish dialog. |
| Stale red timer | The low-time warning could remain after resetting the challenge. | Recompute the timer warning from current challenge state. |
| Misleading reset scope | The reset message described browser-only removal even for a signed-in account. | Warn signed-in users that reset also syncs to their account and other devices. |
| Incomplete challenge review | Results showed the correct answer but omitted the learner's selected option. | Show the selected answer, or Unanswered, alongside the correct answer and explanation. |
| Misleading XP label | TOTAL XP implied lifetime earnings even though penalties reduce the balance. | Label it CURRENT XP. |

## Verification

- Existing practice/challenge checks passed: question structure, scoring, confirmation/cancellation, streak bonuses and penalties, level-ups, timeout, reload locks, migration, topic counters, and same/random retakes across all 16 topics.
- Account checks passed: account isolation, guest import, logout/cloud restore, conflict backup, and absence of stored passwords/recovery codes.
- Nine new regression checks passed, covering blocked storage, guest restoration, delayed refresh, online challenge expiry synchronization, timer reset, early submission, expiry during confirmation, selected-answer review, and account reset wording.
- Browser checks on localhost: random variation content, answer confirmation, correct feedback and +20 XP, persistence after reload, challenge start, early-finish cancellation, and a timer that continued after reload.
- Desktop and 390 by 844 mobile layouts inspected, including sign-in and password-recovery forms. No console warnings or errors observed during these checks.

## Limits

Cloud edge cases were exercised through deterministic client integration tests with simulated API responses. This pass did not create real accounts, change passwords, rerun a security audit, or modify the live backend, database permissions, login lockout policy, or recovery mechanism. Existing recovery uses the private code saved at signup, not email delivery. Free service limits still apply.
