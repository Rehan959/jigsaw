---
title: "在 Scrapy Spider 中使用 Jigsaw 解析"
description: "将 Scrapy 响应转换为 Jigsaw 响应，或为回调添加装饰器。保留 Scrapy 爬虫，同时使用 Jigsaw 选择器和自适应解析。"
---

# 将 Jigsaw 集成到 Scrapy {#integrating-jigsaw-into-scrapy}

如果已有 Scrapy 项目，无需重写就能使用 Jigsaw 的解析 API。这项集成会直接在 Spider 回调中，把 Scrapy 响应转换为 Jigsaw [Response](../fetching/choosing.md#response-object) 对象。Scrapy 继续负责爬取，Jigsaw 负责解析。

!!! note "安装"

    这项集成可用于默认的 Jigsaw 安装（`pip install jigsaw`），无需扩展依赖。它只要求安装 Scrapy，而 Scrapy 项目本身已经满足这一条件。

## 使用方法 {#usage}

为任意 Spider 回调添加 `jigsaw_response` 装饰器，回调收到的 `response` 参数就会变成 Jigsaw 的 `Response`：

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

装饰器支持 Scrapy 的所有回调类型：普通函数、生成器、协程和异步生成器。它会保留回调的类型、名称和文档字符串，因此 Scrapy 的回调检查和 Contracts 仍然正常工作。

也可以向装饰器传入 [Selector](../parsing/main_classes.md#selector) 配置，它会转交给生成的 `Response`：

```python
    @jigsaw_response(adaptive=True, keep_comments=True)
    def parse_product(self, response):
        ...
```

如果在回调之外持有 Scrapy 响应，例如在中间件或 Pipeline 中，可以直接调用转换函数：

```python
from jigsaw.integrations.scrapy import convert_response

jigsaw_response = convert_response(scrapy_response, keep_comments=False)
```

## 注意事项 {#notes}

- 像上面的示例一样，用 yield 输出 `scrapy.Request(response.urljoin(href))` 来访问后续页面。Jigsaw 的 `Response.follow()` 创建的是 [Jigsaw Spider 系统](../spiders/getting-started.md)的请求，Scrapy 无法处理。
- 响应的 `meta` 字典会进行浅拷贝，因此其他中间件存入的对象仍然可用。例如，使用 `scrapy-playwright` 时，页面仍保存在 `response.meta["playwright_page"]` 中。
- Cookie 会从原始 `Set-Cookie` 响应头中解析出来，并存入响应的 `cookies` 字典。
