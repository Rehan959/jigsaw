import { chromium, type Browser, type Page } from "playwright";
import type { ScrapedContent } from "@jigsaw/shared";
import type { ScrapeOptions, CrawlerConfig } from "./types.js";
import { DEFAULT_CRAWLER_CONFIG } from "./types.js";
import { cleanHtml } from "./cleaner.js";

let browser: Browser | null = null;

async function getBrowser(config: CrawlerConfig): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function scrapeUrl(
  options: ScrapeOptions,
  config: CrawlerConfig = DEFAULT_CRAWLER_CONFIG
): Promise<ScrapedContent> {
  const browserInstance = await getBrowser(config);
  const context = await browserInstance.newContext({
    userAgent: config.userAgent,
  });
  const page: Page = await context.newPage();

  try {
    await page.goto(options.url, {
      timeout: options.timeout ?? config.defaultTimeout,
      waitUntil: "domcontentloaded",
    });

    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, {
        timeout: options.timeout ?? config.defaultTimeout,
      });
    }

    const title = await page.title();
    const html = await page.content();
    const cleaned = cleanHtml(html);

    return {
      url: options.url,
      title,
      content: cleaned.text,
      html: cleaned.html,
      crawledAt: new Date(),
    };
  } finally {
    await context.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
