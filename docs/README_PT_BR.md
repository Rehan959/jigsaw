
<h1 align="center">Jigsaw</h1>
<p align="center"><small>Extraia dados da web moderna de forma simples</small></p>


Jigsaw é um framework de web scraping para Python. Ele reúne solicitações HTTP rápidas, navegadores furtivos, análise de páginas e rastreamento simultâneo em uma só biblioteca.

Extraia dados de páginas estáticas, execute JavaScript, interaja com sites e acesse as APIs que eles usam. Crie crawlers com sessões reutilizáveis, rotação de proxies, novas tentativas automáticas, pausa e retomada, e exportação de dados integrada.

Use o Jigsaw pelo Python, pelo terminal ou com seu agente de IA por meio do servidor MCP e da Agent Skill. Ele cobre todo o processo, desde extrair alguns campos até salvar um site inteiro como arquivos Markdown limpos.

## O que você pode fazer com o Jigsaw

- **Obter páginas e interagir**: Solicitações HTTP rápidas, navegadores furtivos, execução de JavaScript, tratamento de Cloudflare Turnstile e Interstitial, sessões persistentes e captura de respostas de APIs em segundo plano.
- **Analisar e extrair**: Busca com CSS, XPath, texto e expressões regulares, localização de elementos após mudanças na página, busca de elementos semelhantes e saída em Markdown limpo.
- **Rastrear e exportar**: Spiders simultâneos, rotação de proxies, novas tentativas, AutoThrottle, pausa e retomada, resultados em streaming, modelos prontos e exportação em JSON, JSONL, CSV e XML.
- **Extrair dados com IA ou pelo terminal**: Um servidor MCP para agentes de IA navegarem e extraírem dados, uma Agent Skill, comandos CLI e um shell interativo.

Comece com uma só página:

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

Ou extraia mais dados com um spider:

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

Este exemplo imprime `10` e salva as citações e seus autores em `quotes.json`.


---

## Principais recursos

### Spiders: um framework completo de rastreamento

- 🕷️ **API de Spider parecida com a do Scrapy**: Defina spiders com `start_urls`, callbacks `parse` assíncronos e objetos `Request` e `Response`.
- ⚡ **Rastreamento simultâneo**: Configure o número de solicitações simultâneas, os limites por domínio e o intervalo entre downloads.
- 🔄 **Várias sessões**: Use solicitações HTTP e navegadores furtivos sem interface gráfica no mesmo spider. Direcione as solicitações para sessões diferentes pelo ID.
- 💾 **Pausa e retomada**: Salve as solicitações pendentes e as URLs visitadas com `crawldir`. Pressione Ctrl+C para parar com segurança e reinicie com o mesmo diretório.
- 📡 **Resultados em streaming**: Receba os itens assim que forem extraídos com `async for item in spider.stream()`, junto com estatísticas em tempo real. É útil para interfaces, processos de dados e rastreamentos longos.
- 🛡️ **Detecção de solicitações bloqueadas**: Detecte e repita automaticamente as solicitações bloqueadas. Você pode personalizar esse comportamento.
- 🚦 **AutoThrottle**: O spider ajusta o intervalo de cada domínio conforme a velocidade de resposta do site. Se o site bloquear ou limitar as solicitações, ele dobra o intervalo ou respeita o tempo indicado por `Retry-After`. Quando a limitação termina, volta a acelerar.
- 🤖 **Respeito ao robots.txt**: Ative `robots_txt_obey` para respeitar as diretivas `Disallow`, `Crawl-delay` e `Request-rate`, com cache por domínio.
- 🧪 **Modo de desenvolvimento**: Salve as respostas em disco na primeira execução e reutilize-as nas próximas. Assim você pode ajustar `parse()` sem enviar novas solicitações aos servidores.
- 🧩 **Modelos de spider prontos**: Use `CrawlSpider` para seguir links por regras, `SitemapSpider` para rastrear a partir de sitemaps ou robots.txt, `XMLFeedSpider` e `CSVFeedSpider` para ler feeds XML, RSS e CSV, e `ShopifySpider` para coletar produtos de lojas públicas do Shopify, com um item por variante.
- 🔗 **Extração de links**: `LinkExtractor` permite aceitar ou recusar links por padrões, filtrar domínios e extensões, limitar a busca com CSS ou XPath e normalizar as URLs. Use com os modelos ou separadamente.
- 📦 **Exportação integrada**: Exporte os resultados com hooks e seu próprio processo de dados, ou use os formatos JSON, JSONL, CSV e XML integrados: `result.items.to_json()`, `to_jsonl()`, `to_csv()` e `to_xml()`.

### Obtenção de páginas com suporte a sessões

- **Solicitações HTTP**: Envie solicitações HTTP rápidas e furtivas com `Fetcher`. Você pode imitar a impressão digital TLS e os cabeçalhos de um navegador, além de usar HTTP/3.
- **Carregamento dinâmico**: Obtenha sites dinâmicos com automação completa do navegador por meio de `StealthyFetcher`, compatível com o Chromium do Playwright e o Google Chrome.
- **Evasão de sistemas antibot**: `StealthyFetcher` oculta a automação e imita impressões digitais do navegador. Pode superar automaticamente os diferentes tipos de Cloudflare Turnstile e Interstitial.
- **Gerenciamento de sessões**: `FetcherSession` e `StealthySession` mantêm os cookies e o estado entre solicitações.
- **Rotação de proxies**: `ProxyRotator` permite alternar os proxies de forma cíclica ou personalizada em todos os tipos de sessão. Você também pode escolher um proxy para uma solicitação específica.
- **Bloqueio de domínios e anúncios**: Bloqueie solicitações a domínios e subdomínios específicos ou ative o bloqueio de anúncios dos fetchers de navegador. Ele inclui cerca de 3.500 domínios conhecidos de anúncios e rastreamento.
- **Prevenção de vazamentos de DNS**: Ative DNS-over-HTTPS para enviar consultas DNS pelo serviço DoH da Cloudflare e evitar vazamentos ao usar proxies.
- **Navegadores remotos**: Conecte-se a um navegador em execução por CDP com `cdp_url`, seja no seu computador, em outro servidor ou em um serviço de navegadores. Você também pode usar sua própria versão do Chromium com qualquer fetcher de navegador por meio de `executable_path`.
- **Captura de APIs em segundo plano**: Ative `record_requests=True` em uma sessão de navegador e busque as respostas salvas com `session.network.search(limit=None)`. Leia dados de APIs e erros HTTP de diferentes carregamentos sem repetir as solicitações. O histórico tem tamanho limitado e salva o conteúdo das respostas de texto.
- **Suporte assíncrono**: Todos os fetchers permitem o uso assíncrono, com classes de sessão próprias para esse modo.

### Análise de páginas e extração de dados

- 🔄 **Localização de elementos**: Encontre os elementos após mudanças no site usando algoritmos de semelhança.
- 🎯 **Seleção flexível**: Use seletores CSS e XPath, filtros, texto, expressões regulares e mais.
- 🔍 **Elementos semelhantes**: Encontre automaticamente elementos parecidos com os que você já localizou.

### Recursos de IA

- 🤖 **Servidor MCP**: Permite que assistentes e agentes de IA, como Claude e Cursor, extraiam dados com Jigsaw por meio de solicitações HTTP, ações do navegador, capturas de tela, estado de login salvo e respostas de APIs em segundo plano. Usa nosso navegador furtivo e ferramentas que ajudam os modelos adequados a resolver CAPTCHA, além do solucionador de Cloudflare. Reduz o conteúdo enviado ao modelo, bloqueia anúncios e protege contra injeção de instruções (prompt injection). Também permite usar navegadores remotos por CDP e conexões HTTP com opções de autenticação. ([Vídeo de demonstração](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: Uma Agent Skill pronta para instalar que ensina a biblioteca aos agentes de programação, para que escrevam código compatível com a API atual.
- 📚 **Markdown pronto para RAG**: Converta uma página em Markdown limpo e preparado para modelos de linguagem com uma linha (`page.markdown()`), ou salve um site inteiro como arquivos Markdown com o modelo `ContentSpider`. O processo não precisa de um modelo de linguagem. (Documentação)

### Alto desempenho e uso comprovado

- 🚀 **Alta velocidade**: Desempenho otimizado que supera a maioria das bibliotecas de web scraping para Python.
- 🔋 **Baixo consumo de memória**: Estruturas de dados otimizadas e carregamento apenas quando necessário.
- ⚡ **Conversão rápida para JSON**: 10 vezes mais rápida que a biblioteca padrão.
- 🏗️ **Testado na prática**: Os testes cobrem 92% do Jigsaw e todo o código tem anotações de tipo. Centenas de pessoas o usaram diariamente para extrair dados durante o último ano.

### Ferramentas para desenvolver e extrair dados

- 🎯 **Shell interativo**: Shell IPython opcional integrado ao Jigsaw, com atalhos e ferramentas para criar scripts mais rápido. Converta solicitações curl em solicitações do Jigsaw e veja os resultados no navegador.
- 🚀 **Uso pelo terminal**: Extraia os dados de uma URL sem escrever código.
- 🛠️ **Navegação pelo DOM**: Acesse os elementos pai, irmãos e filhos.
- 🧬 **Processamento de texto**: Expressões regulares, limpeza de texto e operações de strings otimizadas.
- 📝 **Geração de seletores**: Gere seletores CSS e XPath confiáveis para qualquer elemento.
- 🔌 **API conhecida**: Parecida com Scrapy e BeautifulSoup, com os mesmos pseudoelementos do Scrapy e do Parsel.
- 🤝 **Integração direta com Scrapy**: Adicione o decorador `jigsaw_response` a um callback para analisar as respostas que você já obtém com o parser do Jigsaw, sem reescrever seu programa.
- 📘 **Anotações de tipo completas**: Ajudam o editor a verificar e completar o código. Todo o código é verificado automaticamente com **PyRight** e **MyPy** a cada alteração.
- 🔋 **Imagem Docker pronta**: Uma imagem Docker com todos os navegadores é criada e publicada automaticamente a cada versão.

## Primeiros passos

Veja alguns exemplos do que você pode fazer com o Jigsaw.

### Uso básico
Solicitações HTTP com suporte a sessões
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Use a versão mais recente da fingerprint TLS do Chrome
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# Ou use requisições avulsas
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
Navegação furtiva
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # Mantenha o navegador aberto até terminar
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# Ou use o estilo de requisição avulsa, ele abre o navegador para esta requisição e o fecha ao finalizar
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
Automação completa de navegador
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # Mantenha o navegador aberto até terminar
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # Se preferir, use seletor XPath

# Ou use o estilo de requisição avulsa, ele abre o navegador para esta requisição e o fecha ao finalizar
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spiders
Crie crawlers completos com solicitações simultâneas, vários tipos de sessão, pausa e retomada:
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
print(f"Extraídas {len(result.items)} citações")
result.items.to_json("quotes.json")
```
Use vários tipos de sessão no mesmo spider:
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
            # Direcione páginas protegidas através da sessão stealth
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # callback explícito
```
Salve o progresso para pausar e retomar rastreamentos longos. Execute o spider assim:
```python
QuotesSpider(crawldir="./crawl_data").start()
```
Com `crawldir` definido, pressione Ctrl+C para salvar as solicitações pendentes e as URLs visitadas. Reinicie com o mesmo `crawldir` para continuar. Salve os dados extraídos separadamente.

Você também pode usar um modelo pronto. Por exemplo, extraia o catálogo inteiro de uma loja Shopify:
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # Todos os produtos da loja, um item por variante
```
O modelo lê os produtos disponíveis nos endpoints públicos das coleções, com um item por variante.

### Análise avançada e navegação
```python
from jigsaw.fetchers import Fetcher

# Seleção rica de elementos e navegação
page = Fetcher.get('https://quotes.toscrape.com/')

# Obtenha citações com múltiplos métodos de seleção
quotes = page.css('.quote')  # Seletor CSS
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # Estilo BeautifulSoup
# O mesmo que
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # e assim por diante...
# Encontre elementos por conteúdo de texto
quotes = page.find_by_text('Albert Einstein', first_match=False)

# Navegação avançada
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # Seletores encadeados
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# Relações e similaridade entre elementos
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
Você pode usar o parser diretamente, sem obter uma página da web:
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
Ele funciona da mesma forma.

### Exemplos de sessões assíncronas
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession` se adapta ao contexto e funciona tanto com sync quanto com async
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI e shell interativo

Você também pode usar o Jigsaw pelo terminal:

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

Inicie o shell interativo de web scraping:
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
Extraia páginas diretamente para um arquivo sem programar. Use `--css-selector` para escolher o conteúdo ou `--ai-targeted` para selecionar e limpar o conteúdo de `body`. Use `.txt` para texto, `.md` para Markdown ou `.html` para HTML.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> Veja mais recursos, incluindo o servidor MCP e o shell interativo, na documentação completa.

## Testes de desempenho

Jigsaw também se destaca pela velocidade. Estes testes comparam seu parser com as versões mais recentes de outras bibliotecas conhecidas.

### Velocidade de extração de texto (5.000 elementos aninhados)

| # |    Biblioteca     | Tempo (ms) | Comparação com Jigsaw |
|---|:-----------------:|:----------:|:------------:|
| 1 |     Jigsaw     |    1,99    |     1,0x     |
| 2 |   Parsel/Scrapy   |    2,06    |     1,035    |
| 3 |     Lxml puro      |    2,56    |    1,286     |
| 4 |      PyQuery      |   23,98    |     ~12x     |
| 5 |    Selectolax     |   197,02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545,15   |   ~776,5x    |
| 7 |   BS4 com Lxml   |   1562,1   |   ~785,0x    |
| 8 | BS4 com html5lib |  3412,73   |   ~1714,9x   |


### Desempenho da busca de elementos semelhantes e de texto

A busca adaptativa de elementos do Jigsaw é mais rápida que as alternativas:

| Biblioteca  | Tempo (ms) | Comparação com Jigsaw |
|-------------|:----------:|:------------:|
| Jigsaw   |    2,3     |     1,0x     |
| AutoScraper |   12,58    |    5,47x     |


> Cada resultado é a média de pelo menos 100 execuções. Veja o método em [benchmarks.py](benchmarks.py).

## Instalação

Jigsaw requer Python 3.10 ou mais recente:

```bash
pip install jigsaw
```

> [!IMPORTANT]
> Este comando instala apenas o parser e suas dependências, sem fetchers ou ferramentas de linha de comando. Se você instalar apenas isso, importar de `jigsaw.fetchers` ou `jigsaw.spiders`, como nos exemplos anteriores, gera `ModuleNotFoundError`. Para usar fetchers ou spiders, instale primeiro as dependências dos fetchers, como mostrado a seguir.

### Dependências opcionais

1. Para usar os fetchers, suas classes ou os recursos adicionais a seguir, instale as dependências dos fetchers e dos navegadores:
    ```bash
    pip install "jigsaw[fetchers]"
    
    jigsaw install           # instalação normal
    jigsaw install  --force  # forçar reinstalação
    ```

    Isso baixa todos os navegadores, as dependências do sistema e as ferramentas para alterar as impressões digitais do navegador.

    Você também pode instalar pelo Python, em vez de executar um comando:
    ```python
    from jigsaw.cli import install
    
    install([], standalone_mode=False)          # instalação normal
    install(["--force"], standalone_mode=False) # forçar reinstalação
    ```

2. Recursos adicionais:
   - Instalar o servidor MCP:
       ```bash
       pip install "jigsaw[ai]"
       ```
   - Instalar as dependências para criar sistemas RAG:
       ```bash
       pip install "jigsaw[rag]"
       ```
   - Instalar o shell interativo e o comando `extract`:
       ```bash
       pip install "jigsaw[shell]"
       ```
   - Instalar tudo:
       ```bash
       pip install "jigsaw[all]"
       ```
   Execute `jigsaw install` para usar fetchers de navegador. Solicitações HTTP não precisam de um navegador.

## Como contribuir

Contribuições são bem-vindas! Leia nossas [diretrizes de contribuição](CONTRIBUTING.md) antes de começar.

## Aviso legal

> [!CAUTION]
> Esta biblioteca é apenas para ensino e pesquisa. Ao usá-la, você concorda em cumprir as leis locais e internacionais de extração de dados e privacidade. Os autores e colaboradores não se responsabilizam pelo uso indevido deste software. Respeite os termos de serviço dos sites e os arquivos robots.txt.

