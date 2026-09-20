# TRACEID — Threat Model

## Threat table

| # | Threat | Attack surface | Impact | Likelihood | Mitigation | Residual risk | Where implemented |
|---|--------|---------------|--------|-----------|------------|--------------|-------------------|
| T1 | False identification | Status engine, evidence chain | HIGH — innocent person wrongly identified | MEDIUM | Deterministic rules with minimum evidence thresholds; INSUFFICIENT EVIDENCE as default; runner-up always shown; human review required | Over-reliance on synthetic threshold tuning; may not generalize | `core/status.py`, `core/matrix.py` |
| T2 | Data poisoning | Source adapters, sandbox corpus | HIGH — fabricated evidence accepted as real | MEDIUM | Allowlist limits sources; source independence detects copies; contradiction engine hunts disconfirming evidence | Sophisticated poisoning within allowlisted domains may bypass | `security/allowlist.py`, `core/independence.py`, `core/contradiction.py` |
| T3 | Source spoofing | Live adapter | MEDIUM — spoofed source inflates reliability | LOW | Allowlist; reliability tiers bound trust; independence clustering | Domain-level spoofing within allowed list | `security/allowlist.py`, `core/reliability.py` |
| T4 | Search manipulation | Query planner | MEDIUM — manipulated results skew candidates | LOW | Queries validated against allowlist; planner uses only authorized context | Manipulation within allowed domains | `agents/planner.py`, `security/allowlist.py` |
| T5 | Direct prompt injection | LLM provider input | HIGH — attacker controls LLM output | LOW | Fixed system prompts; structured output schema; no user-controlled prompts reach LLM directly | Novel injection bypassing schema validation | `llm/provider.py`, `llm/schemas.py` |
| T6 | Indirect prompt injection | Fetched web pages | HIGH — malicious page steers extraction/status | MEDIUM | Content as data in randomized-delimiter block; sanitizer flags injection patterns; schema-only output; fail closed; page content never reaches tool selection or status logic | Novel obfuscation bypassing sanitizer patterns | `security/sanitize.py`, `agents/extraction.py`, invariant I6 |
| T7 | Malicious web pages | Source adapters | MEDIUM — scripts, hidden text, zero-width characters | MEDIUM | Sanitizer strips scripts/styles/hidden elements, removes zero-width and bidi chars; content hash after sanitization | Legitimate content inadvertently stripped | `security/sanitize.py` |
| T8 | Duplicate/copied evidence | Independence engine | MEDIUM — copies inflate apparent confirmation | HIGH | MinHash/shingling near-duplicate detection; attribution link detection; conservative merge on uncertainty; count clusters not URLs | Edited copies below similarity threshold treated as independent | `core/independence.py`, invariant I2 |
| T9 | Conflicting information | Contradiction engine | MEDIUM — unresolved contradictions mask true status | MEDIUM | Deterministic contradiction rules run before status; hard contradictions block STRONG/POSSIBLE MATCH; soft contradictions flagged | Novel contradiction types not in taxonomy | `core/contradiction.py`, invariant I3 |
| T10 | Hallucinated claims | LLM extraction | HIGH — fabricated evidence with no source basis | MEDIUM | Verbatim snippet verification: every extracted snippet must exist in stored source text (normalized); unverifiable claims dropped | Normalization may match approximate but non-verbatim text | `agents/extraction.py`, invariant I4 |
| T11 | Model overconfidence | LLM-assisted agents | MEDIUM — LLM outputs treated as authoritative | LOW | LLM never decides status; all LLM output schema-validated; deterministic core handles all decisions | Implicit trust in LLM-extracted structure | invariant I9, `core/status.py` |
| T12 | Fake profiles | Source adapters, resolution | MEDIUM — crafted profiles for false matches | MEDIUM | Source reliability tiers; independence clustering; contradiction detection; human review | Well-crafted fakes on high-reliability platforms | `core/reliability.py`, `core/independence.py` |
| T13 | API abuse | FastAPI endpoints | LOW — resource exhaustion, data scraping | MEDIUM | Rate limiting per client; consent required for case creation; authentication | Distributed attack from multiple clients | `security/ratelimit.py`, `security/consent.py` |
| T14 | Data leakage | Logging, API responses, DB | HIGH — personal data exposed in logs or responses | LOW | Never log raw images, secrets, or full page bodies; structured logging; API responses limited to case data; `.env` gitignored | Verbose error messages may leak context | `security/audit.py`, `.gitignore` |
| T15 | Unauthorized source access | Live adapter | MEDIUM — accessing non-approved sources | LOW | Allowlist enforced in adapter base class (not callers); refusals audited; live adapter disabled by default | Allowlist bypass via redirect or subdomain | `adapters/base.py`, `security/allowlist.py`, invariant I7 |
| T16 | Image-related privacy misuse | Image processing | HIGH — face search, tracking, deanonymization | LOW | EXIF stripped; no open-web face search; face similarity off by default; image retained only for case lifetime with `expires_at`; OCR output sanitized | Organizer-provided reference comparison still possible | `security/`, config `FACE_SIMILARITY_ENABLED` |
| T17 | Insider/logging exposure | Audit log, LLM calls | MEDIUM — internal access to sensitive investigation data | LOW | Audit log append-only; LLM calls store prompt hash not full content; access controls on database; structured logging omits sensitive fields | Database-level access not role-restricted in MVP | `audit_log` table, `llm_calls` table |

## Misuse analysis

TRACEID could potentially be abused for:

| Misuse scenario | How TRACEID prevents it |
|----------------|----------------------|
| **Stalking / surveillance** | Consent gate requires explicit consent before processing; no processing without it. Allowlist prevents arbitrary web scraping. All actions audited. |
| **Doxxing** | No open-web face search (D2). Allowlist limits to organizer-approved sources. Evidence is never fabricated. INSUFFICIENT EVIDENCE prevents over-identification. |
| **Harassment via false identification** | Deterministic status engine with minimum evidence thresholds. Human review required. Runner-up candidate always shown. No single confidence percentage that could be weaponized as "proof". |
| **Mass surveillance** | Rate limiting on case creation. One investigation per consent record. No batch processing API. Data retention with `expires_at`. |
| **Evidence fabrication** | Every claim traces to a verbatim snippet in a stored source document (I4). Audit log is append-only. Human review actions cannot delete evidence. |

## Legal/regulatory note

TRACEID's design is inspired by principles from:
- **India DPDP Act 2023**: consent-first processing, data minimization, purpose limitation, retention limits
- **GDPR principles**: lawfulness, fairness, transparency, purpose limitation, data minimization, storage limitation, integrity and confidentiality

*This is not legal advice. These regulations are referenced as design inspiration, not as a compliance certification. Actual deployment would require legal review specific to the jurisdiction and use case.* [ASSUMPTION]

## Logging rules

**Never logged**:
- Raw images or image content
- API keys, tokens, or secrets
- Full page bodies in plain-text logs (only content hashes and metadata)
- Personal data outside the investigation context

**Always logged** (structured, append-only):
- Case creation with consent record
- Source fetch attempts (allowed and refused)
- LLM calls (prompt hash, schema, outcome — not full prompt or response)
- Review actions (action type, target, reason)
- Status computations (inputs and result)
- Deletions
