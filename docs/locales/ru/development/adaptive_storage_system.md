---
title: "Своё хранилище для адаптивного парсинга"
description: "Реализуйте save и retrieve для адаптивного парсинга Jigsaw. Создайте хранилище Redis для сохранения и получения свойств элементов."
---

# Своя система хранения и поиска {#writing-your-retrieval-system}

По умолчанию Jigsaw использует SQLite. Это руководство покажет, как создать свою систему хранения свойств элементов для функции `adaptive`.

Например, можно использовать Firebase и общую базу данных для нескольких пауков на разных компьютерах. Такая удалённая база позволяет паукам обмениваться данными адаптивного парсинга.

Чтобы класс хранилища работал, выполните три условия:

1. Унаследуйте его от абстрактного класса `jigsaw.core.storage.StorageSystemMixin`. Принимайте строковый аргумент `url`, чтобы сохранить логику библиотеки.
2. Добавьте над классом декоратор `functools.lru_cache`, чтобы использовать шаблон Singleton, как в других классах.
3. Реализуйте методы `save` и `retrieve` с указанными типами:
    - Метод `save` ничего не возвращает и получает два аргумента от библиотеки.
        * Первый имеет тип `lxml.html.HtmlElement` и содержит сам элемент. Преобразуйте его в словарь через `element_to_dict` из подмодуля `jigsaw.core.utils._StorageTools`, чтобы сохранить общий формат. Затем сохраните словарь в свою базу данных.
        * Второй представляет собой строковый идентификатор для поиска. Сочетание этого идентификатора и аргумента `url` из конструктора должно быть уникальным для каждой записи. Иначе данные `adaptive` смешаются.
    - Метод `retrieve` принимает строковый идентификатор. Вместе с `url`, полученным при создании объекта, он используется для поиска словаря элемента в базе данных. Если запись найдена, метод возвращает её, иначе `None`.

> Если нужны подробности, посмотрите реализацию с SQLite3 в файле storage_adaptors.

Если класс соответствует этим условиям, остальное несложно. Для многопоточного приложения убедитесь, что класс безопасно работает с несколькими потоками. Класс по умолчанию поддерживает такую работу.

В абстрактном классе есть вспомогательные функции. Подробнее в коде, где много пояснений :)


## Практический пример: хранилище Redis {#real-world-example-redis-storage}

Вот практический пример с Redis, созданный с помощью ИИ:

```python
import redis
import orjson
from functools import lru_cache
from jigsaw.core.storage import StorageSystemMixin
from jigsaw.core.utils import _StorageTools

@lru_cache(None)
class RedisStorage(StorageSystemMixin):
    def __init__(self, host='localhost', port=6379, db=0, url=None):
        super().__init__(url)
        self.redis = redis.Redis(
            host=host,
            port=port,
            db=db,
            decode_responses=False
        )
        
    def save(self, element, identifier: str) -> None:
        # Convert element to dictionary
        element_dict = _StorageTools.element_to_dict(element)
        
        # Create key
        key = f"jigsaw:{self._get_base_url()}:{identifier}"
        
        # Store as JSON
        self.redis.set(
            key,
            orjson.dumps(element_dict)
        )
        
    def retrieve(self, identifier: str) -> dict | None:
        # Get data
        key = f"jigsaw:{self._get_base_url()}:{identifier}"
        data = self.redis.get(key)
        
        # Parse JSON if exists
        if data:
            return orjson.loads(data)
        return None
```
