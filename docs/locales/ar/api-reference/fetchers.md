---
title: "مرجع API لجلب الصفحات عبر HTTP والمتصفح"
description: "تعرّف على API للفئات Fetcher وAsyncFetcher وStealthyFetcher والجلسات، مع خيارات الطلبات وإعدادات المتصفح وأنواع القيم المعادة."
---

# فئات Fetchers {#fetchers-classes}

هذا مرجع لكل معاملات فئات Fetchers وخصائصها وطرقها.

يمكنك استيرادها كلها كما يلي:

```python
from jigsaw.fetchers import (
    Fetcher, AsyncFetcher, StealthyFetcher,
    FetcherSession, AsyncStealthySession, StealthySession
)
```

## ::: jigsaw.fetchers.Fetcher
    handler: python
    :docstring:

## ::: jigsaw.fetchers.AsyncFetcher
    handler: python
    :docstring:

## ::: jigsaw.fetchers.StealthyFetcher
    handler: python
    :docstring:


## فئات الجلسات {#session-classes}

### جلسات HTTP {#http-sessions}

## ::: jigsaw.fetchers.FetcherSession
    handler: python
    :docstring:

### جلسات التخفي {#stealth-sessions}

## ::: jigsaw.fetchers.StealthySession
    handler: python
    :docstring:

## ::: jigsaw.fetchers.AsyncStealthySession
    handler: python
    :docstring:
