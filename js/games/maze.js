import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

export function renderMaze(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  const { rows, cols, start, end, walls } = task;
  const wallSet = new Set(walls.map(w => `${w[0]},${w[1]},${w[2]}`));
  const visited = new Set();
  let pos = [...start];
  visited.add(`${pos[0]},${pos[1]}`);

  function hasWall(r1, c1, r2, c2) {
    // Check if wall exists between adjacent cells
    if (r2 === r1 && c2 === c1 + 1) {
      return wallSet.has(`${r1},${c1},right`);
    }
    if (r2 === r1 && c2 === c1 - 1) {
      return wallSet.has(`${r1},${c2},right`);
    }
    if (r2 === r1 + 1 && c2 === c1) {
      return wallSet.has(`${r1},${c1},bottom`);
    }
    if (r2 === r1 - 1 && c2 === c1) {
      return wallSet.has(`${r2},${c2},bottom`);
    }
    return true; // non-adjacent = blocked
  }

  function canMove(r1, c1, r2, c2) {
    if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) return false;
    if (Math.abs(r2 - r1) + Math.abs(c2 - c1) !== 1) return false;
    return !hasWall(r1, c1, r2, c2);
  }

  function moveTo(r, c) {
    if (!canMove(pos[0], pos[1], r, c)) return;
    pos = [r, c];
    visited.add(`${r},${c}`);
    sounds.click();
    render();

    if (r === end[0] && c === end[1]) {
      sounds.correct();
      setTimeout(() => onAnswer(true), 800);
    }
  }

  function render() {
    const cellSize = Math.min(60, Math.floor(280 / Math.max(rows, cols)));
    el.innerHTML = `
      <div class="game maze">
        <div class="game-question">${task.question}</div>
        <div class="maze-grid" style="
          grid-template-columns: repeat(${cols}, ${cellSize}px);
          grid-template-rows: repeat(${rows}, ${cellSize}px);
        ">
          ${Array.from({ length: rows * cols }, (_, idx) => {
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            const isCurrent = pos[0] === r && pos[1] === c;
            const isEnd = end[0] === r && end[1] === c;
            const isVisited = visited.has(`${r},${c}`);
            const wallRight = wallSet.has(`${r},${c},right`);
            const wallBottom = wallSet.has(`${r},${c},bottom`);
            const classes = [
              'maze-cell',
              isVisited ? 'maze-visited' : '',
              isCurrent ? 'maze-current' : '',
              isEnd ? 'maze-end' : '',
            ].filter(Boolean).join(' ');
            const borderRight = wallRight ? '3px solid var(--color-text)' : '1px solid #E0E0E0';
            const borderBottom = wallBottom ? '3px solid var(--color-text)' : '1px solid #E0E0E0';
            return `<div class="${classes}" data-r="${r}" data-c="${c}" style="
              border-right: ${c < cols - 1 ? borderRight : '3px solid var(--color-text)'};
              border-bottom: ${r < rows - 1 ? borderBottom : '3px solid var(--color-text)'};
              border-left: ${c === 0 ? '3px solid var(--color-text)' : 'none'};
              border-top: ${r === 0 ? '3px solid var(--color-text)' : 'none'};
              width: ${cellSize}px; height: ${cellSize}px;
            ">
              ${isCurrent ? '<span class="maze-player">🐣</span>' : ''}
              ${isEnd && !isCurrent ? '<span class="maze-target">🐔</span>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    el.querySelectorAll('.maze-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const r = Number(cell.dataset.r);
        const c = Number(cell.dataset.c);
        moveTo(r, c);
      });
    });

    // Swipe support
    let touchStart = null;
    const grid = el.querySelector('.maze-grid');
    if (!grid) return;

    grid.addEventListener('touchstart', (e) => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    grid.addEventListener('touchend', (e) => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      touchStart = null;

      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // too short, let click handle it

      let nr, nc;
      if (Math.abs(dx) > Math.abs(dy)) {
        nr = pos[0];
        nc = pos[1] + (dx > 0 ? 1 : -1);
      } else {
        nr = pos[0] + (dy > 0 ? 1 : -1);
        nc = pos[1];
      }
      moveTo(nr, nc);
    }, { passive: true });
  }

  render();
}
