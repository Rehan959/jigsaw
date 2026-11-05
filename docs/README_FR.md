
<h1 align="center">Jigsaw</h1>
<p align="center"><small>Extrayez simplement les données du web moderne</small></p>


Jigsaw est un framework de web scraping pour Python. Il réunit des requêtes HTTP rapides, des navigateurs furtifs, l’analyse de pages et l’exploration simultanée de sites dans une seule bibliothèque.

Extrayez les données de pages statiques, exécutez JavaScript, interagissez avec les sites et accédez aux API qu’ils utilisent. Créez des crawlers avec des sessions réutilisables, la rotation des proxies, de nouvelles tentatives automatiques, la pause et la reprise, et des exports intégrés.

Utilisez Jigsaw depuis Python, le terminal ou votre agent IA grâce au serveur MCP et à l’Agent Skill. Il couvre tout le processus, de l’extraction de quelques champs à l’enregistrement d’un site entier en fichiers Markdown propres.

## Ce que vous pouvez faire avec Jigsaw

- **Récupérer des pages et interagir** : Requêtes HTTP rapides, navigateurs furtifs, exécution de JavaScript, gestion de Cloudflare Turnstile et Interstitial, sessions persistantes et capture des réponses des API en arrière-plan.
- **Analyser et extraire** : Recherche par CSS, XPath, texte et expressions régulières, suivi des éléments après un changement de page, recherche d’éléments similaires et sortie en Markdown propre.
- **Explorer et exporter** : Spiders simultanés, rotation des proxies, nouvelles tentatives, AutoThrottle, pause et reprise, résultats en streaming, modèles prêts à l’emploi et exports en JSON, JSONL, CSV et XML.
- **Extraire avec l’IA ou depuis le terminal** : Un serveur MCP pour que les agents IA naviguent et extraient des données, une Agent Skill, des commandes CLI et un shell interactif.

Commencez par une seule page :

```python
from jigsaw.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
print(quotes)
```

Ou extrayez plus de données avec un spider :

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

Cet exemple affiche `10` et enregistre les citations et leurs auteurs dans `quotes.json`.


---

## Fonctions principales

### Spiders : un framework complet d’exploration de sites

- 🕷️ **API de Spider proche de Scrapy** : Définissez des spiders avec `start_urls`, des callbacks `parse` asynchrones et des objets `Request` et `Response`.
- ⚡ **Exploration simultanée** : Réglez le nombre de requêtes simultanées, les limites par domaine et le délai entre les téléchargements.
- 🔄 **Plusieurs sessions** : Utilisez des requêtes HTTP et des navigateurs furtifs sans interface graphique dans le même spider. Dirigez les requêtes vers différentes sessions grâce à leur ID.
- 💾 **Pause et reprise** : Enregistrez les requêtes en attente et les URL visitées avec `crawldir`. Appuyez sur Ctrl+C pour arrêter proprement, puis relancez avec le même dossier.
- 📡 **Résultats en streaming** : Recevez les éléments dès leur extraction avec `async for item in spider.stream()`, avec des statistiques en temps réel. Utile pour les interfaces, les traitements de données et les explorations longues.
- 🛡️ **Détection des requêtes bloquées** : Détectez et relancez les requêtes bloquées automatiquement. Vous pouvez adapter ce comportement.
- 🚦 **AutoThrottle** : Le spider ajuste le délai de chaque domaine selon la vitesse de réponse du site. Si le site bloque ou limite les requêtes, il double le délai ou respecte la durée indiquée par `Retry-After`. Il accélère à nouveau quand la limitation prend fin.
- 🤖 **Respect de robots.txt** : Activez `robots_txt_obey` pour respecter les directives `Disallow`, `Crawl-delay` et `Request-rate`, avec un cache par domaine.
- 🧪 **Mode développement** : Enregistrez les réponses sur disque lors de la première exécution et réutilisez-les ensuite. Vous pouvez ainsi ajuster `parse()` sans envoyer de nouvelles requêtes aux serveurs.
- 🧩 **Modèles de spider prêts à l’emploi** : Utilisez `CrawlSpider` pour suivre les liens selon des règles, `SitemapSpider` pour explorer à partir de sitemaps ou de robots.txt, `XMLFeedSpider` et `CSVFeedSpider` pour lire des flux XML, RSS et CSV, et `ShopifySpider` pour collecter les produits des boutiques Shopify publiques, avec un élément par variante.
- 🔗 **Extraction de liens** : `LinkExtractor` permet d’accepter ou de refuser des liens selon des motifs, de filtrer les domaines et les extensions, de limiter la recherche avec CSS ou XPath et de normaliser les URL. Utilisez-le avec les modèles ou seul.
- 📦 **Export intégré** : Exportez les résultats avec des hooks et votre propre traitement de données, ou utilisez les formats JSON, JSONL, CSV et XML intégrés : `result.items.to_json()`, `to_jsonl()`, `to_csv()` et `to_xml()`.

### Récupération de pages avec des sessions

- **Requêtes HTTP** : Envoyez des requêtes HTTP rapides et furtives avec `Fetcher`. Vous pouvez imiter l’empreinte TLS et les en-têtes d’un navigateur, et utiliser HTTP/3.
- **Chargement dynamique** : Récupérez les sites dynamiques avec une automatisation complète du navigateur grâce à `StealthyFetcher`, compatible avec le Chromium de Playwright et Google Chrome.
- **Contournement des systèmes antibot** : `StealthyFetcher` masque l’automatisation et imite les empreintes du navigateur. Il peut franchir automatiquement les différents types de Cloudflare Turnstile et Interstitial.
- **Gestion des sessions** : `FetcherSession` et `StealthySession` conservent les cookies et l’état entre les requêtes.
- **Rotation des proxies** : `ProxyRotator` permet une rotation cyclique ou personnalisée dans tous les types de sessions. Vous pouvez aussi choisir un proxy pour une requête précise.
- **Blocage des domaines et des publicités** : Bloquez les requêtes vers certains domaines et leurs sous-domaines, ou activez le blocage des publicités des fetchers de navigateur. Il couvre environ 3 500 domaines connus de publicité et de suivi.
- **Prévention des fuites DNS** : Activez DNS-over-HTTPS pour envoyer les requêtes DNS par le service DoH de Cloudflare et éviter les fuites lorsque vous utilisez des proxies.
- **Navigateurs distants** : Connectez-vous par CDP à un navigateur déjà ouvert avec `cdp_url`, sur votre ordinateur, un autre serveur ou un service de navigateurs. Vous pouvez aussi utiliser votre propre version de Chromium avec tout fetcher de navigateur grâce à `executable_path`.
- **Capture des API en arrière-plan** : Activez `record_requests=True` dans une session de navigateur et cherchez les réponses enregistrées avec `session.network.search(limit=None)`. Lisez les données des API et les erreurs HTTP de plusieurs chargements sans répéter les requêtes. L’historique a une taille limitée et conserve le contenu des réponses textuelles.
- **Mode asynchrone** : Tous les fetchers peuvent fonctionner en mode asynchrone, avec des classes de session propres à ce mode.

### Analyse de pages et extraction de données

- 🔄 **Suivi des éléments** : Retrouvez les éléments après un changement du site grâce à des algorithmes de similarité.
- 🎯 **Sélection souple** : Utilisez CSS, XPath, les filtres, le texte, les expressions régulières et plus encore.
- 🔍 **Éléments similaires** : Trouvez automatiquement des éléments proches de ceux que vous avez déjà trouvés.

### Fonctions pour l’IA

- 🤖 **Serveur MCP** : Permet aux assistants et agents IA, comme Claude et Cursor, d’extraire des données avec Jigsaw par des requêtes HTTP, des actions du navigateur, des captures d’écran, un état de connexion enregistré et des réponses d’API en arrière-plan. Il utilise notre navigateur furtif et des outils qui aident les modèles adaptés à résoudre les CAPTCHA, en plus du solveur Cloudflare. Il réduit le contenu envoyé au modèle, bloque les publicités et protège contre les injections de prompts. Il permet aussi d’utiliser des navigateurs distants par CDP et des connexions HTTP avec des options d’authentification. ([Vidéo de démonstration](https://www.youtube.com/watch?v=qyFk3ZNwOxE))
- 🧠 **Agent Skill** : Une Agent Skill prête à installer qui enseigne la bibliothèque aux agents de programmation pour qu’ils écrivent du code conforme à l’API actuelle.
- 📚 **Markdown prêt pour le RAG** : Convertissez une page en Markdown propre et adapté aux modèles de langage avec une ligne (`page.markdown()`), ou enregistrez un site entier en fichiers Markdown avec le modèle `ContentSpider`. Le processus ne demande aucun modèle de langage. (Documentation)

### Performances et usage réel

- 🚀 **Grande vitesse** : Des performances optimisées qui dépassent la plupart des bibliothèques de web scraping pour Python.
- 🔋 **Faible usage de la mémoire** : Des structures de données optimisées et un chargement à la demande.
- ⚡ **Conversion rapide en JSON** : 10 fois plus rapide que la bibliothèque standard.
- 🏗️ **Testé en pratique** : Les tests couvrent 92 % de Jigsaw et tout le code a des annotations de type. Des centaines de personnes l’ont utilisé chaque jour pour extraire des données pendant l’année passée.

### Outils pour développer et extraire des données

- 🎯 **Shell interactif** : Un shell IPython en option, intégré à Jigsaw, avec des raccourcis et des outils pour créer des scripts plus vite. Convertissez les requêtes curl en requêtes Jigsaw et consultez les résultats dans votre navigateur.
- 🚀 **Usage depuis le terminal** : Extrayez les données d’une URL sans écrire de code.
- 🛠️ **Navigation dans le DOM** : Accédez aux éléments parents, frères et enfants.
- 🧬 **Traitement du texte** : Expressions régulières, nettoyage du texte et opérations optimisées sur les chaînes.
- 📝 **Création de sélecteurs** : Générez des sélecteurs CSS et XPath fiables pour tout élément.
- 🔌 **API familière** : Proche de Scrapy et BeautifulSoup, avec les mêmes pseudo-éléments que Scrapy et Parsel.
- 🤝 **Intégration directe avec Scrapy** : Ajoutez le décorateur `jigsaw_response` à un callback pour analyser les réponses que vous récupérez déjà avec le parser de Jigsaw, sans réécrire votre programme.
- 📘 **Annotations de type complètes** : Elles aident l’éditeur à vérifier et à compléter le code. Tout le code est vérifié automatiquement par **PyRight** et **MyPy** à chaque changement.
- 🔋 **Image Docker prête à l’emploi** : Une image Docker avec tous les navigateurs est créée et publiée automatiquement à chaque version.

## Pour commencer

Voici quelques exemples de ce que vous pouvez faire avec Jigsaw.

### Utilisation de base
Requêtes HTTP avec des sessions
```python
from jigsaw.fetchers import Fetcher, FetcherSession

with FetcherSession(impersonate='chrome') as session:  # Utiliser la dernière version de l'empreinte TLS de Chrome
    page = session.get('https://quotes.toscrape.com/', stealthy_headers=True)
    quotes = page.css('.quote .text::text').getall()

# Ou utiliser des requêtes ponctuelles
page = Fetcher.get('https://quotes.toscrape.com/')
quotes = page.css('.quote .text::text').getall()
```
Mode furtif avancé
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, solve_cloudflare=True) as session:  # Garder le navigateur ouvert jusqu'à ce que vous ayez terminé
    page = session.fetch('https://nopecha.com/demo/cloudflare', google_search=False)
    data = page.css('#padded_content a').getall()

# Ou utiliser le style requête ponctuelle : ouvre le navigateur pour cette requête, puis le ferme après
page = StealthyFetcher.fetch('https://nopecha.com/demo/cloudflare', solve_cloudflare=True)
data = page.css('#padded_content a').getall()
```
Automatisation complète du navigateur
```python
from jigsaw.fetchers import StealthyFetcher, StealthySession

with StealthySession(headless=True, disable_resources=False, network_idle=True) as session:  # Garder le navigateur ouvert jusqu'à ce que vous ayez terminé
    page = session.fetch('https://quotes.toscrape.com/', load_dom=False)
    data = page.xpath('//span[@class="text"]/text()').getall()  # Sélecteur XPath si vous le préférez

# Ou utiliser le style requête ponctuelle : ouvre le navigateur pour cette requête, puis le ferme après
page = StealthyFetcher.fetch('https://quotes.toscrape.com/')
data = page.css('.quote .text::text').getall()
```

### Spiders
Créez des crawlers complets avec des requêtes simultanées, plusieurs types de sessions, la pause et la reprise :
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
print(f"{len(result.items)} citations scrapées")
result.items.to_json("quotes.json")
```
Utilisez plusieurs types de sessions dans un seul spider :
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
            # Router les pages protégées via la session furtive
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast", callback=self.parse)  # Callback explicite
```
Enregistrez la progression pour mettre en pause et reprendre les explorations longues. Lancez le spider ainsi :
```python
QuotesSpider(crawldir="./crawl_data").start()
```
Avec `crawldir`, Ctrl+C enregistre les requêtes en attente et les URL visitées. Relancez avec le même `crawldir` pour reprendre. Enregistrez les données extraites séparément.

Vous pouvez aussi utiliser un modèle prêt à l’emploi. Par exemple, récupérez tout le catalogue d’une boutique Shopify :
```python
from jigsaw.spiders import ShopifySpider

class MyStore(ShopifySpider):
    target_website = "example.com"

result = MyStore().start()  # Tous les produits de la boutique, un élément par variante
```
Le modèle lit les produits disponibles sur les endpoints publics des collections, avec un élément par variante.

### Analyse avancée et navigation
```python
from jigsaw.fetchers import Fetcher

# Sélection riche d'éléments et navigation
page = Fetcher.get('https://quotes.toscrape.com/')

# Obtenir des citations avec plusieurs méthodes de sélection
quotes = page.css('.quote')  # Sélecteur CSS
quotes = page.xpath('//div[@class="quote"]')  # XPath
quotes = page.find_all('div', {'class': 'quote'})  # Style BeautifulSoup
# Identique à
quotes = page.find_all('div', class_='quote')
quotes = page.find_all(['div'], class_='quote')
quotes = page.find_all(class_='quote')  # et ainsi de suite...
# Trouver un élément par contenu textuel
quotes = page.find_by_text('Albert Einstein', first_match=False)

# Navigation avancée
quote_text = page.css('.quote')[0].css('.text::text').get()
quote_texts = page.css('.quote').css('.text::text').getall()  # Sélecteurs chaînés
first_quote = page.css('.quote')[0]
author = first_quote.css('.author::text').get()
next_quote = first_quote.next
parent_container = first_quote.parent

# Relations et similarité entre éléments
similar_elements = first_quote.find_similar()
below_elements = first_quote.below_elements
```
Vous pouvez utiliser le parser directement, sans récupérer de page web :
```python
from jigsaw.parser import Selector

page = Selector("<html>...</html>")
```
Il fonctionne de la même façon.

### Exemples de sessions asynchrones
```python
import asyncio
from jigsaw.fetchers import FetcherSession, AsyncStealthySession

async def main():
    async with FetcherSession(http3=True) as http_session:  # `FetcherSession` s'adapte au contexte et fonctionne en mode sync comme async
        page1 = await http_session.get('https://quotes.toscrape.com/')
        page2 = await http_session.get('https://quotes.toscrape.com/page/2/', impersonate='chrome')
        print(len(page1.css('.quote')), len(page2.css('.quote')))

    async with AsyncStealthySession(max_pages=2) as browser_session:
        urls = ['https://quotes.toscrape.com/js/', 'https://quotes.toscrape.com/js/page/2/']
        pages = await asyncio.gather(*(browser_session.fetch(url, wait_selector='.quote') for url in urls))
        print([len(page.css('.quote')) for page in pages])

asyncio.run(main())
```

## CLI et shell interactif

Vous pouvez aussi utiliser Jigsaw depuis le terminal :

[![asciicast](https://asciinema.org/a/736339.svg)](https://asciinema.org/a/736339)

Lancez le shell interactif de web scraping :
```bash
pip install "jigsaw[shell]"
jigsaw shell
```
Extrayez des pages directement dans un fichier sans programmation. Utilisez `--css-selector` pour choisir le contenu ou `--ai-targeted` pour sélectionner et nettoyer le contenu de `body`. Utilisez `.txt` pour du texte, `.md` pour du Markdown ou `.html` pour du HTML.
```bash
jigsaw extract get 'https://quotes.toscrape.com/' quotes.md
jigsaw extract get 'https://quotes.toscrape.com/' quotes.txt --css-selector '.quote' --impersonate 'chrome'
jigsaw extract fetch 'https://quotes.toscrape.com/js/' quotes.md --css-selector '.quote' --wait-selector '.quote' --no-headless
jigsaw extract fetch 'https://nopecha.com/demo/cloudflare' captchas.html --css-selector '#padded_content a' --solve-cloudflare
```

> [!NOTE]
> Consultez les autres fonctions, dont le serveur MCP et le shell interactif, dans la documentation complète.

## Tests de performance

Jigsaw se distingue aussi par sa vitesse. Ces tests comparent son parser aux dernières versions d’autres bibliothèques connues.

### Vitesse d’extraction du texte (5 000 éléments imbriqués)

| # |   Bibliothèque    | Temps (ms) | Par rapport à Jigsaw |
|---|:-----------------:|:----------:|:------------:|
| 1 |     Jigsaw     |    1,99    |     1,0x     |
| 2 |   Parsel/Scrapy   |    2,06    |     1,035    |
| 3 |     Lxml seul      |    2,56    |    1,286     |
| 4 |      PyQuery      |   23,98    |     ~12x     |
| 5 |    Selectolax     |   197,02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545,15   |   ~776,5x    |
| 7 |   BS4 avec Lxml   |  1562,1   |   ~785,0x    |
| 8 | BS4 avec html5lib |  3412,73   |   ~1714,9x   |


### Recherche d’éléments similaires et de texte

La recherche adaptative d’éléments de Jigsaw est plus rapide que les autres solutions :

| Bibliothèque | Temps (ms) | Par rapport à Jigsaw |
|--------------|:----------:|:------------:|
| Jigsaw    |    2,3    |     1,0x     |
| AutoScraper  |   12,58    |    5,47x    |


> Chaque résultat est la moyenne d’au moins 100 exécutions. Consultez [benchmarks.py](benchmarks.py) pour connaître la méthode.

## Installation

Jigsaw demande Python 3.10 ou une version plus récente :

```bash
pip install jigsaw
```

> [!IMPORTANT]
> Cette commande installe seulement le parser et ses dépendances, sans fetchers ni outils en ligne de commande. Avec cette seule installation, importer depuis `jigsaw.fetchers` ou `jigsaw.spiders`, comme dans les exemples précédents, provoque `ModuleNotFoundError`. Pour utiliser les fetchers ou les spiders, installez d’abord les dépendances des fetchers comme indiqué ci-dessous.

### Dépendances facultatives

1. Pour utiliser les fetchers, leurs classes ou les fonctions supplémentaires suivantes, installez les dépendances des fetchers et des navigateurs :
    ```bash
    pip install "jigsaw[fetchers]"

    jigsaw install           # installation normale
    jigsaw install  --force  # réinstallation forcée
    ```

    Cette commande télécharge tous les navigateurs, leurs dépendances système et les outils de modification des empreintes du navigateur.

    Vous pouvez aussi les installer depuis Python, au lieu de lancer une commande :
    ```python
    from jigsaw.cli import install

    install([], standalone_mode=False)          # installation normale
    install(["--force"], standalone_mode=False) # réinstallation forcée
    ```

2. Fonctions supplémentaires :
   - Installer le serveur MCP :
       ```bash
       pip install "jigsaw[ai]"
       ```
   - Installer les dépendances pour créer des systèmes RAG :
       ```bash
       pip install "jigsaw[rag]"
       ```
   - Installer le shell interactif et la commande `extract` :
       ```bash
       pip install "jigsaw[shell]"
       ```
   - Tout installer :
       ```bash
       pip install "jigsaw[all]"
       ```
   Lancez `jigsaw install` pour utiliser les fetchers de navigateur. Les requêtes HTTP ne demandent pas de navigateur.

## Contribuer

Les contributions sont les bienvenues ! Lisez nos [consignes de contribution](CONTRIBUTING.md) avant de commencer.

## Avertissement

> [!CAUTION]
> Cette bibliothèque est destinée à l’enseignement et à la recherche. En l’utilisant, vous acceptez de respecter les lois locales et internationales sur l’extraction de données et la vie privée. Les auteurs et contributeurs ne sont pas responsables d’un usage abusif de ce logiciel. Respectez les conditions d’utilisation des sites et les fichiers robots.txt.

