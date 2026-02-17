import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

export function renderTangram(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  const { target, pieces } = task;
  const rows = target.length;
  const cols = target[0].length;
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  let selectedPiece = null;
  let answered = false;

  function render() {
    el.innerHTML = `
      <div class="game tangram">
        <div class="game-question">${task.question}</div>
        <div class="tangram-layout">
          <div class="tangram-target-wrap">
            <div class="tangram-label">Образец</div>
            <div class="tangram-grid" style="grid-template-columns: repeat(${cols}, 1fr)">
              ${target.flat().map(cell => `
                <div class="tangram-cell target-cell">${cell || ''}</div>
              `).join('')}
            </div>
          </div>
          <div class="tangram-work-wrap">
            <div class="tangram-label">Собери</div>
            <div class="tangram-grid" style="grid-template-columns: repeat(${cols}, 1fr)">
              ${grid.flat().map((cell, idx) => {
                const r = Math.floor(idx / cols);
                const c = idx % cols;
                const hasTarget = !!target[r][c];
                return `<div class="tangram-cell work-cell ${cell ? 'filled' : ''} ${hasTarget ? 'active' : 'empty-target'}"
                  data-row="${r}" data-col="${c}">${cell || ''}</div>`;
              }).join('')}
            </div>
          </div>
        </div>
        <div class="tangram-pieces">
          ${shuffled.map((p, i) => {
            const used = isPieceUsed(i);
            return `<button class="btn drag-item tangram-piece ${used ? 'used' : ''} ${selectedPiece === i ? 'selected' : ''}"
              data-index="${i}" ${used ? 'disabled' : ''}>${p}</button>`;
          }).join('')}
        </div>
      </div>
    `;
    if (answered) return;
    bindEvents();
  }

  function isPieceUsed(idx) {
    const piece = shuffled[idx];
    let countBefore = 0;
    for (let i = 0; i <= idx; i++) {
      if (shuffled[i] === piece) countBefore++;
    }
    let countInGrid = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === piece) countInGrid++;
      }
    }
    return countBefore <= countInGrid;
  }

  function isComplete() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (target[r][c] && !grid[r][c]) return false;
      }
    }
    return true;
  }

  function placeInCell(r, c, itemIndex) {
    if (grid[r][c] !== null) return false;
    if (!target[r][c]) return false;
    grid[r][c] = shuffled[itemIndex];
    sounds.click();
    selectedPiece = null;
    render();
    if (isComplete()) checkAnswer();
    return true;
  }

  function checkAnswer() {
    answered = true;
    let correct = true;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((target[r][c] || null) !== (grid[r][c] || null)) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    if (correct) {
      sounds.correct();
    } else {
      sounds.wrong();
      setTimeout(() => {
        answered = false;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) grid[r][c] = null;
        }
        selectedPiece = null;
        render();
      }, 1200);
    }

    setTimeout(() => onAnswer(correct), correct ? 500 : 1000);
  }

  function bindEvents() {
    el.querySelectorAll('.tangram-piece:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPiece = Number(btn.dataset.index);
        render();
      });

      btn.addEventListener('touchstart', (e) => {
        if (answered) return;
        e.preventDefault();
        startDrag(btn, e.touches[0].clientX, e.touches[0].clientY, 'touch');
      }, { passive: false });

      btn.addEventListener('mousedown', (e) => {
        if (answered) return;
        e.preventDefault();
        startDrag(btn, e.clientX, e.clientY, 'mouse');
      });
    });

    el.querySelectorAll('.work-cell.active').forEach(cell => {
      cell.addEventListener('click', () => {
        if (answered) return;
        const r = Number(cell.dataset.row);
        const c = Number(cell.dataset.col);

        if (grid[r][c]) {
          grid[r][c] = null;
          selectedPiece = null;
          render();
          return;
        }

        if (selectedPiece !== null) {
          placeInCell(r, c, selectedPiece);
        }
      });
    });
  }

  function startDrag(btn, startX, startY, mode) {
    const index = Number(btn.dataset.index);
    const clone = btn.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.cssText = `
      position: fixed; z-index: 1000; pointer-events: none;
      width: ${btn.offsetWidth}px; height: ${btn.offsetHeight}px;
      left: ${startX - btn.offsetWidth / 2}px;
      top: ${startY - btn.offsetHeight / 2}px;
      opacity: 0.9; transform: scale(1.15); transition: none;
    `;
    document.body.appendChild(clone);
    btn.classList.add('dragging');

    selectedPiece = index;
    render();

    let lastHighlight = null;

    function moveClone(cx, cy) {
      clone.style.left = (cx - btn.offsetWidth / 2) + 'px';
      clone.style.top = (cy - btn.offsetHeight / 2) + 'px';

      const target = document.elementFromPoint(cx, cy);
      if (lastHighlight && lastHighlight !== target) {
        lastHighlight.classList.remove('drop-hover');
      }
      if (target && target.classList.contains('work-cell') && target.classList.contains('active') && !target.classList.contains('filled')) {
        target.classList.add('drop-hover');
        lastHighlight = target;
      } else {
        lastHighlight = null;
      }
    }

    function endDrag(cx, cy) {
      clone.remove();
      if (lastHighlight) lastHighlight.classList.remove('drop-hover');

      const target = document.elementFromPoint(cx, cy);
      if (target && target.classList.contains('work-cell') && target.classList.contains('active') && !target.classList.contains('filled')) {
        placeInCell(Number(target.dataset.row), Number(target.dataset.col), index);
      } else {
        selectedPiece = null;
        render();
      }
    }

    if (mode === 'touch') {
      function onMove(ev) {
        ev.preventDefault();
        moveClone(ev.touches[0].clientX, ev.touches[0].clientY);
      }
      function onEnd(ev) {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        const t = ev.changedTouches[0];
        endDrag(t.clientX, t.clientY);
      }
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    } else {
      function onMove(ev) {
        moveClone(ev.clientX, ev.clientY);
      }
      function onEnd(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        endDrag(ev.clientX, ev.clientY);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }
  }

  render();
}
