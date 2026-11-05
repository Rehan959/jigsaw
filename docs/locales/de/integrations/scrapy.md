---
title: "Jigsaw-Parsing in einem Scrapy-Spider verwenden"
description: "Wandeln Sie Scrapy-Antworten in Jigsaw-Antworten um oder versehen Sie einen Callback mit einem Dekorator. Behalten Sie Ihren Scrapy-Crawler und nutzen Sie Jigsaws Selektoren und adaptives Parsing."
---

# Jigsaw in Scrapy einbinden {#integrating-jigsaw-into-scrapy}

Sie müssen ein bestehendes Scrapy-Projekt nicht neu schreiben, um Jigsaws Parsing-API zu nutzen. Die Integration wandelt Scrapy-Antworten direkt in Ihren Spider-Callbacks in [Response](../fetching/choosing.md#response-object)-Objekte von Jigsaw um. Scrapy übernimmt weiter das Crawling, während Jigsaw den Inhalt parst.

!!! note "Installation"

    Diese Integration funktioniert mit der Standardinstallation von Jigsaw (`pip install jigsaw`). Extras sind nicht nötig. Nur Scrapy muss installiert sein, was bei einem Scrapy-Projekt bereits der Fall ist.

## Verwendung {#usage}

Fügen Sie einem Spider-Callback den Dekorator `jigsaw_response` hinzu. Das Argument `response`, das er erhält, wird dann zu einem Jigsaw-`Response`:

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

Der Dekorator unterstützt alle Callback-Arten von Scrapy: normale Funktionen, Generatoren, Coroutinen und asynchrone Generatoren. Er behält die Art, den Namen und den Docstring des Callbacks bei. Scrapy kann den Callback also weiterhin untersuchen und seine Contracts prüfen.

Sie können dem Dekorator auch eine [Selector](../parsing/main_classes.md#selector)-Konfiguration übergeben. Sie wird an das erzeugte `Response` weitergegeben:

```python
    @jigsaw_response(adaptive=True, keep_comments=True)
    def parse_product(self, response):
        ...
```

Wenn Sie eine Scrapy-Antwort außerhalb eines Callbacks haben, zum Beispiel in einer Middleware oder Pipeline, verwenden Sie den Konverter direkt:

```python
from jigsaw.integrations.scrapy import convert_response

jigsaw_response = convert_response(scrapy_response, keep_comments=False)
```

## Hinweise {#notes}

- Geben Sie für weitere Seiten wie im Beispiel oben `scrapy.Request(response.urljoin(href))` mit yield aus. Jigsaws Methode `Response.follow()` erstellt Anfragen für das [Spider-System von Jigsaw](../spiders/getting-started.md), die Scrapy nicht versteht.
- Das Wörterbuch `meta` der Antwort wird flach kopiert. Darin gespeicherte Objekte anderer Middlewares bleiben also erreichbar. Mit `scrapy-playwright` ist die Seite zum Beispiel weiterhin unter `response.meta["playwright_page"]` verfügbar.
- Cookies werden aus den rohen `Set-Cookie`-Headern gelesen und in das Wörterbuch `cookies` der Antwort eingefügt.
