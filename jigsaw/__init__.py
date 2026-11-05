__version__ = "0.5"

from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from jigsaw.parser import Selector, Selectors
    from jigsaw.core.custom_types import AttributesHandler, TextHandler
    from jigsaw.fetchers import Fetcher, AsyncFetcher, StealthyFetcher


# Lazy import mapping
_LAZY_IMPORTS = {
    "Fetcher": ("jigsaw.fetchers", "Fetcher"),
    "Selector": ("jigsaw.parser", "Selector"),
    "Selectors": ("jigsaw.parser", "Selectors"),
    "AttributesHandler": ("jigsaw.core.custom_types", "AttributesHandler"),
    "TextHandler": ("jigsaw.core.custom_types", "TextHandler"),
    "AsyncFetcher": ("jigsaw.fetchers", "AsyncFetcher"),
    "StealthyFetcher": ("jigsaw.fetchers", "StealthyFetcher"),
}
__all__ = ["Selector", "Fetcher", "AsyncFetcher", "StealthyFetcher"]


def __getattr__(name: str) -> Any:
    if name in _LAZY_IMPORTS:
        module_path, class_name = _LAZY_IMPORTS[name]
        module = __import__(module_path, fromlist=[class_name])
        return getattr(module, class_name)
    else:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    """Support for dir() and autocomplete."""
    return sorted(__all__ + ["fetchers", "parser", "cli", "core", "__author__", "__version__", "__copyright__"])
