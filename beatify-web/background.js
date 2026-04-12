/**
 * Background Service Worker: Market Sentiment AI
 * Aggregates news and analyzes with Gemini Nano.
 */

console.log("[MarketAI] Background service worker loaded.");

let aiSession = null;

const FEEDS_BY_REGION = {
  USA: [
    "https://news.google.com/rss/search?q=stock+market+OR+finance&hl=en-US&gl=US&ceid=US:en",
    "https://finance.yahoo.com/news/rss",
    "https://www.federalreserve.gov/feeds/press_monetary.xml"
  ],
  India: [
    "https://www.moneycontrol.com/rss/latestnews.xml",
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://www.livemint.com/rss/markets",
    "https://www.livemint.com/rss/news"
  ]
};

/**
 * Super-Detection for AI Interface in background context
 */
async function getAiSession(region = 'USA') {
  if (aiSession) return aiSession;

  try {
    // Search every possible namespace for LanguageModel
    const aiObject = (typeof self !== 'undefined' && self.ai) || 
                     (typeof navigator !== 'undefined' && navigator.ai) ||
                     (typeof ai !== 'undefined' ? ai : null);
    
    const languageModel = aiObject?.languageModel || (typeof LanguageModel !== 'undefined' ? LanguageModel : null);

    if (!languageModel) {
      console.error("[MarketAI] languageModel not found in any namespace.");
      throw new Error("Gemini Nano not available in background worker.");
    }

    console.log("[MarketAI] languageModel found. Checking status...");
    const status = await languageModel.availability({ outputLanguage: 'en' });
    
    if (status !== 'available' && status !== 'readily') {
      throw new Error(`AI Status: ${status}`);
    }

    aiSession = await languageModel.create({
      outputLanguage: 'en',
      systemPrompt: `You are a financial analyst for the ${region} market. 
      Analyze news impact strictly as: [TICKER/MACRO] | [SENTIMENT] | [EXPLANATION]`
    });

    return aiSession;
  } catch (error) {
    console.error("[MarketAI] AI Init failed:", error);
    throw error;
  }
}

function parseRssXml(text, limit = 5) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null && items.length < limit) {
    const content = match[1];
    const title = content.match(/<title>(.*?)<\/title>/)?.[1] || 
                  content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || "No Title";
    const link = content.match(/<link>(.*?)<\/link>/)?.[1] || "#";
    items.push({ 
      title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(), 
      link: link.trim() 
    });
  }
  return items;
}

async function refreshNews() {
  try {
    const { region = 'USA' } = await chrome.storage.local.get("region");
    console.log(`[MarketAI] Refreshing news for ${region}...`);
    
    const feeds = FEEDS_BY_REGION[region] || FEEDS_BY_REGION.USA;
    let allArticles = [];
    for (const url of feeds) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        allArticles = allArticles.concat(parseRssXml(text, 4));
      } catch (e) { console.warn("[MarketAI] Feed failed:", url); }
    }

    const uniqueArticles = Array.from(new Set(allArticles.map(a => a.link)))
      .map(link => allArticles.find(a => a.link === link)).slice(0, 10);

    const analyzed = [];
    let session;
    try {
      session = await getAiSession(region);
    } catch (e) {
      console.warn("[MarketAI] AI session skipped due to error.");
    }

    for (const article of uniqueArticles) {
      let analysis = "No AI | Neutral | Analysis unavailable.";
      if (session) {
        try { analysis = await session.prompt(article.title); } catch (e) {}
      }
      analyzed.push({ ...article, analysis });
    }

    const { history = [] } = await chrome.storage.local.get("history");
    await chrome.storage.local.set({ 
      fresh: analyzed, 
      history: [...analyzed, ...history].slice(0, 50),
      lastUpdate: Date.now() 
    });
    return analyzed;
  } catch (err) {
    console.error("[MarketAI] Refresh failed:", err);
  }
}

chrome.alarms.create("refreshNews", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshNews") refreshNews();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_LATEST_NEWS") {
    chrome.storage.local.get(["fresh", "history", "region"], (data) => sendResponse(data));
    return true;
  }
  if (request.type === "UPDATE_REGION") {
    chrome.storage.local.set({ region: request.region, fresh: [], history: [] }, () => {
      aiSession = null;
      refreshNews().then(() => sendResponse({ success: true }));
    });
    return true;
  }
  if (request.type === "REFRESH_NEWS") {
    refreshNews().then(news => sendResponse({ success: true, news }))
                 .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
  if (request.type === "TOGGLE_SIDEBAR") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "TOGGLE_SIDEBAR", state: request.state });
    });
  }
});

// Initial startup
refreshNews();
