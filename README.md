
<h1 align="center">Jigsaw</h1>
<p align="center"><small>Effortless Web Scraping for the Modern Web</small></p>


Jigsaw is a Python Web Scraping framework that brings fast HTTP requests, stealth browsers, powerful parsing, and concurrent crawling into one library.

Scrape static pages, render JavaScript, interact with websites, and extract data from the API calls behind them. Build crawlers with reusable sessions, proxy rotation, automatic retries, pause/resume, and built-in data exports.

Use it from Python, the terminal, or your AI agent through its MCP server and Agent Skill. From extracting a few fields to collecting a whole website as clean Markdown, Jigsaw covers the full scraping workflow.

## What you can do with Jigsaw

- **[Fetch & interact](docs/fetching/choosing.md)**: Fast HTTP requests, stealth browsers, JavaScript rendering, Cloudflare Turnstile/Interstitial handling, persistent sessions, and background API capture.
- **[Parse & extract](docs/parsing/selection.md)**: CSS, XPath, text and regex search, adaptive element tracking, similar-element matching, and clean Markdown output.
- **[Crawl & export](docs/spiders/getting-started.md)**: Concurrent spiders, proxy rotation, retries, AutoThrottle, pause/resume, streaming, ready-made templates, and JSON/JSONL/CSV/XML exports.
- **[Scrape with AI or from your terminal](docs/ai/mcp-server.md)**: An MCP server for AI agents to browse and extract data, an Agent Skill, CLI commands, and an interactive shell.

Start with a single page:

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

Or scale up with a spider:

```python
from jigsaw.spiders import Spider, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                "text": quote.css('.text::text').get(),
                "author": quote.css('.author::text').get(),
            }

result = QuotesSpider().start()
print(len(result.items))
result.items.to_json("quotes.json")
```

This prints `10` and saves the quotes and authors to `quotes.json`.


---

## Key Features

### Spiders - A Full Crawling Framework
- 🕷️ **Scrapy-like Spider API**: Define spiders with `start_urls`, async `parse` callbacks, and `Request`/`Response` objects.
- ⚡ **Concurrent Crawling**: Configurable concurrency limits, per-domain throttling, and download delays.
- 🔄 **Multi-Session Support**: Unified interface for HTTP requests, and stealthy headless browsers in a single spider - route requests to different sessions by ID.
- 💾 **Pause & Resume**: Save pending requests and seen URLs with `crawldir`. Press Ctrl+C to stop gracefully and restart with the same directory.
- 📡 **Streaming Mode**: Stream scraped items as they arrive via `async for item in spider.stream()` with real-time stats - ideal for UI, pipelines, and long-running crawls.
- 🛡️ **Blocked Request Detection**: Automatic detection and retry of blocked requests with customizable logic.
- 🚦 **AutoThrottle**: Stop guessing delays. The spider tunes the delay of each domain on its own from how fast the website responds, then doubles it (or waits what `Retry-After` asks) whenever the website starts blocking or rate-limiting you, and speeds back up once it stops.
- 🤖 **Robots.txt Compliance**: Optional `robots_txt_obey` flag that respects `Disallow`, `Crawl-delay`, and `Request-rate` directives with per-domain caching.
- 🧪 **Development Mode**: Cache responses to disk on the first run and replay them on subsequent runs - iterate on your `parse()` logic without re-hitting the target servers.
- 🧩 **Ready-made Spider Templates**: Skip the boilerplate with `CrawlSpider` for rule-based link following, `SitemapSpider` for sitemap/robots.txt-driven crawls, `XMLFeedSpider`/`CSVFeedSpider` for iterating XML/RSS and CSV feeds, and `ShopifySpider` to collect products from public Shopify stores, one item per variant.
- 🔗 **Link Extraction**: A standalone `LinkExtractor` primitive with allow/deny patterns, domain filters, CSS/XPath scoping, extension filtering, and canonicalization - use it inside the templates or on its own.
- 📦 **Built-in Export**: Export results through hooks and your own pipeline or the built-in JSON/JSONL/CSV/XML exporters with `result.items.to_json()`, `to_jsonl()`, `to_csv()`, and `to_xml()`.

### Advanced Websites Fetching with Session Support
- **HTTP Requests**: Fast and stealthy HTTP requests with the `Fetcher` class. Can impersonate browsers' TLS fingerprint, headers, and use HTTP/3.
- **Dynamic Loading**: Fetch dynamic websites with full browser automation through the `StealthyFetcher` class supporting Playwright's Chromium and Google's Chrome.
- **Anti-bot Bypass**: Advanced stealth capabilities with `StealthyFetcher` and fingerprint spoofing. Can easily bypass all types of Cloudflare's Turnstile/Interstitial with automation.
- **Session Management**: Persistent session support with `FetcherSession` and `StealthySession` classes for cookie and state management across requests.
- **Proxy Rotation**: Built-in `ProxyRotator` with cyclic or custom rotation strategies across all session types, plus per-request proxy overrides.
- **Domain & Ad Blocking**: Block requests to specific domains (and their subdomains) or enable built-in ad blocking (~3,500 known ad/tracker domains) in browser-based fetchers.
- **DNS Leak Prevention**: Optional DNS-over-HTTPS support to route DNS queries through Cloudflare's DoH, preventing DNS leaks when using proxies.
- **Remote Browsers**: Instead of launching a browser locally, connect to one that's already running through CDP with `cdp_url`, whether it's on the same machine, another host, or a managed browser provider. You can also point any browser fetcher at your own Chromium build with `executable_path`.
- **Background API Capture**: Enable `record_requests=True` on a browser session, then search its saved responses with `session.network.search(limit=None)`. Read API data and HTTP errors across page loads without sending requests again. History is bounded and saves text response bodies.
- **Async Support**: Complete async support across all fetchers and dedicated async session classes.

### Parsing and Data Extraction
- 🔄 **Smart Element Tracking**: Relocate elements after website changes using intelligent similarity algorithms.
- 🎯 **Smart Flexible Selection**: CSS selectors, XPath selectors, filter-based search, text search, regex search, and more.
- 🔍 **Find Similar Elements**: Automatically locate elements similar to found elements.

### AI Features
- 🤖 **MCP Server**: Let AI chatbots and agents (Claude/Cursor/etc) scrape through Jigsaw with HTTP requests, browser actions, screenshots, saved login state, and background API responses. Uses our stealthy browser with the right tools to enable suitable AI models to bypass any CAPTCHA is faces while working (not to mention our Cloudflare solver). It uses a lot of methods to reduce the content sent to the model, block ads, and protect it against Prompt-Injection. Remote browsers over CDP and HTTP transport with authentication options are included. ([demo video](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: A ready-to-install [Agent Skill](docs/ai/agent-skill.md) that teaches coding agents the whole library, so the code they write with Jigsaw matches the current API instead of guessing.
- 📚 **RAG-ready Markdown**: Turn any page into clean, sanitized, LLM-ready Markdown with one line (`page.markdown()`), or crawl a whole website into a Markdown corpus with the `ContentSpider` template, all without an LLM in the loop. ([docs](docs/ai/building-rag-systems.md))

### High-Performance & battle-tested Architecture
- 🚀 **Lightning Fast**: Optimized performance outperforming most Python scraping libraries.
- 🔋 **Memory Efficient**: Optimized data structures and lazy loading for a minimal memory footprint.
- ⚡ **Fast JSON Serialization**: 10x faster than the standard library.
- 🏗️ **Battle tested**: Not only does Jigsaw have 92% test coverage and full type hints coverage, but it has been used daily by hundreds of Web Scrapers over the past year.

### Developer/Web Scraper Friendly Experience
- 🎯 **Interactive Web Scraping Shell**: Optional built-in IPython shell with Jigsaw integration, shortcuts, and new tools to speed up Web Scraping scripts development, like converting curl requests to Jigsaw requests and viewing requests results in your browser.
- 🚀 **Use it directly from the Terminal**: Optionally, you can use Jigsaw to scrape a URL without writing a single line of code!
- 🛠️ **Rich Navigation API**: Advanced DOM traversal with parent, sibling, and child navigation methods.
- 🧬 **Enhanced Text Processing**: Built-in regex, cleaning methods, and optimized string operations.
- 📝 **Auto Selector Generation**: Generate robust CSS/XPath selectors for any element.
- 🔌 **Familiar API**: Similar to Scrapy/BeautifulSoup with the same pseudo-elements used in Scrapy/Parsel.
- 🤝 **Drop-in Scrapy Integration**: Already invested in Scrapy? Decorate any callback with `jigsaw_response` to parse the responses you already fetch with Jigsaw's parser, no rewrite needed.
- 📘 **Complete Type Coverage**: Full type hints for excellent IDE support and code completion. The entire codebase is automatically scanned with **PyRight** and **MyPy** with each change.

## Getting Started

Let's give you a quick glimpse of what Jigsaw can do without deep diving.

### Basic Usage
HTTP requests with session support
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Use latest version of Chrome's TLS fingerprint
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# Or use one-off requests
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
Advanced stealth mode
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # Keep the browser open until you finish
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# Or use one-off request style, it opens the browser for this request, then closes it after finishing
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
Full browser automation
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # Keep the browser open until you finish
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # XPath selector if you prefer it

# Or use one-off request style, it opens the browser for this request, then closes it after finishing
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spiders
Build full crawlers with concurrent requests, multiple session types, and pause/resume:
```python
from jigsaw.spiders import Spider, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 10
    
    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                "text": quote.css('.text::text').get(),
                "author": quote.css('.author::text').get(),
            }
            
        next_page = response.css('.next a')
        if next_page:
            yield response.follow(next_page[0].attrib['href'])

result = QuotesSpider().start()
print(f"Scraped {len(result.items)} quotes")
result.items.to_json("quotes.json")
```
Use multiple session types in a single spider:
```python
from jigsaw.spiders import Spider, Request, Response
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

class MultiSessionSpider(Spider):
    name = "multi"
    start_urls = ["https://example.com/"]
    
    def configure_sessions(self, manager):
        manager.add("fast", FetcherSession(impersonate="chrome"))
        manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)
    
    async def parse(self, response: Response):
        for link in response.css('a::attr(href)').getall():
            # Route protected pages through the stealth session
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # explicit callback
```
Pause and resume long crawls with checkpoints by running the spider like this:
```python
QuotesSpider(crawldir="./crawl_data").start()
```
With `crawldir` set, press Ctrl+C to save pending requests and seen URLs. Restart with the same `crawldir` to resume. Save scraped items separately.

Or skip writing the crawling logic altogether with the ready-made templates, like pulling an entire Shopify store's catalog:
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # Every product in the store, one item per variant
```
The template reads products exposed through public collection endpoints, one item per variant.

### Advanced Parsing & Navigation
```python
from jigsaw.fetchers import Fetcher

# Rich element selection and navigation
page = Fetcher.get('https://quotes.toscrape.com/')

# Get quotes with multiple selection methods
quotes = page.css('.quote')  # CSS selector
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # BeautifulSoup-style
# Same as
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # and so on...
# Find element by text content
quotes = page.find_by_text('Albert Einstein', first_match=False)

# Advanced navigation
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # Chained selectors
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# Element relationships and similarity
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
You can use the parser right away if you don't want to fetch websites like below:
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
And it works precisely the same way!

### Async Session Management Examples
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession` is context-aware and can work in both sync/async patterns
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI & Interactive Shell

Jigsaw includes a powerful command-line interface:

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

Launch the interactive Web Scraping shell
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
Extract pages to a file directly without programming. Use `--css-selector` to pick the content, or `--ai-targeted` to select and sanitize the `body` content. Use `.txt` for text, `.md` for Markdown, or `.html` for HTML.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> There are many additional features, but we want to keep this page concise, including the MCP server and the interactive Web Scraping Shell. Check out the full documentation here

## Performance Benchmarks

Jigsaw isn't just powerful-it's also blazing fast. The following benchmarks compare Jigsaw's parser with the latest versions of other popular libraries.

### Text Extraction Speed Test (5000 nested elements)

| # |      Library      | Time (ms) | vs Jigsaw | 
|---|:-----------------:|:---------:|:------------:|
| 1 |     Jigsaw     |   1.99    |     1.0x     |
| 2 |   Parsel/Scrapy   |   2.06    |    1.035     |
| 3 |     Raw Lxml      |   2.56    |    1.286     |
| 4 |      PyQuery      |   23.98   |     ~12x     |
| 5 |    Selectolax     |  197.02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545.15  |   ~776.5x    |
| 7 |   BS4 with Lxml   |  1562.1   |   ~785.0x    |
| 8 | BS4 with html5lib |  3412.73  |   ~1714.9x   |


### Element Similarity & Text Search Performance

Jigsaw's adaptive element finding capabilities significantly outperform alternatives:

| Library     | Time (ms) | vs Jigsaw |
|-------------|:---------:|:------------:|
| Jigsaw   |    2.3    |     1.0x     |
| AutoScraper |   12.58   |    5.47x     |


> All benchmarks represent averages of 100+ runs. See [benchmarks.py](benchmarks.py) for methodology.

## Installation

Jigsaw requires Python 3.10 or higher:

```bash
pip install jigsaw
```

> [!IMPORTANT]
> This installation only includes the parser engine and its dependencies, without any fetchers or commandline dependencies. So importing anything from `jigsaw.fetchers` or `jigsaw.spiders`, like in the examples above, will raise `ModuleNotFoundError` with this installation alone. If you are going to use any of the fetchers or spiders, install the fetchers' dependencies first as shown below.

### Optional Dependencies

1. If you are going to use any of the extra features below, the fetchers, or their classes, you will need to install fetchers' dependencies and their browser dependencies as follows:
    ```bash
    pip install "jigsaw[fetchers]"
    
    jigsaw install           # normal install
    jigsaw install  --force  # force reinstall
    ```

    This downloads all browsers, along with their system dependencies and fingerprint manipulation dependencies.

    Or you can install them from the code instead of running a command like this:
    ```python
    from jigsaw.cli import install
    
    install([], standalone_mode=False)          # normal install
    install(["--force"], standalone_mode=False) # force reinstall
    ```

2. Extra features:
   - Install the MCP server feature:
       ```bash
       pip install "jigsaw[ai]"
       ```
   - Install dependencies for ([building RAG systems](docs/ai/building-rag-systems.md)):
       ```bash
       pip install "jigsaw[rag]"
       ```
   - Install shell features (Web Scraping shell and the `extract` command): 
       ```bash
       pip install "jigsaw[shell]"
       ```
   - Install everything: 
       ```bash
       pip install "jigsaw[all]"
       ```
   Run `jigsaw install` when you need browser fetchers. HTTP requests do not need a browser installation.


## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) before getting started.

## Disclaimer

> [!CAUTION]
> This library is provided for educational and research purposes only. By using this library, you agree to comply with local and international data scraping and privacy laws. The authors and contributors are not responsible for any misuse of this software. Always respect the terms of service of websites and robots.txt files.

