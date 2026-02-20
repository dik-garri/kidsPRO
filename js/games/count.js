import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

function isSingleEmoji(val) {
  const s = String(val).trim();
  if (Intl.Segmenter) return [...new Intl.Segmenter().segment(s)].length === 1;
  return [...s].length <= 2;
}

export function renderCount(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  const hasOptions = Array.isArray(task.options);

  if (hasOptions) {
    renderChoiceMode(el, task, onAnswer);
  } else {
    renderTapMode(el, task, onAnswer);
  }
}

function renderChoiceMode(el, task, onAnswer) {
  el.innerHTML = `
    <div class="game count">
      <div class="game-question">${task.question}</div>
      <div class="count-scene">${task.scene.map(item =>
        `<span class="count-item">${item}</span>`
      ).join('')}</div>
      <div class="game-options${task.options.every(o => isSingleEmoji(o)) ? ' compact' : ''}">
        ${task.options.map((opt, i) => `
          <button class="btn btn-option" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = task.options[Number(btn.dataset.index)];
      const correct = selected === task.answer;

      el.querySelectorAll('.btn-option').forEach(b => b.disabled = true);

      if (correct) {
        btn.classList.add('correct');
        sounds.correct();
      } else {
        btn.classList.add('wrong');
        sounds.wrong();
        el.querySelectorAll('.btn-option').forEach(b => {
          if (task.options[Number(b.dataset.index)] === task.answer) {
            b.classList.add('correct');
          }
        });
      }

      setTimeout(() => onAnswer(correct), 1000);
    });
  });
}

function renderTapMode(el, task, onAnswer) {
  const tapped = new Set();
  const targetCount = task.scene.filter(item => item === task.target).length;

  function render() {
    el.innerHTML = `
      <div class="game count">
        <div class="game-question">${task.question}</div>
        <div class="count-counter">${tapped.size} / ${targetCount}</div>
        <div class="count-scene">
          ${task.scene.map((item, i) => {
            const isTarget = item === task.target;
            const isTapped = tapped.has(i);
            return `<button class="count-tappable ${isTapped ? 'count-tapped' : ''}"
              data-index="${i}" ${!isTarget || isTapped ? 'disabled' : ''}>${item}</button>`;
          }).join('')}
        </div>
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    el.querySelectorAll('.count-tappable:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        tapped.add(idx);
        sounds.click();
        render();

        if (tapped.size === targetCount) {
          sounds.correct();
          setTimeout(() => onAnswer(true), 800);
        }
      });
    });
  }

  render();
}
