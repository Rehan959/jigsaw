---
title: "Use Jigsaw Parsing in a Scrapy Spider"
description: "Convert Scrapy responses to Jigsaw or decorate a callback. Keep your Scrapy crawler and use Jigsaw selectors and adaptive parsing."
---

# Integrating Jigsaw into Scrapy

If you have an existing Scrapy project, you don't need to rewrite it to enjoy Jigsaw's parsing API. The Scrapy integration converts Scrapy responses to Jigsaw [Response](../fetching/choosing.md#response-object) objects right inside your spider callbacks, so Scrapy keeps handling the crawling while Jigsaw handles the parsing.

!!! note "Installation"

    This integration works with the default Jigsaw installation (`pip install jigsaw`), no extras needed. It only requires Scrapy to be installed, which you already have in a Scrapy project.

## Usage

Put the `jigsaw_response` decorator on any spider callback, and the `response` argument it receives becomes a Jigsaw `Response`:

```python
import scrapy
from jigsaw.integrations.scrapy import jigsaw_response


class QuotesSpider(scrapy.Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com"]

    @jigsaw_response
    def parse(self, response):  # `response` is now a Jigsaw Response
        first_quote = response.find_by_text("The world as we have created it", partial=True)
        for quote in [first_quote, *first_quote.find_similar()]:
            card = quote.parent
            yield {
                "text": quote.get_all_text(strip=True),
                "author": card.find("small", class_="author").text,
                "tags": [tag.text for tag in card.find_all("a", class_="tag")],
            }
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield scrapy.Request(response.urljoin(next_page), callback=self.parse)
```

The decorator works on all the callback kinds Scrapy supports: regular functions, generators, coroutines, and async generators. The wrapper keeps the callback's kind, name, and docstring, so Scrapy's callback introspection and contracts keep working.

You can also pass [Selector](../parsing/main_classes.md#selector) configuration to the decorator, and it will be forwarded to the generated `Response`:

```python
    @jigsaw_response(adaptive=True, keep_comments=True)
    def parse_product(self, response):
        ...
```

If you have a Scrapy response at hand outside a callback (middlewares, pipelines, and so on), use the converter directly:

```python
from jigsaw.integrations.scrapy import convert_response

jigsaw_response = convert_response(scrapy_response, keep_comments=False)
```

## Notes

- Yield `scrapy.Request(response.urljoin(href))` for the next pages as in the example above. Jigsaw's `Response.follow()` method builds requests for [Jigsaw's spider system](../spiders/getting-started.md), which Scrapy doesn't understand.
- The response's `meta` dictionary is shallow-copied, so objects stored by other middlewares stay reachable. For example, with `scrapy-playwright`, the page is still at `response.meta["playwright_page"]`.
- Cookies are parsed from the raw `Set-Cookie` headers into the response's `cookies` dictionary.
