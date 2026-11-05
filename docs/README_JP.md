
<h1 align="center">Jigsaw</h1>
<p align="center"><small>現代のウェブを手軽にスクレイピング</small></p>


Jigsaw は Python のウェブスクレイピングフレームワークです。高速な HTTP リクエスト、ステルスブラウザ、ページの解析、並行クロールをひとつのライブラリで扱えます。

静的なページの取得、JavaScript の実行、サイトの操作、背後にある API からのデータ抽出ができます。セッションの再利用、プロキシの切り替え、自動再試行、一時停止と再開、データの出力に対応したクローラーを作れます。

Python やターミナルから使うほか、MCP サーバーと Agent Skill を通じて AI エージェントからも使えます。少数の項目を取り出す作業から、サイト全体を整理された Markdown ファイルとして保存する作業まで対応します。

## Jigsaw でできること

- **ページの取得と操作**：高速な HTTP リクエスト、ステルスブラウザ、JavaScript の実行、Cloudflare Turnstile と Interstitial への対応、永続セッション、バックグラウンド API レスポンスの記録。
- **解析とデータ抽出**：CSS、XPath、テキスト、正規表現による検索、ページ変更後の要素の追跡、類似要素の検索、整理された Markdown の出力。
- **クロールと出力**：並行クロール、プロキシの切り替え、再試行、AutoThrottle、一時停止と再開、ストリーミング、すぐに使えるテンプレート、JSON・JSONL・CSV・XML への出力。
- **AI やターミナルからの利用**：AI エージェントがページを操作してデータを抽出するための MCP サーバー、Agent Skill、CLI コマンド、対話型シェル。

まずはひとつのページから始めます。

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

Spider を使えば、より多くのページを取得できます。

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

このコードは `10` を表示し、名言と作者を `quotes.json` に保存します。


---

## 主な機能

### Spider：本格的なクロールフレームワーク

- 🕷️ **Scrapy に似た Spider API**：`start_urls`、非同期の `parse` コールバック、`Request` と `Response` オブジェクトで Spider を定義します。
- ⚡ **並行クロール**：同時に処理するリクエスト数、ドメインごとの制限、ダウンロードの待ち時間を設定できます。
- 🔄 **複数のセッション**：ひとつの Spider で HTTP リクエストとステルス対応のヘッドレスブラウザを使えます。セッション ID でリクエストの処理先を選びます。
- 💾 **一時停止と再開**：`crawldir` で待機中のリクエストと訪問済み URL を保存します。Ctrl+C で安全に停止し、同じディレクトリで起動すると続きから再開できます。
- 📡 **ストリーミング**：`async for item in spider.stream()` で、抽出したデータをすぐに受け取れます。統計もリアルタイムで確認できます。画面への表示、データ処理、長時間のクロールに適しています。
- 🛡️ **ブロックの検出**：ブロックされたリクエストを自動で検出し、再試行します。処理は変更できます。
- 🚦 **AutoThrottle**：サイトの応答速度に合わせて、ドメインごとの待ち時間を自動調整します。ブロックや頻度制限を受けたら待ち時間を 2 倍にするか、`Retry-After` が指定する時間を待ちます。問題が収まると再び速度を上げます。
- 🤖 **robots.txt の遵守**：`robots_txt_obey` を有効にすると、`Disallow`、`Crawl-delay`、`Request-rate` に従います。ルールはドメインごとにキャッシュします。
- 🧪 **開発モード**：初回のレスポンスをディスクに保存し、次回から再利用します。サーバーに再度アクセスせずに `parse()` を調整できます。
- 🧩 **すぐに使える Spider テンプレート**：`CrawlSpider` はルールに沿ってリンクをたどり、`SitemapSpider` は sitemap や robots.txt を起点にクロールします。`XMLFeedSpider` と `CSVFeedSpider` は XML・RSS・CSV フィードを読み取ります。`ShopifySpider` は公開 Shopify ストアの商品を取得し、バリエーションごとに 1 件のデータを出力します。
- 🔗 **リンク抽出**：`LinkExtractor` はパターンによる許可と除外、ドメインや拡張子の絞り込み、CSS と XPath による範囲指定、URL の正規化に対応します。テンプレート内でも単体でも使えます。
- 📦 **データの出力**：フックと独自の処理を使うか、組み込みの JSON・JSONL・CSV・XML 出力を使えます。`result.items.to_json()`、`to_jsonl()`、`to_csv()`、`to_xml()` を呼び出します。

### セッションを使ったページの取得

- **HTTP リクエスト**：`Fetcher` で高速かつ検出されにくい HTTP リクエストを送れます。ブラウザの TLS フィンガープリントとヘッダーの模倣や、HTTP/3 に対応します。
- **動的なページの読み込み**：`StealthyFetcher` のブラウザ自動化で動的なサイトを取得できます。Playwright の Chromium と Google Chrome に対応します。
- **ボット検出の回避**：`StealthyFetcher` は自動化の痕跡を隠し、フィンガープリントを偽装します。Cloudflare Turnstile や Interstitial の各種検証を自動処理できます。
- **セッション管理**：`FetcherSession` と `StealthySession` は、リクエスト間で Cookie と状態を保持します。
- **プロキシの切り替え**：`ProxyRotator` は、すべてのセッションで順番に、または独自のルールでプロキシを切り替えます。リクエストごとにプロキシを指定することもできます。
- **ドメインと広告のブロック**：指定したドメインとそのサブドメインへのリクエストを止められます。ブラウザ Fetcher には広告ブロック機能もあり、約 3,500 の広告・追跡用ドメインに対応します。
- **DNS リークの防止**：DNS-over-HTTPS を有効にすると、Cloudflare の DoH を通じて DNS を問い合わせます。プロキシ使用時の DNS リークを防ぎます。
- **リモートブラウザ**：CDP と `cdp_url` を使い、すでに動いているブラウザに接続できます。同じパソコン、別のサーバー、ブラウザ提供サービスのいずれでも使えます。`executable_path` で、各ブラウザ Fetcher に独自の Chromium を指定することもできます。
- **バックグラウンド API レスポンスの記録**：ブラウザセッションで `record_requests=True` を有効にし、`session.network.search(limit=None)` で保存済みレスポンスを検索します。リクエストを送り直さずに、複数のページ読み込みで発生した API データや HTTP エラーを確認できます。履歴には上限があり、テキストのレスポンス本文を保存します。
- **非同期対応**：すべての Fetcher で非同期処理を使えます。専用の非同期セッションもあります。

### 解析とデータ抽出

- 🔄 **要素の再検索**：サイトが変わった後も、類似度を使って要素を見つけ直します。
- 🎯 **柔軟な選択**：CSS、XPath、フィルター、テキスト、正規表現などを使えます。
- 🔍 **類似要素の検索**：見つけた要素に似た要素を自動で探します。

### AI 機能

- 🤖 **MCP サーバー**：Claude や Cursor などの AI アシスタントとエージェントが Jigsaw を使ってデータを抽出できます。HTTP リクエスト、ブラウザ操作、スクリーンショット、保存済みログイン状態、バックグラウンド API レスポンスに対応します。ステルスブラウザとツールを使い、対応する能力を持つモデルが CAPTCHA を処理できるようにします。Cloudflare 検証の処理機能もあります。モデルへ送る内容を減らし、広告をブロックし、プロンプトインジェクションから保護します。CDP によるリモートブラウザ接続や、認証付きの HTTP 接続にも対応します。（[デモ動画](https://www.youtube.com/watch?v=qyFk3ZNwOxE)）
- 🧠 **Agent Skill**：インストールして使える Agent Skill が、コーディングエージェントにライブラリの使い方を伝えます。現在の API に合ったコードを書く助けになります。
- 📚 **RAG 向けの Markdown**：1 行のコード（`page.markdown()`）で、ページを整理・クリーニングした LLM 向けの Markdown に変換します。`ContentSpider` テンプレートを使えば、サイト全体を Markdown ファイルに保存できます。この処理に LLM は不要です。（ドキュメント）

### 高速で、実際の作業にも使われています

- 🚀 **高速な処理**：最適化により、多くの Python スクレイピングライブラリを上回る速度を実現しています。
- 🔋 **少ないメモリ使用量**：最適化したデータ構造と、必要なときだけ読み込む仕組みを使っています。
- ⚡ **高速な JSON 出力**：標準ライブラリの 10 倍の速度です。
- 🏗️ **実際の作業で検証済み**：テストカバレッジは 92% で、すべてのコードに型ヒントがあります。この 1 年間、数百人が毎日のデータ抽出に使ってきました。

### 開発とデータ抽出のためのツール

- 🎯 **対話型シェル**：Jigsaw と連携した IPython シェルを追加できます。ショートカットやツールでスクリプトの開発を助けます。curl リクエストを Jigsaw のリクエストに変換し、結果をブラウザで確認できます。
- 🚀 **ターミナルからの利用**：コードを書かずに URL の内容を取得できます。
- 🛠️ **DOM の移動**：親要素、兄弟要素、子要素をたどれます。
- 🧬 **テキスト処理**：正規表現、テキストのクリーニング、最適化した文字列操作を使えます。
- 📝 **セレクターの生成**：任意の要素に対する CSS と XPath のセレクターを生成します。
- 🔌 **使い慣れた API**：Scrapy や BeautifulSoup に似た API で、Scrapy と Parsel と同じ疑似要素を使えます。
- 🤝 **Scrapy との連携**：コールバックに `jigsaw_response` デコレーターを付けると、取得済みのレスポンスを Jigsaw のパーサーで解析できます。プログラムを書き直す必要はありません。
- 📘 **すべてのコードに型ヒント**：エディターでの確認とコード補完を助けます。変更のたびに、すべてのコードを **PyRight** と **MyPy** で自動チェックします。
- 🔋 **すぐに使える Docker イメージ**：リリースごとに、すべてのブラウザを含む Docker イメージを自動で作成・公開します。

## はじめに

よく使う機能をいくつか紹介します。

### 基本的な使い方
セッションを使った HTTP リクエスト
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Chrome の TLS fingerprint の最新バージョンを使用
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# または一回限りのリクエストを使用
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
高度なステルスモード
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # 完了するまでブラウザを開いたままにする
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# または一回限りのリクエストスタイル、このリクエストのためにブラウザを開き、完了後に閉じる
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
完全なブラウザ自動化
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # 完了するまでブラウザを開いたままにする
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # お好みであれば XPath セレクタを使用

# または一回限りのリクエストスタイル、このリクエストのためにブラウザを開き、完了後に閉じる
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spider
並行リクエスト、複数のセッション、一時停止と再開に対応したクローラーを作れます。
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
print(f"{len(result.items)}件の引用をスクレイプしました")
result.items.to_json("quotes.json")
```
ひとつの Spider で、複数の種類のセッションを使えます。
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
            # 保護されたページはステルス Session を通してルーティング
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # 明示的な callback
```
進捗を保存すれば、長時間のクロールを一時停止して再開できます。次のように Spider を起動します。
```python
QuotesSpider(crawldir="./crawl_data").start()
```
`crawldir` を設定して Ctrl+C を押すと、保留中のリクエストと訪問済み URL が保存されます。同じ `crawldir` で再起動すると再開できます。抽出データは別途保存してください。

すぐに使えるテンプレートもあります。たとえば、Shopify ストアの商品全体を取得できます。
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # ストア内の全商品を、バリエーションごとに 1 件取得
```
このテンプレートは公開されているコレクション API から商品を読み取り、バリエーションごとに 1 件のデータを出力します。

### さらに詳しい解析と要素の移動
```python
from jigsaw.fetchers import Fetcher

# 豊富な要素選択とナビゲーション
page = Fetcher.get('https://quotes.toscrape.com/')

# 複数の選択メソッドで引用を取得
quotes = page.css('.quote')  # CSS セレクタ
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # BeautifulSoup スタイル
# 以下と同じ
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # など...
# テキスト内容で要素を検索
quotes = page.find_by_text('Albert Einstein', first_match=False)

# 高度なナビゲーション
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # チェーンセレクタ
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# 要素の関連性と類似性
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
ページを取得せずに、パーサーを直接使うこともできます。
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
使い方は同じです。

### 非同期セッションの例
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession` はコンテキストに応じて同期・非同期の両方で動作します
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI と対話型シェル

ターミナルからも Jigsaw を使えます。

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

スクレイピング用の対話型シェルを起動します。
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
プログラミングなしでページをファイルに抽出できます。`--css-selector` で内容を選ぶか、`--ai-targeted` で `body` の内容を選択・クリーニングします。テキストは `.txt`、Markdown は `.md`、HTML は `.html` を使います。
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> MCP サーバーや対話型シェルなど、ほかの機能はドキュメントをご覧ください。

## 性能テスト

Jigsaw は処理速度も重視しています。以下では、そのパーサーと他のよく使われるライブラリの最新バージョンを比較します。

### テキスト抽出の速度（5,000 個の入れ子の要素）

| # |      ライブラリ      | 時間（ミリ秒） | Jigsaw との比較 |
|---|:-----------------:|:---------:|:------------:|
| 1 |     Jigsaw     |   1.99    |     1.0x     |
| 2 |   Parsel/Scrapy   |   2.06    |    1.035     |
| 3 |     Lxml 単体      |   2.56    |    1.286     |
| 4 |      PyQuery      |   23.98   |     ~12x     |
| 5 |    Selectolax     |  197.02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545.15  |   ~776.5x    |
| 7 |   BS4 + Lxml   |  1562.1   |   ~785.0x    |
| 8 | BS4 + html5lib |  3412.73  |   ~1714.9x   |


### 類似要素とテキストの検索

Jigsaw の適応型の要素検索は、他の方法より高速です。

| ライブラリ     | 時間（ミリ秒） | Jigsaw との比較 |
|-------------|:---------:|:------------:|
| Jigsaw   |    2.3    |     1.0x     |
| AutoScraper |   12.58   |    5.47x     |


> 各結果は、100 回以上の実行の平均です。測定方法は [benchmarks.py](benchmarks.py) をご覧ください。

## インストール

Jigsaw には Python 3.10 以上が必要です。

```bash
pip install jigsaw
```

> [!IMPORTANT]
> このコマンドはパーサーとその依存パッケージだけをインストールします。Fetcher やコマンドラインツールは含まれません。この状態で上の例のように `jigsaw.fetchers` や `jigsaw.spiders` からインポートすると、`ModuleNotFoundError` が発生します。Fetcher や Spider を使う場合は、先に以下の手順で Fetcher の依存パッケージをインストールしてください。

### 追加の依存パッケージ

1. Fetcher、関連するクラス、以下の追加機能を使う場合は、Fetcher とブラウザに必要なパッケージをインストールします。
    ```bash
    pip install "jigsaw[fetchers]"

    jigsaw install           # normal install
    jigsaw install  --force  # force reinstall
    ```

    すべてのブラウザ、必要なシステムパッケージ、フィンガープリントを変更するツールがダウンロードされます。

    コマンドの代わりに、Python のコードからインストールすることもできます。
    ```python
    from jigsaw.cli import install

    install([], standalone_mode=False)          # normal install
    install(["--force"], standalone_mode=False) # force reinstall
    ```

2. 追加機能：
   - MCP サーバーをインストール：
       ```bash
       pip install "jigsaw[ai]"
       ```
   - RAG システムの構築に必要なパッケージをインストール：
       ```bash
       pip install "jigsaw[rag]"
       ```
   - 対話型シェルと `extract` コマンドをインストール：
       ```bash
       pip install "jigsaw[shell]"
       ```
   - すべての機能をインストール：
       ```bash
       pip install "jigsaw[all]"
       ```
   ブラウザ Fetcher を使う場合は `jigsaw install` を実行してください。HTTP リクエストにはブラウザのインストールは不要です。

## 開発への参加

開発への参加を歓迎します。始める前に[参加ガイド](CONTRIBUTING.md)をお読みください。

## 免責事項

> [!CAUTION]
> このライブラリは学習と研究のために提供しています。利用する場合は、地域および国際的なデータ取得とプライバシーの法律に従うことに同意したものとします。作者と開発への参加者は、ソフトウェアの悪用に責任を負いません。サイトの利用規約と robots.txt に従ってください。

