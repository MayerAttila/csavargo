# ADR 001: Three repositories

**Decision:** Use `csavargo` (hub), `csavargo-web` (frontend), and `csavargo-api` (backend).

**Rationale:** Independent release/deployment pipelines and clearly separated portfolio artifacts. Shared API types will be generated from published OpenAPI contracts rather than a fourth repository.

**Trade-off:** Cross-repository contract compatibility needs explicit checks and coordinated releases. Use backward-compatible additive API changes first.
