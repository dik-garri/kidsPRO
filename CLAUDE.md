# CLAUDE.md

## Project Overview

Sovyonok PRO (Совёнок PRO) — a comprehensive preschool education platform (3-7 years) for school readiness. Vanilla HTML/CSS/JS, no frameworks, no build tools. Hosted on GitHub Pages.

## Tech Stack

- Vanilla JS with ES modules (`import`/`export`)
- CSS custom properties for theming
- Hash-based SPA router (`#/path`)
- localStorage for state persistence under key `owl-kids-v2-progress`
- Pre-recorded WAV speech files for task questions (Edge TTS, Svetlana voice)
- Web Speech API as TTS fallback (Russian)
- WAV sound effects with HTML5 Audio pool for mobile compatibility
- PWA meta tags (apple-mobile-web-app-capable, theme-color)
- CSS animations: entrance effects, celebrations, progress feedback
- No dependencies, no build step

## Key Architecture

- `js/engine.js` — game engine loads JSON task configs and delegates to type-specific renderers
- `js/games/*.js` — each file renders one game type (choice, sequence, dragdrop, match, count, classify, maze, trace)
- `js/curriculum.js` — loads and caches `data/curriculum.json` (master config for all topics)
- `data/tasks/{ageGroup}/{subject}/{topicCode}.json` — task content as JSON
- `js/state.js` — all app state in localStorage, path-based topic keys (`"age3/math/m01"`)
- `js/router.js` — hash-based router, routes registered in `app.js`
- `js/puzzles.js` — SVG puzzle loader and renderer (reveals pieces based on task progress)
- `js/screens/*.js` — screen renderers (home, subjects, topics, play, gallery)
- `data/puzzles.json` — 123 SVG puzzles (one per topic, 12 pieces each)

## Routes

- `#/` — home (3 age group cards + puzzle gallery buttons)
- `#/subjects/:ageGroup` — subject grid for selected age + puzzle button
- `#/topics/:ageGroup/:subject` — topic list within subject
- `#/play/:ageGroup/:subject/:topic` — game screen (with mini puzzle preview)
- `#/puzzles/:ageGroup` — puzzle gallery screen

## Content Structure

### curriculum.json
Master config with all 123 topics across 3 age groups (age3, age4, age5) and 5-6 subjects each. All topics have task files (1473 tasks total).

### Task files
Located in `data/tasks/{ageGroup}/{subject}/{topicCode}.json`. Each task has:
- `id` — unique within topic (e.g. `m01_01`)
- `type` — one of: `choice`, `sequence`, `drag-drop`, `match`, `count`, `classify`, `maze`, `trace`
- `question` — Russian text (read aloud via WAV)
- `image` — optional emoji visual
- Type-specific fields vary by type:
  - `choice`: `options`, `answer`
  - `sequence`: `items` (correct order)
  - `drag-drop`: `items`, `slots`, `answer`
  - `match`: `pairs` ([{left, right}])
  - `count`: `scene`, `target`, `answer`, optional `options` (choice mode if present, tap mode if absent)
  - `classify`: `categories` ([{name, items}]), `items` (shuffled pool)
  - `maze`: `rows`, `cols`, `start`, `end`, `walls` ([[row, col, "right"|"bottom"]])
  - `trace`: `traceType` ("dots"|"line"), `points` ([{x, y}] normalized 0-1), `strokeWidth`, optional `threshold`

### Speech files
WAV files at `assets/speech/{ageGroup}/{subject}/{topicCode}/{taskId}.wav`
- Engine constructs path: `assets/speech/${taskFile.replace('.json', '')}/${task.id}.wav`

### Puzzle system
- `data/puzzles.json` — keyed by topic path (e.g. `"age3/math/m01"`)
- Each puzzle: `{ title, svg }` where SVG has `viewBox="0 0 200 200"` and 12 `<g data-piece="N">` groups
- `js/puzzles.js` renders SVG with hidden/revealed pieces based on completed task count
- Hidden pieces: `opacity: 0.08` + `grayscale(1)`. Revealed: full opacity with `puzzle-pop` animation
- Mini preview (52x52) in play header. Full gallery at `#/puzzles/:ageGroup`

## Game Renderer Interface

```js
renderX(el, task, speechPath, onAnswer)
```
- `el` — container DOM element
- `task` — task object from JSON
- `speechPath` — full WAV path for this task
- `onAnswer(correct: boolean)` — callback when answer is given

## Running Locally

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## Important Rules

- **When adding or changing tasks**: ALWAYS generate WAV speech files for new/changed questions
  - Voice: `ru-RU-SvetlanaNeural`, rate: `-10%`
  - Convert to WAV: 22050 Hz, mono, 16-bit
  - Save to: `assets/speech/{ageGroup}/{subject}/{topicCode}/{taskId}.wav`
  - Tool: `/tmp/tts-env/bin/edge-tts` (install: `python3 -m venv /tmp/tts-env && /tmp/tts-env/bin/pip install edge-tts`)
  - Convert: `afconvert input.mp3 output.wav -d LEI16 -f WAVE --quality 127 -r 22050`
- **All task options/items must be emoji-only** — children can't read text
- **Questions are in Russian** — read aloud via TTS
- **After changes**: run `python3 scripts/validate.py` to verify JSON↔WAV consistency

## Language

- UI and content are in Russian
- Code comments and git messages in English
