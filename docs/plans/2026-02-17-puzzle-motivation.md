# Puzzle Motivation System

## Overview

Add SVG puzzle rewards to motivate children. Each topic (12 tasks) has its own puzzle — completing tasks reveals fragments. Each subject has a meta-puzzle assembled from completed topics. Gallery screen shows all collected puzzles.

## Puzzle Mechanics

### Topic Puzzle (12 pieces)
- Each topic has a themed SVG illustration split into 12 `<g>` fragments
- Completing a task reveals the corresponding fragment with pop-in animation
- Hidden fragments shown as faded silhouettes (opacity 0.1 + grayscale filter)
- Completing all 12 tasks = full illustration with celebration animation

### Subject Puzzle (7-10 pieces)
- Each subject has a larger SVG, one piece per topic
- Completing a topic fully = reveals that piece in the subject puzzle
- Visible on gallery screen

## Where Puzzles Appear

### 1. During gameplay (mini preview)
- Small puzzle preview (~80x80px) shown in play header next to progress bar
- After correct answer → new fragment pops in with animation
- Tap preview to see full-size puzzle modal

### 2. Topic completion screen
- Replaces current "Молодец!" screen
- Shows fully assembled puzzle at large size
- Celebration animation (confetti-like sparkle around puzzle)
- "К темам" button below

### 3. Gallery screen (`#/puzzles/:ageGroup`)
- Grid of all puzzles for the age group
- Completed: full color, tappable to view full size
- In progress: partially revealed with progress indicator
- Not started: gray silhouette with lock icon
- Accessible from home screen via "🧩" button

## Data Structure

### `data/puzzles.json`
```json
{
  "topics": {
    "age3/speech/s01": {
      "title": "Совёнок",
      "svg": "<svg viewBox='0 0 200 200'><g data-piece='0'>...</g>...</svg>"
    }
  },
  "subjects": {
    "age3/speech": {
      "title": "Мир речи",
      "svg": "<svg viewBox='0 0 300 300'><g data-piece='0'>...</g>...</svg>"
    }
  }
}
```

Each SVG:
- `viewBox="0 0 200 200"` for topic puzzles
- Contains 12 `<g data-piece="N">` groups (topic) or 7-10 groups (subject)
- Pure inline SVG, no external assets
- Simple flat-style illustrations using basic shapes (circles, rects, paths)

### SVG Themes by Subject
- **Speech**: animals, fairy tales, nature scenes
- **Math**: space, robots, vehicles
- **Reading**: books, castles, magical creatures
- **Writing**: art supplies, buildings, instruments
- **World**: landscapes, cities, ocean
- **Logic**: puzzles, machines, inventions

## New Files

| File | Purpose |
|------|---------|
| `data/puzzles.json` | All SVG puzzle data (~123 topic + ~15 subject puzzles) |
| `js/puzzles.js` | Puzzle loader, SVG renderer, fragment visibility manager |
| `js/screens/gallery.js` | Gallery screen renderer |

## Modified Files

| File | Changes |
|------|---------|
| `js/screens/play.js` | Add mini puzzle preview in header; replace completion screen |
| `js/app.js` | Register `#/puzzles/:ageGroup` route |
| `js/screens/home.js` | Add "🧩" gallery button |
| `css/styles.css` | Puzzle preview, gallery grid, fragment animation styles |

## CSS

```css
/* Puzzle preview in play header */
.puzzle-preview { width: 60px; height: 60px; cursor: pointer; }
.puzzle-preview svg { width: 100%; height: 100%; }

/* Fragment states */
.puzzle-piece-hidden { opacity: 0.08; filter: grayscale(1); }
.puzzle-piece-revealed { opacity: 1; animation: puzzle-pop 0.5s ease-out both; }

@keyframes puzzle-pop {
  0%   { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  70%  { transform: scale(1.1) rotate(3deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* Completion puzzle */
.puzzle-complete { width: 250px; height: 250px; margin: 0 auto; }

/* Gallery grid */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.gallery-item { aspect-ratio: 1; border-radius: var(--radius); padding: 0.5rem; }
.gallery-item.locked { opacity: 0.3; filter: grayscale(1) blur(2px); }
```

## Implementation Steps

### Step 1: Create puzzle infrastructure
- `js/puzzles.js` — loader + renderer (render SVG with hidden/revealed pieces)
- CSS styles for puzzle components

### Step 2: Generate SVG puzzles
- Write a generation script or create inline SVGs for all 123 topics
- Simple flat-design illustrations using basic SVG shapes
- Each SVG ~500-2000 chars (simple shapes, not complex art)
- Subject puzzles: 15 larger SVGs

### Step 3: Integrate into play screen
- Mini preview in play header
- Update fragment on correct answer
- Replace completion screen with puzzle reveal

### Step 4: Gallery screen
- New route + screen renderer
- Grid of all puzzles with progress state
- Tap to view full size

### Step 5: Home screen integration
- Add "🧩" button to home screen
- Navigate to gallery

## Estimated Scope
- ~123 topic SVGs + ~15 subject SVGs (can generate with agents)
- ~200 lines JS (puzzles.js)
- ~80 lines JS (gallery.js)
- ~60 lines CSS
- ~30 lines changes to existing files
