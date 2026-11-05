
<h1 align="center">Jigsaw</h1>
<p align="center"><small>اجمع بيانات الويب الحديث بسهولة</small></p>


Jigsaw إطار عمل بلغة Python لجمع بيانات الويب. يجمع طلبات HTTP السريعة، والمتصفحات الخفية، وتحليل الصفحات، والزحف المتزامن في مكتبة واحدة.

اجمع بيانات الصفحات الثابتة، وشغّل JavaScript، وتفاعل مع المواقع، واستخرج البيانات من طلبات API التي تعمل خلفها. أنشئ برامج زحف بجلسات قابلة لإعادة الاستخدام، وتبديل البروكسي، وإعادة المحاولة تلقائيًا، والإيقاف والاستئناف، وتصدير البيانات بأدوات مدمجة.

استخدمه من Python أو الطرفية أو وكيل الذكاء الاصطناعي عبر خادم MCP وAgent Skill. يغطي Jigsaw خطوات جمع البيانات كاملة، من استخراج بضعة حقول إلى جمع موقع كامل في ملفات Markdown نظيفة.

## ما الذي يمكنك فعله باستخدام Jigsaw؟

- **الجلب والتفاعل**: طلبات HTTP سريعة، ومتصفحات خفية، وتشغيل JavaScript، والتعامل مع Cloudflare Turnstile وInterstitial، وجلسات مستمرة، وحفظ ردود طلبات API في الخلفية.
- **التحليل والاستخراج**: البحث باستخدام CSS وXPath والنص والتعبيرات المنتظمة، وتتبع العناصر عند تغير الصفحة، والعثور على العناصر المتشابهة، وإخراج Markdown نظيف.
- **الزحف والتصدير**: برامج Spider متزامنة، وتبديل البروكسي، وإعادة المحاولة، وAutoThrottle، والإيقاف والاستئناف، وبث النتائج، وقوالب جاهزة، وتصدير JSON وJSONL وCSV وXML.
- **جمع البيانات بالذكاء الاصطناعي أو من الطرفية**: خادم MCP لوكلاء الذكاء الاصطناعي لتصفح المواقع واستخراج البيانات، وAgent Skill، وأوامر CLI، وواجهة تفاعلية.

ابدأ بصفحة واحدة:

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

أو اجمع بيانات أكثر باستخدام Spider:

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

يطبع هذا المثال `10` ويحفظ الاقتباسات وأسماء المؤلفين في `quotes.json`.


---

## الميزات الأساسية

### Spiders: إطار عمل كامل للزحف
- 🕷️ **واجهة Spider تشبه Scrapy**: عرّف برامج Spider باستخدام `start_urls`، ودوال `parse` غير المتزامنة، وكائنات `Request` و`Response`.
- ⚡ **زحف متزامن**: اضبط عدد الطلبات المتزامنة، وحدود كل نطاق، ومدة الانتظار بين التنزيلات.
- 🔄 **دعم عدة جلسات**: واجهة واحدة لطلبات HTTP والمتصفحات الخفية بلا واجهة ضمن Spider واحد. وجّه الطلبات إلى جلسات مختلفة باستخدام المعرّف.
- 💾 **الإيقاف والاستئناف**: احفظ الطلبات المعلقة والروابط التي زرتها باستخدام `crawldir`. اضغط Ctrl+C للإيقاف الآمن، ثم أعد التشغيل مع المجلد نفسه.
- 📡 **بث النتائج**: استقبل العناصر فور جمعها عبر `async for item in spider.stream()`، مع إحصاءات مباشرة. يناسب الواجهات وخطوات معالجة البيانات وعمليات الزحف الطويلة.
- 🛡️ **كشف الطلبات المحظورة**: كشف الطلبات المحظورة وإعادة محاولتها تلقائيًا، مع إمكانية تخصيص السلوك.
- 🚦 **AutoThrottle**: لا تحتاج إلى تخمين مدة الانتظار. يضبط Spider المدة لكل نطاق حسب سرعة رد الموقع، ثم يضاعفها، أو ينتظر المدة التي يطلبها `Retry-After`، عندما يبدأ الموقع في الحظر أو تقييد معدل الطلبات. ويعود إلى السرعة الأعلى عند توقف ذلك.
- 🤖 **الالتزام بملف robots.txt**: خيار `robots_txt_obey` يحترم تعليمات `Disallow` و`Crawl-delay` و`Request-rate`، مع تخزين مؤقت لكل نطاق.
- 🧪 **وضع التطوير**: احفظ الردود على القرص في أول تشغيل، ثم أعد استخدامها في التشغيلات التالية. عدّل دالة `parse()` دون إرسال طلبات جديدة إلى الخوادم.
- 🧩 **قوالب Spider جاهزة**: استخدم `CrawlSpider` لتتبع الروابط وفق قواعد، و`SitemapSpider` للزحف من خرائط الموقع أو robots.txt، و`XMLFeedSpider` و`CSVFeedSpider` لقراءة خلاصات XML وRSS وCSV، و`ShopifySpider` لجمع منتجات متاجر Shopify العامة، بعنصر مستقل لكل نوع من المنتج (variant).
- 🔗 **استخراج الروابط**: أداة `LinkExtractor` مستقلة تدعم أنماط السماح والمنع، وتصفية النطاقات والامتدادات، وحصر البحث باستخدام CSS وXPath، وتوحيد صيغة الروابط. استخدمها داخل القوالب أو وحدها.
- 📦 **تصدير مدمج**: صدّر النتائج عبر hooks وخط معالجة خاص بك، أو استخدم أدوات JSON وJSONL وCSV وXML المدمجة: `result.items.to_json()` و`to_jsonl()` و`to_csv()` و`to_xml()`.

### جلب متقدم للمواقع مع دعم الجلسات
- **طلبات HTTP**: طلبات HTTP سريعة وخفية باستخدام `Fetcher`. تدعم محاكاة بصمة TLS وترويسات المتصفح واستخدام HTTP/3.
- **التحميل الديناميكي**: اجلب المواقع الديناميكية مع أتمتة كاملة للمتصفح عبر `StealthyFetcher`، الذي يدعم Chromium الخاص بـPlaywright وGoogle Chrome.
- **تجاوز كشف البوتات**: إخفاء متقدم للأتمتة ومحاكاة البصمات باستخدام `StealthyFetcher`. يمكنه تجاوز أنواع Cloudflare Turnstile وInterstitial تلقائيًا.
- **إدارة الجلسات**: تدعم `FetcherSession` و`StealthySession` الجلسات المستمرة لإدارة ملفات تعريف الارتباط وحالة المتصفح بين الطلبات.
- **تبديل البروكسي**: أداة `ProxyRotator` مدمجة تدعم التبديل الدوري أو المخصص في كل أنواع الجلسات، مع إمكانية تحديد بروكسي مستقل لكل طلب.
- **حظر النطاقات والإعلانات**: امنع الطلبات إلى نطاقات محددة ونطاقاتها الفرعية، أو فعّل حظر الإعلانات المدمج في أدوات جلب المتصفح، الذي يشمل نحو 3,500 نطاق إعلانات وتتبع معروف.
- **منع تسريب DNS**: دعم اختياري لـDNS-over-HTTPS لتوجيه استعلامات DNS عبر DoH من Cloudflare، ومنع تسريبها عند استخدام البروكسي.
- **متصفحات بعيدة**: اتصل بمتصفح يعمل بالفعل عبر CDP باستخدام `cdp_url`، سواء كان على جهازك أو جهاز آخر أو لدى مزود متصفحات، بدلًا من تشغيل متصفح محلي. ويمكنك استخدام نسخة Chromium الخاصة بك مع أي أداة جلب متصفح عبر `executable_path`.
- **حفظ ردود API في الخلفية**: فعّل `record_requests=True` في جلسة المتصفح، ثم ابحث في الردود المحفوظة عبر `session.network.search(limit=None)`. اقرأ بيانات API وأخطاء HTTP عبر عمليات تحميل الصفحات دون إعادة الطلبات. للسجل حد أقصى، ويحفظ محتوى الردود النصية.
- **الدعم غير المتزامن**: دعم كامل في كل أدوات الجلب، مع فئات جلسات مخصصة للعمل غير المتزامن.

### تحليل الصفحات واستخراج البيانات
- 🔄 **تتبع ذكي للعناصر**: اعثر على العناصر بعد تغير الموقع باستخدام خوارزميات مقارنة التشابه.
- 🎯 **اختيار مرن للعناصر**: محددات CSS وXPath، والبحث بالشروط أو بالنص أو بالتعبيرات المنتظمة، والمزيد.
- 🔍 **العثور على العناصر المتشابهة**: ابحث تلقائيًا عن عناصر تشبه العناصر التي وجدتها.

### ميزات الذكاء الاصطناعي
- 🤖 **خادم MCP**: يتيح لوكلاء ومساعدي الذكاء الاصطناعي، مثل Claude وCursor، جمع البيانات عبر Jigsaw باستخدام طلبات HTTP، والتفاعل مع المتصفح، ولقطات الشاشة، وحالة تسجيل دخول محفوظة، وردود API في الخلفية. يستخدم متصفحنا الخفي مع أدوات تساعد النماذج المناسبة على تجاوز CAPTCHA أثناء العمل، إلى جانب أداة حل Cloudflare. ويقلل المحتوى المرسل إلى النموذج، ويحظر الإعلانات، ويحميه من حقن التعليمات Prompt Injection. يدعم أيضًا المتصفحات البعيدة عبر CDP والاتصال عبر HTTP مع خيارات المصادقة. ([فيديو توضيحي](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: مهارة جاهزة للتثبيت تعرّف وكلاء البرمجة على المكتبة كاملة، ليكتبوا كودًا يطابق واجهتها الحالية بدلًا من التخمين.
- 📚 **Markdown جاهز لأنظمة RAG**: حوّل أي صفحة إلى Markdown نظيف ومنقّى وجاهز لنماذج اللغة بسطر واحد (`page.markdown()`)، أو اجمع موقعًا كاملًا في مجموعة ملفات Markdown باستخدام قالب `ContentSpider`، دون الحاجة إلى نموذج لغة أثناء العملية. (التوثيق)

### أداء عالٍ وتصميم مجرّب
- 🚀 **سرعة عالية**: أداء محسّن يتفوق على معظم مكتبات جمع بيانات الويب في Python.
- 🔋 **استهلاك قليل للذاكرة**: هياكل بيانات محسّنة وتحميل عند الحاجة لتقليل استخدام الذاكرة.
- ⚡ **تحويل سريع إلى JSON**: أسرع بعشر مرات من المكتبة القياسية.
- 🏗️ **مجرّب عمليًا**: تغطي الاختبارات 92% من Jigsaw، وتوجد تلميحات أنواع للكود كله. كما استخدمه مئات العاملين في جمع بيانات الويب يوميًا خلال العام الماضي.

### تجربة مناسبة للمطورين وجمع البيانات
- 🎯 **واجهة تفاعلية لجمع البيانات**: واجهة IPython اختيارية مدمجة مع Jigsaw، واختصارات وأدوات تسرّع كتابة البرامج، مثل تحويل طلبات curl إلى طلبات Jigsaw وعرض نتائج الطلبات في المتصفح.
- 🚀 **استخدام مباشر من الطرفية**: يمكنك جمع بيانات رابط دون كتابة أي كود.
- 🛠️ **طرق كثيرة للتنقل**: تنقل في شجرة DOM بين الآباء والأشقاء والأبناء.
- 🧬 **معالجة نصوص محسّنة**: تعبيرات منتظمة وطرق لتنظيف النص وعمليات نصية محسّنة مدمجة.
- 📝 **إنشاء محددات تلقائيًا**: أنشئ محددات CSS وXPath موثوقة لأي عنصر.
- 🔌 **واجهة مألوفة**: تشبه Scrapy وBeautifulSoup، وتستخدم pseudo-elements نفسها الموجودة في Scrapy وParsel.
- 🤝 **تكامل مباشر مع Scrapy**: إذا كنت تستخدم Scrapy، أضف decorator باسم `jigsaw_response` إلى أي callback لتحليل الردود التي تجلبها بالفعل بمحلّل Jigsaw، دون إعادة كتابة البرنامج.
- 📘 **تلميحات أنواع كاملة**: دعم جيد لمحرر الكود والإكمال التلقائي. يُفحص الكود كله تلقائيًا باستخدام **PyRight** و**MyPy** مع كل تغيير.
- 🔋 **صورة Docker جاهزة**: تُبنى صورة Docker تحتوي كل المتصفحات وتُنشر تلقائيًا مع كل إصدار.

## البدء

إليك أمثلة سريعة على استخدام Jigsaw.

### الاستخدام الأساسي
طلبات HTTP مع دعم الجلسات
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # استخدم أحدث إصدار من بصمة TLS لـ Chrome
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# أو استخدم طلبات لمرة واحدة
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
وضع التخفي المتقدم
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # أبقِ المتصفح مفتوحاً حتى تنتهي
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# أو استخدم نمط الطلب لمرة واحدة، يفتح المتصفح لهذا الطلب، ثم يغلقه بعد الانتهاء
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
أتمتة المتصفح الكاملة
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # أبقِ المتصفح مفتوحاً حتى تنتهي
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # محدد XPath إذا كنت تفضله

# أو استخدم نمط الطلب لمرة واحدة، يفتح المتصفح لهذا الطلب، ثم يغلقه بعد الانتهاء
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spiders
أنشئ برامج Spider ترسل عدة طلبات في الوقت نفسه، وتستخدم أنواع جلسات مختلفة، وتدعم الإيقاف والاستئناف:
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
استخدم أنواع جلسات متعددة في Spider واحد:
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
            # وجّه الصفحات المحمية عبر جلسة التخفي
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # callback صريح
```
لحفظ تقدم الزحف وإكماله لاحقًا، شغّل Spider هكذا:
```python
QuotesSpider(crawldir="./crawl_data").start()
```
عند استخدام `crawldir`، اضغط Ctrl+C لحفظ الطلبات المعلقة والروابط التي زرتها. أعد التشغيل مع `crawldir` نفسه لإكمال الزحف. احفظ البيانات التي جمعتها بشكل منفصل.

أو استخدم قالبًا جاهزًا بدلًا من كتابة كود الزحف بنفسك، مثل هذا القالب لجمع كل منتجات متجر Shopify:
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # كل منتج في المتجر، مع عنصر لكل variant
```
يجمع القالب المنتجات المتاحة عبر واجهات API العامة للمجموعات، ويحفظ نتيجة منفصلة لكل نوع من المنتج (variant).

### التحليل المتقدم والتنقل
```python
from jigsaw.fetchers import Fetcher

# اختيار عناصر غني وتنقل
page = Fetcher.get('https://quotes.toscrape.com/')

# احصل على الاقتباسات بطرق اختيار متعددة
quotes = page.css('.quote')  # محدد CSS
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # بأسلوب BeautifulSoup
# نفس الشيء مثل
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # وهكذا...
# البحث عن عنصر بمحتوى النص
quotes = page.find_by_text('Albert Einstein', first_match=False)

# التنقل المتقدم
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # محددات متسلسلة
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# علاقات العناصر والتشابه
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
إذا كان لديك محتوى HTML بالفعل، يمكنك تحليله مباشرة:
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
يمكنك استخدام طرق اختيار العناصر نفسها.

### إدارة الجلسات باستخدام Async
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # تتكيف `FetcherSession` مع السياق وتعمل بالنمطين المتزامن وغير المتزامن
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## سطر الأوامر وShell التفاعلي

يمكنك استخدام Jigsaw من سطر الأوامر:

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

لتشغيل Shell التفاعلي لجمع البيانات:
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
احفظ محتوى الصفحات في ملف مباشرة دون كتابة كود. استخدم `--css-selector` لاختيار المحتوى، أو `--ai-targeted` لاختيار محتوى `body` وإزالة الأجزاء غير المطلوبة. استخدم `.txt` للنص، أو `.md` لصيغة Markdown، أو `.html` لصيغة HTML.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> هذه أمثلة مختصرة. للمزيد من الميزات والتفاصيل، بما فيها خادم MCP وShell التفاعلي، اقرأ التوثيق الكامل هنا

## اختبارات الأداء

Jigsaw سريع أيضًا. تقارن الاختبارات التالية محلّل Jigsaw بأحدث إصدارات مكتبات شائعة أخرى.

### اختبار سرعة استخراج النص (5000 عنصر متداخل)

| # |      المكتبة      | الوقت (ms) | vs Jigsaw |
|---|:-----------------:|:----------:|:------------:|
| 1 |     Jigsaw     |    1.99    |     1.0x     |
| 2 |   Parsel/Scrapy   |    2.06    |     1.035    |
| 3 |     Raw Lxml      |    2.56    |    1.286     |
| 4 |      PyQuery      |   23.98    |     ~12x     |
| 5 |    Selectolax     |   197.02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545.15   |   ~776.5x    |
| 7 |   BS4 with Lxml   |  1562.1   |   ~785.0x    |
| 8 | BS4 with html5lib |  3412.73   |   ~1714.9x   |


### أداء تشابه العناصر والبحث النصي

يعثر Jigsaw على العناصر بعد تغير الصفحة بسرعة أكبر من البدائل:

| المكتبة     | الوقت (ms) | vs Jigsaw |
|-------------|:----------:|:------------:|
| Jigsaw   |    2.3    |     1.0x     |
| AutoScraper |   12.58    |    5.47x    |


> كل نتيجة هي متوسط أكثر من 100 تشغيل. لمعرفة طريقة الاختبار، راجع [benchmarks.py](benchmarks.py).

## التثبيت

يتطلب Jigsaw إصدار Python 3.10 أو أحدث:

```bash
pip install jigsaw
```

> [!IMPORTANT]
> يثبّت هذا الأمر محلّل الصفحات ومتطلباته فقط، دون أدوات الجلب أو متطلبات سطر الأوامر. إذا اكتفيت بهذا التثبيت، سيظهر الخطأ `ModuleNotFoundError` عند استيراد أي شيء من `jigsaw.fetchers` أو `jigsaw.spiders`، كما في الأمثلة السابقة. لاستخدام أدوات الجلب أو Spiders، ثبّت متطلبات أدوات الجلب أولًا كما يلي.

### المتطلبات الاختيارية

1. لاستخدام أدوات الجلب أو فئاتها أو الميزات الإضافية التالية، ثبّت متطلبات أدوات الجلب والمتصفحات كما يلي:
    ```bash
    pip install "jigsaw[fetchers]"

    jigsaw install           # normal install
    jigsaw install  --force  # force reinstall
    ```

    ينزّل هذا كل المتصفحات، ومتطلبات النظام، ومتطلبات تعديل بصمات المتصفح.

    ويمكنك تثبيتها من الكود بدلًا من تشغيل أمر:
    ```python
    from jigsaw.cli import install

    install([], standalone_mode=False)          # normal install
    install(["--force"], standalone_mode=False) # force reinstall
    ```

2. ميزات إضافية:
   - تثبيت خادم MCP:
       ```bash
       pip install "jigsaw[ai]"
       ```
   - تثبيت متطلبات بناء أنظمة RAG:
       ```bash
       pip install "jigsaw[rag]"
       ```
   - تثبيت Shell التفاعلي وأمر `extract`:
       ```bash
       pip install "jigsaw[shell]"
       ```
   - تثبيت كل شيء:
       ```bash
       pip install "jigsaw[all]"
       ```
   شغّل `jigsaw install` عند استخدام أدوات جلب المتصفح. طلبات HTTP لا تحتاج إلى تثبيت متصفح.

## المساهمة

نرحب بالمساهمات! يرجى قراءة [إرشادات المساهمة](CONTRIBUTING.md) قبل البدء.

## إخلاء المسؤولية

> [!CAUTION]
> هذه المكتبة للتعليم والبحث فقط. باستخدامها، توافق على الالتزام بقوانين جمع البيانات والخصوصية المحلية والدولية. المؤلفون والمساهمون غير مسؤولين عن أي إساءة استخدام لهذا البرنامج. احترم دائماً شروط خدمة المواقع وملفات robots.txt.

