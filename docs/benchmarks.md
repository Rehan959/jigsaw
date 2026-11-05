---
title: "Python HTML Parser Benchmarks: Jigsaw and Other Libraries"
description: "See how Jigsaw performs in HTML parsing, text extraction and element similarity tests against other popular Python libraries."
---

# Performance Benchmarks

Jigsaw isn't just powerful - it's also blazing fast. The following benchmarks compare Jigsaw's parser with other popular libraries.

### Text Extraction Speed Test (5000 nested elements)

| # |      Library      | Time (ms) | vs Jigsaw | 
|---|:-----------------:|:---------:|:------------:|
| 1 |     Jigsaw     |   1.99    |     1.0x     |
| 2 |   Parsel/Scrapy   |   2.06    |    1.035     |
| 3 |     Raw Lxml      |   2.56    |    1.286     |
| 4 |      PyQuery      |   23.98   |     ~12x     |
| 5 |    Selectolax     |  197.02   |     ~99x     |
| 6 |  MechanicalSoup   |  1545.15  |   ~776.5x    |
| 7 |   BS4 with Lxml   |  1562.1  |   ~785.0x    |
| 8 | BS4 with html5lib |  3412.73  |   ~1714.9x   |


### Element Similarity & Text Search Performance

Jigsaw's adaptive element finding capabilities significantly outperform alternatives:

| Library     | Time (ms) | vs Jigsaw |
|-------------|:---------:|:------------:|
| Jigsaw   |   2.3    |     1.0x     |
| AutoScraper |   12.58   |    5.47x    |

> All benchmarks represent averages of 100 timed runs. See [benchmarks.py](benchmarks.py) for methodology.
