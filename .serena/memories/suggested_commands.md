# Commands

- Frontend commands run from `src/frontend`: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm build-only`, `pnpm type-check`, `pnpm lint`.
- Backend commands run from `src/backend`: `go test ./...`, `go run .`, `go run ./cmd/seed`.
- Linux deployment helper: from repository root, `./scripts/redeploy.sh [--daemon] [--frontend-build build|build-only|skip]`.
- The helper builds the frontend and starts Go; it does not configure Nginx, certificates, SSH, or renewal timers.