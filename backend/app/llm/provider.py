"""LLM provider interface — mock / replay / real.

All LLM calls go through generate_structured(). Output must parse into
a Pydantic schema or the call fails closed (I5).
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
from pathlib import Path
import time
from typing import Any, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

logger = logging.getLogger("traceid.llm")

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    """Raised when LLM call fails after all retries."""
    pass


class LLMProvider:
    """LLM provider with mock/replay/real modes.

    All calls produce structured output validated against a Pydantic schema.
    If validation fails after max_retries, the call fails closed.
    """

    def __init__(
        self,
        *,
        provider: str = "mock",
        api_key: str = "",
        model: str = "gemini-3.5-flash",
        temperature: float = 0.1,
        timeout: int = 60,
        max_retries: int = 2,
        replay_dir: str = "backend/seed/llm_replays",
        record_mode: bool = False,
    ) -> None:
        self.provider = provider
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.timeout = timeout
        self.max_retries = max_retries
        self.replay_dir = Path(replay_dir)
        self.record_mode = record_mode

    def _prompt_hash(self, messages: list[dict]) -> str:
        """Hash the prompt for replay matching."""
        content = json.dumps(messages, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _load_replay(self, prompt_hash: str, schema_name: str) -> dict[str, Any] | None:
        """Load a recorded LLM response."""
        replay_file = self.replay_dir / f"{schema_name}_{prompt_hash}.json"
        if replay_file.exists():
            with open(replay_file) as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        return None

    def _save_replay(self, prompt_hash: str, schema_name: str, response: dict[str, Any]) -> None:
        """Save an LLM response for replay."""
        os.makedirs(self.replay_dir, exist_ok=True)
        replay_file = self.replay_dir / f"{schema_name}_{prompt_hash}.json"
        with open(replay_file, "w") as f:
            json.dump(response, f, indent=2)

    def generate_structured(
        self,
        messages: list[dict[str, Any]],
        schema: type[T],
        *,
        schema_name: str = "",
    ) -> T:
        """Generate structured output from the LLM.

        Args:
            messages: List of {"role": "...", "content": "..."} messages.
            schema: Pydantic model class to validate output against.
            schema_name: Name for replay file naming.

        Returns:
            Validated Pydantic model instance.

        Raises:
            LLMError: If output doesn't validate after retries.
        """
        schema_name = schema_name or schema.__name__
        prompt_hash = self._prompt_hash(messages)

        # Try replay first if configured or available
        if self.provider in ("mock", "replay"):
            replay_data = self._load_replay(prompt_hash, schema_name)
            if replay_data is not None:
                try:
                    return schema.model_validate(replay_data)
                except ValidationError as e:
                    logger.warning("Replay data failed validation: %s", e)
                    raise LLMError(f"Replay data failed validation: {e}") from e

        # Mock provider returns default/empty
        if self.provider == "mock":
            return self._mock_response(schema)

        # Gemini live provider
        if self.provider == "gemini":
            return self._generate_gemini(messages, schema, schema_name=schema_name, prompt_hash=prompt_hash)

        # OpenAI live provider (if ever configured)
        if self.provider == "openai":
            return self._generate_openai(messages, schema, schema_name=schema_name, prompt_hash=prompt_hash)

        raise LLMError(f"Real LLM provider '{self.provider}' not configured")

    def _generate_gemini(
        self,
        messages: list[dict[str, Any]],
        schema: type[T],
        *,
        schema_name: str,
        prompt_hash: str,
    ) -> T:
        """Call Google Gemini API with JSON structured output and retry loop."""
        if not self.api_key:
            raise LLMError("Gemini API key is not configured (LLM_API_KEY is empty)")

        # Prepare messages for Gemini
        system_instruction = None
        gemini_contents: list[dict[str, Any]] = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                system_instruction = {"parts": [{"text": content}]}
            elif role in ("assistant", "model"):
                gemini_contents.append({"role": "model", "parts": [{"text": content}]})
            else:
                gemini_contents.append({"role": "user", "parts": [{"text": content}]})

        if not gemini_contents:
            gemini_contents.append({"role": "user", "parts": [{"text": "Process request."}]})

        # Provide schema instruction in system prompt or trailing prompt
        schema_json_str = json.dumps(schema.model_json_schema())
        schema_prompt = (
            f"\nYou must output strictly valid JSON conforming to this JSON Schema:\n"
            f"{schema_json_str}\nDo not include markdown code block formatting or explanations outside the JSON."
        )

        if system_instruction is not None:
            system_instruction["parts"][0]["text"] += "\n" + schema_prompt
        else:
            system_instruction = {"parts": [{"text": schema_prompt}]}

        # Candidate models for fallback (prioritizing high-throughput lite models)
        models_to_try = [self.model]
        for fallback in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        current_contents = list(gemini_contents)
        last_error = None

        for attempt in range(self.max_retries + 1):
            for model_candidate in models_to_try:
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_candidate}:generateContent?key={self.api_key}"
                payload: dict[str, Any] = {
                    "contents": current_contents,
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "temperature": self.temperature,
                    },
                }
                if system_instruction:
                    payload["system_instruction"] = system_instruction

                try:
                    with httpx.Client(timeout=float(self.timeout)) as client:
                        resp = client.post(endpoint, json=payload)

                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            raise LLMError("Gemini returned empty candidates list")

                        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = schema.model_validate_json(raw_text)

                        if self.record_mode:
                            try:
                                self._save_replay(prompt_hash, schema_name, json.loads(raw_text))
                            except Exception as e:
                                logger.debug("Failed saving replay: %s", e)

                        return parsed

                    # Check for transient model issue or 404/503 to try fallback model
                    if resp.status_code in (404, 503):
                        logger.warning(
                            "Model %s returned status %d. Trying fallback model.",
                            model_candidate,
                            resp.status_code,
                        )
                        time.sleep(0.5)
                        continue

                    # Rate limit or quota error
                    if resp.status_code == 429:
                        logger.warning("Gemini 429 rate limited on %s: %s", model_candidate, resp.text[:120])
                        time.sleep(1.0 * (attempt + 1))
                        continue

                    # Other HTTP error
                    last_error = f"Gemini API returned {resp.status_code}: {resp.text[:200]}"
                    break

                except ValidationError as ve:
                    last_error = f"Validation error on schema {schema_name}: {ve}"
                    logger.warning("Attempt %d failed schema validation: %s", attempt, ve)
                    # Append validation failure notice for retry
                    current_contents.append({
                        "role": "user",
                        "parts": [{"text": f"Output failed schema validation: {ve}. Please fix and return compliant JSON."}],
                    })
                    break
                except Exception as ex:
                    last_error = f"Gemini request exception: {ex}"
                    logger.warning("Attempt %d exception: %s", attempt, ex)
                    break

        raise LLMError(f"Gemini structured generation failed after {self.max_retries} retries: {last_error}")

    def _generate_openai(
        self,
        messages: list[dict[str, Any]],
        schema: type[T],
        *,
        schema_name: str,
        prompt_hash: str,
    ) -> T:
        """Call OpenAI-compatible API with JSON structured output."""
        if not self.api_key:
            raise LLMError("OpenAI API key is not configured")

        endpoint = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model or "gpt-4o-mini",
            "messages": messages,
            "response_format": {"type": "json_object"},
            "temperature": self.temperature,
        }

        with httpx.Client(timeout=float(self.timeout)) as client:
            resp = client.post(endpoint, headers=headers, json=payload)
            if resp.status_code != 200:
                raise LLMError(f"OpenAI error {resp.status_code}: {resp.text}")
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = schema.model_validate_json(raw_text)
            if self.record_mode:
                self._save_replay(prompt_hash, schema_name, json.loads(raw_text))
            return parsed

    def _mock_response(self, schema: type[T]) -> T:
        """Generate a minimal valid mock response."""
        mock_data: dict[str, Any] = {}
        for field_name, field_info in schema.model_fields.items():
            annotation = field_info.annotation
            origin = getattr(annotation, "__origin__", None)
            if annotation is str or origin is str:
                mock_data[field_name] = f"mock_{field_name}"
            elif annotation is bool:
                mock_data[field_name] = False
            elif annotation is list or origin is list:
                mock_data[field_name] = []
            elif annotation is int:
                mock_data[field_name] = 0
            elif annotation is float:
                mock_data[field_name] = 0.0
            else:
                if field_info.default is not None:
                    mock_data[field_name] = field_info.default
                else:
                    mock_data[field_name] = None

        try:
            return schema.model_validate(mock_data)
        except ValidationError:
            return schema.model_validate({})
