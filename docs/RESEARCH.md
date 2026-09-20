# TRACEID — Research

## Established concepts mapped to TRACEID pillars

| TRACEID pillar | Established practice | Tag | How TRACEID uses it |
|----------------|---------------------|-----|-------------------|
| Evidence graph / provenance | W3C PROV-O (Provenance Ontology) | [ESTABLISHED] | Every claim carries source_id, snippet, timestamps, and reliability tier forming a provenance chain from raw page to reportable claim |
| Entity resolution | Fellegi–Sunter probabilistic record linkage (1969); Splink open-source implementation | [ESTABLISHED] | Blocking + per-feature comparison yields typed signals and pair states (SAME/POSSIBLY_SAME/DIFFERENT/UNKNOWN) without a single score |
| Source reliability tiers | Intelligence analysis tradecraft (Admiralty/NATO system); OSINT methodology (Berkeley Protocol) | [ESTABLISHED] | Three-tier rubric (HIGH/MEDIUM/LOW) with concrete source-type examples; tiers bound evidence weight but a HIGH source can still be wrong |
| Source independence / copy detection | Broder, "On the resemblance and containment of documents" (1997) — MinHash/shingling; Dong, Berti-Equille, Srivastava copy-detection in data integration (VLDB 2009) | [ESTABLISHED] | Layered method: domain ownership → near-duplicate content (shingling + similarity threshold) → attribution links → publication date; count clusters, not URLs |
| Contradiction detection | Logical consistency checking in knowledge bases; temporal reasoning | [ESTABLISHED] | Rules over structured claims: impossible timelines, mutually exclusive attributes; hard vs soft classification with explain-away mechanism |
| UNKNOWN / insufficient evidence | NIST SP 800-63A identity proofing levels; intelligence analysis "information gaps" | [ESTABLISHED] | INSUFFICIENT EVIDENCE is a first-class case status; no fabricated identities; decision rules require minimum evidence thresholds |
| Human review / oversight | NIST AI RMF 1.0 (MAP, MEASURE, MANAGE functions); human-in-the-loop AI systems | [ESTABLISHED] | Confirm/reject claims with logged reasons; evidence never deleted; review actions append-only |
| Prompt-injection defense | OWASP Top 10 for LLM Applications (2023); indirect prompt injection research | [ESTABLISHED] | Content wrapped as data with randomized delimiters; sanitization pipeline; schema-only LLM output; fail closed on invalid output |

## What does NOT transfer

- **Identity proofing standards** (NIST SP 800-63) assume a cooperating subject presenting credentials. TRACEID operates on public evidence without subject cooperation — the proofing levels don't directly apply, but the tiered-assurance mindset informs our evidence thresholds. [ASSUMPTION]
- **Probabilistic record linkage** assumes known error rates from labeled training data. TRACEID uses ordinal signal tiers instead of calibrated probabilities because we lack labeled data. [EXPERIMENTAL]
- **Intelligence agency OSINT methodology** assumes trained analysts with access controls. TRACEID automates the evidence-first approach but cannot replicate analyst judgment — hence the human review requirement. [ASSUMPTION]

## Verified sources

1. **NIST SP 800-63-4 (Digital Identity Guidelines)**, NIST, 2024. Tiered identity assurance framework. Used for: evidence threshold design and the principle that insufficient evidence is a valid outcome.

2. **Fellegi, I.P. and Sunter, A.B., "A Theory for Record Linkage"**, Journal of the American Statistical Association, 1969. Foundational probabilistic record linkage. Used for: entity resolution approach (blocking + comparison), adapted to ordinal tiers.

3. **Splink** — open-source probabilistic record linkage library (Ministry of Justice, UK). Used for: validation that Fellegi–Sunter blocking + comparison can scale to real datasets; architectural reference.

4. **W3C PROV-O: The PROV Ontology**, W3C Recommendation, 2013. Provenance data model. Used for: evidence provenance chain design (entity → activity → agent pattern maps to claim → extraction → source).

5. **Broder, A., "On the Resemblance and Containment of Documents"**, IEEE SEQUENCES, 1997. MinHash and shingling for near-duplicate detection. Used for: source independence — detecting copied/syndicated content via content similarity.

6. **Dong, X.L., Berti-Equille, L., Srivastava, D., "Integrating Conflicting Data: The Role of Source Dependence"**, VLDB, 2009. Source dependence and copy detection. Used for: independence cluster method — identifying when sources derive from a common origin.

7. **Berkeley Protocol on Digital Open Source Investigations**, UC Berkeley Human Rights Center, 2020. Methodology for verifiable open-source investigations. Used for: evidence chain standards, provenance requirements, documentation practices.

8. **OWASP Top 10 for LLM Applications**, OWASP, 2023. LLM-specific security risks including prompt injection. Used for: layered defense against indirect prompt injection via web content; fail-closed schema validation.

9. **NIST AI Risk Management Framework (AI RMF 1.0)**, NIST, 2023. AI risk governance. Used for: human oversight requirements, transparency, and the principle that AI systems should be explainable.

10. **India Digital Personal Data Protection Act (DPDP), 2023**. Indian data protection legislation. Used for: design inspiration for consent-first processing, data minimization, and purpose limitation. *This is not legal advice; the Act is referenced as a design principle, not as a compliance certification.* [ASSUMPTION]

## Established vs experimental

### Established (directly applicable)
- MinHash/shingling for near-duplicate detection
- Blocking + feature comparison for entity resolution
- Provenance chains for evidence traceability
- Schema-validated structured LLM output
- Append-only audit logging
- Content sanitization for injection defense

### Experimental (adapted for TRACEID, no standard implementation)
- Ordinal signal tiers replacing calibrated probabilities for entity resolution [EXPERIMENTAL]
- Independence cluster counting as a substitute for Bayesian source modeling [EXPERIMENTAL]
- LLM-proposed contradictions verified by deterministic rules [EXPERIMENTAL]
- Randomized-delimiter data wrapping for prompt injection defense [EXPERIMENTAL]
- Gap-loop investigation (bounded re-discovery) as an automated OSINT cycle [EXPERIMENTAL]
