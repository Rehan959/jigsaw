---
title: "HTTP・ブラウザ Fetcher の API リファレンス"
description: "Fetcher、AsyncFetcher、StealthyFetcher、セッションの API を確認します。リクエストのオプション、ブラウザ設定、戻り値の型を紹介します。"
---

# Fetcher クラス {#fetchers-classes}

すべての Fetcher クラスの引数、属性、メソッドを紹介します。

次のように直接インポートできます。

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


## セッションクラス {#session-classes}

### HTTP セッション {#http-sessions}

## ::: jigsaw.fetchers.FetcherSession
    handler: python
    :docstring:

### ステルスセッション {#stealth-sessions}

## ::: jigsaw.fetchers.StealthySession
    handler: python
    :docstring:

## ::: jigsaw.fetchers.AsyncStealthySession
    handler: python
    :docstring:
