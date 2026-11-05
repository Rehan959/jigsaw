from os import getenv

import pytest

from jigsaw.core._types import Any
from jigsaw.fetchers import AsyncStealthySession
from jigsaw.spiders import Request, SessionManager


@pytest.mark.browser
@pytest.mark.asyncio
@pytest.mark.parametrize("lazy", [False, True])
async def test_stealthy_browser_session_dispatch(lazy: bool) -> None:
    async def setup(page: Any) -> None:
        await page.route("**/*", lambda route: route.fulfill(content_type="text/html", body="<h1>Browser</h1>"))

    session = AsyncStealthySession(executable_path=getenv("JIGSAW_EXECUTABLE_PATH"), google_search=False)
    manager = SessionManager().add("browser", session, lazy=lazy)
    request = Request("https://spider.test/", sid="browser", page_setup=setup, meta={"source": "browser"})
    async with manager:
        assert session._is_alive is not lazy
        response = await manager.fetch(request)
        assert response.status == 200
        assert response.css("h1::text").get() == "Browser"
        assert response.request is request
        assert response.meta["source"] == "browser"
        assert session._is_alive
    assert not session._is_alive
    assert session.page_pool.pages_count == 0
