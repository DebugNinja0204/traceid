# TRACEID — Architecture

## High-level architecture

```mermaid
graph TB
    subgraph Browser
        UI[React workspace<br/>Vite + TypeScript + Tailwind + React Flow]
    end
    subgraph API Layer
        GW[FastAPI gateway]
        CG[Consent gate]
        AL[Allowlist enforcer]
        RL[Rate limiter]
    end
    subgraph Orchestrator
        SM[State machine<br/>bounded loop controller]
    end
    subgraph LLM-Assisted Agents
        PL[Planner<br/>query suggestions]
        EX[Extraction<br/>structured claims]
        RP[Report<br/>narrative generation]
        CP[Copilot<br/>read-only Q&A]
    end
    subgraph Deterministic Core
        REL[Reliability engine]
        IND[Independence engine]
        RES[Resolution engine]
        CON[Contradiction engine]
        TL[Timeline engine]
        MTX[Matrix builder]
        ST[Status engine<br/>ONLY status writer]
    end
    subgraph Source Adapters
        SB[Sandbox corpus adapter]
        LA[Live allowlisted adapter<br/>disabled by default]
        OCR[OCR adapter<br/>Tesseract / fixture fallback]
    end
    subgraph Security
        SAN[Sanitizer<br/>injection flagging]
        AUD[Audit logger<br/>append-only]
    end
    subgraph Data
        PG[(PostgreSQL 16<br/>+ pgvector if needed)]
        LLM_P[LLM provider<br/>mock / replay / real]
    end

    UI --> GW
    GW --> CG --> AL --> RL --> SM
    SM --> PL --> LLM_P
    SM --> EX --> LLM_P
    SM --> RP --> LLM_P
    SM --> CP --> LLM_P
    SM --> REL
    SM --> IND
    SM --> RES
    SM --> CON
    SM --> TL
    SM --> MTX
    SM --> ST
    SM --> SB
    SM --> LA
    SM --> OCR
    SB --> SAN
    LA --> SAN
    OCR --> SAN
    SAN --> AUD
    SM --> PG
    EX --> SAN
```

## Component diagram

```mermaid
graph LR
    subgraph backend/app/api
        R[Thin routers<br/>validation + serialization only]
    end
    subgraph backend/app/orchestrator
        OSM[State machine]
        LC[Loop controller]
    end
    subgraph backend/app/core
        REL[reliability.py]
        IND[independence.py]
        RES[resolution.py]
        CON[contradiction.py]
        TL[timeline.py]
        MTX[matrix.py]
        ST[status.py]
    end
    subgraph backend/app/agents
        PL[planner.py]
        EX[extraction.py]
        RP[report.py]
        CP[copilot.py]
    end
    subgraph backend/app/llm
        PROV[provider.py]
        SCH[schemas.py]
        MOCK[mock provider]
        REPLAY[replay provider]
    end
    subgraph backend/app/adapters
        BASE[base adapter]
        SAND[sandbox_corpus.py]
        LIVE[live_allowlisted.py]
        OCRA[ocr.py]
    end
    subgraph backend/app/security
        CONS[consent.py]
        ALST[allowlist.py]
        SANZ[sanitize.py]
        AUDT[audit.py]
        RATE[ratelimit.py]
    end
    subgraph backend/app/db
        MOD[models.py]
        SESS[session.py]
        MIG[migrations/]
    end

    R --> OSM
    OSM --> LC
    OSM --> REL & IND & RES & CON & TL & MTX & ST
    OSM --> PL & EX & RP & CP
    PL & EX & RP & CP --> PROV
    PROV --> MOCK & REPLAY
    OSM --> BASE
    BASE --> SAND & LIVE & OCRA
    BASE --> ALST
    SAND & LIVE & OCRA --> SANZ
    R --> CONS
    SANZ --> AUDT
    OSM --> MOD
    MOD --> SESS
```

## Pipeline with gap loop

```mermaid
flowchart TD
    A[INPUT: image + authorized context] --> B[CONSENT/VALIDATION]
    B --> C[CANDIDATE GENERATION]
    C --> D[SOURCE DISCOVERY]
    D --> E[EVIDENCE EXTRACTION<br/>LLM-assisted]
    E --> F[ENTITY RESOLUTION<br/>deterministic]
    F --> G[SOURCE RELIABILITY<br/>deterministic]
    G --> H[SOURCE INDEPENDENCE<br/>deterministic]
    H --> I[CONTRADICTION SEARCH<br/>deterministic rules +<br/>LLM proposals verified]
    I --> J{Gaps found?<br/>iterations < MAX?}
    J -->|Yes| D
    J -->|No / max reached| K[TIMELINE/GRAPH<br/>deterministic]
    K --> L[HUMAN REVIEW]
    L --> M[FINAL STATUS<br/>deterministic only]
```

## AI agent table

| Agent | Purpose | Input | Output schema | Method | Failure mode | Human-review trigger | Security controls |
|-------|---------|-------|--------------|--------|-------------|---------------------|-------------------|
| Identity Investigator | Orchestrator/planner | Case context, verified claims | QueryPlan(queries, target_domains) | LLM-assisted planning | Falls back to default query set | Never | Queries validated against allowlist |
| Profile Discovery | Source adapters + query | QueryPlan | RawDocument(url, text, metadata) | Adapter fetch + sanitize | Allowlist refusal logged; continue | Never | Allowlist enforced in base class; sanitizer strips injection |
| Entity Resolution | Deterministic scorer | Claims, signals | ResolutionResult(pair_state, signals) | Blocking + feature comparison | UNKNOWN if insufficient features | POSSIBLY_SAME triggers review | No LLM; pure functions |
| Evidence Extraction | LLM extraction + verification | Sanitized text | ExtractedClaim(entity, attr, value, snippet) | LLM structured output + snippet verification | Fail closed; drop unverifiable claims | Flagged documents highlighted | Randomized delimiters; schema-only output |
| Contradiction Detection | Rules over claims + LLM proposals | Structured claims | Contradiction(kind, hard/soft, evidence_ids) | Deterministic rules; LLM proposals verified | Conservative: uncertain = no contradiction | Hard contradiction flags case | LLM proposals verified against rules |
| Timeline | Deterministic ordering | Dated claims | TimelineEvent(date, claim, conflicts) | Date sorting + overlap detection | Missing dates → excluded, not guessed | Impossible timelines flagged | No LLM |
| Report | Template + LLM narrative | Matrix, status, evidence | ReportSection(text, evidence_ids) | Template with LLM narrative bound to evidence IDs | Deterministic-only fallback with banner | Always available | Strip uncited statements |
| Copilot | Read-only Q&A | User query + case evidence | CopilotAnswer(answer, evidence_ids, refused) | Retrieval + LLM answer with citations | Refuse out-of-scope; cite or refuse | Cannot trigger actions | Read-only; no fetches; no status changes |

## Evidence flow

```mermaid
flowchart LR
    S[Source page] --> A[Adapter fetch]
    A --> SAN[Sanitize<br/>strip/normalize/flag]
    SAN --> STORE[Store document<br/>text + content hash]
    STORE --> EXT[LLM extraction<br/>structured claims]
    EXT --> VER{Snippet in<br/>stored text?}
    VER -->|Yes| CL[Claim stored<br/>with evidence + source_id]
    VER -->|No| DROP[Claim dropped<br/>counted in metrics]
    CL --> RES[Entity resolution<br/>signals + pair states]
    CL --> CON[Contradiction check]
    CL --> TL[Timeline]
    RES --> MTX[Evidence matrix]
    CON --> MTX
    TL --> MTX
    MTX --> ST[Status engine]
```

## Verification and human-review flow

```mermaid
flowchart TD
    EV[Evidence matrix + status] --> REV[Human review interface]
    REV --> CONF[Confirm claim/candidate<br/>with reason]
    REV --> REJ[Reject claim/candidate<br/>with reason]
    CONF --> RA[review_actions INSERT<br/>append-only]
    REJ --> RA
    RA --> RECOMP[Recompute status<br/>with review adjustments]
    RECOMP --> AUDIT[Audit log<br/>append-only]
```

## Security boundaries (trust zones)

| Trust zone | Components | Trust level | Boundaries |
|-----------|-----------|-------------|-----------|
| Browser | React workspace | Untrusted | All input validated server-side; no secrets |
| API gateway | FastAPI, consent gate, rate limiter | Semi-trusted | Validates consent, enforces rate limits |
| Orchestrator | State machine, loop controller | Trusted | Controls pipeline flow; reads/writes via repositories |
| Deterministic core | reliability, independence, resolution, contradiction, timeline, matrix, status | Trusted | Pure functions; no network, no LLM, no DB |
| LLM-assisted agents | extraction, report, copilot, planner | Semi-trusted | Output schema-validated; fail closed; cannot write status |
| Source adapters | sandbox, live, OCR | Untrusted boundary | Allowlist enforced; output sanitized; no LLM or DB access |
| LLM provider | External API or mock/replay | Untrusted | Timeout; retry limits; structured output only |
| External content | Web pages, images | Untrusted | Data only; never instructions; sanitized; flagged |
| Database | PostgreSQL | Trusted | Constraints enforce evidence-first; audit append-only |

## Pluggable source-adapter interface

```python
class BaseAdapter(ABC):
    def __init__(self, allowlist: AllowlistConfig, audit: AuditLogger):
        self._allowlist = allowlist
        self._audit = audit

    def fetch(self, source_ref: SourceRef) -> RawDocument:
        if not self._allowlist.is_allowed(source_ref.domain):
            self._audit.log_refusal(source_ref)
            raise AllowlistRefusalError(source_ref.domain)
        return self._do_fetch(source_ref)

    @abstractmethod
    def _do_fetch(self, source_ref: SourceRef) -> RawDocument: ...
```

Adapters return raw documents only. They never call the LLM and never write to the DB. Allowlist enforcement is in the base class, not in callers.

## Deployment

```yaml
# docker-compose.yml
services:
  db:
    image: pgvector/pgvector:pg16  # pgvector only if embeddings used
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U traceid"]
    volumes:
      - pgdata:/var/lib/postgresql/data
  backend:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }
    env_file: .env
  frontend:
    build: ./frontend
    depends_on: [backend]
volumes:
  pgdata:
```

## MVP build order

1. **P0**: Scaffold (repo layout, Docker, health endpoint, Makefile, frontend skeleton)
2. **P1**: Database (SQLAlchemy models, Alembic migrations, constraints)
3. **P2** ∥ **P3**: Core engines (pure functions) ∥ Sandbox corpus + adapters + sanitizer
4. **P4**: LLM layer (extraction, report, copilot with fail-closed contracts)
5. **P5**: Orchestrator state machine + API endpoints
6. **P6**: Frontend (React workspace with all panels)
7. **P7**: Demo hardening, doc sync, replay fixtures, freeze
