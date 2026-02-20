import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

function isSingleEmoji(val) {
  const s = String(val).trim();
  if (Intl.Segmenter) return [...new Intl.Segmenter().segment(s)].length === 1;
  return [...s].length <= 2;
}

export function renderChoice(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  const compact = task.options.every(o => isSingleEmoji(o));

  el.innerHTML = `
    <div class="game choice">
      <div class="game-question">${task.question}</div>
      ${task.image ? `<div class="game-image">${task.image}</div>` : ''}
      <div class="game-options${compact ? ' compact' : ''}">
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
