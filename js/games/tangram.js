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
          grid[r][c] = shuffled[selectedPiece];
          sounds.click();
          selectedPiece = null;
          render();
          if (isComplete()) checkAnswer();
        }
      });
    });
  }

  render();
}
