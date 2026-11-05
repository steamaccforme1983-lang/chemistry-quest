# Chemistry Quest

A minimal, responsive TG EAPCET / EAMCET Chemistry practice app. Includes 64 original, explained four-choice questions across all 16 requested topic groups.

The retake system adds 64 reviewed alternate questions (one variation per original question pattern), for 128 topic-practice questions plus the 10-question JEE-style challenge.

## Run

Open `index.html` in a modern browser. No installation, build step, API key, or account is required. For a stable localStorage origin, serve the `dist` folder:

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
- A separate 30-minute JEE Chemistry Challenge includes 10 harder original single-correct MCQs with worked explanations, question navigation, skipping, early submission, and a results review. These are JEE-style practice questions, not official previous-year questions.
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
- Storage failures degrade to temporary in-memory progress with a visible status.

`questions.js` contains the editable question bank; `app.js` implements interaction and persistence. `styles.css` contains the responsive design. Google Fonts is optional: system fallback fonts work without an internet connection. No analytics or application backend is used.

Streak means consecutive correct responses, not consecutive calendar days. Mastery means a question has been answered correctly at least once. Original practice questions are not official past-paper questions and are not a claim of complete syllabus coverage.

## Verification

Run `node check.cjs` for question-bank structure and app interaction checks, using only Node's standard library.

## GitHub Pages

In Settings → Pages, choose Deploy from a branch, select main and / (root), and save. The site will be available at https://steamaccforme1983-lang.github.io/chemistry-quest/ after deployment succeeds.

The site works on any device with a browser. Progress is saved separately on each browser/device; it does not sync through GitHub.
