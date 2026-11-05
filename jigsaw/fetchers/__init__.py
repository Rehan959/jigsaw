from typing import TYPE_CHECKING, Any
from jigsaw.engines.toolbelt import ProxyRotator

if TYPE_CHECKING:
    from jigsaw.fetchers.requests import Fetcher, AsyncFetcher, FetcherSession
    from jigsaw.fetchers.stealth_chrome import StealthyFetcher, StealthySession, AsyncStealthySession


# Lazy import mapping
_LAZY_IMPORTS = {
    "Fetcher": ("jigsaw.fetchers.requests", "Fetcher"),
    "AsyncFetcher": ("jigsaw.fetchers.requests", "AsyncFetcher"),
    "FetcherSession": ("jigsaw.fetchers.requests", "FetcherSession"),
    "StealthyFetcher": ("jigsaw.fetchers.stealth_chrome", "StealthyFetcher"),
    "StealthySession": ("jigsaw.fetchers.stealth_chrome", "StealthySession"),
    "AsyncStealthySession": ("jigsaw.fetchers.stealth_chrome", "AsyncStealthySession"),
}

__all__ = [
    "Fetcher",
    "AsyncFetcher",
    "ProxyRotator",
    "FetcherSession",
    "StealthyFetcher",
    "StealthySession",
    "AsyncStealthySession",
]


def __getattr__(name: str) -> Any:
    if name in _LAZY_IMPORTS:
        module_path, class_name = _LAZY_IMPORTS[name]
        module = __import__(module_path, fromlist=[class_name])
        return getattr(module, class_name)
    else:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def __dir__() -> list[str]:
    """Support for dir() and autocomplete."""
    return sorted(list(_LAZY_IMPORTS.keys()))
