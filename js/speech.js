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

let russianVoice = null;
let ttsUnlocked = false;

function findRussianVoice() {
  const voices = speechSynthesis.getVoices();
  russianVoice = voices.find(v => v.lang.startsWith('ru')) || null;
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = findRussianVoice;
  findRussianVoice();
}

function unlockTts() {
  if (ttsUnlocked) return;
  if (typeof speechSynthesis === 'undefined') return;
  ttsUnlocked = true;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  speechSynthesis.speak(u);
}

document.addEventListener('touchstart', unlockTts, { capture: true });
document.addEventListener('touchend', unlockTts, { capture: true });
document.addEventListener('click', unlockTts, { capture: true });

let pendingSpeechPath = null;
let pendingText = null;

export const speech = {
  /**
   * Play pre-recorded WAV for a task, with TTS fallback.
   * @param {string} speechPath - full path like "assets/speech/age3/math/m01_01.wav"
   * @param {string} fallbackText - question text for TTS fallback
   */
  speakTask(speechPath, fallbackText) {
    if (state.get().muted) return;

    if (!audioUnlocked) {
      pendingSpeechPath = speechPath;
      pendingText = fallbackText;
      return;
    }

    this._doSpeakTask(speechPath, fallbackText);
  },

  _doSpeakTask(speechPath, fallbackText) {
    this.stop();

    if (!speechAudio) {
      speechAudio = document.createElement('audio');
      speechAudio.preload = 'auto';
    }

    speechAudio.src = speechPath;
    speechAudio.currentTime = 0;
    speechAudio.volume = 1.0;

    speechAudio.onerror = () => {
      this._doSpeakTts(fallbackText);
    };

    speechAudio.play().catch(() => {
      this._doSpeakTts(fallbackText);
    });
  },

  speak(text) {
    if (state.get().muted) return;

    const clean = text.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[❓❌✅⬜🔺]/gu, '').trim();
    if (!clean) return;

    if (!ttsUnlocked) {
      pendingText = clean;
      pendingSpeechPath = null;
      return;
    }

    this._doSpeakTts(clean);
  },

  _doSpeakTts(text) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    if (russianVoice) utterance.voice = russianVoice;

    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 100);
  },

  speakPending() {
    if (pendingSpeechPath && audioUnlocked) {
      this._doSpeakTask(pendingSpeechPath, pendingText);
      pendingSpeechPath = null;
      pendingText = null;
    } else if (pendingText && ttsUnlocked) {
      this._doSpeakTts(pendingText);
      pendingText = null;
    }
  },

  stop() {
    if (speechAudio) {
      speechAudio.pause();
      speechAudio.currentTime = 0;
    }
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }
};

document.addEventListener('click', () => {
  setTimeout(() => speech.speakPending(), 200);
}, { capture: true });
document.addEventListener('touchend', () => {
  setTimeout(() => speech.speakPending(), 200);
}, { capture: true });
