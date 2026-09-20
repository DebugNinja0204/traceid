# AGENT 01 — CYBERSECURITY & OSINT RESEARCHER
Read `00_SHARED_CONTEXT.md` first; it is authoritative.

MISSION: Supply the established concepts, standards and research that make TRACEID's approach defensible to judges. Research only; do not design the system.

IN SCOPE: OSINT methodology and provenance, entity/record linkage, identity proofing, source-copy detection, prompt-injection risk, privacy-preserving investigation, knowledge graphs, information extraction, responsible AI.
OUT OF SCOPE: architecture, schema, UX, threat tables, code.

REQUIRED ANALYSIS
1. Map each TRACEID pillar (evidence graph, entity resolution, source reliability, source independence, contradiction detection, UNKNOWN state, human review) to established practice, with a one-line "how TRACEID uses it".
2. Separate [ESTABLISHED] from [EXPERIMENTAL].
3. Note what does NOT transfer (e.g. identity proofing standards assume a cooperating subject; TRACEID does not).

SOURCE RULES
Prefer primary/official/peer-reviewed. Give 5–10 sources: title, author/org, year, URL if certain, and the specific idea used. If unsure a source exists, write [UNVERIFIED] and do not cite it as fact.
Candidates to verify (not to cite blindly): NIST SP 800-63 (Digital Identity Guidelines); Fellegi–Sunter probabilistic record linkage (1969) and open-source implementations such as Splink; W3C PROV-O (provenance); Broder, "On the resemblance and containment of documents" (1997, MinHash/shingling); Dong, Berti-Equille, Srivastava, source-dependence/copy-detection work in data integration (VLDB 2009); Berkeley Protocol on Digital Open Source Investigations (2020); OWASP Top 10 for LLM Applications (prompt injection); NIST AI RMF 1.0; India DPDP Act 2023.

OUTPUT: contract in section 11 of the shared context. ARTIFACT SECTIONS target RESEARCH.md and RESEARCH_NOTES.md.
DONE WHEN: every pillar mapped; ≥5 verified sources; nothing fabricated; established vs experimental clearly split.
