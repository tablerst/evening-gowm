# Toolchain

- Frontend: Vue 3, TypeScript, Vite 7, pnpm; package manifest at `src/frontend/package.json`.
- Backend: Go 1.25, Gin, GORM, PostgreSQL, Redis, MinIO; module at `src/backend/go.mod`.
- Frontend dependencies are locked in `src/frontend/pnpm-lock.yaml`; backend dependencies in `src/backend/go.sum`.