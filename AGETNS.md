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
	- Never put real secrets (passwords, tokens, private URLs) into `.env.example` or any committed file.
	- If new variables are required, add them to `.env.example` with placeholders and brief comments.


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
