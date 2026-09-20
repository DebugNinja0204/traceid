"""Evidence verification tests — I4 invariant."""


def _verify_snippet_in_source(snippet: str, source_text: str) -> bool:
    """Verify that a snippet exists verbatim in the source text (normalized).

    This is the I4 invariant: every claim must have a verifiable snippet.
    """
    if not snippet or not snippet.strip():
        return False
    normalized_snippet = " ".join(snippet.lower().split())
    normalized_source = " ".join(source_text.lower().split())
    return normalized_snippet in normalized_source


def test_exact_snippet_found():
    """I4: Exact snippet exists in source text."""
    source = "Dr. Aarav Mehta is a researcher at Meridian Institute of Technology."
    snippet = "Aarav Mehta is a researcher at Meridian Institute"
    assert _verify_snippet_in_source(snippet, source)


def test_whitespace_normalized():
    """I4: Whitespace differences don't fail verification."""
    source = "Dr. Aarav   Mehta  is a researcher   at Meridian."
    snippet = "Aarav Mehta is a researcher at Meridian"
    assert _verify_snippet_in_source(snippet, source)


def test_hallucinated_snippet_rejected():
    """I4: Snippet not in source text is rejected."""
    source = "Dr. Aarav Mehta is a researcher at Meridian Institute."
    snippet = "Aarav Mehta is a professor at Stanford University"
    assert not _verify_snippet_in_source(snippet, source)


def test_empty_snippet_rejected():
    """I4: Empty snippet is rejected."""
    source = "Some source text."
    assert not _verify_snippet_in_source("", source)


def test_case_insensitive():
    """I4: Verification is case-insensitive."""
    source = "AARAV MEHTA is a researcher."
    snippet = "aarav mehta is a researcher"
    assert _verify_snippet_in_source(snippet, source)
