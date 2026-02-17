import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

const CANVAS_SIZE = 300;

export function renderTrace(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  if (task.traceType === 'dots') {
    renderDots(el, task, onAnswer);
  } else {
    renderLine(el, task, onAnswer);
  }
}

function renderDots(el, task, onAnswer) {
  const points = task.points;
  // Find unique dot positions (skip later duplicates at same coords)
  const visibleDots = []; // indices of dots to render
  const seenPos = new Set();
  const posToDots = new Map(); // "x,y" -> [indices]
  for (let i = 0; i < points.length; i++) {
    const key = `${points[i].x},${points[i].y}`;
    if (!posToDots.has(key)) posToDots.set(key, []);
    posToDots.get(key).push(i);
    if (!seenPos.has(key)) {
      seenPos.add(key);
      visibleDots.push(i);
    }
  }
  let currentDot = 0;
  let answered = false;

  el.innerHTML = `
    <div class="game trace">
      <div class="game-question">${task.question}</div>
      <div class="trace-container">
        <canvas class="trace-template" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
        <canvas class="trace-user" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
      </div>
    </div>
  `;

  const templateCanvas = el.querySelector('.trace-template');
  const userCanvas = el.querySelector('.trace-user');
  const tCtx = templateCanvas.getContext('2d');
  const uCtx = userCanvas.getContext('2d');

  // Draw dots with numbers
  function drawTemplate() {
    tCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw faded connecting lines
    tCtx.strokeStyle = '#E0E0E0';
    tCtx.lineWidth = 2;
    tCtx.setLineDash([6, 4]);
    tCtx.beginPath();
    points.forEach((p, i) => {
      const x = p.x * CANVAS_SIZE;
      const y = p.y * CANVAS_SIZE;
      if (i === 0) tCtx.moveTo(x, y);
      else tCtx.lineTo(x, y);
    });
    tCtx.stroke();
    tCtx.setLineDash([]);

    // Draw only unique dots; color based on highest-priority state at each position
    for (const i of visibleDots) {
      const p = points[i];
      const key = `${p.x},${p.y}`;
      const allAtPos = posToDots.get(key);
      const x = p.x * CANVAS_SIZE;
      const y = p.y * CANVAS_SIZE;
      const radius = 18;

      // Determine color: orange if any dot here is current target, green if any completed, else grey
      let color = '#BDBDBD';
      for (const idx of allAtPos) {
        if (idx === currentDot) { color = '#FF9800'; break; }
        if (idx < currentDot) color = '#4CAF50';
      }

      tCtx.beginPath();
      tCtx.arc(x, y, radius, 0, Math.PI * 2);
      tCtx.fillStyle = color;
      tCtx.fill();
      tCtx.strokeStyle = '#fff';
      tCtx.lineWidth = 2;
      tCtx.stroke();

      // Number label
      tCtx.fillStyle = '#fff';
      tCtx.font = 'bold 14px sans-serif';
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';
      tCtx.fillText(String(i + 1), x, y);
    }
  }

  drawTemplate();

  // Drawing state
  let drawing = false;
  uCtx.strokeStyle = '#FF9800';
  uCtx.lineWidth = task.strokeWidth || 6;
  uCtx.lineCap = 'round';
  uCtx.lineJoin = 'round';

  function getPos(e) {
    const rect = userCanvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function checkDot(x, y) {
    if (currentDot >= points.length || answered) return;
    const target = points[currentDot];
    const tx = target.x * CANVAS_SIZE;
    const ty = target.y * CANVAS_SIZE;
    const dist = Math.hypot(x - tx, y - ty);

    if (dist < 30) {
      currentDot++;
      sounds.click();
      drawTemplate();

      if (currentDot >= points.length) {
        answered = true;
        sounds.correct();
        setTimeout(() => onAnswer(true), 800);
      }
    }
  }

  function onStart(e) {
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    uCtx.beginPath();
    uCtx.moveTo(p.x, p.y);
    checkDot(p.x, p.y);
  }

  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    uCtx.lineTo(p.x, p.y);
    uCtx.stroke();
    checkDot(p.x, p.y);
  }

  function onEnd() {
    drawing = false;
  }

  userCanvas.style.touchAction = 'none';
  userCanvas.addEventListener('mousedown', onStart);
  userCanvas.addEventListener('mousemove', onMove);
  userCanvas.addEventListener('mouseup', onEnd);
  userCanvas.addEventListener('mouseleave', onEnd);
  userCanvas.addEventListener('touchstart', onStart, { passive: false });
  userCanvas.addEventListener('touchmove', onMove, { passive: false });
  userCanvas.addEventListener('touchend', onEnd);
}

function renderLine(el, task, onAnswer) {
  let answered = false;

  el.innerHTML = `
    <div class="game trace">
      <div class="game-question">${task.question}</div>
      <div class="trace-container">
        <canvas class="trace-template" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
        <canvas class="trace-user" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
      </div>
      <div class="trace-controls">
        <button class="btn btn-small trace-clear">🗑</button>
        <button class="btn btn-small trace-check">✅</button>
      </div>
    </div>
  `;

  const templateCanvas = el.querySelector('.trace-template');
  const userCanvas = el.querySelector('.trace-user');
  const tCtx = templateCanvas.getContext('2d');
  const uCtx = userCanvas.getContext('2d');

  // Draw template line (faded)
  const points = task.points;
  tCtx.strokeStyle = 'rgba(158, 158, 158, 0.4)';
  tCtx.lineWidth = task.strokeWidth || 20;
  tCtx.lineCap = 'round';
  tCtx.lineJoin = 'round';
  tCtx.beginPath();
  points.forEach((p, i) => {
    const x = p.x * CANVAS_SIZE;
    const y = p.y * CANVAS_SIZE;
    if (i === 0) tCtx.moveTo(x, y);
    else tCtx.lineTo(x, y);
  });
  tCtx.stroke();

  // Draw start/end markers
  const startPt = points[0];
  const endPt = points[points.length - 1];
  tCtx.fillStyle = '#4CAF50';
  tCtx.beginPath();
  tCtx.arc(startPt.x * CANVAS_SIZE, startPt.y * CANVAS_SIZE, 8, 0, Math.PI * 2);
  tCtx.fill();
  tCtx.fillStyle = '#F44336';
  tCtx.beginPath();
  tCtx.arc(endPt.x * CANVAS_SIZE, endPt.y * CANVAS_SIZE, 8, 0, Math.PI * 2);
  tCtx.fill();

  // User drawing
  let drawing = false;
  uCtx.strokeStyle = '#FF9800';
  uCtx.lineWidth = task.strokeWidth || 20;
  uCtx.lineCap = 'round';
  uCtx.lineJoin = 'round';

  function getPos(e) {
    const rect = userCanvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function onStart(e) {
    e.preventDefault();
    drawing = true;
    const p = getPos(e);
    uCtx.beginPath();
    uCtx.moveTo(p.x, p.y);
  }

  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    uCtx.lineTo(p.x, p.y);
    uCtx.stroke();
  }

  function onEnd() {
    drawing = false;
  }

  userCanvas.style.touchAction = 'none';
  userCanvas.addEventListener('mousedown', onStart);
  userCanvas.addEventListener('mousemove', onMove);
  userCanvas.addEventListener('mouseup', onEnd);
  userCanvas.addEventListener('mouseleave', onEnd);
  userCanvas.addEventListener('touchstart', onStart, { passive: false });
  userCanvas.addEventListener('touchmove', onMove, { passive: false });
  userCanvas.addEventListener('touchend', onEnd);

  // Clear button
  el.querySelector('.trace-clear').addEventListener('click', () => {
    if (answered) return;
    uCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  });

  // Check button — verify coverage via point sampling
  el.querySelector('.trace-check').addEventListener('click', () => {
    if (answered) return;

    const samples = 30;
    let covered = 0;
    const threshold = task.threshold || 0.6;
    const tolerance = (task.strokeWidth || 20) * 1.5;
    const imageData = uCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let s = 0; s < samples; s++) {
      const t = s / (samples - 1);
      // Interpolate along the template polyline
      const totalLen = polylineLength(points);
      const targetDist = t * totalLen;
      const pt = pointAtDistance(points, targetDist);
      const px = Math.round(pt.x * CANVAS_SIZE);
      const py = Math.round(pt.y * CANVAS_SIZE);

      // Check nearby pixels for user drawing
      if (hasDrawingNear(imageData, px, py, Math.round(tolerance / 2))) {
        covered++;
      }
    }

    const ratio = covered / samples;
    answered = true;
    const correct = ratio >= threshold;

    if (correct) {
      sounds.correct();
    } else {
      sounds.wrong();
      answered = false;
      uCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    setTimeout(() => onAnswer(correct), correct ? 500 : 1000);
  });
}

function polylineLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function pointAtDistance(points, dist) {
  let remaining = dist;
  for (let i = 1; i < points.length; i++) {
    const segLen = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (remaining <= segLen) {
      const t = segLen > 0 ? remaining / segLen : 0;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      };
    }
    remaining -= segLen;
  }
  return points[points.length - 1];
}

function hasDrawingNear(imageData, cx, cy, radius) {
  const w = imageData.width;
  const h = imageData.height;
  for (let dy = -radius; dy <= radius; dy += 2) {
    for (let dx = -radius; dx <= radius; dx += 2) {
      const px = cx + dx;
      const py = cy + dy;
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      const idx = (py * w + px) * 4;
      if (imageData.data[idx + 3] > 50) return true; // alpha > 50 means drawn
    }
  }
  return false;
}
