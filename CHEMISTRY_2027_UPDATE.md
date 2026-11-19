# JEE Main 2027 Chemistry update

Source: user-supplied `20261024683680768.pdf`, Chemistry pages 7–11, verified against [NTA Syllabus 2027](https://jeemain.nta.nic.in/document/syllabus-2027/).

## Changes

- Complete scope text for 20 units, four collapsible Chemistry groups and legacy chapter mapping.
- 320 additional original questions, bringing Chemistry practice to 400. Every chapter has all six requested categories and easy, medium and hard questions. Each question has four distinct choices, one correct index, official topic metadata and worked steps.
- Twenty-question, thirty-minute chapter tests, persistent deadlines, delayed scoring, weak-topic review, retries and mistake revision.
- Configurable rewards, first-attempt question receipts and one-time completion bonuses. Persistent dashboard and dark mode.
- Additive local migration retains old results, XP, avatars, rounds and counters. Source IDs remain stable. No backend schema changes.

## Validation — 19 November 2026

All ten Node suites passed: `check.cjs`, `check-regressions.cjs`, `check-scoring.cjs`, `check-account.cjs`, `check-battles.cjs`, `check-edge-cases.cjs`, `check-subjects.cjs`, `check-jee-syllabus.cjs`, `check-chemistry-platform.cjs`, `check-pwa.cjs`.

Coverage includes 3,000 seeded legacy actions, all 20 units and 400 unique questions, six categories in every chapter, valid official topic references, four distinct choices, worked steps, corrupted saves, blocked storage, repeated migration, first-attempt rewards, bonus idempotency, test retries, expiry and revision scope. The original 80 published Chemistry question records were compared directly and match. Their sorted ID/prompt/options/answer SHA-256 is `ae1ad7eb49655eb50aec5b15ca2e54dde02b3fb0c7972b748950b59a7f2018a5`.

Isolated Chrome checks passed for widths 320, 390, 680, 768, 1024 and 1440 pixels, dark dialogs, confirmation, hidden test results, 70% and 100% scores, bonus locks, revision, timer/answer reload, expiry and preservation of the original study track. No uncaught browser errors occurred. Offline service-worker reload retained an active test and its selected answer, and completed the test offline. No real student accounts were modified during these checks.

PDF scope was compared per unit against extracted text and visually checked for formulas, ionic lists and experiment details. Stored wording normalizes PDF wrapping, punctuation and formula typography. Questions were reviewed for answer/explanation consistency, including numerical calculations. This is original practice content, not official NTA question certification or exhaustive coverage of every possible exam problem.

## Current limits

JEE state remains in its existing browser-local storage. Online account sync, authoritative server rewards and account battles for this new bank still need a separate backend catalog integration. Existing account tests validate client regressions, not a new live database deployment. Clearing browser data removes JEE progress. When storage is blocked, a visible warning indicates that progress is temporary.

Older saves without cumulative attempt counters cannot recover unrecorded historical attempts. The question bank samples the official scope across all chapters, while the full scope text is available for study planning. The separate original ten-question challenge retains its existing reward rules. OS-level Android/Windows installation was not repeated in this pass.
