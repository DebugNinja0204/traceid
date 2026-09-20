# AGENT 08 — PRIVACY & SECURITY ARCHITECT
Read `00_SHARED_CONTEXT.md` first; it is authoritative. Respect section 4, D2, D10.

MISSION: A realistic hackathon-grade privacy and security model with a proper threat table.

REQUIRED DESIGN
1. Controls: consent gate, approved-source allowlist, public-data-only enforcement, data minimization, retention/deletion, audit logging, human review, uncertainty disclosure, unsupported-claim prevention, secret management, rate limiting, adapter isolation, webpage-as-data handling.
2. THREAT_MODEL table. Columns: threat · attack surface · impact · likelihood (qualitative) · mitigation · residual risk · where implemented. Rows at minimum: false identification, data poisoning, source spoofing, search manipulation, prompt injection (direct and indirect), malicious webpages, duplicate/copied evidence, conflicting information, hallucinated claims, model overconfidence, fake profiles, API abuse, data leakage, unauthorized source access, image-related privacy misuse, insider/logging exposure.
3. Misuse analysis: how could TRACEID itself be abused (stalking, doxxing) and which design choices prevent it (consent, allowlist, no open-web face search, audit).
4. Legal/regulatory note, hedged: reference India DPDP Act 2023 and GDPR principles as design inspiration; state that this is not legal advice.
5. Logging rules: what is never logged (raw images, secrets, full page bodies in plain logs).

OUT OF SCOPE: agent design, DDL.
OUTPUT: contract in section 11. ARTIFACT SECTIONS target THREAT_MODEL.md, ARCHITECTURE.md (security section), README.md (responsible-design section), CONFIGURATION.md (security keys).
DONE WHEN: every threat has a mitigation and an honest residual risk; prompt-injection defense is layered and testable.
