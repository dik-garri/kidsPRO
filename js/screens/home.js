import { router } from '../router.js';
import { state } from '../state.js';
import { curriculum } from '../curriculum.js';

export async function homeScreen(el) {
  const ageGroups = await curriculum.getAgeGroups();
  const s = state.get();

  el.innerHTML = `
    <div class="screen home">
      <button class="btn btn-mute" id="btn-mute">${s.muted ? '🔇' : '🔊'}</button>
      <div class="home-header">
        <div class="owl-big">🦉</div>
        <h1>Совёнок</h1>
        <p class="subtitle">Готовимся к школе!</p>
      </div>
      <div class="age-groups">
        ${ageGroups.map(ag => {
          const stats = state.getAgeGroupStats(ag);
          return `
            <button class="btn age-card" data-id="${ag.id}" style="--card-color: ${ag.color}">
              <span class="age-icon">${ag.icon}</span>
              <span class="age-title">${ag.title}</span>
              <span class="age-subtitle">${ag.subtitle}</span>
              ${stats.stars > 0 ? `<span class="age-stars">⭐ ${stats.stars}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
      <button class="btn btn-reset" id="btn-reset">Начать заново</button>
    </div>
  `;

  el.querySelector('#btn-mute').addEventListener('click', () => {
    const muted = state.toggleMute();
    el.querySelector('#btn-mute').textContent = muted ? '🔇' : '🔊';
  });

  el.querySelector('#btn-reset').addEventListener('click', () => {
    if (confirm('Сбросить весь прогресс?')) {
      state.reset();
      router.navigate('/');
    }
  });

  el.querySelectorAll('.age-card').forEach(card => {
    card.addEventListener('click', () => {
      router.navigate(`/subjects/${card.dataset.id}`);
    });
  });
}
