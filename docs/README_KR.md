
<h1 align="center">Jigsaw</h1>
<p align="center"><small>현대적인 웹을 간편하게 스크래핑하세요</small></p>


Jigsaw은 빠른 HTTP 요청, 스텔스 브라우저, 강력한 파싱, 동시 크롤링을 하나로 묶은 Python 웹 스크래핑 프레임워크입니다.

정적 페이지를 가져오고, JavaScript를 실행하고, 사이트를 조작하고, 사이트가 호출하는 API에서 데이터를 추출하세요. 세션 재사용, 프록시 교체, 자동 재시도, 일시 정지와 재개, 데이터 내보내기를 지원하는 크롤러를 만들 수 있습니다.

Python이나 터미널에서 사용할 수 있으며, MCP 서버와 Agent Skill을 통해 AI 에이전트에서도 사용할 수 있습니다. 몇 개의 필드를 추출하는 작업부터 사이트 전체를 깔끔한 Markdown 파일로 저장하는 작업까지 지원합니다.

## Jigsaw으로 할 수 있는 일

- **페이지 가져오기와 조작**: 빠른 HTTP 요청, 스텔스 브라우저, JavaScript 실행, Cloudflare Turnstile과 Interstitial 처리, 지속 세션, 백그라운드 API 응답 기록.
- **파싱과 데이터 추출**: CSS, XPath, 텍스트와 정규식 검색, 페이지가 바뀐 뒤에도 요소 추적, 비슷한 요소 찾기, 깔끔한 Markdown 출력.
- **크롤링과 내보내기**: 동시 크롤링, 프록시 교체, 재시도, AutoThrottle, 일시 정지와 재개, 스트리밍, 바로 쓸 수 있는 템플릿, JSON·JSONL·CSV·XML 내보내기.
- **AI나 터미널에서 스크래핑**: AI 에이전트가 사이트를 탐색하고 데이터를 추출하는 MCP 서버, Agent Skill, CLI 명령어, 대화형 셸.

한 페이지부터 시작하세요:

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

스파이더로 여러 페이지를 수집할 수도 있습니다:

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

이 코드는 `10`을 출력하고 명언과 저자를 `quotes.json`에 저장합니다.


---

## 주요 기능

### 스파이더: 본격적인 크롤링 프레임워크

- 🕷️ **Scrapy와 비슷한 Spider API**: `start_urls`, 비동기 `parse` 콜백, `Request`/`Response` 객체로 스파이더를 정의합니다.
- ⚡ **동시 크롤링**: 동시에 처리할 요청 수, 도메인별 제한, 다운로드 사이의 대기 시간을 설정합니다.
- 🔄 **여러 세션 지원**: 한 스파이더에서 HTTP 요청과 스텔스 헤드리스 브라우저를 같은 방식으로 사용합니다. 세션 ID로 각 요청을 보낼 세션을 고릅니다.
- 💾 **일시 정지와 재개**: `crawldir`로 대기 중인 요청과 방문한 URL을 저장합니다. Ctrl+C로 안전하게 멈춘 뒤 같은 폴더로 다시 시작하면 이어서 실행됩니다.
- 📡 **스트리밍**: `async for item in spider.stream()`으로 추출한 항목을 바로 받고 실시간 통계를 확인합니다. 화면 표시, 데이터 처리, 긴 크롤링 작업에 적합합니다.
- 🛡️ **차단 감지**: 차단된 요청을 자동으로 감지하고 재시도합니다. 처리 방식도 바꿀 수 있습니다.
- 🚦 **AutoThrottle**: 대기 시간을 직접 추측할 필요가 없습니다. 스파이더가 응답 속도에 맞춰 도메인별 대기 시간을 조절합니다. 차단이나 요청 빈도 제한이 시작되면 두 배로 늘리거나 `Retry-After`가 지정한 시간만큼 기다리고, 문제가 사라지면 다시 속도를 높입니다.
- 🤖 **robots.txt 준수**: `robots_txt_obey`를 켜면 `Disallow`, `Crawl-delay`, `Request-rate` 규칙을 따릅니다. 규칙은 도메인별로 캐시합니다.
- 🧪 **개발 모드**: 첫 실행에서 응답을 디스크에 저장하고 다음 실행부터 다시 사용합니다. 서버에 다시 요청하지 않고 `parse()`를 수정하며 시험할 수 있습니다.
- 🧩 **바로 쓰는 스파이더 템플릿**: `CrawlSpider`는 규칙에 따라 링크를 따라가고, `SitemapSpider`는 sitemap과 robots.txt를 사용합니다. `XMLFeedSpider`/`CSVFeedSpider`는 XML·RSS·CSV 피드를 읽습니다. `ShopifySpider`는 공개 Shopify 스토어에서 상품을 수집하며, 상품 옵션 조합마다 한 항목을 만듭니다.
- 🔗 **링크 추출**: `LinkExtractor`는 허용·제외 패턴, 도메인 필터, CSS·XPath 범위 지정, 확장자 필터, URL 정규화를 지원합니다. 템플릿 안에서 또는 단독으로 사용할 수 있습니다.
- 📦 **데이터 내보내기**: 훅과 자체 처리 과정으로 결과를 저장하거나 내장 JSON·JSONL·CSV·XML 기능을 사용하세요. `result.items.to_json()`, `to_jsonl()`, `to_csv()`, `to_xml()`을 호출하면 됩니다.

### 세션을 사용한 사이트 가져오기

- **HTTP 요청**: `Fetcher`로 빠르고 탐지하기 어려운 HTTP 요청을 보냅니다. 브라우저의 TLS 지문과 헤더를 흉내 내고 HTTP/3를 사용할 수 있습니다.
- **동적 페이지**: `StealthyFetcher`로 브라우저를 자동 조작하며 동적 사이트를 가져옵니다. Playwright의 Chromium과 Google Chrome을 지원합니다.
- **봇 차단 우회**: `StealthyFetcher`는 자동화 흔적을 숨기고 브라우저 지문을 위장합니다. 모든 유형의 Cloudflare Turnstile과 Interstitial 검사를 자동으로 통과할 수 있습니다.
- **세션 관리**: `FetcherSession`과 `StealthySession`은 요청 사이에 쿠키와 상태를 유지합니다.
- **프록시 교체**: `ProxyRotator`는 모든 세션에서 프록시를 순서대로 또는 정한 규칙에 따라 교체합니다. 요청마다 다른 프록시를 지정할 수도 있습니다.
- **도메인과 광고 차단**: 특정 도메인과 하위 도메인으로 보내는 요청을 막을 수 있습니다. 브라우저 Fetcher의 광고 차단 기능은 약 3,500개의 광고·추적 도메인을 차단합니다.
- **DNS 유출 방지**: DNS-over-HTTPS를 켜면 Cloudflare의 DoH를 통해 DNS를 조회합니다. 프록시를 쓸 때 DNS가 새어 나가는 것을 막습니다.
- **원격 브라우저**: `cdp_url`로 CDP를 통해 이미 실행 중인 브라우저에 연결합니다. 같은 컴퓨터, 다른 서버, 브라우저 제공 서비스 어디에서든 사용할 수 있습니다. `executable_path`로 직접 만든 Chromium을 브라우저 Fetcher에 지정할 수도 있습니다.
- **백그라운드 API 응답 기록**: 브라우저 세션에서 `record_requests=True`를 켜고 `session.network.search(limit=None)`으로 저장된 응답을 검색하세요. 요청을 다시 보내지 않고 여러 페이지에서 발생한 API 데이터와 HTTP 오류를 읽을 수 있습니다. 기록에는 크기 제한이 있으며 텍스트 응답 본문을 저장합니다.
- **비동기 지원**: 모든 Fetcher에서 비동기 호출을 지원하며, 전용 비동기 세션 클래스도 제공합니다.

### 파싱과 데이터 추출

- 🔄 **요소 추적**: 사이트가 바뀌어도 유사도 알고리즘으로 요소를 다시 찾습니다.
- 🎯 **유연한 선택**: CSS, XPath, 필터, 텍스트, 정규식 등 여러 방법을 사용할 수 있습니다.
- 🔍 **비슷한 요소 찾기**: 이미 찾은 요소와 비슷한 요소를 자동으로 찾습니다.

### AI 기능

- 🤖 **MCP 서버**: Claude나 Cursor 같은 AI 챗봇과 에이전트가 Jigsaw으로 데이터를 수집합니다. HTTP 요청, 브라우저 조작, 스크린샷, 저장된 로그인 상태, 백그라운드 API 응답을 사용할 수 있습니다. 스텔스 브라우저와 도구를 통해 충분한 능력을 가진 AI 모델이 작업 중 마주치는 모든 CAPTCHA를 처리하도록 돕습니다. Cloudflare 처리 기능도 내장되어 있습니다. 모델에 보내는 내용을 줄이고 광고를 차단하며 프롬프트 인젝션으로부터 모델을 보호합니다. CDP 원격 브라우저와 인증을 지원하는 HTTP 연결도 제공합니다. ([데모 영상](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: 설치해서 쓰는 Agent Skill이 코딩 에이전트에 라이브러리 전체 사용법을 알려 줍니다. 에이전트가 추측 대신 현재 API에 맞는 코드를 작성하도록 돕습니다.
- 📚 **RAG용 Markdown**: 한 줄(`page.markdown()`)로 페이지를 정리하고 위험한 내용을 제거해 LLM용 Markdown으로 만듭니다. `ContentSpider` 템플릿으로 사이트 전체를 Markdown 파일로 저장할 수도 있습니다. 이 과정에는 LLM이 필요하지 않습니다. (문서)

### 빠르고 실무에서 검증된 구조

- 🚀 **빠른 처리**: 최적화를 통해 대부분의 Python 스크래핑 라이브러리보다 빠르게 동작합니다.
- 🔋 **적은 메모리 사용**: 최적화한 자료 구조를 사용하고 필요한 시점에만 데이터를 불러옵니다.
- ⚡ **빠른 JSON 변환**: 표준 라이브러리보다 10배 빠릅니다.
- 🏗️ **실무 검증**: 테스트 커버리지 92%와 전체 코드의 타입 힌트를 갖췄습니다. 지난 1년 동안 수백 명이 매일 데이터를 수집하는 데 사용했습니다.

### 개발자를 위한 편리한 도구

- 🎯 **대화형 셸**: Jigsaw을 통합한 IPython 셸을 추가할 수 있습니다. 단축 명령과 도구로 스크립트를 빠르게 개발하세요. curl 요청을 Jigsaw 요청으로 바꾸고 결과를 브라우저에서 볼 수 있습니다.
- 🚀 **터미널에서 바로 사용**: 코드를 한 줄도 쓰지 않고 URL에서 데이터를 가져올 수 있습니다!
- 🛠️ **DOM 탐색**: 부모, 형제, 자식 요소로 이동하는 메서드를 제공합니다.
- 🧬 **텍스트 처리**: 정규식, 텍스트 정리, 빠른 문자열 연산을 사용할 수 있습니다.
- 📝 **선택자 생성**: 어떤 요소든 안정적인 CSS·XPath 선택자를 만들 수 있습니다.
- 🔌 **익숙한 API**: Scrapy와 BeautifulSoup에 익숙하다면 쉽게 사용할 수 있습니다. Scrapy·Parsel과 같은 가상 요소를 지원합니다.
- 🤝 **Scrapy 통합**: 콜백에 `jigsaw_response` 데코레이터를 붙이면 이미 가져온 응답을 Jigsaw 파서로 처리할 수 있습니다. 코드를 새로 작성할 필요가 없습니다.
- 📘 **전체 타입 힌트**: 편집기 지원과 코드 자동 완성을 돕습니다. 코드가 바뀔 때마다 **PyRight**와 **MyPy**가 전체 코드를 자동으로 검사합니다.
- 🔋 **바로 쓰는 Docker 이미지**: 새 버전마다 모든 브라우저가 포함된 Docker 이미지를 자동으로 만들고 배포합니다.

## 시작하기

자주 쓰는 기능을 몇 가지 살펴보겠습니다.

### 기본 사용법
세션을 지원하는 HTTP 요청
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Chrome의 최신 TLS fingerprint 사용
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# 또는 일회성 요청 사용
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
고급 스텔스 모드
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # 작업이 끝날 때까지 브라우저를 열어둡니다
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# 또는 일회성 요청 스타일 - 이 요청을 위해 브라우저를 열고, 완료 후 닫습니다
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
완전한 브라우저 자동화
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # 작업이 끝날 때까지 브라우저를 열어둡니다
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # 원하시면 XPath selector도 사용 가능

# 또는 일회성 요청 스타일 - 이 요청을 위해 브라우저를 열고, 완료 후 닫습니다
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### 스파이더
동시 요청, 여러 세션, 일시 정지와 재개를 지원하는 크롤러를 만들 수 있습니다:
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
print(f"{len(result.items)}개의 인용구를 스크레이핑했습니다")
result.items.to_json("quotes.json")
```
한 스파이더에서 여러 종류의 세션을 사용합니다:
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
            # 보호된 페이지는 스텔스 세션을 통해 라우팅
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # 명시적 콜백
```
진행 상태를 저장하면 긴 크롤링 작업을 멈췄다가 이어서 실행할 수 있습니다. 다음처럼 스파이더를 시작하세요:
```python
QuotesSpider(crawldir="./crawl_data").start()
```
`crawldir`를 설정한 뒤 Ctrl+C를 누르면 대기 중인 요청과 방문한 URL이 저장됩니다. 같은 `crawldir`로 다시 시작하면 이어서 실행됩니다. 추출한 데이터는 따로 저장하세요.

바로 쓸 수 있는 템플릿도 있습니다. 예를 들어 Shopify 스토어의 전체 상품을 가져올 수 있습니다:
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # 스토어의 모든 상품을 변형당 한 항목씩 수집
```
이 템플릿은 공개 컬렉션 API에서 상품을 읽고, 상품 옵션 조합마다 한 항목을 만듭니다.

### 고급 파싱과 요소 탐색
```python
from jigsaw.fetchers import Fetcher

# 풍부한 요소 선택과 내비게이션
page = Fetcher.get('https://quotes.toscrape.com/')

# 여러 선택 메서드로 인용구 가져오기
quotes = page.css('.quote')  # CSS selector
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # BeautifulSoup 스타일
# 아래와 동일
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # 등등...
# 텍스트 내용으로 요소 찾기
quotes = page.find_by_text('Albert Einstein', first_match=False)

# 고급 내비게이션
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # 체이닝 셀렉터
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# 요소 관계와 유사도
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
페이지를 가져오지 않고 파서를 직접 사용할 수도 있습니다:
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
사용법은 같습니다!

### 비동기 세션 예제
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession`은 컨텍스트에 따라 동기/비동기 방식 모두로 동작합니다
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI와 대화형 셸

터미널에서도 Jigsaw을 사용할 수 있습니다:

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

스크래핑용 대화형 셸을 실행합니다:
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
프로그래밍 없이 페이지를 파일로 바로 추출합니다. `--css-selector`로 내용을 고르거나 `--ai-targeted`로 `body` 내용을 선택하고 정리하세요. 텍스트는 `.txt`, Markdown은 `.md`, HTML은 `.html`을 사용하세요.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> MCP 서버와 대화형 셸 등 다른 기능은 문서에서 확인하세요.

## 성능 테스트

Jigsaw은 강력할 뿐 아니라 매우 빠릅니다. 다음 테스트는 Jigsaw 파서와 널리 쓰이는 다른 라이브러리의 최신 버전을 비교합니다.

### 텍스트 추출 속도: 중첩 요소 5,000개

| # |      라이브러리      | 시간(ms) | Jigsaw 대비 |
|---|:-----------------:|:---------:|:------------:|
| 1 |     Jigsaw     |   1.99    |     1.0x     |
| 2 |   Parsel/Scrapy   |   2.06    |    1.035     |
| 3 |     Lxml 단독      |   2.56    |    1.286     |
| 4 |      PyQuery      |   23.98   |     ~12x     |
| 5 |    Selectolax     |  197.02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545.15  |   ~776.5x    |
| 7 |   BS4 + Lxml   |  1562.1   |   ~785.0x    |
| 8 | BS4 + html5lib |  3412.73  |   ~1714.9x   |


### 비슷한 요소 찾기와 텍스트 검색

Jigsaw의 적응형 요소 검색은 다른 방법보다 훨씬 빠릅니다:

| 라이브러리     | 시간(ms) | Jigsaw 대비 |
|-------------|:---------:|:------------:|
| Jigsaw   |    2.3    |     1.0x     |
| AutoScraper |   12.58   |    5.47x     |


> 각 결과는 100회 이상 실행한 평균입니다. 측정 방법은 [benchmarks.py](benchmarks.py)를 확인하세요.

## 설치

Jigsaw에는 Python 3.10 이상이 필요합니다:

```bash
pip install jigsaw
```

> [!IMPORTANT]
> 이 명령은 파서와 필요한 패키지만 설치합니다. Fetcher나 명령줄 도구는 포함되지 않습니다. 따라서 위 예제처럼 `jigsaw.fetchers`나 `jigsaw.spiders`에서 가져오면 `ModuleNotFoundError`가 발생합니다. Fetcher나 스파이더를 사용하려면 먼저 아래 방법으로 Fetcher에 필요한 패키지를 설치하세요.

### 추가 패키지

1. Fetcher, 관련 클래스, 아래 추가 기능을 사용하려면 Fetcher와 브라우저에 필요한 패키지를 설치하세요:
    ```bash
    pip install "jigsaw[fetchers]"

    jigsaw install           # 일반 설치
    jigsaw install  --force  # 강제 재설치
    ```

    모든 브라우저, 필요한 시스템 패키지, 브라우저 지문을 바꾸는 도구를 다운로드합니다.

    명령어 대신 코드에서 설치할 수도 있습니다:
    ```python
    from jigsaw.cli import install

    install([], standalone_mode=False)          # 일반 설치
    install(["--force"], standalone_mode=False) # 강제 재설치
    ```

2. 추가 기능:
   - MCP 서버 설치:
       ```bash
       pip install "jigsaw[ai]"
       ```
   - RAG 시스템 만들기에 필요한 패키지 설치:
       ```bash
       pip install "jigsaw[rag]"
       ```
   - 대화형 셸과 `extract` 명령어 설치:
       ```bash
       pip install "jigsaw[shell]"
       ```
   - 모든 기능 설치:
       ```bash
       pip install "jigsaw[all]"
       ```
   브라우저 Fetcher를 사용하려면 `jigsaw install`을 실행하세요. HTTP 요청에는 브라우저 설치가 필요하지 않습니다.

## 개발에 참여하기

개발 참여를 환영합니다! 시작하기 전에 [참여 안내](CONTRIBUTING.md)를 읽어 주세요.

## 면책 조항

> [!CAUTION]
> 이 라이브러리는 학습과 연구 목적으로 제공합니다. 사용하면 국내외 데이터 수집과 개인정보 보호 관련 법률을 따르는 데 동의한 것으로 봅니다. 작성자와 참여자는 소프트웨어의 오용에 책임지지 않습니다. 사이트의 이용 약관과 robots.txt를 지켜 주세요.

