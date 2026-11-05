---
title: "Справочник API ProxyRotator"
description: "ProxyRotator, выбор прокси и правила их смены для HTTP- и браузерных сессий."
---

# Смена прокси {#proxy-rotation}

`ProxyRotator` переключает прокси во всех Fetcher и сессиях. Он безопасен для работы из нескольких потоков.

Его можно импортировать напрямую:

```python
from jigsaw.fetchers import ProxyRotator
```

## ::: jigsaw.engines.toolbelt.proxy_rotation.ProxyRotator
    handler: python
    :docstring:
