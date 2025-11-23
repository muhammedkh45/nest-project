# Architecture Overview

This document explains the main layers and responsibilities in this NestJS e-commerce project.

Layers:

- Controllers: Accept HTTP requests, validate input, delegate to services.
- Services: Application business logic, orchestrating repositories and utilities.
- Repositories: Data access layer; keep DB code isolated in `DB/Repositories`.
- Models / Schemas: Domain models in `DB/models`.
- Common utilities: Pipes, Guards, Decorators, Middleware, and shared services in `src/common/`.

Module boundaries:

- Each feature lives in `src/module/<feature>` and contains controller, service, DTOs, and local providers.
- Shared cross-cutting concerns (auth, email, file storage) live under `src/common/`.

Events & async tasks:

- Email and notification flows can be emitted as events and handled by event listeners (see `src/common/utils/Events`).

Notes:

- Repository pattern makes it easier to swap DB adapters or add caching layers later.
- Keep controllers thin—business logic should be testable in services.
