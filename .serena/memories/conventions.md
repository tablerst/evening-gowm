# Conventions

- Keep frontend and backend changes scoped to their respective trees.
- Runtime secrets belong in ignored `.env` files; committed files use `.env.example`.
- Deployment configs containing real paths/domains are local-only and ignored; the committed `deploy/nginx/nginx.conf.example` is a generic site-block template.
- Backend defaults to port 8080; Nginx proxies `/api/` to localhost:8080 in the deployment configs.