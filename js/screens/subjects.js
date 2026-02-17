import { router } from '../router.js';
import { state } from '../state.js';
import { curriculum } from '../curriculum.js';

export async function subjectsScreen(el, params) {
  const { ageGroup } = params;
  const ag = await curriculum.getAgeGroup(ageGroup);

  if (!ag) {
    router.navigate('/');
    return;
  }

  const s = state.get();
  const agStats = state.getAgeGroupStats(ag);

  el.innerHTML = `
    <div class="screen subjects">
      <div class="screen-header">
        <button class="btn btn-back btn-small" id="btn-back">←</button>
        <h2>${ag.icon} ${ag.title}</h2>
        <span class="stars-count">⭐ ${agStats.stars}</span>
      </div>
      <p class="screen-subtitle">${ag.subtitle}</p>
      <div class="subject-grid">
        ${ag.subjects.map(subj => {
          const stats = state.getSubjectStats(ageGroup, subj.id, subj.topics);
          return `
            <button class="btn subject-card" data-id="${subj.id}" style="--card-color: ${subj.color}">
              <span class="subject-icon">${subj.icon}</span>
              <span class="subject-title">${subj.title}</span>
              <span class="subject-progress">${stats.completed}/${stats.total}</span>
              ${stats.stars > 0 ? `<span class="subject-stars">⭐ ${stats.stars}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
      <button class="btn btn-gallery" id="btn-puzzles">🧩 Мои пазлы</button>
    </div>
  `;

  el.querySelector('#btn-back').addEventListener('click', () => router.navigate('/'));

  el.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      router.navigate(`/topics/${ageGroup}/${card.dataset.id}`);
    });
  });

  el.querySelector('#btn-puzzles').addEventListener('click', () => {
    router.navigate(`/puzzles/${ageGroup}`);
  });
}
