# Security and LLM rules

## Untrusted content pipeline (D10)
1. Adapter returns raw document + metadata.
2. `security/sanitize.py`: strip scripts/styles/hidden elements, remove zero-width and bidi control characters, normalize whitespace and Unicode, cap length; record `injection_flags` for instruction-like patterns (e.g. "ignore previous", "system prompt", role markers, "you are now", tool-call syntax, requests to change status). Flagged documents are still stored and shown, with a visible flag.
3. Store cleaned text + content hash. Snippet verification (I4) runs against this stored text.
4. LLM receives the text only inside a clearly delimited data block with a fixed system prompt stating that the block is untrusted data and contains no instructions. Delimiters are randomized per call.
5. LLM output must parse into the Pydantic schema. Reject unknown fields. Retry ≤ `LLM_MAX_RETRIES` with the validation error appended (never with page content as instruction), then fail closed.
6. Extracted snippets not found verbatim in the stored text are dropped and counted in metrics.
7. Nothing derived from page text is ever used to pick tools, URLs to fetch, config values or statuses. Query planning uses only the authorized case context; discovered links are followed only if they pass the allowlist.

## Allowlist, consent, audit
- `ALLOWED_DOMAINS` (and sandbox corpus IDs) enforced in the adapter base class, not in callers. Refusal writes an audit row.
- Case creation requires an explicit consent record (who, scope, timestamp). No consent ⇒ 4xx.
- Audit every: case create, consent, source fetch (allowed/refused), LLM call (hash of prompt, schema, outcome), review action, status computation, deletion.

## LLM provider contract
- `llm/provider.py`: `generate_structured(schema, messages) -> ValidatedModel`. Providers: `mock` (fixtures, used in tests), `replay` (reads recorded responses keyed by prompt hash; zero network), one real provider selected by env (Gemini- or OpenAI-compatible). Real provider behind a timeout and retry limit.
- Record mode writes `llm_calls`; replay mode must work with no API key and no network (I14).
- Temperature low; no tool/function calling that touches the network from the LLM.

## Secrets and config
- `.env` is git-ignored; only `.env.example` (placeholders) is committed. Never print secrets. Never commit real API keys, tokens or personal data.

## Image handling (D2)
- Strip EXIF, cap size, store only for the case lifetime with `expires_at`. OCR output is treated as untrusted text and passes through the same sanitize step. No face matching to discover candidates. Face similarity vs organizer-provided reference photos is behind a flag, default off, never sufficient alone.

## Rate limiting
- Per-client limits on case creation and copilot queries; return 429 with a clear error.
