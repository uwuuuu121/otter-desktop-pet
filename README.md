[English](README.md) | [繁體中文](README_zh-TW.md)

---
# 🦦 Otter Desktop Pet – Focus Timer Chrome Extension

A floating desktop otter that evolves while you focus.

## 🛠 How to Install

1. Download this repository as ZIP
2. Extract the folder
3. Open Chrome and go to: `chrome://extensions`
4. Enable **Developer Mode** (top right)
5. Click **Load Unpacked**
6. Select the folder containing `manifest.json`

Your otter will appear on every webpage 🦦

---

## 🌊 Evolution Stages

Your otter grows through focus sessions:

🥚 Stage 1 – Egg
👶 Stage 2 – Baby Otter
🐟 Stage 3 – Fish
🦴 Stage 4 – Bone
🐚 Stage 5 – Shell

After completing a full cycle, it resets and continues growing again.

## ✨ Features

- ⏱ 30-minute Pomodoro timer with automatic cycling
- 😴 Sleep mode during breaks (10 minutes)
- 😎 Gangster mode when you try to close during focus
- 🔮 Magic summon button — hover over the bottom-right corner to reveal it
- 💾 State saved across page refreshes (stage, timer, mode all preserved)
- 🖱 Draggable — stays within screen bounds, won't go off-screen
- ↔️ Resizable via drag handle
- ⏱ Editable timer — click the time display to set a custom duration

## 🔮 Summon Button

When the otter is hidden, a secret button appears in the bottom-right corner of the screen.

- Move your mouse to the bottom-right corner to reveal it
- The button shows your custom otter icon
- Hover tooltip displays 🔮🪄✨
- Click to bring your otter back exactly as you left it

## ✕ Close Button Behaviour

| Mode | 1st press | 2nd press |
|------|-----------|-----------|
| Focus | Activates Gangster mode 😎 | Hides otter |
| Sleep | Hides otter immediately | — |
| Gangster | Hides otter immediately | — |

The otter is **hidden**, not deleted — click the summon button to bring it back anytime.

## 📁 File Structure

```
otter-pet/
├── manifest.json
├── content.js
├── pet.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── images/
    ├── stage1_egg.png
    ├── stage2.png
    ├── stage3_fish.png
    ├── stage4_bone.png
    ├── stage5_shell.png
    ├── stage_gangster.png
    ├── stage_sleep.png
    └── summon_icon.png
```

## 📌 Tech

- JavaScript
- Chrome Extension (Manifest v3)
- CSS animations
- Chrome Storage API

## 🚀 Future Updates

- Stage-specific dialogue bubbles
- Personality system
- More evolution variations
