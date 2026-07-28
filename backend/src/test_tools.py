"""Self-check for the non-trivial bits. Run: python -m src.test_tools"""

import tempfile
from pathlib import Path

import yaml

from src import tools
from src.agent import load_subagents
from src.tools import _MAX_PAGE_CHARS, _compact_markdown, write_blog


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


if __name__ == "__main__":
    test_write_blog_rejects_traversal()
    test_compact_markdown()
    test_load_subagents_requires_description()
    print("ok")
