let data = null;

export const curriculum = {
  async load() {
    if (!data) {
      const resp = await fetch('data/curriculum.json');
      data = await resp.json();
    }
    return data;
  },

  async getAgeGroups() {
    const d = await this.load();
    return d.ageGroups;
  },

  async getAgeGroup(ageGroupId) {
    const d = await this.load();
    return d.ageGroups.find(ag => ag.id === ageGroupId);
  },

  async getSubjects(ageGroupId) {
    const ag = await this.getAgeGroup(ageGroupId);
    return ag ? ag.subjects : [];
  },

  async getSubject(ageGroupId, subjectId) {
    const subjects = await this.getSubjects(ageGroupId);
    return subjects.find(s => s.id === subjectId);
  },

  async getTopics(ageGroupId, subjectId) {
    const subject = await this.getSubject(ageGroupId, subjectId);
    return subject ? subject.topics : [];
  },

  async getTopic(ageGroupId, subjectId, topicId) {
    const topics = await this.getTopics(ageGroupId, subjectId);
    return topics.find(t => t.id === topicId);
  }
};
