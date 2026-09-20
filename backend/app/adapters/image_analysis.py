"""Consented Image Analysis Adapter — Multimodal OCR & Context Extraction.

Uses Gemini Multimodal Vision to inspect user-uploaded images for:
1. Visible text on badges, lanyards, name tags, clothing, and signs.
2. Organization, university, or corporate logos and crests.
3. Setting and profession contextual indicators.
4. Synthesizing high-precision targeted search queries for web correlation.

Adheres to Invariant D2 (EXIF metadata stripping and consensual visible-context extraction).
"""

from __future__ import annotations

import base64
import json
import logging
from typing import Any
from pydantic import BaseModel, Field
import httpx

logger = logging.getLogger("traceid.adapters.image_analysis")


class ImageAnalysisResult(BaseModel):
    """Structured extraction from a user-uploaded consented image."""
    visible_text: list[str] = Field(default_factory=list, description="Text on badges, signs, clothing, etc.")
    detected_logos: list[str] = Field(default_factory=list, description="Identified brand, school, or event logos.")
    detected_affiliations: list[str] = Field(default_factory=list, description="Likely organizations or institutions.")
    visual_context: str = Field(default="", description="Description of the scene, setting, or profession hints.")
    suggested_queries: list[str] = Field(default_factory=list, description="Targeted search queries for public correlation.")
    detected_role: str | None = Field(default=None, description="Inferred role or professional designation.")


def _detect_mime_type(image_bytes: bytes) -> str:
    """Infer image MIME type from magic bytes."""
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_bytes.startswith(b"RIFF") and b"WEBP" in image_bytes[:16]:
        return "image/webp"
    return "image/jpeg"


def _strip_exif_simple(image_bytes: bytes) -> bytes:
    """Strip basic JPEG EXIF APP1 markers (0xFFE1) per Invariant D2 privacy rule."""
    if not image_bytes.startswith(b"\xff\xd8"):
        return image_bytes

    # Basic stripping of JPEG metadata chunks while preserving SOI and image data
    pos = 2
    length = len(image_bytes)
    cleaned = bytearray(b"\xff\xd8")

    while pos < length - 1:
        if image_bytes[pos] != 0xFF:
            cleaned.extend(image_bytes[pos:])
            break
        marker = image_bytes[pos + 1]
        # End of image or SOS
        if marker == 0xDA or marker == 0xD9:
            cleaned.extend(image_bytes[pos:])
            break
        if pos + 4 > length:
            cleaned.extend(image_bytes[pos:])
            break
        seg_len = (image_bytes[pos + 2] << 8) + image_bytes[pos + 3]
        # APP1 marker (EXIF is 0xE1)
        if marker == 0xE1:
            pos += 2 + seg_len
            continue
        cleaned.extend(image_bytes[pos : pos + 2 + seg_len])
        pos += 2 + seg_len

    return bytes(cleaned)


def analyze_consented_image(
    image_bytes: bytes,
    subject_name: str = "",
    api_key: str = "",
    timeout: int = 25,
) -> ImageAnalysisResult:
    """Analyze uploaded photo using Gemini Vision models for visible context and targeted search queries.

    Args:
        image_bytes: Raw image file bytes.
        subject_name: Name of the subject to anchor suggested search queries.
        api_key: Gemini API key.
        timeout: Request timeout in seconds.

    Returns:
        ImageAnalysisResult with extracted text, logos, context, and search queries.
    """
    if not image_bytes or not api_key:
        logger.info("Image analysis skipped: empty image or missing API key.")
        return ImageAnalysisResult()

    try:
        # Strip EXIF for privacy compliance (D2)
        sanitized_bytes = _strip_exif_simple(image_bytes)
        mime_type = _detect_mime_type(sanitized_bytes)
        b64_data = base64.b64encode(sanitized_bytes).decode("utf-8")

        prompt = (
            f"You are an expert digital identity intelligence forensic vision engine. "
            f"The consented user image belongs to target subject '{subject_name or 'the individual'}'.\n"
            f"Analyze this image thoroughly to discover any verifiable public footprint clues:\n"
            f"1. Extract any visible text: badge names, lanyards, certificates, clothing text, background banners, event names.\n"
            f"2. Identify any visible logos or emblems (university, company, tech brand, conference).\n"
            f"3. Note the contextual setting (e.g., keynote presenter, software engineer workstation, academic ceremony, office portrait).\n"
            f"4. Propose 4-6 specific, high-precision search queries combining '{subject_name}' with the detected text/logos/roles "
            f"to accurately find public profiles on LinkedIn, GitHub, research repositories, and company pages.\n\n"
            f"Return strictly valid JSON with keys: 'visible_text' (list of strings), 'detected_logos' (list of strings), "
            f"'detected_affiliations' (list of strings), 'visual_context' (string), 'suggested_queries' (list of strings), "
            f"'detected_role' (string or null)."
        )

        candidate_models = [
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-flash-latest",
        ]

        for model in candidate_models:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                    ]
                }],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                },
            }

            try:
                with httpx.Client(timeout=float(timeout)) as client:
                    resp = client.post(endpoint, json=payload)

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw_json = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed_dict = json.loads(raw_json)
                        # Clean up nulls
                        if parsed_dict.get("visible_text") is None:
                            parsed_dict["visible_text"] = []
                        if parsed_dict.get("detected_logos") is None:
                            parsed_dict["detected_logos"] = []
                        if parsed_dict.get("detected_affiliations") is None:
                            parsed_dict["detected_affiliations"] = []
                        if parsed_dict.get("suggested_queries") is None:
                            parsed_dict["suggested_queries"] = []

                        result = ImageAnalysisResult(**parsed_dict)
                        logger.info("Image analysis succeeded via %s: %d text items, %d logos, %d queries",
                                    model, len(result.visible_text), len(result.detected_logos), len(result.suggested_queries))
                        return result

                elif resp.status_code in (404, 429, 503):
                    logger.warning("Vision model %s returned status %d. Trying fallback...", model, resp.status_code)
                    continue
                else:
                    logger.warning("Vision model %s error %d: %s", model, resp.status_code, resp.text[:150])
                    break

            except Exception as ex:
                logger.warning("Vision call error on %s: %s", model, ex)
                continue

    except Exception as e:
        logger.error("Failed to analyze consented image: %s", e)

    return ImageAnalysisResult()
