import { sounds } from '../sounds.js';
import { speech } from '../speech.js';

export function renderClassify(el, task, speechPath, onAnswer) {
  speech.speakTask(speechPath, task.question);

  const shuffled = [...task.items].sort(() => Math.random() - 0.5);
  const baskets = task.categories.map(c => ({ name: c.name, expected: new Set(c.items), placed: [] }));
  const placedItems = new Set();
  let selectedItem = null;
  let answered = false;

  function render() {
    el.innerHTML = `
      <div class="game classify">
        <div class="game-question">${task.question}</div>
        <div class="classify-baskets">
          ${baskets.map((b, bi) => `
            <div class="classify-basket" data-basket="${bi}">
              <div class="basket-label">${b.name}</div>
              <div class="basket-items">
                ${b.placed.map(item => `<span class="basket-item">${item}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="classify-pool">
          ${shuffled.map((item, i) => {
            const used = placedItems.has(i);
            return `<button class="btn classify-item ${used ? 'used' : ''} ${selectedItem === i ? 'selected' : ''}"
              data-index="${i}" ${used ? 'disabled' : ''}>${item}</button>`;
          }).join('')}
        </div>
      </div>
    `;
    if (answered) return;
    bindEvents();
  }

  function placeInBasket(basketIdx, itemIndex) {
    baskets[basketIdx].placed.push(shuffled[itemIndex]);
    placedItems.add(itemIndex);
    sounds.click();
    selectedItem = null;
    render();

    if (placedItems.size === shuffled.length) {
      checkAnswer();
    }
  }

  function checkAnswer() {
    answered = true;
    const correct = baskets.every(b =>
      b.placed.length === b.expected.size &&
      b.placed.every(item => b.expected.has(item))
    );

    if (correct) {
      sounds.correct();
    } else {
      sounds.wrong();
      setTimeout(() => {
        answered = false;
        baskets.forEach(b => b.placed = []);
        placedItems.clear();
        selectedItem = null;
        render();
      }, 1200);
    }

    setTimeout(() => onAnswer(correct), correct ? 500 : 1000);
  }

  function bindEvents() {
    // Tap to select item
    el.querySelectorAll('.classify-item:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedItem = Number(btn.dataset.index);
        render();
      });

      btn.addEventListener('touchstart', (e) => {
        if (answered) return;
        e.preventDefault();
        startDrag(btn, e.touches[0].clientX, e.touches[0].clientY, 'touch');
      }, { passive: false });

      btn.addEventListener('mousedown', (e) => {
        if (answered) return;
        e.preventDefault();
        startDrag(btn, e.clientX, e.clientY, 'mouse');
      });
    });

    // Tap basket to place selected item
    el.querySelectorAll('.classify-basket').forEach(basket => {
      basket.addEventListener('click', () => {
        if (answered) return;
        if (selectedItem !== null) {
          placeInBasket(Number(basket.dataset.basket), selectedItem);
        }
      });
    });
  }

  function startDrag(btn, startX, startY, mode) {
    const index = Number(btn.dataset.index);
    const clone = btn.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.cssText = `
      position: fixed; z-index: 1000; pointer-events: none;
      width: ${btn.offsetWidth}px; height: ${btn.offsetHeight}px;
      left: ${startX - btn.offsetWidth / 2}px;
      top: ${startY - btn.offsetHeight / 2}px;
      opacity: 0.9; transform: scale(1.15); transition: none;
    `;
    document.body.appendChild(clone);
    btn.classList.add('dragging');

    selectedItem = index;
    render();

    let lastHighlight = null;

    function moveClone(cx, cy) {
      clone.style.left = (cx - btn.offsetWidth / 2) + 'px';
      clone.style.top = (cy - btn.offsetHeight / 2) + 'px';

      const target = document.elementFromPoint(cx, cy);
      if (lastHighlight && lastHighlight !== target) {
        lastHighlight.classList.remove('drop-hover');
      }
      const basket = target?.closest('.classify-basket');
      if (basket) {
        basket.classList.add('drop-hover');
        lastHighlight = basket;
      } else {
        lastHighlight = null;
      }
    }

    function endDrag(cx, cy) {
      clone.remove();
      if (lastHighlight) lastHighlight.classList.remove('drop-hover');

      const target = document.elementFromPoint(cx, cy);
      const basket = target?.closest('.classify-basket');
      if (basket) {
        placeInBasket(Number(basket.dataset.basket), index);
      } else {
        selectedItem = null;
        render();
      }
    }

    if (mode === 'touch') {
      function onMove(ev) {
        ev.preventDefault();
        moveClone(ev.touches[0].clientX, ev.touches[0].clientY);
      }
      function onEnd(ev) {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        const t = ev.changedTouches[0];
        endDrag(t.clientX, t.clientY);
      }
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    } else {
      function onMove(ev) {
        moveClone(ev.clientX, ev.clientY);
      }
      function onEnd(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        endDrag(ev.clientX, ev.clientY);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    }
  }

  render();
}
