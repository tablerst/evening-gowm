# AGENTS.md

## Dev environment tips

- This repo has **two parts**: a **frontend (Vue/Vite)** and a **backend (Go/Gin)**. Keep changes scoped and coherent.
- Before touching code, **collect enough context**:
  - find the relevant files, routes, handlers, and tests
  - understand expected behavior + edge cases
  - confirm assumptions by reading existing implementation (don’t “guess-fix”)
- Frontend development should follow the design system docs:
  - `src/backend/frontend/DESIGN.md`
  - `src/backend/frontend/STYLE.md`
  - Treat mobile as a first-class target: when styling, validate small screens, touch ergonomics, and responsive breakpoints (don’t assume desktop-only layouts).
- Backend follows Gin best practices:
  - keep HTTP concerns in handlers/middleware
  - **avoid passing `*gin.Context` into the business/domain layer** (extract what you need and pass explicit params instead)

- Environment variables (.env / .env.example):
  - Assume `.env` often **already exists locally but is not tracked by git**.
  - Before creating a new `.env`, **check whether it already exists**, and if it does, **read it first**.
  - Prefer updating/adding a committed `src/backend/.env.example` (safe template) instead of overwriting local `.env`.
  - Ensure `.env` is ignored by git (repo root `.gitignore` should include `.env` / `.env.*`), while keeping `*.env.example` committed.
  - Never put real secrets (passwords, tokens, private URLs) into `.env.example` or any committed file.
  - If new variables are required, add them to `.env.example` with placeholders and brief comments.

## SubAgent Usage

- Use SubAgents only when a task contains a meaningful, independently executable slice. Keep small single-file changes, one-off commands, and tightly coupled or immediately blocking work on the main thread.
- Before delegating, identify the critical path, independent workstreams, owned paths, acceptance criteria, validation, and expected coordination cost. Use the minimum number of SubAgents needed; do not duplicate exploration or create a separate SubAgent only to classify the model tier.
- Treat model selection as a risk and complexity decision. Choose the lowest tier that can safely satisfy the acceptance criteria; if the task is ambiguous or its risk is unclear, escalate to `gpt-5.6-sol`.
- When model selection is supported, use `gpt-5.6-luna` for low-risk, bounded, mechanical, read-only, repetitive, or high-volume work such as inventory, formatting, fixture updates, simple status checks, and focused test execution.
- Use `gpt-5.6-terra` as the default for ordinary bounded exploration, implementation slices, debugging with a clear reproduction, focused tests or documentation, and independent verification.
- Use `gpt-5.6-sol` for judgment, decisions, product taste, high-risk or destructive work, security or data migration, ambiguous requirements, non-trivial architecture or planning, cross-module contracts, delegated final synthesis or review, and lower-tier failures.
- When reasoning controls are available, prefer medium effort for Luna, medium or high for Terra, and `high`, `xhigh`, or `max` for Sol work that carries the critical risk classes above. Do not raise reasoning effort globally.
- If a Luna or Terra task becomes broad, ambiguous, destructive, or contract-affecting, stop and escalate to Sol; do not let a lower tier make unresolved architectural or product decisions.
- Prefer implementation-oriented SubAgents for disjoint write scopes and concrete validation, and exploration-oriented SubAgents when the implementation boundary is still unclear.
- The primary agent retains final integration, acceptance, and conflict resolution; child output is evidence until independently checked.
- Explicit user model or reasoning requests take precedence. If the dispatch surface cannot select or expose the requested model, do not silently claim that it was used; report the limitation and continue with the available route.
- Keep SubAgent prompts narrow and handoff-friendly: state the owned paths, goal, constraints, success criteria, validation command, and stop or escalation conditions.
- Reuse an existing SubAgent only when the follow-up remains within the same bounded context.

## Testing instructions

- Frontend type safety:
  - run `pnpm type-check` (from `src/backend/frontend/`)
- Backend tests:
  - run `go test ./...` (from `src/backend/`)
- When changing behavior, add/adjust tests close to the affected module (prefer small, focused tests).

## PR instructions

- Commit messages must follow the **Angular commit message convention** (type/scope/subject):
  - examples: `feat(frontend): add seasonal hero copy`, `fix(backend): validate jwt expiry`, `chore: update deps`
- Keep PRs small and readable:
  - one intent per PR
  - link to related issue/notes when applicable
  - describe what changed, why, and how it was verified (commands + key scenarios)
