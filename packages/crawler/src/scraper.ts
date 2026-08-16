import { chromium, type Browser, type Page } from "playwright";
import { extractContent } from "./cleaner.js";
import type { CrawlOptions, ScrapedPage } from "./types.js";

const DEFAULT_OPTIONS: CrawlOptions = {
  url: "",
  maxPages: 1,
  timeout: 30000,
  viewportWidth: 1280,
  viewportHeight: 720,
  waitUntil: "networkidle",
};

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function scrapePage(
  url: string,
  options?: Partial<CrawlOptions>,
): Promise<ScrapedPage> {
  const opts = { ...DEFAULT_OPTIONS, ...options, url };
  let page: Page | null = null;

  try {
    const b = await getBrowser();
    page = await b.newPage({
      userAgent: opts.userAgent,
      viewport: { width: opts.viewportWidth, height: opts.viewportHeight },
    });

    const response = await page.goto(url, {
      timeout: opts.timeout,
      waitUntil: opts.waitUntil,
    });

    if (!response || !response.ok()) {
      return {
        url,
        title: "",
        content: "",
        html: "",
        links: [],
        crawledAt: new Date(),
      };
    }

    if (opts.waitForSelector) {
      try {
        await page.waitForSelector(opts.waitForSelector, {
          timeout: Math.min(opts.timeout, 10000),
        });
      } catch {
        // Selector not found, proceed with current content
      }
    }

    const title = await page.title();
    const html = await page.content();

    const { content } = extractContent(html);

    const links = await page.evaluate((baseUrl: string) => {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      return anchors
        .map((a) => {
          try {
            return new URL(a.getAttribute("href") || "", baseUrl).href;
          } catch {
            return null;
          }
        })
        .filter((href): href is string => href !== null);
    }, url);

    return {
      url,
      title,
      content,
      html,
      links: [...new Set(links)],
      crawledAt: new Date(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scrape error";
    return {
      url,
      title: "",
      content: `Error: ${message}`,
      html: "",
      links: [],
      crawledAt: new Date(),
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}
