# Market Sentiment AI (USA & India)

Real-time stock market sentiment analysis for USA and India, powered by Chrome's on-device Gemini Nano.

## Features
- **Dual Region Support:** Choose between **USA** or **India** to get localized market news and analysis.
- **Micro & Macro Sources:** Aggregates data from Yahoo Finance, Google News, **FOMC (Federal Reserve)**, Moneycontrol, and Economic Times.
- **On-Device AI:** Uses Gemini Nano (Prompt API) locally to analyze news sentiment (Bullish/Bearish/Neutral) and identify relevant tickers without sending data to servers.
- **Sticky Side Panel:** A dedicated sidebar to monitor market-moving news while you browse any website.
- **Automatic Updates:** Background worker refreshes news every 30 minutes.

## Setup
1. Open `chrome://flags`
2. Enable **Prompt API for Gemini Nano**.
3. Enable **Optimization Guide On Device Model** (Set to *Enabled BypassPerfRequirement*).
4. Relaunch Chrome.
5. Open `chrome://on-device-internals` and verify the foundational model is **Ready**.

## Usage
1. Click the extension icon.
2. Select your region (**USA** or **India**) during the initial setup.
3. Toggle the **Side Panel** to **ON**.
4. To change your region later, click the **(Edit)** badge next to the region name in the popup.
5. Click **Refresh Feeds** to trigger an immediate AI analysis of the latest news.

## Privacy & Speed
By running Gemini Nano locally, your financial interests and browsing habits never leave your computer. The "surgical" side panel ensures zero impact on the host website's performance.
