# 📺 YT-Sentence-Flow
### Stop reading fragments. Start reading stories.

[![GitHub stars](https://img.shields.io/github/stars/misutesu-desu/YT-Sentence-Flow?style=for-the-badge)](https://github.com/misutesu-desu/YT-Sentence-Flow/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://greasyfork.org/tr/scripts/578170-youtube-sentence-flow-advanced-subtitle-merger)

**YT-Sentence-Flow** is a professional-grade subtitle engine that intercepts YouTube's fragmented caption data and rebuilds it into semantically logical, complete sentences in real-time. 

Designed for speed-learners, language students, and power users who are tired of YouTube's clunky "one-word-at-a-time" delivery.

[🚀 Install from Greasy Fork](https://greasyfork.org/tr/scripts/578170-youtube-sentence-flow-advanced-subtitle-merger) • [🐛 Report Bug](https://github.com/misutesu-desu/YT-Sentence-Flow/issues)

---

## 🚀 Why YT-Sentence-Flow?
YouTube's default captions deliver text in tiny, broken fragments. This creates a high cognitive load as your brain struggles to stitch them together. 

**YT-Sentence-Flow** solves this by analyzing time-gaps and semantic clues to deliver a Netflix-like reading experience on YouTube.

### ✨ Core Features
*   🎲 **Semantic Sentence Merger:** Analyzes silence (gaps >1000ms), capitalization cues, and punctuation to merge text intelligently.
*   ⚡ **Sync-Lock Technology:** Guaranteed sync with high-speed playback (1.5x - 3.5x). The text stays with the voice.
*   🛡️ **Lag-Free Interaction:** Move subtitles anywhere on the player or resize them instantly with zero drag-latency.
*   🖥️ **Proportional Scaling:** Font size and position automatically adapt when you switch between Windowed, Theater, and Fullscreen modes.
*   🔄 **Auto-Lift UI:** Subtitles automatically jump above the YouTube control bar when it appears. No more overlapped text.
*   💾 **Persistent Memory:** Saves your preferred font size and position locally across all sessions.

---

## 🏆 Comparison: The Flow Difference

| Feature | Default YouTube | Basic Scripts | ⚡ YT-Sentence-Flow |
| :--- | :---: | :---: | :---: |
| **Reading Experience** | Fragments (Staccato) | Merged (Static) | **Semantic Flow (Stories)** |
| **UI Aesthetics** | Good | Cheap Overlays | **1:1 Original Styling** |
| **Dragging** | None | Laggy/Magnet-feel | **Butter-Smooth (Real-time)** |
| **Scaling** | Pixelated | Fixed Pixels | **Adaptive Ratios** |
| **Punctuation Support** | Minimal | Basic | **Advanced Abbr. Handling** |

---

## 🛠️ Installation

### 📥 User Installation (Recommended)
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Visit the [Greasy Fork Page](https://greasyfork.org/tr/scripts/578170-youtube-sentence-flow-advanced-subtitle-merger).
3. Click **Install**.
4. Open any YouTube video and turn on Captions (CC).

### 🧑‍💻 Developer Way
```bash
git clone https://github.com/misutesu-desu/YT-Sentence-Flow.git
```

---

## 💡 How to Customize
*   **Drag Position:** Click and hold the center of the subtitle to move it anywhere.
*   **Resize Font:** Click and hold the invisible handle at the **bottom-right corner** of the text box. Drag right to increase, left to decrease.
*   **Auto-Save:** Your settings are automatically saved in your browser's `localStorage`.

---

## 📜 Technical Details
The script uses a `ResizeObserver` to track the player dimensions and `Passive Network Hooks` (XHR/Fetch) to intercept subtitle events before they reach the YouTube UI. This ensures maximum performance and zero DOM-bloat.

---

## 💬 Support & Community
If **YT-Sentence-Flow** improved your watching experience, please give this repository a ⭐ **Star**! It helps others find the tool and keeps me motivated to add new features.

Developed with ❤️ by [misutesu-desu](https://github.com/misutesu-desu).

---

### ⚠️ Disclaimer
This script is not affiliated with YouTube or Google. It is a third-party UI enhancement tool.
```

### 3. Son Bir Dokunuş (Otomatik Güncelleme Linkleri)
Scriptinin en başındaki Metadata kısmına GitHub Raw linklerini eklemiş miydin? Eğer eklemediysen, kodunu şu satırlarla güncelle ki GitHub'da her "Commit" yaptığında kullanıcıların scripti otomatik güncellensin:

```javascript
// @updateURL    https://github.com/misutesu-desu/YT-Sentence-Flow/raw/main/yt-sentence-flow.user.js
// @downloadURL  https://github.com/misutesu-desu/YT-Sentence-Flow/raw/main/yt-sentence-flow.user.js
