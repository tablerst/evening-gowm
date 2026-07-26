# Completion checks

- Frontend behavior changes: run `pnpm type-check` and `pnpm build-only` from `src/frontend`; run `pnpm lint` when lint scope matters.
- Backend behavior changes: run `go test ./...` from `src/backend`.
- Deployment-only investigation: inspect both tracked examples and ignored local configs, then verify `git status --short --ignored` so local deployment files are not mistaken for committed automation.