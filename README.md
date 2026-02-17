# Sovyonok PRO

**Comprehensive preschool education platform for school readiness (3-7 years)**

Live: [dik-garri.github.io/kidsPRO](https://dik-garri.github.io/kidsPRO/)

## About

Interactive learning app designed to prepare children for school. Covers key educational areas across 3 age groups with 123 topics, 1473 tasks, and 8 game types. SVG puzzle motivation system rewards progress. All content complete — ready for use.

## Age Groups

| Group | Age | Subjects |
|-------|-----|----------|
| Младшая | 3-4 | Speech, Math, Writing Prep, World, Logic |
| Средняя | 4-5 | + Reading |
| Подготовительная | 5-7 | + Advanced Reading & Writing |

## Game Types

- **Choice** — pick the correct answer
- **Sequence** — arrange items in order (drag & drop)
- **Match** — connect pairs with lines (SVG)
- **Drag & Drop** — place items into slots
- **Count** — count target objects (choice or tap mode)
- **Classify** — drag items into category baskets
- **Maze** — navigate a grid maze (tap or swipe)
- **Trace** — draw on canvas (connect dots or trace lines)

## Content

| Age Group | Topics | Tasks | WAV Speech Files |
|-----------|--------|-------|------------------|
| 3-4 (Младшая) | 41 | 489 | 489 |
| 4-5 (Средняя) | 41 | 492 | 492 |
| 5-7 (Подготовительная) | 41 | 492 | 492 |
| **Total** | **123** | **1473** | **1473** |

## Motivation System

Each of the 123 topics has a unique SVG puzzle (12 pieces). As children complete tasks, puzzle pieces are revealed one by one. A puzzle gallery screen lets kids browse and view their collected puzzles. Mini puzzle preview is shown during gameplay in the header.

## Tech

- Vanilla JS (ES modules), no frameworks, no build tools
- PWA-ready (mobile web app capable)
- Mobile-first, touch-optimized with safe area support
- Pre-recorded Russian speech (Edge TTS) with Web Speech API fallback
- Animated UI: entrance animations, celebration effects, progress feedback
- SVG puzzle system: 123 puzzles with animated piece reveals
- All content in JSON — adding topics requires no code changes
- Validation script: `python3 scripts/validate.py`

## Run Locally

```bash
python3 -m http.server 8000
open http://localhost:8000
```

## Project Structure

```
├── index.html
├── css/styles.css
├── js/
│   ├── app.js              # Entry point, route registration
│   ├── router.js            # Hash-based SPA router
│   ├── state.js             # localStorage state management
│   ├── engine.js            # Game engine dispatcher
│   ├── curriculum.js        # Curriculum data loader
│   ├── speech.js            # WAV playback + TTS fallback
│   ├── sounds.js            # Sound effects (audio pool)
│   ├── puzzles.js            # SVG puzzle loader & renderer
│   ├── screens/             # Screen renderers
│   │   ├── home.js          # Age group selection
│   │   ├── subjects.js      # Subject grid
│   │   ├── topics.js        # Topic list
│   │   ├── play.js          # Game screen + puzzle preview
│   │   └── gallery.js       # Puzzle gallery
│   └── games/               # Game type renderers
│       ├── choice.js
│       ├── sequence.js
│       ├── match.js
│       ├── dragdrop.js
│       ├── count.js
│       ├── classify.js
│       ├── maze.js
│       └── trace.js
├── scripts/
│   └── validate.py          # JSON↔WAV consistency checker
├── data/
│   ├── curriculum.json      # Master config (123 topics)
│   ├── puzzles.json         # SVG puzzle data (123 puzzles)
│   └── tasks/               # Task files by age/subject/topic
└── assets/
    ├── sounds/              # Sound effects (WAV)
    └── speech/              # Task speech files (1473 WAV)
```
