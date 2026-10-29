# Market Sentiment AI — Chrome Extension

A Chrome extension that tracks market-moving news for the **USA** and **India** and classifies sentiment (bullish / bearish / neutral) **entirely on-device** using Chrome's built-in Gemini Nano (Prompt API). No news or browsing data leaves your machine.

## Features
- Region-aware feeds: Yahoo Finance, Google News, Federal Reserve (FOMC), Moneycontrol, Economic Times, Mint
- On-device LLM sentiment + ticker extraction via Gemini Nano
- Sticky side panel to monitor headlines while browsing
- Background service worker refreshes every 30 minutes (Chrome alarms)

## Tech
Manifest V3, service worker, content scripts, Chrome Prompt API (Gemini Nano), vanilla JS.

## Install
1. Enable **Prompt API for Gemini Nano** and **Optimization Guide On Device Model** in `chrome://flags`, then relaunch.
2. Open `chrome://extensions`, turn on Developer mode, and **Load unpacked** → `beatify-web/`.

Full setup and usage: [`beatify-web/README.md`](beatify-web/README.md)
