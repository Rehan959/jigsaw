---
title: "Jigsaw: framework de web scraping para Python"
description: "Jigsaw: extraia dados da web moderna de forma simples."
---

<style>
.md-typeset h1 {
  display: none;
}
[data-md-color-scheme="default"] .only-dark { display: none; }
[data-md-color-scheme="slate"] .only-light { display: none; }
</style>

<br/>
<div align="center">
    <a href="index.html" alt="Capa">
        <img alt="Jigsaw" src="assets/cover_light.svg" class="only-light">
        <img alt="Jigsaw" src="assets/cover_dark.svg" class="only-dark">
    </a>
</div>

<h2 align="center"><i>Extraia dados da web moderna de forma simples</i></h2><br>

Jigsaw é um framework de web scraping para Python. Ele reúne solicitações HTTP rápidas, navegadores furtivos, análise de páginas e rastreamento simultâneo em uma só biblioteca.

Extraia dados de páginas estáticas, execute JavaScript, interaja com sites e acesse as APIs que eles usam. Crie crawlers com sessões reutilizáveis, rotação de proxies, novas tentativas automáticas, pausa e retomada, e exportação de dados integrada.

Use o Jigsaw pelo Python, pelo terminal ou com seu agente de IA por meio do servidor MCP e da Agent Skill. Ele cobre todo o processo, desde extrair alguns campos até salvar um site inteiro como arquivos Markdown limpos.

## O que você pode fazer com o Jigsaw {#what-you-can-do-with-jigsaw}

- **[Obter páginas e interagir](fetching/choosing.md)**: Solicitações HTTP rápidas, navegadores furtivos, execução de JavaScript, tratamento de Cloudflare Turnstile e Interstitial, sessões persistentes e captura de respostas de APIs em segundo plano.
- **[Analisar e extrair](parsing/selection.md)**: Busca com CSS, XPath, texto e expressões regulares, localização de elementos após mudanças na página, busca de elementos semelhantes e saída em Markdown limpo.
- **[Rastrear e exportar](spiders/getting-started.md)**: Spiders simultâneos, rotação de proxies, novas tentativas, AutoThrottle, pausa e retomada, resultados em streaming, modelos prontos e exportação em JSON, JSONL, CSV e XML.
- **[Extrair dados com IA ou pelo terminal](ai/mcp-server.md)**: Um servidor MCP para agentes de IA navegarem e extraírem dados, uma Agent Skill, comandos CLI e um shell interativo.

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

## Principais recursos {#key-features}

### Spiders: um framework completo de rastreamento {#spiders-a-full-crawling-framework}
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

### Obtenção de páginas com suporte a sessões {#advanced-websites-fetching-with-session-support}
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

### Análise de páginas e extração de dados {#parsing-and-data-extraction}
- 🔄 **Localização de elementos**: Encontre os elementos após mudanças no site usando algoritmos de semelhança.
- 🎯 **Seleção flexível**: Use seletores CSS e XPath, filtros, texto, expressões regulares e mais.
- 🔍 **Elementos semelhantes**: Encontre automaticamente elementos parecidos com os que você já localizou.

### Recursos de IA {#ai-features}
- 🤖 **Servidor MCP**: Permite que assistentes e agentes de IA, como Claude e Cursor, extraiam dados com Jigsaw por meio de solicitações HTTP, ações do navegador, capturas de tela, estado de login salvo e respostas de APIs em segundo plano. Usa nosso navegador furtivo e ferramentas que ajudam os modelos adequados a resolver CAPTCHA, além do solucionador de Cloudflare. Reduz o conteúdo enviado ao modelo, bloqueia anúncios e protege contra injeção de instruções (prompt injection). Também permite usar navegadores remotos por CDP e conexões HTTP com opções de autenticação. ([Vídeo de demonstração](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill**: Uma [Agent Skill](ai/agent-skill.md) pronta para instalar que ensina a biblioteca aos agentes de programação, para que escrevam código compatível com a API atual.
- 📚 **Markdown pronto para RAG**: Converta uma página em Markdown limpo e preparado para modelos de linguagem com uma linha (`page.markdown()`), ou salve um site inteiro como arquivos Markdown com o modelo `ContentSpider`. O processo não precisa de um modelo de linguagem. ([Documentação](ai/building-rag-systems.md))

### Alto desempenho e uso comprovado {#high-performance-battle-tested-architecture}
- 🚀 **Alta velocidade**: Desempenho otimizado que supera a maioria das bibliotecas de web scraping para Python.
- 🔋 **Baixo consumo de memória**: Estruturas de dados otimizadas e carregamento apenas quando necessário.
- ⚡ **Conversão rápida para JSON**: 10 vezes mais rápida que a biblioteca padrão.
- 🏗️ **Testado na prática**: Os testes cobrem 92% do Jigsaw e todo o código tem anotações de tipo. Centenas de pessoas o usaram diariamente para extrair dados durante o último ano.

### Ferramentas para desenvolver e extrair dados {#developerweb-scraper-friendly-experience}
- 🎯 **Shell interativo**: Shell IPython opcional integrado ao Jigsaw, com atalhos e ferramentas para criar scripts mais rápido. Converta solicitações curl em solicitações do Jigsaw e veja os resultados no navegador.
- 🚀 **Uso pelo terminal**: Extraia os dados de uma URL sem escrever código.
- 🛠️ **Navegação pelo DOM**: Acesse os elementos pai, irmãos e filhos.
- 🧬 **Processamento de texto**: Expressões regulares, limpeza de texto e operações de strings otimizadas.
- 📝 **Geração de seletores**: Gere seletores CSS e XPath confiáveis para qualquer elemento.
- 🔌 **API conhecida**: Parecida com Scrapy e BeautifulSoup, com os mesmos pseudoelementos do Scrapy e do Parsel.
- 🤝 **Integração direta com Scrapy**: Adicione o decorador `jigsaw_response` a um callback para analisar as respostas que você já obtém com o parser do Jigsaw, sem reescrever seu programa.
- 📘 **Anotações de tipo completas**: Ajudam o editor a verificar e completar o código. Todo o código é verificado automaticamente com **PyRight** e **MyPy** a cada alteração.
- 🔋 **Imagem Docker pronta**: Uma imagem Docker com todos os navegadores é criada e publicada automaticamente a cada versão.




## Instalação {#installation}
Jigsaw requer Python 3.10 ou mais recente:

```bash
pip install jigsaw
```

!!! warning "Atenção"

    Este comando instala apenas o parser e suas dependências, sem fetchers ou ferramentas de linha de comando. Se você instalar apenas isso, importar de `jigsaw.fetchers` ou `jigsaw.spiders`, como nos exemplos anteriores, gera `ModuleNotFoundError`. Para usar fetchers ou spiders, instale primeiro as dependências dos fetchers, como mostrado a seguir.

### Dependências opcionais {#optional-dependencies}

1. Para usar os fetchers, suas classes ou os recursos adicionais a seguir, instale as dependências dos fetchers e dos navegadores:
    ```bash
    pip install "jigsaw[fetchers]"
    
    jigsaw install           # normal install
    jigsaw install  --force  # force reinstall
    ```

    Isso baixa todos os navegadores, as dependências do sistema e as ferramentas para alterar as impressões digitais do navegador.

    Você também pode instalar pelo Python, em vez de executar um comando:
    ```python
    from jigsaw.cli import install
    
    install([], standalone_mode=False)          # normal install
    install(["--force"], standalone_mode=False) # force reinstall
    ```

2. Recursos adicionais:


     - Instalar o servidor MCP:
       ```bash
       pip install "jigsaw[ai]"
       ```
     - Instalar as dependências para [criar sistemas RAG](ai/building-rag-systems.md):
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

### Docker {#docker}
Você também pode baixar do DockerHub uma imagem Docker com todos os extras e navegadores:
Ou baixar pelo registro do GitHub:
A imagem é criada a partir da branch principal do repositório e publicada automaticamente pelo GitHub Actions.

## Organização da documentação {#how-the-documentation-is-organized}
A documentação do Jigsaw é ampla, por isso seguimos o [modelo de documentação Diátaxis](https://diataxis.fr/).

## Apoio {#support}

Se você gosta do Jigsaw e quer apoiar seu desenvolvimento:

- ⭐ Dê uma estrela ao repositório no GitHub.
- 🐛 Relate erros e sugira recursos pelo GitHub Issues.

