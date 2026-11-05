---
title: "مرجع API لفئات Spiders والطلبات ونتائج الجمع"
description: "تعرّف على hooks لمراحل عمل Spider وخيارات الطلبات وإدارة الجلسات وإحصاءات الجمع وطرق تصدير العناصر."
---

# فئات Spider {#spider-classes}

هذا مرجع لكل معاملات فئات إطار Spiders وخصائصها وطرقها.

يمكنك استيرادها كما يلي:

```python
from jigsaw.spiders import Spider, Request, CrawlResult, SessionManager, Response
```

## ::: jigsaw.spiders.Spider
    handler: python
    :docstring:

## ::: jigsaw.spiders.Request
    handler: python
    :docstring:

## فئات النتائج {#result-classes}

## ::: jigsaw.spiders.result.CrawlResult
    handler: python
    :docstring:

## ::: jigsaw.spiders.result.CrawlStats
    handler: python
    :docstring:

## ::: jigsaw.spiders.result.ItemList
    handler: python
    :docstring:

## إدارة الجلسات {#session-management}

## ::: jigsaw.spiders.session.SessionManager
    handler: python
    :docstring:
