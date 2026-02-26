# 🦦 Otter Pet Timer - Chrome Extension

你的桌面水獺計時器夥伴！專注工作，看著水獺成長！

## ✨ 功能特色

### 主要進化路線（每30分鐘一階段）
1. 🥚 **Stage 1: Egg** - 蛋
2. 🍼 **Stage 2: Baby** - 奶瓶寶寶
3. 🐟 **Stage 3: Fish** - 吃魚水獺
4. 🦴 **Stage 4: Bone** - 啃骨頭水獺
5. 🦪 **Stage 5: Shell** - 吃貝殼水獺（最高等級）

### 特殊狀態
- 😎 **Gangster** - 如果你放棄或打X，水獺會變成壞水獺提醒你！
- 😴 **Sleep** - 休息時間顯示睡覺水獺

## 📦 安裝步驟

### 步驟 1：準備檔案
確認你的資料夾裡有：
```
otter-pet-extension/
├── manifest.json
├── content.js
├── pet.css
└── images/
    ├── stage1_egg.png
    ├── stage2.png
    ├── stage3_fish.png
    ├── stage4_bone.png
    ├── stage5_shell.png
    ├── stage_gangster.png
    └── stage_sleep.png
```

### 步驟 2：安裝到 Chrome
1. 打開 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 打開右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇 `otter-pet-extension` 資料夾
6. 完成！🎉

### 步驟 3：使用你的水獺
1. 訪問任何網頁
2. 右下角會出現你的水獺蛋
3. 計時器自動開始倒數
4. 每完成一次（30分鐘），水獺就會進化！
5. 可以拖曳水獺到任何位置

## 🎮 使用說明

### 計時器
- **自動開始**：水獺出現後自動開始30分鐘倒數
- **自動重置**：完成後自動重置並開始下一輪
- **進度保存**：即使關閉瀏覽器也會記住進度

### 進化系統
- 每完成 **30分鐘** 專注時間 = 進化一階段
- 從蛋 → 最高等級需要 **2小時** 專注時間
- 進化過程會自動保存

### 測試模式
想快速看到進化？編輯 `content.js`：
- 第 61 行：`let timeRemaining = 10;` （10秒測試）
- 正式使用改成：`let timeRemaining = 30 * 60;` （30分鐘）

## 🛠️ 客製化

### 修改計時器時間
編輯 `content.js` 第 61 行：
```javascript
let timeRemaining = 30 * 60; // 30分鐘（單位：秒）
```

### 更換圖片
把你自己的圖片放到 `images/` 資料夾，確保檔名一致！

### 調整位置
編輯 `pet.css` 第 2-3 行：
```css
bottom: 20px;  /* 改成 top: 20px; 就會在上方 */
right: 20px;   /* 改成 left: 20px; 就會在左邊 */
```

## 🎨 你畫的水獺設計

這個擴充功能使用的所有水獺圖片都是你自己畫的！每個階段都有獨特的設計：
- 蛋是乾淨簡約的白色
- 寶寶拿著奶瓶超可愛
- 吃魚的水獺流口水
- 啃骨頭的樣子很滿足
- 吃貝殼是最高境界
- Gangster 模式有墨鏡和火焰
- Sleep 模式在打瞌睡

## 📝 開發筆記

**技術棧：**
- Vanilla JavaScript（無框架）
- Chrome Extension Manifest V3
- Chrome Storage API

**檔案說明：**
- `manifest.json` - 擴充功能設定
- `content.js` - 計時器和進化邏輯
- `pet.css` - 樣式
- `images/` - 你畫的水獺圖片

## 🚀 下一步可以加的功能

- [ ] 點擊暫停/繼續計時器
- [ ] 音效提醒
- [ ] 統計總專注時間
- [ ] 點X出現 Gangster 模式
- [ ] 休息時間倒數顯示 Sleep 模式
- [ ] 更多進化階段
- [ ] 成就系統

祝你專注工作，享受和水獺一起成長的樂趣！🦦💪
