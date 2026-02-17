let puzzleData = null;

async function loadPuzzles() {
  if (!puzzleData) {
    const resp = await fetch('data/puzzles.json');
    puzzleData = await resp.json();
  }
  return puzzleData;
}

export const puzzles = {
  async getTopicPuzzle(topicPath) {
    const data = await loadPuzzles();
    return data.topics[topicPath] || null;
  },

  async getSubjectPuzzle(subjectPath) {
    const data = await loadPuzzles();
    return data.subjects[subjectPath] || null;
  },

  async getAllTopicPuzzles() {
    const data = await loadPuzzles();
    return data.topics;
  },

  async getAllSubjectPuzzles() {
    const data = await loadPuzzles();
    return data.subjects;
  },

  renderPuzzle(container, svgString, revealedCount, totalPieces, options = {}) {
    const { size = 200, animate = false, lastRevealed = -1 } = options;
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'puzzle-svg-wrapper';
    wrapper.innerHTML = svgString;

    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    svg.style.width = size + 'px';
    svg.style.height = size + 'px';

    const pieces = svg.querySelectorAll('[data-piece]');
    pieces.forEach(piece => {
      const idx = parseInt(piece.getAttribute('data-piece'));
      if (idx < revealedCount) {
        piece.classList.add('puzzle-piece-revealed');
        piece.classList.remove('puzzle-piece-hidden');
        if (animate && idx === lastRevealed) {
          piece.style.animation = 'puzzle-pop 0.5s ease-out both';
        }
      } else {
        piece.classList.add('puzzle-piece-hidden');
        piece.classList.remove('puzzle-piece-revealed');
      }
    });

    container.appendChild(wrapper);
    return svg;
  }
};
