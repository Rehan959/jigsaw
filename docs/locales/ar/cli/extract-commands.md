---
title: "احفظ صفحات الويب بصيغة Markdown أو HTML أو نص من سطر الأوامر"
description: "استخدم jigsaw extract لحفظ نتائج HTTP أو المتصفح. حدّد المحتوى باستخدام CSS، واضبط خيارات الطلب، واختر صيغة إخراج مدعومة."
---

# دليل أمر الاستخراج في Jigsaw {#jigsaw-extract-command-guide}

**استخرج بيانات الويب من الطرفية دون الحاجة إلى البرمجة!**

يتيح أمر `jigsaw extract` تنزيل محتوى المواقع واستخراجه من الطرفية مباشرة دون كتابة كود. وهو مناسب للمبتدئين والباحثين وكل من يحتاج إلى استخراج بيانات الويب بسرعة.

!!! success "قبل البدء"

    1. اقرأ صفحة [أساسيات أدوات الجلب](../fetching/choosing.md) لتفهم [كائن Response](../fetching/choosing.md#response-object) وتعرف أداة الجلب المناسبة.
    2. اقرأ صفحة [البحث عن العناصر](../parsing/selection.md) لتعرف كيفية العثور على العناصر واستخراجها من كائن [Selector](../parsing/main_classes.md#selector) أو [Response](../fetching/choosing.md#response-object).
    3. اقرأ صفحة [الأصناف الرئيسية](../parsing/main_classes.md) لتعرف الخصائص والدوال التي يرثها [Response](../fetching/choosing.md#response-object) من [Selector](../parsing/main_classes.md#selector).
    4. اقرأ صفحة واحدة على الأقل من قسم أدوات الجلب لاستخدامها هنا: [طلبات HTTP](../fetching/static.md) أو [الجلب بالمتصفح](../fetching/stealthy.md).

## ما مجموعة أوامر Extract؟ {#what-is-the-extract-command-group}

أوامر extract أدوات بسيطة للطرفية توفر ما يلي:

- **تنزيل صفحات الويب** وحفظ محتواها في ملفات.
- **تحويل HTML إلى صيغ سهلة القراءة** مثل Markdown، أو الاحتفاظ به بصيغة HTML، أو استخراج نص الصفحة فقط.
- **دعم محددات CSS** لاستخراج أجزاء معينة من الصفحة.
- **التعامل مع طلبات HTTP والجلب بالمتصفح**.
- **خيارات تخصيص كثيرة** للترويسات وcookies وproxies وبقية الإعدادات. تتوفر تقريبًا كل خيارات الكود من سطر الأوامر أيضًا.

!!! tip "الوضع المخصص للذكاء الاصطناعي"

    تدعم كل أوامر extract الخيار `--ai-targeted`. عند تفعيله، يستخرج محتوى body الأساسي فقط، ويزيل الوسوم غير المفيدة، وهي script وstyle وnoscript وsvg. كما يزيل العناصر المخفية التي قد تُستخدم لحقن التعليمات، ومنها العناصر المخفية بأنماط مباشرة وaria-hidden وعناصر slot المخفية ووسوم template، ويزيل محارف Unicode عديمة العرض وتعليقات HTML. ومع أمر المتصفح `fetch`، يفعّل حظر الإعلانات تلقائيًا أيضًا. هذا مناسب عندما ستُرسل النتيجة إلى نموذج ذكاء اصطناعي.

## بداية سريعة {#quick-start}

- **تنزيل محتوى موقع**

    نزّل محتوى الموقع كنص نظيف وسهل القراءة:

    ```bash
    jigsaw extract get "https://example.com" page_content.txt
    ```

    يرسل هذا طلب HTTP GET ويحفظ نص الصفحة في `page_content.txt`.

- **الحفظ بصيغ مختلفة**

    اختر صيغة الإخراج بتغيير امتداد الملف:

    ```bash
    # Convert the HTML content to Markdown, then save it to the file (great for documentation)
    jigsaw extract get "https://blog.example.com" article.md
    
    # Save the HTML content as it is to the file
    jigsaw extract get "https://example.com" page.html
    
    # Save a clean version of the text content of the webpage to the file
    jigsaw extract get "https://example.com" content.txt
  
    # Or use the Docker image with something like this:
    ```

- **استخراج محتوى محدد**

    تستطيع جميع الأوامر استخدام محددات CSS لاستخراج أجزاء معينة من الصفحة عبر `--css-selector` أو `-s`، كما في الأمثلة التالية.

## الأوامر المتاحة {#available-commands}

اعرض الأوامر باستخدام `jigsaw extract --help` لتحصل على القائمة التالية:

```bash
Usage: jigsaw extract [OPTIONS] COMMAND [ARGS]...

  Fetch web pages using various fetchers and extract full/selected HTML content as HTML, Markdown, or extract text content.

Options:
  --help  Show this message and exit.

Commands:
  get             Perform a GET request and save the content to a file.
  post            Perform a POST request and save the content to a file.
  put             Perform a PUT request and save the content to a file.
  delete          Perform a DELETE request and save the content to a file.
  fetch           Use StealthyFetcher to fetch content with advanced stealth features.
```

سنشرح كل أمر بالتفصيل فيما يلي.

### طلبات HTTP {#http-requests}

1. **طلب GET**

    الأمر الأكثر استخدامًا لتنزيل محتوى المواقع:

    ```bash
    jigsaw extract get [URL] [OUTPUT_FILE] [OPTIONS]
    ```

    **أمثلة:**

    ```bash
    # Basic download
    jigsaw extract get "https://news.site.com" news.md
    
    # Download with custom timeout
    jigsaw extract get "https://example.com" content.txt --timeout 60
    
    # Extract only specific content using CSS selectors
    jigsaw extract get "https://blog.example.com" articles.md --css-selector "article"
   
    # Send a request with cookies
    jigsaw extract get "https://jigsaw.requestcatcher.com" content.md --cookies "session=abc123; user=john"
   
    # Add user agent
    jigsaw extract get "https://api.site.com" data.txt -H "User-Agent: MyBot 1.0"
    
    # Add multiple headers
    jigsaw extract get "https://site.com" page.html -H "Accept: text/html" -H "Accept-Language: en-US"
    ```

    اعرض خيارات الأمر باستخدام `jigsaw extract get --help` كما يلي:

    ```bash
    Usage: jigsaw extract get [OPTIONS] URL OUTPUT_FILE
    
      Perform a GET request and save the content to a file.
    
      The output file path can be an HTML file, a Markdown file of the HTML content, or the text content itself. Use file extensions (`.html`/`.md`/`.txt`) respectively.
    
    Options:
      -H, --headers TEXT                             HTTP headers in format "Key: Value" (can be used multiple times)
      --cookies TEXT                                 Cookies string in format "name1=value1;name2=value2"
      --timeout INTEGER                              Request timeout in seconds (default: 30)
      --proxy TEXT                                   Proxy URL in format "http://username:password@host:port"
      -s, --css-selector TEXT                        CSS selector to extract specific content from the page. It returns all matches.
      -p, --params TEXT                              Query parameters in format "key=value" (can be used multiple times)
      --follow-redirects / --no-follow-redirects     Whether to follow redirects (default: True)
      --verify / --no-verify                         Whether to verify SSL certificates (default: True)
      --impersonate TEXT                             Browser to impersonate (e.g., chrome, firefox).
      --stealthy-headers / --no-stealthy-headers     Use stealthy browser headers (default: True)
      --ai-targeted                                  Extract only main content and sanitize hidden elements for AI consumption (default: False)
      --help                                         Show this message and exit.
    
    ```

    تعمل هذه الخيارات بالطريقة نفسها في بقية أوامر الطلبات، لذلك لا حاجة إلى تكرار شرحها.

2. **طلب POST**

    ```bash
    jigsaw extract post [URL] [OUTPUT_FILE] [OPTIONS]
    ```

    **أمثلة:**

    ```bash
    # Submit form data
    jigsaw extract post "https://api.site.com/search" results.html --data "query=python&type=tutorial"
    
    # Send JSON data
    jigsaw extract post "https://api.site.com" response.txt --json '{"username": "test", "action": "search"}'
    ```

    اعرض خيارات الأمر باستخدام `jigsaw extract post --help` كما يلي:

    ```bash
    Usage: jigsaw extract post [OPTIONS] URL OUTPUT_FILE
    
      Perform a POST request and save the content to a file.
    
      The output file path can be an HTML file, a Markdown file of the HTML content, or the text content itself. Use file extensions (`.html`/`.md`/`.txt`) respectively.
    
    Options:
      -d, --data TEXT                                Form data to include in the request body (as string, ex: "param1=value1&param2=value2")
      -j, --json TEXT                                JSON data to include in the request body (as string)
      -H, --headers TEXT                             HTTP headers in format "Key: Value" (can be used multiple times)
      --cookies TEXT                                 Cookies string in format "name1=value1;name2=value2"
      --timeout INTEGER                              Request timeout in seconds (default: 30)
      --proxy TEXT                                   Proxy URL in format "http://username:password@host:port"
      -s, --css-selector TEXT                        CSS selector to extract specific content from the page. It returns all matches.
      -p, --params TEXT                              Query parameters in format "key=value" (can be used multiple times)
      --follow-redirects / --no-follow-redirects     Whether to follow redirects (default: True)
      --verify / --no-verify                         Whether to verify SSL certificates (default: True)
      --impersonate TEXT                             Browser to impersonate (e.g., chrome, firefox).
      --stealthy-headers / --no-stealthy-headers     Use stealthy browser headers (default: True)
      --ai-targeted                                  Extract only main content and sanitize hidden elements for AI consumption (default: False)
      --help                                         Show this message and exit.
    
    ```

3. **طلب PUT**

    ```bash
    jigsaw extract put [URL] [OUTPUT_FILE] [OPTIONS]
    ```

    **أمثلة:**

    ```bash
    # Send data
    jigsaw extract put "https://jigsaw.requestcatcher.com/put" results.html --data "update=info" --impersonate "firefox"
    
    # Send JSON data
    jigsaw extract put "https://jigsaw.requestcatcher.com/put" response.txt --json '{"username": "test", "action": "search"}'
    ```

    اعرض خيارات الأمر باستخدام `jigsaw extract put --help` كما يلي:

    ```bash
    Usage: jigsaw extract put [OPTIONS] URL OUTPUT_FILE
    
      Perform a PUT request and save the content to a file.
    
      The output file path can be an HTML file, a Markdown file of the HTML content, or the text content itself. Use file extensions (`.html`/`.md`/`.txt`) respectively.
    
    Options:
      -d, --data TEXT                                Form data to include in the request body
      -j, --json TEXT                                JSON data to include in the request body (as string)
      -H, --headers TEXT                             HTTP headers in format "Key: Value" (can be used multiple times)
      --cookies TEXT                                 Cookies string in format "name1=value1;name2=value2"
      --timeout INTEGER                              Request timeout in seconds (default: 30)
      --proxy TEXT                                   Proxy URL in format "http://username:password@host:port"
      -s, --css-selector TEXT                        CSS selector to extract specific content from the page. It returns all matches.
      -p, --params TEXT                              Query parameters in format "key=value" (can be used multiple times)
      --follow-redirects / --no-follow-redirects     Whether to follow redirects (default: True)
      --verify / --no-verify                         Whether to verify SSL certificates (default: True)
      --impersonate TEXT                             Browser to impersonate (e.g., chrome, firefox).
      --stealthy-headers / --no-stealthy-headers     Use stealthy browser headers (default: True)
      --ai-targeted                                  Extract only main content and sanitize hidden elements for AI consumption (default: False)
      --help                                         Show this message and exit.
    ```

4. **طلب DELETE**

    ```bash
    jigsaw extract delete [URL] [OUTPUT_FILE] [OPTIONS]
    ```

    **أمثلة:**

    ```bash
    # Send data
    jigsaw extract delete "https://jigsaw.requestcatcher.com/delete" results.html
    
    # Send JSON data
    jigsaw extract delete "https://jigsaw.requestcatcher.com/" response.txt --impersonate "chrome"
    ```

    اعرض خيارات الأمر باستخدام `jigsaw extract delete --help` كما يلي:

    ```bash
    Usage: jigsaw extract delete [OPTIONS] URL OUTPUT_FILE
    
      Perform a DELETE request and save the content to a file.
    
      The output file path can be an HTML file, a Markdown file of the HTML content, or the text content itself. Use file extensions (`.html`/`.md`/`.txt`) respectively.
    
    Options:
      -H, --headers TEXT                             HTTP headers in format "Key: Value" (can be used multiple times)
      --cookies TEXT                                 Cookies string in format "name1=value1;name2=value2"
      --timeout INTEGER                              Request timeout in seconds (default: 30)
      --proxy TEXT                                   Proxy URL in format "http://username:password@host:port"
      -s, --css-selector TEXT                        CSS selector to extract specific content from the page. It returns all matches.
      -p, --params TEXT                              Query parameters in format "key=value" (can be used multiple times)
      --follow-redirects / --no-follow-redirects     Whether to follow redirects (default: True)
      --verify / --no-verify                         Whether to verify SSL certificates (default: True)
      --impersonate TEXT                             Browser to impersonate (e.g., chrome, firefox).
      --stealthy-headers / --no-stealthy-headers     Use stealthy browser headers (default: True)
      --ai-targeted                                  Extract only main content and sanitize hidden elements for AI consumption (default: False)
      --help                                         Show this message and exit.
    ```

### الجلب بالمتصفح {#browser-fetching}

استخدم `fetch` لصفحات JavaScript وأتمتة المتصفح والمواقع المحمية. يشغّل `StealthyFetcher` مع جميع خيارات التخفي المتاحة.

```bash
jigsaw extract fetch "https://jigsaw.requestcatcher.com/" content.md --network-idle
jigsaw extract fetch "https://jigsaw.requestcatcher.com/" data.txt --wait-selector ".content-loaded"
jigsaw extract fetch "https://jigsaw.requestcatcher.com/" page.html --no-headless --disable-resources
jigsaw extract fetch "https://nopecha.com/demo/cloudflare" data.txt --solve-cloudflare --css-selector "#padded_content a"
jigsaw extract fetch "https://site.com" content.md --proxy "http://proxy-server:8080"
```

استخدم `--pierce-shadow` لتضمين محتوى Shadow DOM المفتوح. هذا الخيار غير مفعّل افتراضيًا، ويمكن تعطيله صراحة باستخدام `--no-pierce-shadow`. راجع [Shadow DOM](../fetching/stealthy.md#shadow-dom) لأمثلة المحددات وحدود الدعم.

```bash
jigsaw extract fetch "https://example.com" content.md --pierce-shadow
```

شغّل `jigsaw extract fetch --help` لعرض كل الخيارات:

```text
Usage: jigsaw extract fetch [OPTIONS] URL OUTPUT_FILE

  Use StealthyFetcher to fetch content with advanced stealth features.

Options:
  --headless / --no-headless                  Run browser in headless mode (default: True)
  --disable-resources / --enable-resources    Drop unnecessary resources for speed boost (default: False)
  --block-webrtc / --allow-webrtc             Block WebRTC entirely (default: False)
  --solve-cloudflare / --no-solve-cloudflare  Solve Cloudflare challenges (default: False)
  --allow-webgl / --block-webgl               Allow WebGL (default: True)
  --pierce-shadow / --no-pierce-shadow        Include open Shadow DOM content (default: False)
  --network-idle / --no-network-idle          Wait for network idle (default: False)
  --real-chrome/--no-real-chrome              If you have a Chrome browser installed on your device, enable this, and the Fetcher will launch an instance of your browser and use it. (default: False)
  --timeout INTEGER                           Timeout in milliseconds (default: 30000)
  --wait INTEGER                              Additional wait time in milliseconds after page load (default: 0)
  -s, --css-selector TEXT                     CSS selector to extract specific content from the page. It returns all matches.
  --wait-selector TEXT                        CSS selector to wait for before proceeding
  --hide-canvas / --show-canvas               Add noise to canvas operations (default: False)
  --locale TEXT                               Specify user locale. Defaults to the system default locale.
  --proxy TEXT                                Proxy URL in format "http://username:password@host:port"
  -H, --extra-headers TEXT                    Extra headers in format "Key: Value" (can be used multiple times)
  --dns-over-https / --no-dns-over-https   Route DNS through Cloudflare's DoH to prevent DNS leaks when using proxies (default: False)
  --block-ads / --no-block-ads               Block requests to known ad and tracker domains (default: False)
  --executable-path TEXT                      Path to a custom Chromium-compatible browser executable. Falls back to the JIGSAW_EXECUTABLE_PATH environment variable when not set.
  --ai-targeted                              Extract only main content and sanitize hidden elements for AI consumption (default: False)
  --help                                      Show this message and exit.
```

## متى تستخدم كل أمر؟ {#when-to-use-each-command}

إذا لم تكن خبيرًا في استخراج بيانات الويب ولم تعرف ماذا تختار، فاستخدم هذه القاعدة البسيطة:

- استخدم **`get`** مع المواقع البسيطة والمدونات والمقالات الإخبارية.
- استخدم **`fetch`** مع صفحات JavaScript وأتمتة المتصفح والمواقع المحمية، ومنها Cloudflare.

## اعتبارات قانونية وأخلاقية {#legal-and-ethical-considerations}

⚠️ **إرشادات مهمة:**

- **افحص robots.txt**: افتح `https://website.com/robots.txt` لمعرفة قواعد استخراج البيانات.
- **احترم حدود الطلبات**: لا تُثقل الخوادم بكثرة الطلبات.
- **شروط الخدمة**: اقرأ شروط الموقع والتزم بها.
- **حقوق النشر**: احترم حقوق الملكية الفكرية.
- **الخصوصية**: راعِ قوانين حماية البيانات الشخصية.
- **الاستخدام التجاري**: تأكد من امتلاك الإذن المطلوب لأغراض العمل.

---

*نتمنى لك تجربة موفقة في استخراج البيانات! تذكّر احترام سياسات المواقع والالتزام بكل القوانين واللوائح المعمول بها.*
