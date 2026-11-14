"""Self-check for the non-trivial bits. Run: python -m src.test_tools"""

import io
import tempfile
from pathlib import Path

import PIL.Image
import yaml

from src import tools
from src.agent import load_subagents
from src.tools import (
    _COVER_SIZE,
    _MAX_PAGE_CHARS,
    _compact_markdown,
    _fit_cover,
    _save_cover,
    generate_cover,
    write_blog,
)


def test_write_blog_rejects_traversal():
    assert "Invalid slug" in write_blog.invoke({"slug": "../evil", "content": "x"})
    assert "Invalid slug" in write_blog.invoke({"slug": "a/b", "content": "x"})

    real, tools.BLOG_DIR = tools.BLOG_DIR, Path(tempfile.mkdtemp())
    try:
        out = write_blog.invoke({"slug": "good-slug", "content": "# ok"})
        assert "Blog saved to" in out, out
        assert (tools.BLOG_DIR / "good-slug" / "Blog.md").read_text() == "# ok"
    finally:
        tools.BLOG_DIR = real


def test_compact_markdown():
    assert _compact_markdown("a\n\n\n\n\nb") == "a\n\nb"
    long = _compact_markdown("x" * (_MAX_PAGE_CHARS + 500))
    assert long.endswith("[...truncated...]")
    assert len(long) < _MAX_PAGE_CHARS + 100


def test_load_subagents_requires_description():
    with tempfile.TemporaryDirectory() as d:
        path = Path(d) / "bad.yaml"
        path.write_text(yaml.safe_dump({"writer": {"name": "w", "system_prompt": "p"}}))
        try:
            load_subagents(path)
        except ValueError as e:
            assert "description" in str(e), e
        else:
            raise AssertionError("expected ValueError for missing description")


def test_fit_cover_crops_and_resizes():
    # Square source (what FLUX.1 [schnell] returns) must come out as the exact
    # cover size, not a 1024x1024 square.
    square = PIL.Image.new("RGB", (1024, 1024), "navy")
    assert _fit_cover(square).size == _COVER_SIZE

    # Wrong-aspect source is cropped, not stretched: the centre stays intact.
    wide = PIL.Image.new("RGB", (2000, 500), "navy")
    assert _fit_cover(wide).size == _COVER_SIZE


def test_save_cover_writes_readable_png():
    real, tools.BLOG_DIR = tools.BLOG_DIR, Path(tempfile.mkdtemp())
    try:
        buffer = io.BytesIO()
        PIL.Image.new("RGB", (1024, 1024), "navy").save(buffer, format="JPEG")
        out = _save_cover(buffer.getvalue(), "some-slug", "cover")

        path = tools.BLOG_DIR / "some-slug" / "cover.png"
        assert "Cover saved to" in out, out
        assert path.exists()
        assert path.stat().st_size > 0
        with PIL.Image.open(path) as image:
            assert image.size == _COVER_SIZE
            assert image.format == "PNG"
    finally:
        tools.BLOG_DIR = real


def test_generate_cover_validates_names():
    for args in (("../evil", "cover"), ("good", "../cover"), ("a/b", "cover")):
        out = generate_cover.invoke(
            {"prompt": "x", "slug": args[0], "name": args[1]}
        )
        assert "Invalid slug" in out, out


def test_generate_cover_requires_pollinations_key():
    """Default provider is the Pollinations gen API; without a key it must say so."""
    real, tools.BLOG_DIR = tools.BLOG_DIR, Path(tempfile.mkdtemp())
    saved = {
        key: tools.os.environ.pop(key, None)
        for key in ("POLLONATION_API_KEY", "IMAGE_PROVIDER")
    }
    try:
        out = generate_cover.invoke(
            {"prompt": "a cover", "slug": "fallback-test", "name": "cover"}
        )
        assert "POLLONATION_API_KEY" in out, out
    finally:
        tools.BLOG_DIR = real
        for key, value in saved.items():
            if value is not None:
                tools.os.environ[key] = value


def test_generate_cover_reports_unknown_provider():
    saved = tools.os.environ.get("IMAGE_PROVIDER")
    tools.os.environ["IMAGE_PROVIDER"] = "not-a-provider"
    try:
        out = generate_cover.invoke({"prompt": "x", "slug": "ok", "name": "cover"})
        assert "Unknown IMAGE_PROVIDER" in out, out
    finally:
        if saved is None:
            tools.os.environ.pop("IMAGE_PROVIDER", None)
        else:
            tools.os.environ["IMAGE_PROVIDER"] = saved


if __name__ == "__main__":
    test_write_blog_rejects_traversal()
    test_compact_markdown()
    test_load_subagents_requires_description()
    test_fit_cover_crops_and_resizes()
    test_save_cover_writes_readable_png()
    test_generate_cover_validates_names()
    test_generate_cover_requires_pollinations_key()
    test_generate_cover_reports_unknown_provider()
    print("ok")
