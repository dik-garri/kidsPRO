import { router } from '../router.js';
import { state } from '../state.js';
import { curriculum } from '../curriculum.js';

export async function topicsScreen(el, params) {
  const { ageGroup, subject } = params;
  const subj = await curriculum.getSubject(ageGroup, subject);

  if (!subj) {
    router.navigate(`/subjects/${ageGroup}`);
    return;
  }

  el.innerHTML = `
    <div class="screen topics">
      <div class="screen-header">
        <button class="btn btn-back btn-small" id="btn-back">←</button>
        <h2>${subj.icon} ${subj.title}</h2>
        <span class="stars-count">⭐ ${state.get().stars}</span>
      </div>
      <div class="topics-list">
        ${subj.topics.map((topic, i) => {
          const topicPath = `${ageGroup}/${subject}/${topic.id}`;
          const progress = state.get().topics[topicPath];
          const completed = progress ? progress.completed.length : 0;
          const total = topic.taskCount || 0;
          const isDone = total > 0 && completed >= total;
          const hasTaskFile = !!topic.taskFile;

          return `
            <button class="btn topic-item ${isDone ? 'done' : ''} ${!hasTaskFile ? 'locked' : ''}"
              data-id="${topic.id}" ${!hasTaskFile ? 'disabled' : ''}>
              <span class="topic-num">${i + 1}</span>
              <span class="topic-info">
                <span class="topic-title">${topic.title}</span>
                ${total > 0 ? `<span class="topic-progress">${completed}/${total}</span>` : '<span class="topic-progress">Скоро!</span>'}
              </span>
              <span class="topic-status">${isDone ? '✅' : completed > 0 ? `⭐${completed}` : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  el.querySelector('#btn-back').addEventListener('click', () => {
    router.navigate(`/subjects/${ageGroup}`);
  });

  el.querySelectorAll('.topic-item:not([disabled])').forEach(item => {
    item.addEventListener('click', () => {
      router.navigate(`/play/${ageGroup}/${subject}/${item.dataset.id}`);
    });
  });
}
