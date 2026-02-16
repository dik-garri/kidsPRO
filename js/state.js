const STORAGE_KEY = 'owl-kids-v2-progress';

const defaultState = {
  stars: 0,
  muted: false,
  topics: {}
};

export const state = {
  _data: null,

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      this._data = saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
    } catch {
      this._data = { ...defaultState };
    }
    return this._data;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
  },

  get() {
    if (!this._data) this.load();
    return this._data;
  },

  addStar() {
    this.get().stars += 1;
    this.save();
  },

  getTopicProgress(topicPath) {
    const data = this.get();
    if (!data.topics[topicPath]) {
      data.topics[topicPath] = { completed: [], current: 0, history: [] };
    }
    return data.topics[topicPath];
  },

  recordAnswer(topicPath, taskId, correct) {
    const topic = this.getTopicProgress(topicPath);
    topic.history.push(correct ? 1 : 0);
    if (topic.history.length > 10) topic.history.shift();
    if (correct) {
      if (!topic.completed.includes(taskId)) topic.completed.push(taskId);
      this.addStar();
    }
    this.save();
  },

  getSubjectStats(ageGroupId, subjectId, topics) {
    let stars = 0;
    let completed = 0;
    let total = 0;
    for (const topic of topics) {
      const path = `${ageGroupId}/${subjectId}/${topic.id}`;
      const progress = this.get().topics[path];
      if (progress) {
        stars += progress.completed.length;
        completed += progress.completed.length;
      }
      total += topic.taskCount || 0;
    }
    return { stars, completed, total };
  },

  getAgeGroupStats(ageGroup) {
    let stars = 0;
    const prefix = ageGroup.id + '/';
    for (const [key, val] of Object.entries(this.get().topics)) {
      if (key.startsWith(prefix)) {
        stars += val.completed.length;
      }
    }
    return { stars };
  },

  toggleMute() {
    this.get().muted = !this.get().muted;
    this.save();
    return this.get().muted;
  },

  reset() {
    this._data = { ...defaultState };
    this.save();
  }
};
