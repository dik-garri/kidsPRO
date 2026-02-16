import { router } from '../router.js';
import { state } from '../state.js';
import { engine } from '../engine.js';
import { speech } from '../speech.js';
import { curriculum } from '../curriculum.js';

export async function playScreen(el, params) {
  const { ageGroup, subject, topic: topicId } = params;
  const topic = await curriculum.getTopic(ageGroup, subject, topicId);

  if (!topic || !topic.taskFile) {
    router.navigate(`/topics/${ageGroup}/${subject}`);
    return;
  }

  const topicPath = `${ageGroup}/${subject}/${topicId}`;
  const backPath = `/topics/${ageGroup}/${subject}`;

  async function loadNext() {
    const task = await engine.getTask(topicPath, topic.taskFile);
    const progress = state.getTopicProgress(topicPath);
    const total = topic.taskCount || 0;
    const done = progress.completed.length;

    if (!task) {
      el.innerHTML = `
        <div class="screen complete">
          <div class="owl-big">🦉</div>
          <h1>Молодец!</h1>
          <p>Все задания пройдены!</p>
          <p class="stars-count">⭐ ${state.get().stars}</p>
          <button class="btn btn-play" id="btn-back-topics">К темам</button>
        </div>
      `;
      el.querySelector('#btn-back-topics').addEventListener('click', () => router.navigate(backPath));
      return;
    }

    const speechPath = `assets/speech/${topic.taskFile.replace('.json', '')}/${task.id}.wav`;

    el.innerHTML = `
      <div class="screen play">
        <div class="play-header">
          <button class="btn btn-back btn-small" id="btn-home">←</button>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${total > 0 ? (done / total * 100) : 0}%"></div>
            <span class="progress-text">${done}/${total}</span>
          </div>
          <span class="stars-count">⭐ ${state.get().stars}</span>
        </div>
        <div id="game-area"></div>
      </div>
    `;

    el.querySelector('#btn-home').addEventListener('click', () => router.navigate(backPath));

    const gameArea = el.querySelector('#game-area');
    engine.render(gameArea, task, topicPath, speechPath, (correct) => {
      const feedback = document.createElement('div');
      feedback.className = correct ? 'feedback correct' : 'feedback wrong';
      feedback.innerHTML = correct
        ? '<div class="owl-big">🦉</div><p>Правильно!</p>'
        : '<div class="owl-big">🦉</div><p>Попробуй ещё!</p>';
      gameArea.appendChild(feedback);
      speech.speak(correct ? 'Правильно! Молодец!' : 'Попробуй ещё!');

      setTimeout(() => loadNext(), 1500);
    });
  }

  await loadNext();
}
