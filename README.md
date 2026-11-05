# Chemistry Quest

A minimal, responsive TG EAPCET / EAMCET Chemistry practice app. Includes 64 original, explained four-choice questions across all 16 requested topic groups.

The retake system adds 64 reviewed alternate questions (one variation per original question pattern), for 128 topic-practice questions plus the 10-question JEE-style challenge.

## Run

Open `index.html` in a modern browser. Guest practice needs no installation, build step, API key, or account. Account sync requires the configured hosted backend. For a stable localStorage origin, serve this repository folder:

```
python -m http.server 4173
```

Then visit http://localhost:4173. Keep using the same browser and address to retain progress.

## Features

- Mixed practice, individual topic selection, and review of questions whose most recent response was incorrect.
- Two retake choices appear above the practice card. **Same questions** restarts the last set for the selected topic (or mixed practice), retaining its exact questions and order. **Random variations** selects one of two reviewed questions for each concept pattern and shuffles the question order. At least one question’s content changes from the previous set; this is more than a change to option order. The finite alternate bank is curated, not generated live.
- Each retake starts a fresh round with its own answered/correct/wrong counts and completion score. Cancelling or skipping does not count as an answer. All lifetime topic counters, mastery and XP remain; each question awards XP only on its first correct response. A new variant can earn XP once too. Existing streak rules still apply in topic retakes.
- Active rounds and submitted-answer locks survive reloads. Last question sets are remembered separately for each topic, so “Same” can repeat a random set even after visiting another topic. Switching topics exits the active round. Review mistakes also includes alternate questions that were answered incorrectly.
- A compact counter shows answered, correct, wrong, and accuracy for the selected topic (or all topics), plus counts for the current visit. An expandable table compares all 16 topics. Every confirmed attempt counts, including repeats and challenge questions; cancellations and skips do not. Topic totals persist, while visit counts reset on switching topics or reloading. Older saves seed totals from the latest recorded answer per question; earlier repeat attempts cannot be reconstructed.
- A separate 30-minute JEE Chemistry Challenge includes 10 harder original single-correct MCQs with worked explanations, question navigation, skipping, confirmed early submission, and a results review showing your selected answer. These are JEE-style practice questions, not official previous-year questions.
- Challenge answers require confirmation and give a fixed 50–90 XP per newly solved question (740 XP available across the bank). Rewards are shown before answering. Each challenge question can award XP only once across retries. Normal practice streak bonuses/penalties apply only in practice, so challenge rewards stay within the displayed range. Challenge attempts count toward their relevant topic counters.
- The challenge deadline and answers persist in localStorage. Leaving or reloading does not pause the timer; expiry automatically finishes the attempt and rejects late answers, including answers awaiting confirmation. The latest attempt summary shows correct, wrong, unanswered, and XP earned.
- An “Are you sure?” dialog shows your chosen answer before checking it. Rethinking or pressing Escape changes neither XP nor streaks.
- After confirmation, correct-answer feedback includes a succinct explanation. Animated popups show XP gained or lost on that attempt and your current balance. Notifications dismiss after four seconds, on navigation, or via their close button, and respect reduced-motion preferences.
- Correct answers launch a short party-popper confetti burst from both sides. Wrong answers use a gentle shake and a rotating retry symbol. Both effects respect reduced-motion settings, and confetti clears on navigation or dismissal.
- Each level-up shows an animated congratulation card with the new level, XP earned, confetti, and a rotating original motivational quote. The quote rotation is saved so successive celebrations differ even after reloading. Dismiss with “Keep going,” navigate onward, or wait 7.5 seconds. Reloading does not replay celebrations.
- 20 XP on the first correct answer per question; every sixth consecutive correct answer gives 24 XP (20% extra) if the question has not already awarded XP. Repeated correct answers award no duplicate XP.
- Every five consecutive wrong answers halve the current XP balance, rounding down. Another five wrong in the same streak halve it again. Correct and wrong answers reset the opposite streak. Skips and cancellations affect neither streak.
- One level per 100 current XP, an animated progress bar, and correct-answer streaks with a personal best. Levels can drop after XP loss. Existing progress migrates automatically, and bonuses and penalties survive reloads.
- Saved current question, revealed answer, topic selection, XP, mastery, and streaks in localStorage.
- Keyboard answer shortcuts (1–4), accessible buttons, mobile layout, reduced-motion support, and a confirmed progress reset.
- Storage failures degrade to temporary in-memory progress with a visible status. Cloud progress still loads and syncs; guest progress survives account switching within the tab. Without browser storage, closing the tab loses unsynced changes and the saved sign-in session.

`questions.js` contains the editable question bank; `app.js` implements interaction and persistence. `styles.css` contains the responsive design. Google Fonts is optional: system fallback fonts work without an internet connection. No analytics is used. Account features use the Supabase backend described below.

Streak means consecutive correct responses, not consecutive calendar days. Mastery means a question has been answered correctly at least once. Original practice questions are not official past-paper questions and are not a claim of complete syllabus coverage.

## Verification

Run `node check.cjs` for question-bank structure and app interaction checks, `node check-account.cjs` for account isolation and synchronization, and `node check-regressions.cjs` for the functional bug regressions. All use only Node's standard library. See `TEST_REPORT.md` for this test pass.

## GitHub Pages

In Settings → Pages, choose Deploy from a branch, select main and / (root), and save. The site will be available at https://steamaccforme1983-lang.github.io/chemistry-quest/ after deployment succeeds.

The site works on any device with a browser. Guest progress is local; signed-in accounts sync through the dedicated backend, not through GitHub.

## Accounts and recovery

Use **Sign in · Save online** to create a Chemistry Quest account or sign in to an existing one. These accounts are separate from GitHub and Supabase dashboard accounts. Only the email address is used as the account identifier; this recovery-code version does not verify email ownership or send messages.

- Passwords require at least 12 characters and at most 72 UTF-8 bytes. The backend stores bcrypt hashes (cost 10), never plaintext passwords.
- A private, random 256-bit recovery code is shown after signup. Store it privately. **Forgot password?** requires email, the saved recovery code and a new password. Recovery rotates the code, invalidates every previous session, preserves progress and resets login lockout. With neither password nor recovery code, the account cannot be recovered. No email-reset delivery is configured.
- Three incorrect logins trigger a server-enforced 5-minute lock. Another three after the lock expires trigger 20 minutes, then 80, 320, 1280, and a 24-hour cap. Requests during a lock do not extend it. A successful login resets escalation. Recovery-code failures have a separate identical limit. The limit applies across browsers/devices, including unknown email identifiers.
- Sessions use random 256-bit opaque tokens, stored hashed on the server and expiring after seven days. Signing out revokes the current token; recovery revokes all tokens. The browser stores a session token and per-account progress cache, never passwords or recovery codes.
- Progress syncs after changes with a short debounce. **Sync now** refreshes the latest saved progress when idle. Initial login restores online progress. A new account can explicitly import this browser’s guest progress.
- Revision checks prevent a stale device from silently overwriting a newer save. If a conflict occurs, download the device copy if wanted and load online progress. A local backup is also retained. Sign-out and account switching keep guest and account data separate. Pending offline changes are kept locally and retried on reconnect or next login.
- The frontend remains on GitHub Pages. The Free Supabase project hosts the API and private database. No paid plan was enabled; Free-plan limits and availability still apply. Backend source is in `backend/`. No project service key is committed or exposed to the browser. The edge endpoint validates its own sessions; Supabase’s legacy JWT gateway check is off for this function only.

## Backend verification

`backend/verify.sql` exercises lockout timing, isolation, recovery and stale saves inside a rolled-back transaction. `node check-account.cjs` verifies account switching and client sync behavior. The deployed API was also checked with synthetic QA credentials without printing or saving them. `backend/schema.sql` is the original one-time schema setup, not a script to rerun on an existing database.
