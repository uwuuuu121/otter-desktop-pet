// ═══════════════════════════════════════════════
//  Otter Pet Timer
//  focus → sleep → focus → ...
//  ✕ (focus only): 1st = gangster, 2nd = close
//  ✕ (sleep): close immediately
//  gangster done → sleep 10min → back to stage
// ═══════════════════════════════════════════════

let timerInterval    = null;
let isRunning        = false;
let currentStage     = 1;
let currentMode      = 'focus'; // 'focus' | 'sleep' | 'gangster'
let closeClickCount  = 0;       // tracks ✕ presses in focus mode

let focusDuration    = 30 * 60;
let sleepDuration    = 10 * 60;
let gangsterDuration =  5 * 60;
let timeRemaining    = focusDuration;
let defaultOtterSize = 250; // bigger default

const stages = {
  1: 'images/stage1_egg.png',
  2: 'images/stage2.png',
  3: 'images/stage3_fish.png',
  4: 'images/stage4_bone.png',
  5: 'images/stage5_shell.png',
  gangster: 'images/stage_gangster.png',
  sleep:    'images/stage_sleep.png'
};

// ── Create UI ──────────────────────────────────
function createPet() {
  // Only allow one otter instance across all tabs
  chrome.storage.local.get(['otterExists'], (result) => {
    if (result.otterExists) {
      console.log('Otter already exists in another tab');
      showSummonButton(); // Show button if otter exists elsewhere
      return;
    }
    
    if (document.getElementById('otter-pet-container')) return;
    
    // Mark that otter exists
    chrome.storage.local.set({ otterExists: true });
    hideSummonButton(); // Remove summon button if it exists

    const container = document.createElement('div');
    container.id = 'otter-pet-container';

  // Timer row
  const timerRow = document.createElement('div');
  timerRow.id = 'otter-timer-row';

  const btnStart = document.createElement('button');
  btnStart.id = 'otter-btn-start';
  btnStart.textContent = '▶';
  btnStart.title = '開始';
  btnStart.addEventListener('click', (e) => { e.stopPropagation(); startTimer(); });

  const timer = document.createElement('div');
  timer.id = 'otter-timer';
  timer.textContent = formatTime(timeRemaining);
  timer.title = '點擊設定時間';

  const btnPause = document.createElement('button');
  btnPause.id = 'otter-btn-pause';
  btnPause.textContent = '⏸';
  btnPause.title = '暫停';
  btnPause.addEventListener('click', (e) => { e.stopPropagation(); pauseTimer(); });

  const btnClose = document.createElement('button');
  btnClose.id = 'otter-btn-close';
  btnClose.textContent = '✕';
  btnClose.title = '關閉';
  btnClose.addEventListener('click', (e) => { e.stopPropagation(); handleClose(); });

  timerRow.appendChild(btnStart);
  timerRow.appendChild(timer);
  timerRow.appendChild(btnPause);
  timerRow.appendChild(btnClose);

  // Pet wrapper
  const petWrapper = document.createElement('div');
  petWrapper.id = 'otter-pet-wrapper';

  const petImage = document.createElement('img');
  petImage.id  = 'otter-pet';
  petImage.src = chrome.runtime.getURL(stages[currentStage]);

  const resizeHandle = document.createElement('div');
  resizeHandle.id          = 'otter-resize-handle';
  resizeHandle.textContent = '⤢';
  resizeHandle.title       = '拖曳調整大小';

  petWrapper.appendChild(petImage);
  petWrapper.appendChild(resizeHandle);

  container.appendChild(timerRow);
  container.appendChild(petWrapper);
  document.body.appendChild(container);

  makeDraggable(container, resizeHandle, timerRow, btnStart, btnPause, btnClose);
  makeResizable(petImage, resizeHandle);
  makeTimerEditable(timer);

  loadState();
  // Bubbles removed - no longer needed
  }); // Close chrome.storage.get callback
}





// ── Close button logic ─────────────────────────
function handleClose() {
  if (currentMode === 'sleep') {
    hideOtter();
    return;
  }

  if (currentMode === 'gangster') {
    hideOtter();
    return;
  }

  // Focus mode: first ✕ = gangster, second ✕ = hide
  closeClickCount++;
  if (closeClickCount === 1) {
    activateGangster();
  } else {
    hideOtter();
    closeClickCount = 0;
  }
}

function hideOtter() {
  pauseTimer();
  const container = document.getElementById('otter-pet-container');
  if (container) container.style.display = 'none';
  chrome.storage.local.set({ otterHidden: true });
  showSummonButton();
}

function showOtter() {
  const container = document.getElementById('otter-pet-container');
  if (container) {
    container.style.display = 'flex';
    chrome.storage.local.remove(['otterHidden']);
    hideSummonButton();
    startTimer();
  } else {
    // Container doesn't exist yet (e.g. fresh page load), create it
    chrome.storage.local.remove(['otterExists', 'otterHidden'], () => {
      createPet();
    });
  }
}

function removePet() {
  pauseTimer();
  chrome.storage.local.remove(['otterState', 'otterExists', 'otterHidden']);
  const container = document.getElementById('otter-pet-container');
  if (container) container.remove();
  showSummonButton();
}

// ── Summon Button ──────────────────────────────
function showSummonButton() {
  // Don't create if already exists
  if (document.getElementById('otter-summon-btn')) return;

  // Invisible hover zone in bottom-right corner
  const zone = document.createElement('div');
  zone.id = 'otter-summon-zone';
  document.body.appendChild(zone);

  const btn = document.createElement('button');
  btn.id = 'otter-summon-btn';
  btn.title = '召喚水獺';

  // Use custom summon icon
  const img = document.createElement('img');
  img.id = 'otter-summon-img';
  img.src = chrome.runtime.getURL('images/summon_icon.png');
  btn.appendChild(img);

  btn.addEventListener('click', () => {
    zone.remove();
    btn.remove();
    showOtter();
  });

  document.body.appendChild(btn);
}

function hideSummonButton() {
  const btn = document.getElementById('otter-summon-btn');
  if (btn) btn.remove();
  const zone = document.getElementById('otter-summon-zone');
  if (zone) zone.remove();
}

// ── Timer controls ─────────────────────────────
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
  saveState();
}

function completeTimer() {
  pauseTimer();

  if (currentMode === 'focus') {
    // Evolve then sleep
    currentStage++;
    if (currentStage > 5) currentStage = 1; // Cycle back to 1
    console.log(`🎉 Stage ${currentStage}! Taking a break...`);
    activateSleep();

  } else if (currentMode === 'sleep') {
    // Sleep done → back to focus stage
    activateFocus();

  } else if (currentMode === 'gangster') {
    // Gangster done → sleep 10 min
    console.log('😎 Gangster done! Rest time...');
    activateSleep();
  }
}

// ── Mode switchers ──────────────────────────────
function activateFocus() {
  currentMode   = 'focus';
  timeRemaining = focusDuration;
  closeClickCount = 0;
  setOtterImage(stages[currentStage]);
  updateTimerDisplay();
  updateTimerColor('focus');
  saveState();
  startTimer();
  console.log('🎯 Focus!');
}

function activateSleep() {
  currentMode   = 'sleep';
  timeRemaining = sleepDuration;
  setOtterImage(stages.sleep);
  updateTimerDisplay();
  updateTimerColor('sleep');
  saveState();
  startTimer();
  console.log('😴 Sleep!');
}

function activateGangster() {
  pauseTimer();
  currentMode   = 'gangster';
  timeRemaining = gangsterDuration;
  setOtterImage(stages.gangster);
  updateTimerDisplay();
  updateTimerColor('gangster');
  saveState();
  startTimer();
  console.log('😎 Gangster!');
}

// ── Visuals ────────────────────────────────────
function setOtterImage(src) {
  const pet = document.getElementById('otter-pet');
  if (pet) pet.src = chrome.runtime.getURL(src);
}

function updateTimerColor(mode) {
  const row = document.getElementById('otter-timer-row');
  if (!row) return;
  const colors = {
    focus:    { bg: 'white',   color: 'black'   },
    sleep:    { bg: '#cce5ff', color: '#004085'  },
    gangster: { bg: '#ffd5d5', color: '#7b0000'  }
  };
  const c = colors[mode] || colors.focus;
  row.querySelectorAll('button, #otter-timer').forEach(el => {
    el.style.background = c.bg;
    el.style.color      = c.color;
  });
}

function updateTimerDisplay() {
  const el = document.getElementById('otter-timer');
  if (el) el.textContent = formatTime(timeRemaining);
}

function formatTime(secs) {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ── Editable timer ─────────────────────────────
function makeTimerEditable(timerEl) {
  timerEl.addEventListener('click', () => {
    const input = prompt('設定時間 (mm:ss 或分鐘數)\n例如：25:00 或 25', formatTime(timeRemaining));
    if (input === null) return;
    const parsed = parseTimeInput(input);
    if (parsed > 0) {
      pauseTimer();
      timeRemaining = parsed;
      if (currentMode === 'focus')    focusDuration    = parsed;
      if (currentMode === 'sleep')    sleepDuration    = parsed;
      if (currentMode === 'gangster') gangsterDuration = parsed;
      updateTimerDisplay();
      startTimer();
      saveState();
    }
  });
}

function parseTimeInput(str) {
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

// ── Draggable (fixed: mouse stays on otter) ───
function makeDraggable(container, ...excludedElements) {
  let isDragging = false;

  container.addEventListener('mousedown', (e) => {
    if (excludedElements.some(el => el && (e.target === el || el.contains(e.target)))) return;
    
    isDragging = true;
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = container.getBoundingClientRect();
    let newLeft = e.clientX - rect.width / 2;
    let newTop  = e.clientY - rect.height / 2;

    // Clamp within viewport
    const maxLeft = window.innerWidth  - rect.width;
    const maxTop  = window.innerHeight - rect.height;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop  = Math.max(0, Math.min(newTop,  maxTop));

    container.style.left = newLeft + 'px';
    container.style.top  = newTop  + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.style.cursor = 'move';
    }
  });
}

// ── Resizable (fixed direction) ────────────────
// Drag handle RIGHT/DOWN = bigger, LEFT/UP = smaller
function makeResizable(img, handle) {
  let isResizing = false;
  let startX, startY, startSize;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX     = e.clientX;
    startY     = e.clientY;
    startSize  = img.offsetWidth;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    // Moving right OR down = bigger
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    const newSize = Math.max(60, Math.min(300, startSize + delta));
    img.style.width  = newSize + 'px';
    img.style.height = newSize + 'px';
    saveState();
  });

  document.addEventListener('mouseup', () => { isResizing = false; });
}

// ── Save / Load ────────────────────────────────
function saveState() {
  const img = document.getElementById('otter-pet');
  chrome.storage.local.set({
    otterState: {
      timeRemaining,
      isRunning,
      currentStage,
      currentMode,
      closeClickCount,
      focusDuration,
      sleepDuration,
      gangsterDuration,
      otterSize: img ? img.offsetWidth : defaultOtterSize
    }
  });
}

function loadState() {
  chrome.storage.local.get(['otterState', 'otterHidden'], (result) => {
    if (result.otterHidden) {
      // Was hidden before page reload - keep hidden, show summon button
      const container = document.getElementById('otter-pet-container');
      if (container) container.style.display = 'none';
      showSummonButton();
      return;
    }
    if (result.otterState) {
      const s         = result.otterState;
      timeRemaining    = s.timeRemaining    ?? focusDuration;
      currentStage     = s.currentStage     ?? 1;
      currentMode      = s.currentMode      ?? 'focus';
      closeClickCount  = s.closeClickCount  ?? 0;
      focusDuration    = s.focusDuration    ?? focusDuration;
      sleepDuration    = s.sleepDuration    ?? sleepDuration;
      gangsterDuration = s.gangsterDuration ?? gangsterDuration;

      const img = document.getElementById('otter-pet');
      if (img) {
        const size = s.otterSize || defaultOtterSize;
        img.style.width  = size + 'px';
        img.style.height = size + 'px';
        img.src = chrome.runtime.getURL(
          currentMode === 'sleep'    ? stages.sleep    :
          currentMode === 'gangster' ? stages.gangster :
          stages[currentStage]
        );
      }
      updateTimerDisplay();
      updateTimerColor(currentMode);
    }
    if (!isRunning) startTimer();
  });
}

// ── Init ───────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createPet);
} else {
  createPet();
}


