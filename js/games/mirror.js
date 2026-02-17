import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

export function renderMirror(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  el.innerHTML = `
    <div class="game mirror">
      <div class="game-question">${task.question}</div>
      <div class="mirror-original">
        <div class="mirror-pattern">
          ${task.pattern.map(item => `<span class="mirror-item">${item}</span>`).join('')}
        </div>
        <div class="mirror-divider">🪞</div>
      </div>
      <div class="game-options">
        ${task.options.map((opt, i) => `
          <button class="btn btn-option mirror-option" data-index="${i}">
            ${Array.isArray(opt) ? opt.join('') : opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedIdx = Number(btn.dataset.index);
      const correct = selectedIdx === task.answer;

      el.querySelectorAll('.btn-option').forEach(b => b.disabled = true);

      if (correct) {
        btn.classList.add('correct');
        sounds.correct();
      } else {
        btn.classList.add('wrong');
        sounds.wrong();
        el.querySelectorAll('.btn-option').forEach(b => {
          if (Number(b.dataset.index) === task.answer) {
            b.classList.add('correct');
          }
        });
      }

      setTimeout(() => onAnswer(correct), 1000);
    });
  });
}
