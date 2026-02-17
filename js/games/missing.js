import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

export function renderMissing(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  el.innerHTML = `
    <div class="game missing">
      <div class="game-question">${task.question}</div>
      <div class="missing-scene">
        ${task.scene.map(item => `
          <span class="missing-item ${item === '❓' ? 'missing-placeholder' : ''}">${item}</span>
        `).join('')}
      </div>
      <div class="game-options">
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
        const placeholder = el.querySelector('.missing-placeholder');
        if (placeholder) {
          placeholder.textContent = task.answer;
          placeholder.classList.remove('missing-placeholder');
          placeholder.classList.add('missing-revealed');
        }
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
