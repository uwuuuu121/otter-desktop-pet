// Otter Pet - Desktop Timer Companion

function createPet() {
  if (document.getElementById('otter-pet-container')) return;

  const container = document.createElement('div');
  container.id = 'otter-pet-container';

  // Timer row: [▶ Start] [00:00] [⏸ Pause]
  const timerRow = document.createElement('div');
  timerRow.id = 'otter-timer-row';

  const btnStart = document.createElement('button');
  btnStart.id = 'otter-btn-start';
  btnStart.textContent = '▶';
  btnStart.addEventListener('click', (e) => { e.stopPropagation(); startTimer(); });

  const timer = document.createElement('div');
  timer.id = 'otter-timer';
  timer.textContent = formatTime(timeRemaining);
  timer.title = '點擊設定時間';

  const btnPause = document.createElement('button');
  btnPause.id = 'otter-btn-pause';
  btnPause.textContent = '⏸';
  btnPause.addEventListener('click', (e) => { e.stopPropagation(); pauseTimer(); });

  timerRow.appendChild(btnStart);
  timerRow.appendChild(timer);
  timerRow.appendChild(btnPause);

  // Wrap image + resize handle together
  const petWrapper = document.createElement('div');
  petWrapper.style.position = 'relative';
  petWrapper.style.display = 'inline-block';

  // Otter image
  const petImage = document.createElement('img');
  petImage.id = 'otter-pet';
  petImage.src = chrome.runtime.getURL('images/stage1_egg.png');

  // Resize handle (small circle at top-right)
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'otter-resize-handle';
  resizeHandle.title = 'Drag to resize';
  resizeHandle.textContent = '⤢';

  petWrapper.appendChild(petImage);
  petWrapper.appendChild(resizeHandle);

  container.appendChild(timerRow);
  container.appendChild(petWrapper);
  document.body.appendChild(container);

  makeDraggable(container, resizeHandle, timerRow, btnStart, btnPause);
  makeResizable(container, petImage, resizeHandle);
  makeTimerEditable(timer);

  loadState();
}

// ── Draggable ──────────────────────────────────────────────
function makeDraggable(container, ...excludedElements) {
  let isDragging = false;
  let startX, startY, origLeft, origTop;

  container.addEventListener('mousedown', (e) => {
    if (excludedElements.some(el => el && (e.target === el || el.contains(e.target)))) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = parseInt(container.style.left) || 0;
    origTop  = parseInt(container.style.top)  || 0;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    container.style.left = (origLeft + e.clientX - startX) + 'px';
    container.style.top  = (origTop  + e.clientY - startY) + 'px';
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
}

// ── Resizable ──────────────────────────────────────────────
function makeResizable(container, img, handle) {
  let isResizing = false;
  let startX, startY, startSize;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX    = e.clientX;
    startY    = e.clientY;
    startSize = img.offsetWidth;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    // Dragging right = bigger, dragging left = smaller
    const delta = (e.clientX - startX) - (e.clientY - startY);
    const newSize = Math.max(60, Math.min(300, startSize + delta));
    img.style.width  = newSize + 'px';
    img.style.height = newSize + 'px';
    saveState();
  });

  document.addEventListener('mouseup', () => { isResizing = false; });
}

// ── Editable Timer (click to type) ────────────────────────
function makeTimerEditable(timerEl) {
  timerEl.addEventListener('click', () => {
    const input = prompt('Set timer (mm:ss or minutes), e.g. "25:00" or "25":', formatTime(timeRemaining));
    if (input === null) return; // cancelled

    const parsed = parseInput(input);
    if (parsed > 0) {
      pauseTimer();
      timeRemaining = parsed;
      updateTimerDisplay();
      startTimer();
      saveState();
    }
  });
}

function parseInput(str) {
  str = str.trim();
  if (str.includes(':')) {
    const [m, s] = str.split(':').map(Number);
    if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
  } else {
    const m = parseFloat(str);
    if (!isNaN(m)) return Math.round(m * 60);
  }
  return 0;
}

// ── Timer logic ────────────────────────────────────────────
let timerInterval  = null;
let timeRemaining  = 30 * 60; // default 30 minutes
let isRunning      = false;
let currentStage   = 1;
let otterSize      = 150; // px

const stages = {
  1: 'images/stage1_egg.png',
  2: 'images/stage2.png',
  3: 'images/stage3_fish.png',
  4: 'images/stage4_bone.png',
  5: 'images/stage5_shell.png',
  gangster: 'images/stage_gangster.png',
  sleep:    'images/stage_sleep.png'
};

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) completeTimer();
    saveState();
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
}

function completeTimer() {
  pauseTimer();
  console.log('✅ Timer complete!');
  if (currentStage < 5) {
    currentStage++;
    evolveOtter(currentStage);
    console.log(`🎉 Evolved to Stage ${currentStage}!`);
  } else {
    console.log('🏆 Max level!');
  }
  timeRemaining = 30 * 60;
  updateTimerDisplay();
  saveState();
  startTimer();
}

function evolveOtter(stage) {
  const pet = document.getElementById('otter-pet');
  if (pet && stages[stage]) {
    pet.src = chrome.runtime.getURL(stages[stage]);
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateTimerDisplay() {
  const el = document.getElementById('otter-timer');
  if (el) el.textContent = formatTime(timeRemaining);
}

// ── Save / Load ────────────────────────────────────────────
function saveState() {
  const img = document.getElementById('otter-pet');
  chrome.storage.local.set({
    otterState: {
      timeRemaining,
      isRunning,
      currentStage,
      otterSize: img ? img.offsetWidth : 150
    }
  });
}

function loadState() {
  chrome.storage.local.get(['otterState'], (result) => {
    if (result.otterState) {
      const s = result.otterState;
      timeRemaining = s.timeRemaining || 30 * 60;
      currentStage  = s.currentStage  || 1;
      otterSize     = s.otterSize     || 150;

      const img = document.getElementById('otter-pet');
      if (img) {
        img.style.width  = otterSize + 'px';
        img.style.height = otterSize + 'px';
      }
      evolveOtter(currentStage);
      updateTimerDisplay();
    }
    if (!isRunning) startTimer();
  });
}

// ── Init ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createPet);
} else {
  createPet();
}
