import { state } from './state.js';
import { renderChoice } from './games/choice.js';
import { renderSequence } from './games/sequence.js';
import { renderMatch } from './games/match.js';
import { renderDragDrop } from './games/dragdrop.js';
import { renderCount } from './games/count.js';
import { renderClassify } from './games/classify.js';
import { renderMaze } from './games/maze.js';
import { renderTrace } from './games/trace.js';
import { renderMissing } from './games/missing.js';
import { renderMirror } from './games/mirror.js';
import { renderTangram } from './games/tangram.js';

const renderers = {
  choice: renderChoice,
  sequence: renderSequence,
  match: renderMatch,
  'drag-drop': renderDragDrop,
  count: renderCount,
  classify: renderClassify,
  maze: renderMaze,
  trace: renderTrace,
  missing: renderMissing,
  mirror: renderMirror,
  tangram: renderTangram,
};

let levelCache = {};

export const engine = {
  async loadLevel(taskFile) {
    if (!levelCache[taskFile]) {
      const resp = await fetch(`data/tasks/${taskFile}`);
      levelCache[taskFile] = await resp.json();
    }
    return levelCache[taskFile];
  },

  async getTask(topicPath, taskFile) {
    const level = await this.loadLevel(taskFile);
    const progress = state.getTopicProgress(topicPath);
    const available = level.tasks.filter(t => !progress.completed.includes(t.id));
    if (available.length === 0) return null;
    return available[0];
  },

  render(el, task, topicPath, speechPath, onComplete) {
    const renderer = renderers[task.type];
    if (!renderer) {
      el.innerHTML = '<p>Неизвестный тип задания</p>';
      return;
    }
    renderer(el, task, speechPath, (correct) => {
      state.recordAnswer(topicPath, task.id, correct);
      onComplete(correct);
    });
  },

  registerType(type, renderer) {
    renderers[type] = renderer;
  }
};
