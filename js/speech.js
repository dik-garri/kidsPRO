import { state } from './state.js';

let speechAudio = null;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  if (!speechAudio) {
    speechAudio = document.createElement('audio');
    speechAudio.preload = 'auto';
  }
  speechAudio.muted = true;
  speechAudio.src = 'assets/sounds/silence.wav';
  const p = speechAudio.play();
  if (p) p.then(() => {
    speechAudio.pause();
    speechAudio.muted = false;
    speechAudio.currentTime = 0;
  }).catch(() => {
    speechAudio.muted = false;
  });
}

document.addEventListener('touchstart', unlockAudio, { capture: true });
document.addEventListener('touchend', unlockAudio, { capture: true });
document.addEventListener('click', unlockAudio, { capture: true });

let pendingSpeechPath = null;

export const speech = {
  speakTask(speechPath) {
    if (state.get().muted) return;

    if (!audioUnlocked) {
      pendingSpeechPath = speechPath;
      return;
    }

    this._play(speechPath);
  },

  _play(speechPath) {
    this.stop();

    if (!speechAudio) {
      speechAudio = document.createElement('audio');
      speechAudio.preload = 'auto';
    }

    speechAudio.src = speechPath;
    speechAudio.currentTime = 0;
    speechAudio.volume = 1.0;
    speechAudio.play().catch(() => {});
  },

  speakPending() {
    if (pendingSpeechPath && audioUnlocked) {
      this._play(pendingSpeechPath);
      pendingSpeechPath = null;
    }
  },

  stop() {
    if (speechAudio) {
      speechAudio.pause();
      speechAudio.currentTime = 0;
    }
  }
};

document.addEventListener('click', () => {
  setTimeout(() => speech.speakPending(), 200);
}, { capture: true });
document.addEventListener('touchend', () => {
  setTimeout(() => speech.speakPending(), 200);
}, { capture: true });
