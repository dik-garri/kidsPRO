# Sovyonok PRO

**Comprehensive preschool education platform for school readiness (3-7 years)**

Live: [dik-garri.github.io/kidsPRO](https://dik-garri.github.io/kidsPRO/)

## About

Interactive learning app designed to prepare children for school. Covers key educational areas across 3 age groups with 123 topics and 8 game types.

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
- **Classify** — sort items into categories *(planned)*
- **Count** — count objects on screen *(planned)*
- **Trace** — draw on canvas (letters, shapes) *(planned)*
- **Maze** — navigate through a maze *(planned)*

## Tech

- Vanilla JS (ES modules), no frameworks, no build tools
- Works offline after first load
- Mobile-first, touch-optimized
- Pre-recorded Russian speech (Edge TTS) with Web Speech API fallback
- All content in JSON — adding topics requires no code changes

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
│   ├── screens/             # Screen renderers
│   │   ├── home.js          # Age group selection
│   │   ├── subjects.js      # Subject grid
│   │   ├── topics.js        # Topic list
│   │   └── play.js          # Game screen
│   └── games/               # Game type renderers
│       ├── choice.js
│       ├── sequence.js
│       ├── match.js
│       └── dragdrop.js
├── data/
│   ├── curriculum.json      # Master config (123 topics)
│   └── tasks/               # Task files by age/subject/topic
└── assets/
    ├── sounds/              # Sound effects (WAV)
    └── speech/              # Task speech files (WAV)
```
