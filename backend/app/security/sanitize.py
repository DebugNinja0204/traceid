"""Sanitizer — strip/normalize/flag injection patterns from web content.

Implements the untrusted-content pipeline: content is DATA, never instructions.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

_DEFAULT_INJECTION_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"ignore\s+all\s+previous",
    r"system\s+prompt",
    r"you\s+are\s+now",
    r"disregard\s+all",
    r"new\s+instructions",
    r"override\s+instructions",
    r"forget\s+everything",
    r"act\s+as\s+if",
    r"pretend\s+you\s+are",
    r"<\s*script",
    r"javascript\s*:",
    r"onerror\s*=",
    r"onclick\s*=",
]

# Zero-width and bidi characters to strip
_INVISIBLE_CHARS = re.compile(
    r"[\u200b\u200c\u200d\u200e\u200f\u2028\u2029\ufeff\u202a-\u202e\u2066-\u2069]"
)


@dataclass
class SanitizeResult:
    """Result of content sanitization."""
    cleaned_text: str
    original_length: int
    cleaned_length: int
    injection_flags: list[str] = field(default_factory=list)
    was_truncated: bool = False


def sanitize(
    raw_text: str,
    *,
    max_length: int = 50000,
    injection_patterns: list[str] | None = None,
) -> SanitizeResult:
    """Sanitize raw web content for safe processing.

    Steps:
    1. Strip zero-width and bidi characters
    2. Remove HTML scripts and style blocks
    3. Normalize whitespace and Unicode
    4. Truncate to max_length
    5. Flag injection patterns (but don't remove — for audit)

    Args:
        raw_text: Raw fetched content.
        max_length: Maximum character length after sanitization.
        injection_patterns: Custom injection patterns (or use defaults).

    Returns:
        SanitizeResult with cleaned text and any injection flags.
    """
    if not raw_text:
        return SanitizeResult(
            cleaned_text="",
            original_length=0,
            cleaned_length=0,
        )

    original_length = len(raw_text)
    text = raw_text

    # Step 1: Strip zero-width and bidi characters
    text = _INVISIBLE_CHARS.sub("", text)

    # Step 2: Remove HTML script and style blocks
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Strip remaining HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Step 3: Normalize Unicode and whitespace
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()

    # Step 4: Truncate
    was_truncated = len(text) > max_length
    if was_truncated:
        text = text[:max_length]

    # Step 5: Flag injection patterns
    compiled = [re.compile(p, re.IGNORECASE) for p in (injection_patterns or _DEFAULT_INJECTION_PATTERNS)]
    flags: list[str] = []
    for compiled_pattern in compiled:
        match = compiled_pattern.search(text)
        if match:
            flags.append(f"Injection pattern matched: '{match.group()}'")

    return SanitizeResult(
        cleaned_text=text,
        original_length=original_length,
        cleaned_length=len(text),
        injection_flags=flags,
        was_truncated=was_truncated,
    )
