# TRACEID — Future Roadmap

Items below are explicitly **not in MVP**. They are listed as post-hackathon enhancements, clearly separated from what is demonstrable today.

## Post-hackathon enhancements

### Near-term (1–3 months post-hackathon)

| Feature | Rationale | Dependency |
|---------|-----------|-----------|
| **Neo4j graph database** | As entity count grows beyond hundreds, recursive CTEs become slow. Neo4j provides native graph traversal, pattern matching, and visualization | Requires dual-database strategy; PostgreSQL remains for relational data |
| **Live adapter expansion** | Enable additional organizer-approved domains beyond the sandbox corpus | Domain-specific adapter implementations; robots.txt compliance |
| **Multi-language extraction** | Support non-English sources for evidence extraction | Multi-language LLM model; language detection; translated snippets with original preserved |
| **User authentication and RBAC** | Multi-user access with role-based permissions (analyst, reviewer, admin) | Session management; JWT or OAuth2; permission model |
| **Calibrated thresholds** | Tune decision rules on labeled real-world data to validate ordinal tiers | Labeled dataset; evaluation framework; threshold optimization |

### Medium-term (3–6 months)

| Feature | Rationale | Dependency |
|---------|-----------|-----------|
| **Embedding-based entity resolution** | Use sentence embeddings for bio/description similarity beyond keyword matching | pgvector; embedding model selection; hybrid scoring with deterministic signals |
| **Model ensemble and fallback chain** | Multiple LLM providers with automatic failover and response comparison | Provider abstraction; cost management; response consistency metrics |
| **Batch investigation mode** | Process multiple cases in parallel with shared source cache | Task queue (Celery/Redis); resource management; concurrent database access |
| **Advanced graph analytics** | Community detection, centrality measures, path analysis for relationship networks | Neo4j or graph analytics library; visualization enhancements |
| **Automated source freshness monitoring** | Re-fetch sources periodically to detect changes and updates | Scheduler; change detection; re-scoring pipeline |

### Long-term (6+ months)

| Feature | Rationale | Dependency |
|---------|-----------|-----------|
| **Federated deployment** | Run TRACEID instances across organizations with shared findings | Federation protocol; privacy-preserving data sharing; trust model |
| **Real-time monitoring and alerting** | Continuous monitoring of cases for new evidence or status changes | Event streaming (Kafka); notification system; webhook integrations |
| **Confidence calibration research** | Study whether ordinal tiers can be mapped to empirical probabilities | Substantial labeled dataset; statistical analysis; calibration curves |
| **Regulatory compliance module** | Formal compliance with GDPR, India DPDP Act, and jurisdiction-specific regulations | Legal review; data processing agreements; consent management enhancements |
| **Plugin architecture for adapters** | Allow third-party adapter development with a published API | Plugin SDK; sandboxing; marketplace |

## Technologies deferred

| Technology | Why deferred | When to reconsider |
|-----------|-------------|-------------------|
| Neo4j | Single database rule (D3); PostgreSQL edge tables sufficient for MVP entity count | When graph traversal latency exceeds 100ms for typical queries |
| Redis | No caching layer needed in MVP; all queries hit PostgreSQL | When concurrent users exceed database connection pool capacity |
| Kafka / message queue | Synchronous pipeline with bounded loop is simpler for MVP | When batch processing or real-time streaming is needed |
| Kubernetes | Docker Compose sufficient for single-machine deployment | When horizontal scaling or multi-node deployment is needed |
| Face recognition for discovery | Privacy violation per D2; not needed for evidence-first approach | Only if organizer explicitly requires and provides reference photos with consent |

## What was NOT claimed

- No accuracy figures — thresholds are tuned on synthetic data only
- No real-time scale claims — MVP is designed for individual investigations
- No compliance certification — regulatory references are design inspiration only
- No production readiness — this is a hackathon prototype demonstrating the approach
