
<h1 align="center">Jigsaw</h1>
<p align="center"><small>Простой веб-скрапинг для современного интернета</small></p>


Jigsaw объединяет быстрые HTTP-запросы, скрытные браузеры, мощный разбор страниц и параллельный обход сайтов в одной библиотеке Python.

Загружайте статические страницы, выполняйте JavaScript, работайте с сайтами и извлекайте данные из API этих сайтов. Создавайте краулеры с повторным использованием сессий, сменой прокси, автоматическими повторами, паузой и продолжением работы, а также готовым экспортом данных.

Используйте Jigsaw из Python, терминала или AI-агента через MCP-сервер и Agent Skill. Библиотека помогает на всех этапах: от извлечения нескольких полей до сохранения целого сайта в виде чистых Markdown-файлов.

## Что можно сделать со Jigsaw

- **Загрузка и работа с сайтами**: быстрые HTTP-запросы, скрытные браузеры, выполнение JavaScript, прохождение Cloudflare Turnstile и Interstitial, постоянные сессии и запись фоновых API-ответов.
- **Разбор и извлечение данных**: CSS, XPath, поиск по тексту и регулярным выражениям, поиск элементов после изменений страницы, поиск похожих элементов и чистый Markdown.
- **Обход и экспорт**: параллельные Spider, смена прокси, повторы, AutoThrottle, пауза и продолжение, потоковая выдача, готовые шаблоны и экспорт в JSON, JSONL, CSV и XML.
- **Сбор данных с AI или из терминала**: MCP-сервер для работы AI-агентов с сайтами и данными, Agent Skill, команды CLI и интерактивная оболочка.

Начните с одной страницы:

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

Или используйте Spider для обхода многих страниц:

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

Код выведет `10` и сохранит цитаты с авторами в `quotes.json`.


---

## Основные возможности

### Spider: всё для обхода сайтов

- 🕷️ **API Spider в стиле Scrapy**: задайте `start_urls`, асинхронные обработчики `parse` и объекты `Request`/`Response`.
- ⚡ **Параллельный обход**: настройте число одновременных запросов, ограничения для каждого домена и задержки между загрузками.
- 🔄 **Несколько сессий**: используйте HTTP-запросы и скрытные браузеры без окна в одном Spider. Выбирайте сессию для запроса по её ID.
- 💾 **Пауза и продолжение**: сохраняйте ожидающие запросы и посещённые URL с помощью `crawldir`. Нажмите Ctrl+C для корректной остановки, затем запустите Spider с той же папкой.
- 📡 **Потоковая выдача**: получайте данные сразу после извлечения через `async for item in spider.stream()` и следите за статистикой в реальном времени. Удобно для интерфейсов, обработки данных и долгих обходов.
- 🛡️ **Обнаружение блокировок**: заблокированные запросы автоматически обнаруживаются и повторяются. Логику можно настроить.
- 🚦 **AutoThrottle**: больше не нужно угадывать задержки. Spider сам меняет задержку для каждого домена по скорости ответа сайта. При блокировках или ограничении частоты запросов он удваивает её либо ждёт время из `Retry-After`, а затем снова ускоряется.
- 🤖 **Соблюдение robots.txt**: включите `robots_txt_obey`, чтобы учитывать `Disallow`, `Crawl-delay` и `Request-rate`. Правила кешируются для каждого домена.
- 🧪 **Режим разработки**: сохраните ответы на диск при первом запуске и используйте их снова. Меняйте логику `parse()` без повторных обращений к серверам.
- 🧩 **Готовые шаблоны Spider**: `CrawlSpider` обходит ссылки по правилам, `SitemapSpider` использует sitemap и robots.txt, `XMLFeedSpider`/`CSVFeedSpider` читают ленты XML/RSS и CSV, а `ShopifySpider` собирает товары из открытых магазинов Shopify, по одной записи на вариант.
- 🔗 **Извлечение ссылок**: `LinkExtractor` поддерживает разрешающие и запрещающие шаблоны, фильтры доменов и расширений, выбор области через CSS/XPath и приведение URL к единому виду. Используйте его в шаблонах или отдельно.
- 📦 **Готовый экспорт**: сохраняйте результаты через хуки и собственную обработку либо в JSON, JSONL, CSV и XML через `result.items.to_json()`, `to_jsonl()`, `to_csv()` и `to_xml()`.

### Загрузка сайтов с поддержкой сессий

- **HTTP-запросы**: `Fetcher` отправляет быстрые и скрытные запросы. Он умеет имитировать TLS-отпечаток и заголовки браузера, а также использовать HTTP/3.
- **Динамические страницы**: `StealthyFetcher` загружает сайты с полной автоматизацией браузера. Поддерживаются Chromium из Playwright и Google Chrome.
- **Обход защиты от ботов**: `StealthyFetcher` скрывает признаки автоматизации и подменяет отпечаток браузера. Он автоматически проходит все виды проверок Cloudflare Turnstile и Interstitial.
- **Управление сессиями**: `FetcherSession` и `StealthySession` сохраняют cookie и состояние между запросами.
- **Смена прокси**: `ProxyRotator` перебирает прокси по кругу или по вашим правилам во всех типах сессий. Для отдельного запроса можно указать другой прокси.
- **Блокировка доменов и рекламы**: блокируйте запросы к выбранным доменам и их поддоменам. В браузерных Fetcher можно включить блокировку рекламы, которая охватывает около 3 500 рекламных и отслеживающих доменов.
- **Защита от утечек DNS**: включите DNS-over-HTTPS, чтобы отправлять DNS-запросы через DoH от Cloudflare и не допускать утечек DNS при работе с прокси.
- **Удалённые браузеры**: подключайтесь к уже запущенному браузеру через CDP с помощью `cdp_url`. Браузер может работать на том же компьютере, другом сервере или у провайдера браузерных услуг. Параметр `executable_path` позволяет указать собственную сборку Chromium для любого браузерного Fetcher.
- **Запись фоновых API-ответов**: включите `record_requests=True` в браузерной сессии, затем ищите сохранённые ответы через `session.network.search(limit=None)`. Читайте API-данные и HTTP-ошибки от разных загрузок страниц без повторной отправки запросов. История имеет ограниченный размер и сохраняет текстовые тела ответов.
- **Асинхронная работа**: все Fetcher поддерживают асинхронные вызовы. Есть и отдельные классы асинхронных сессий.

### Разбор и извлечение данных

- 🔄 **Поиск элементов после изменений**: алгоритмы сходства находят элементы снова, даже если сайт изменился.
- 🎯 **Гибкий поиск**: используйте CSS, XPath, фильтры, текст, регулярные выражения и другие способы.
- 🔍 **Похожие элементы**: автоматически находите элементы, похожие на уже найденные.

### Возможности для AI

- 🤖 **MCP-сервер**: AI-боты и агенты, такие как Claude и Cursor, могут собирать данные через Jigsaw. Им доступны HTTP-запросы, действия в браузере, снимки экрана, сохранённый вход и фоновые API-ответы. Скрытный браузер и нужные инструменты позволяют подходящим AI-моделям проходить любые CAPTCHA во время работы, а проверки Cloudflare обрабатываются встроенным решением. Сервер уменьшает объём данных для модели, блокирует рекламу и защищает от Prompt Injection. Есть подключение к удалённым браузерам по CDP и HTTP-транспорт с настройками аутентификации. ([Демонстрация](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: готовый к установке Agent Skill знакомит агента со всей библиотекой. Он помогает писать код под текущий API без догадок.
- 📚 **Markdown для RAG**: одна строка (`page.markdown()`) превращает страницу в чистый и безопасный Markdown для LLM. Шаблон `ContentSpider` сохраняет целый сайт в набор Markdown-файлов. Для самого сбора и преобразования LLM не нужна. (Документация)

### Высокая скорость, проверенная на практике

- 🚀 **Быстрая работа**: оптимизации позволяют опережать большинство библиотек Python для скрапинга.
- 🔋 **Мало памяти**: оптимизированные структуры данных и загрузка только по мере необходимости.
- ⚡ **Быстрое преобразование в JSON**: в 10 раз быстрее стандартной библиотеки.
- 🏗️ **Проверено на практике**: 92% покрытия тестами и аннотации типов для всего кода. За последний год сотни специалистов ежедневно использовали Jigsaw для сбора данных.

### Удобные инструменты для разработчиков

- 🎯 **Интерактивная оболочка**: дополнительная оболочка IPython со Jigsaw, сокращёнными командами и инструментами для быстрой разработки. Преобразуйте curl-запросы в запросы Jigsaw и просматривайте результаты в браузере.
- 🚀 **Работа из терминала**: собирайте данные по URL, не написав ни строки кода!
- 🛠️ **Навигация по DOM**: переходите к родителям, соседним и дочерним элементам.
- 🧬 **Обработка текста**: регулярные выражения, очистка текста и быстрые операции со строками.
- 📝 **Создание селекторов**: получайте надёжные CSS- и XPath-селекторы для любого элемента.
- 🔌 **Знакомый API**: подход похож на Scrapy и BeautifulSoup, с теми же псевдоэлементами, что и в Scrapy/Parsel.
- 🤝 **Интеграция со Scrapy**: добавьте декоратор `jigsaw_response` к обработчику, чтобы разбирать уже загруженные ответы парсером Jigsaw. Переписывать проект не нужно.
- 📘 **Полные аннотации типов**: удобная работа в редакторе и автодополнение. При каждом изменении весь код автоматически проверяется **PyRight** и **MyPy**.
- 🔋 **Готовый образ Docker**: с каждым выпуском автоматически собирается и публикуется образ со всеми браузерами.

## Начало работы

Вот несколько примеров того, что умеет Jigsaw.

### Базовое использование
HTTP-запросы с сессиями
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Используйте последнюю версию TLS fingerprint Chrome
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# Или используйте одноразовые запросы
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
Расширенный режим скрытности
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # Держите браузер открытым, пока не закончите
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# Или используйте стиль одноразового запроса - открывает браузер для этого запроса, затем закрывает его после завершения
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
Полная автоматизация браузера
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # Держите браузер открытым, пока не закончите
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # XPath-селектор, если вы предпочитаете его

# Или используйте стиль одноразового запроса - открывает браузер для этого запроса, затем закрывает его после завершения
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Пауки
Создавайте краулеры с параллельными запросами, разными сессиями, паузой и продолжением работы:
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
print(f"Извлечено {len(result.items)} цитат")
result.items.to_json("quotes.json")
```
Используйте несколько типов сессий в одном Spider:
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
            # Направляйте защищённые страницы через stealth-сессию
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # явный callback
```
Сохраняйте прогресс, чтобы приостанавливать и продолжать долгий обход. Запустите Spider так:
```python
QuotesSpider(crawldir="./crawl_data").start()
```
Если задан `crawldir`, нажмите Ctrl+C, чтобы сохранить ожидающие запросы и уже посещённые URL. Для продолжения запустите Spider с тем же `crawldir`. Сохраняйте извлечённые данные отдельно.

Можно взять готовый шаблон. Например, для сбора всего каталога магазина Shopify:
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # Все товары магазина, по одной записи на вариант
```
Шаблон получает товары через открытые API коллекций и выдаёт одну запись на каждый вариант товара.

### Расширенный разбор и навигация
```python
from jigsaw.fetchers import Fetcher

# Богатый выбор элементов и навигация
page = Fetcher.get('https://quotes.toscrape.com/')

# Получение цитат различными методами выбора
quotes = page.css('.quote')  # CSS-селектор
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # В стиле BeautifulSoup
# То же самое, что
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # и так далее...
# Найти элемент по текстовому содержимому
quotes = page.find_by_text('Albert Einstein', first_match=False)

# Продвинутая навигация
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # Цепочка селекторов
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# Связи элементов и подобие
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
Можно использовать парсер напрямую, без загрузки сайта:
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
И он работает точно так же!

### Асинхронные сессии
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession` учитывает контекст и работает как с sync, так и с async
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI и интерактивная оболочка

Jigsaw можно использовать из командной строки:

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

Запустите интерактивную оболочку для сбора данных:
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
Извлекайте страницы прямо в файл без программирования. Выберите содержимое с `--css-selector` или используйте `--ai-targeted` для выбора и очистки содержимого `body`. Используйте `.txt` для текста, `.md` для Markdown или `.html` для HTML.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> О других возможностях, включая MCP-сервер и интерактивную оболочку, читайте в документации.

## Тесты производительности

Jigsaw не только мощный, но и очень быстрый. Следующие тесты производительности сравнивают парсер Jigsaw с последними версиями других популярных библиотек.

### Скорость извлечения текста: 5 000 вложенных элементов

| # |    Библиотека     | Время (мс) | По сравнению со Jigsaw |
|---|:-----------------:|:----------:|:------------:|
| 1 |     Jigsaw     |    1,99    |     1,0x     |
| 2 |   Parsel/Scrapy   |    2,06    |     1,035    |
| 3 |     Чистый Lxml      |    2,56    |    1,286     |
| 4 |      PyQuery      |   23,98    |     ~12x     |
| 5 |    Selectolax     |   197,02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545,15   |   ~776,5x    |
| 7 |   BS4 + Lxml   |   1562,1   |   ~785,0x    |
| 8 | BS4 + html5lib |  3412,73   |   ~1714,9x   |


### Поиск похожих элементов и текста

Адаптивный поиск элементов в Jigsaw значительно опережает другие решения:

| Библиотека  | Время (мс) | По сравнению со Jigsaw |
|-------------|:----------:|:------------:|
| Jigsaw   |    2,3     |     1,0x     |
| AutoScraper |   12,58    |    5,47x     |


> Результаты усреднены по более чем 100 запускам. Методика приведена в [benchmarks.py](benchmarks.py).

## Установка

Для Jigsaw нужен Python 3.10 или новее:

```bash
pip install jigsaw
```

> [!IMPORTANT]
> Эта команда устанавливает только парсер и его зависимости. Fetcher и инструменты командной строки в неё не входят. Поэтому импорт из `jigsaw.fetchers` или `jigsaw.spiders`, как в примерах выше, вызовет `ModuleNotFoundError`. Чтобы использовать Fetcher или Spider, сначала установите зависимости для загрузки страниц, как показано ниже.

### Дополнительные зависимости

1. Для Fetcher, их классов и дополнительных функций ниже установите зависимости для загрузки страниц и браузеров:
    ```bash
    pip install "jigsaw[fetchers]"

    jigsaw install           # normal install
    jigsaw install  --force  # force reinstall
    ```

    Команда загрузит все браузеры, нужные системные пакеты и средства изменения отпечатков браузера.

    Вместо команды можно запустить установку из кода:
    ```python
    from jigsaw.cli import install

    install([], standalone_mode=False)          # normal install
    install(["--force"], standalone_mode=False) # force reinstall
    ```

2. Дополнительные возможности:
   - MCP-сервер:
       ```bash
       pip install "jigsaw[ai]"
       ```
   - Зависимости для создания RAG-систем:
       ```bash
       pip install "jigsaw[rag]"
       ```
   - Интерактивная оболочка и команда `extract`:
       ```bash
       pip install "jigsaw[shell]"
       ```
   - Все возможности:
       ```bash
       pip install "jigsaw[all]"
       ```
   Выполните `jigsaw install`, если нужны браузерные Fetcher. Для HTTP-запросов устанавливать браузер не нужно.

## Участие в разработке

Присоединяйтесь к разработке! Перед началом прочитайте [руководство для участников](CONTRIBUTING.md).

## Отказ от ответственности

> [!CAUTION]
> Библиотека предназначена только для обучения и исследований. Используя её, вы соглашаетесь соблюдать местные и международные законы о сборе данных и конфиденциальности. Авторы и участники не отвечают за неправомерное использование программы. Соблюдайте условия сайтов и правила robots.txt.

