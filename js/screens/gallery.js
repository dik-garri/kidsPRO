import { router } from '../router.js';
import { state } from '../state.js';
import { puzzles } from '../puzzles.js';
import { curriculum } from '../curriculum.js';

export async function galleryScreen(el, params) {
  const { ageGroup } = params;
  const ag = await curriculum.getAgeGroup(ageGroup);

  if (!ag) {
    router.navigate('/');
    return;
  }

  const topicPuzzles = await puzzles.getAllTopicPuzzles();

  const items = [];
  for (const subj of ag.subjects) {
    for (const topic of subj.topics) {
      const topicPath = `${ageGroup}/${subj.id}/${topic.id}`;
      const puzzle = topicPuzzles[topicPath];
      if (!puzzle) continue;

      const progress = state.get().topics[topicPath];
      const completed = progress ? progress.completed.length : 0;
      const total = topic.taskCount || 12;

      items.push({ topicPath, puzzle, completed, total, title: puzzle.title || topic.title });
    }
  }

  el.innerHTML = `
    <div class="screen gallery">
      <div class="screen-header">
        <button class="btn btn-back btn-small" id="btn-back">←</button>
        <h2>🧩 Мои пазлы</h2>
        <span class="stars-count">⭐ ${state.get().stars}</span>
      </div>
      <div class="gallery-grid" id="gallery-grid"></div>
    </div>
  `;

  const grid = el.querySelector('#gallery-grid');

  items.forEach(item => {
    const card = document.createElement('button');
    card.className = `btn gallery-item ${item.completed === 0 ? 'locked' : item.completed >= item.total ? 'complete' : 'partial'}`;
    card.dataset.path = item.topicPath;

    const preview = document.createElement('div');
    preview.className = 'gallery-preview';
    puzzles.renderPuzzle(preview, item.puzzle.svg, item.completed, item.total, { size: 120 });

    const label = document.createElement('span');
    label.className = 'gallery-label';
    label.textContent = item.completed >= item.total ? '✅' : item.completed > 0 ? `${item.completed}/${item.total}` : '🔒';

    card.appendChild(preview);
    card.appendChild(label);
    grid.appendChild(card);
  });

  el.querySelector('#btn-back').addEventListener('click', () => router.navigate('/'));

  grid.querySelectorAll('.gallery-item:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const path = card.dataset.path;
      const item = items.find(i => i.topicPath === path);
      if (!item) return;
      showPuzzleModal(el, item);
    });
  });
}

function showPuzzleModal(el, item) {
  const modal = document.createElement('div');
  modal.className = 'puzzle-modal';
  modal.innerHTML = `
    <div class="puzzle-modal-content">
      <div class="puzzle-modal-svg" id="modal-svg"></div>
      <p class="puzzle-modal-title">${item.title}</p>
      <p class="puzzle-modal-progress">${item.completed}/${item.total}</p>
    </div>
  `;

  modal.addEventListener('click', () => modal.remove());

  el.appendChild(modal);

  const svgContainer = modal.querySelector('#modal-svg');
  puzzles.renderPuzzle(svgContainer, item.puzzle.svg, item.completed, item.total, { size: 280 });
}
