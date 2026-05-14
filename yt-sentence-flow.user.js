// ==UserScript==
// @name         YouTube Sentence Flow - Advanced Subtitle Merger
// @namespace    yt-sentence-flow
// @version      1.0.0
// @description  Professional subtitle processor that merges YouTube's fragmented captions into complete, readable sentences. Features lag-free dragging, proportional scaling, and semantic sentence detection.
// @author       misutesu-desu
// @match        *://www.youtube.com/*
// @match        *://www.youtube-nocookie.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/578170/YouTube%20Sentence%20Flow%20-%20Advanced%20Subtitle%20Merger.user.js
// @updateURL https://update.greasyfork.org/scripts/578170/YouTube%20Sentence%20Flow%20-%20Advanced%20Subtitle%20Merger.meta.js
// ==/UserScript==

(function () {
  "use strict";

  // ═══════════════════════════════════════════
  //  CONFIG & SEMANTIC CONSTANTS
  // ═══════════════════════════════════════════
  const SENTENCE_END_RE = /[.!?…。？！]\s*$/;
  const ABBREVIATION_RE = /^(mr|mrs|dr|ms|st|avg|approx)\.$/i;
  
  const MAX_SENTENCE_CHARS = 160;
  const MAX_SENTENCE_MS = 10000;
  const NATURAL_PAUSE_MS = 1000;

  let sentences = [];
  let activeSentence = null;
  let currentVideoId = null;
  let isSetup = false;
  let videoEl = null;
  let containerEl = null;
  let windowEl = null;
  let textEl = null;
  let handleEl = null;
  let ccEnabled = true;

  let fontSizeRatio = parseFloat(localStorage.getItem("yt-sent-fs-ratio")) || 0.042;
  let posBottomPercent = parseFloat(localStorage.getItem("yt-sent-pos-bottom")) || 12;

  // ═══════════════════════════════════════════
  //  UI & CSS (EXACT YouTube Style)
  // ═══════════════════════════════════════════
  function injectStyle() {
    if (document.getElementById("yt-sent-style")) return;
    const style = document.createElement("style");
    style.id = "yt-sent-style";
    style.textContent = `
      .ytp-caption-window-container { display: none !important; }
      .yt-sent-caption-container { pointer-events: none; position: absolute; left: 0; right: 0; bottom: 0; top: 0; z-index: 60; overflow: hidden; }
      .yt-sent-caption-window {
        pointer-events: auto; position: absolute; width: 100%; left: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
        transition: bottom 0.2s cubic-bezier(0, 0, 0.2, 1);
      }
      .yt-sent-dragging { transition: none !important; }
      .yt-sent-caption-text {
        position: relative; display: inline-block; white-space: pre-wrap; text-align: center; color: #fff;
        font-family: "YouTube Noto", Roboto, Arial, sans-serif; font-weight: 400; background: rgba(8, 8, 8, 0.75);
        border-radius: 2px; padding: 0.1em 0.3em; text-shadow: rgba(0, 0, 0, 0.5) 0px 0px 2px;
        opacity: 0; transition: opacity 0.1s; max-width: 85%; cursor: move;
      }
      .yt-sent-resize-handle { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; z-index: 61; }
      .html5-video-player:not(.ytp-autohide) .yt-sent-caption-window { transform: translateY(-45px); }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════
  //  SEMANTIC MERGER ENGINE
  // ═══════════════════════════════════════════
  function buildSentences(events) {
    const rawCues = [];
    for (const ev of events) {
      if (!ev.segs) continue;
      const text = ev.segs.map(s => s.utf8 || "").join("").replace(/\n/g, " ").trim();
      if (!text) continue;
      rawCues.push({
        start: ev.tStartMs || 0,
        end: (ev.tStartMs || 0) + (ev.dDurationMs || 0),
        text: text
      });
    }

    const merged = [];
    let buffer = null;

    for (let i = 0; i < rawCues.length; i++) {
      const current = rawCues[i];
      if (!buffer) {
        buffer = { ...current };
      } else {
        const gapSinceLast = current.start - buffer.end;
        const isEnd = SENTENCE_END_RE.test(buffer.text) && !ABBREVIATION_RE.test(buffer.text);
        const isCap = /^[A-Z]/.test(current.text) && buffer.text.length > 20;
        const isLong = (buffer.text.length + current.text.length) > MAX_SENTENCE_CHARS;

        if (isEnd || gapSinceLast > NATURAL_PAUSE_MS || isCap || isLong) {
          merged.push({ ...buffer });
          buffer = { ...current };
        } else {
          buffer.text += " " + current.text;
          buffer.end = current.end;
        }
      }
    }
    if (buffer) merged.push(buffer);
    sentences = merged.map(s => ({ ...s, text: s.text.replace(/\s\s+/g, ' ') }));
    for (let i = 0; i < sentences.length - 1; i++) {
      if (sentences[i].end > sentences[i+1].start) sentences[i].end = sentences[i+1].start;
    }
  }

  // ═══════════════════════════════════════════
  //  UI INTERACTION & SYNC
  // ═══════════════════════════════════════════
  function updateScaling() {
    if (!textEl || !windowEl || !containerEl) return;
    textEl.style.fontSize = Math.max(12, containerEl.offsetHeight * fontSizeRatio) + "px";
    windowEl.style.bottom = posBottomPercent + "%";
  }

  function initInteractions(win, text, handle, boundary) {
    let isDragging = false, isResizing = false, startY, startRatio, startMouseX, initialBottom;
    handle.addEventListener("mousedown", (e) => {
      e.preventDefault(); e.stopPropagation();
      isResizing = true; startMouseX = e.clientX; startRatio = fontSizeRatio;
    });
    text.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || isResizing) return;
      e.preventDefault(); isDragging = true; startY = e.clientY;
      const rect = win.getBoundingClientRect();
      const parentRect = boundary.getBoundingClientRect();
      initialBottom = parentRect.bottom - rect.bottom;
      win.classList.add("yt-sent-dragging");
    });
    document.addEventListener("mousemove", (e) => {
      if (isResizing) {
        fontSizeRatio = Math.max(0.01, Math.min(0.1, startRatio + ((e.clientX - startMouseX) / boundary.offsetHeight)));
        text.style.fontSize = (boundary.offsetHeight * fontSizeRatio) + "px";
      }
      if (isDragging) {
        posBottomPercent = ((initialBottom - (e.clientY - startY)) / boundary.offsetHeight) * 100;
        posBottomPercent = Math.max(0, Math.min(posBottomPercent, 85));
        win.style.bottom = posBottomPercent + "%";
      }
    });
    document.addEventListener("mouseup", () => {
      if (isResizing || isDragging) {
        localStorage.setItem("yt-sent-fs-ratio", fontSizeRatio);
        localStorage.setItem("yt-sent-pos-bottom", posBottomPercent);
      }
      isDragging = false; isResizing = false;
      win.classList.remove("yt-sent-dragging");
    });
  }

  function onTimeUpdate() {
    if (!ccEnabled || sentences.length === 0 || !textEl) return;
    const ms = videoEl.currentTime * 1000;
    let lo = 0, hi = sentences.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (ms < sentences[mid].start) hi = mid - 1;
      else if (ms >= sentences[mid].end) lo = mid + 1;
      else { found = mid; break; }
    }
    const current = found >= 0 ? sentences[found] : null;
    if (current !== activeSentence) {
      activeSentence = current;
      if (current) {
        textEl.textContent = current.text;
        textEl.appendChild(handleEl);
        textEl.style.opacity = "1";
      } else textEl.style.opacity = "0";
    }
  }

  // ═══════════════════════════════════════════
  //  NETWORK & PLAYER HOOKS
  // ═══════════════════════════════════════════
  const xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () { this._stUrl = arguments[1]; return xhrOpen.apply(this, arguments); };
  const xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    if (/timedtext/.test(this._stUrl)) {
      this.addEventListener("readystatechange", () => {
        if (this.readyState === 4 && this.status === 200) {
          try { buildSentences(JSON.parse(this.responseText).events); setupPlayer(); } catch(e) {}
        }
      });
    }
    return xhrSend.apply(this, arguments);
  };

  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const resp = await origFetch(...args);
    if (/timedtext/.test(args[0]?.url || args[0])) {
      try { const data = await resp.clone().json(); if (data.events) { buildSentences(data.events); setupPlayer(); } } catch(e) {}
    }
    return resp;
  };

  function setupPlayer() {
    videoEl = document.querySelector("video");
    if (!videoEl || isSetup) return;
    injectStyle();
    const player = document.querySelector("#movie_player, .html5-video-player");
    if (player) {
      containerEl = document.createElement("div");
      containerEl.className = "yt-sent-caption-container";
      windowEl = document.createElement("div");
      windowEl.className = "yt-sent-caption-window";
      textEl = document.createElement("div");
      textEl.className = "yt-sent-caption-text";
      handleEl = document.createElement("div");
      handleEl.className = "yt-sent-resize-handle";
      textEl.appendChild(handleEl);
      windowEl.appendChild(textEl);
      containerEl.appendChild(windowEl);
      player.appendChild(containerEl);
      initInteractions(windowEl, textEl, handleEl, containerEl);
      new ResizeObserver(() => updateScaling()).observe(containerEl);
      videoEl.addEventListener("timeupdate", onTimeUpdate);
      isSetup = true;
      updateScaling();
    }
  }

  document.addEventListener("yt-navigate-finish", () => {
    currentVideoId = new URLSearchParams(window.location.search).get("v");
    isSetup = false;
  });

  setInterval(() => {
    const btn = document.querySelector(".ytp-subtitles-button");
    if (btn) ccEnabled = btn.getAttribute("aria-pressed") !== "false";
    if (!ccEnabled && textEl) textEl.style.opacity = "0";
  }, 1000);
})();
