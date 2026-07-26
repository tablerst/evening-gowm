# Evening Gown 部署与运维手册

本文记录 `fleurlis.cn` 现网的部署结构、首次迁移步骤、日常发布命令和常见故障处理。
生产服务器当前为 Ubuntu，项目目录为 `/root/workspace/evening-gown`。

## 1. 运行结构

| 组件       | 生产管理方式                           | 关键路径或服务                 |
| ---------- | -------------------------------------- | ------------------------------ |
| 前端       | Vite 构建后由自定义 Nginx 提供静态文件 | `src/frontend/dist`            |
| 后端       | systemd 托管编译后的 Go 二进制         | `evening-gown-backend.service` |
| Web/HTTPS  | 自定义 Nginx systemd 服务              | `evening-gown-nginx.service`   |
| HTTPS 续期 | Certbot Snap timer + deploy hook       | `snap.certbot.renew.timer`     |
| 对象存储   | 远程 MinIO                             | `src/backend/.env`             |

Nginx 将 `/api/`、`/ping` 和 `/healthz` 转发到 `127.0.0.1:8080`，前端构建不会改变 Nginx 配置。
当前现网图片所在的 MinIO bucket 是 `normal`，不是 `fleurlis`。

## 2. 首次安装或从手工进程迁移

### 2.1 本地提交并推送

只提交部署相关文件，不要使用 `git add .`，以免把本地配置或无关修改带上：

```bash
git add .gitignore scripts/redeploy.sh \
  deploy/systemd/evening-gown-backend.service deploy/README.md
git commit -m "docs(deploy): add production deployment runbook"
git push origin main
```

### 2.2 服务器同步代码并检查环境

```bash
cd /root/workspace/evening-gown
git pull --ff-only

grep -E '^(APP_HOST|APP_PORT|MINIO_BUCKET|MINIO_USE_SSL)=' \
  src/backend/.env
```

生产环境建议确认：

```dotenv
APP_HOST=127.0.0.1
APP_PORT=8080
MINIO_BUCKET=normal
MINIO_USE_SSL=false
```

不要把 `MINIO_ACCESS_KEY`、`MINIO_SECRET_KEY`、`JWT_SECRET` 等值打印到聊天或提交到 Git。
修改 `.env` 前先备份：

```bash
cp -a src/backend/.env \
  "src/backend/.env.bak.$(date +%Y%m%d-%H%M%S)"
```

如果 bucket 错了：

```bash
sed -i 's/^MINIO_BUCKET=.*/MINIO_BUCKET=normal/' src/backend/.env
```

先停止当前手工运行的 `go run .` 或旧 daemon，再确认 8080 没有旧进程占用：

```bash
sudo ss -ltnp | grep ':8080' || true
```

### 2.3 安装并启用后端服务

第一次不要使用 `enable --now`，因为二进制要由发布脚本先构建：

```bash
sudo install -m 0644 \
  deploy/systemd/evening-gown-backend.service \
  /etc/systemd/system/evening-gown-backend.service

sudo systemctl daemon-reload
sudo systemctl enable evening-gown-backend.service
```

该 unit 明确设置了 `WorkingDirectory` 和 `EnvironmentFile`，所以服务重启或开机后不会依赖某个登录 shell 中临时导出的环境变量。

### 2.4 执行首次完整发布

```bash
sudo bash scripts/redeploy.sh \
  --systemd \
  --frontend-build build-only
```

脚本会依次执行：

1. `pnpm install --frozen-lockfile`。
2. 构建前端 `dist`。
3. 构建 `/root/workspace/evening-gown/bin/evening-gown`。
4. 重启 `evening-gown-backend.service`。
5. 等待 `http://127.0.0.1:8080/healthz` 成功。

## 3. 日常发布

完整发布（前端和后端都更新）：

```bash
cd /root/workspace/evening-gown
git pull --ff-only
sudo bash scripts/redeploy.sh --systemd --frontend-build build-only
```

只更新后端：

```bash
sudo bash scripts/redeploy.sh --systemd --frontend-build skip
```

只更新前端：

```bash
cd /root/workspace/evening-gown/src/frontend
pnpm install --frozen-lockfile
pnpm build-only
```

前端只更新 `dist`，不需要重启后端或 reload Nginx。前端资源文件名带 hash，浏览器若仍显示旧 favicon，使用强制刷新即可。

## 4. 发布后验收

```bash
sudo systemctl is-enabled evening-gown-backend.service
sudo systemctl is-active evening-gown-backend.service
sudo systemctl status evening-gown-backend.service --no-pager --full

curl -fsS http://127.0.0.1:8080/healthz
curl -fsS https://fleurlis.cn/healthz
```

图片接口应返回 `200`，并且下载大小大于 0：

```bash
curl -sS -o /dev/null \
  -w 'asset_status=%{http_code} size=%{size_download}\n' \
  https://fleurlis.cn/api/v1/assets/products/736/cover/2026/05/06/368ced2d-6597-4fee-ab43-07d12efb58ab.webp
```

查看后端日志：

```bash
sudo journalctl -u evening-gown-backend.service -n 100 --no-pager
sudo journalctl -u evening-gown-backend.service -f
```

首次构建二进制后可以校验 unit：

```bash
sudo systemd-analyze verify \
  /etc/systemd/system/evening-gown-backend.service
```

## 5. Nginx 操作

只有修改 Nginx 配置时才需要测试并 reload：

```bash
sudo /usr/sbin/nginx -t -q \
  -p /root/workspace/evening-gown \
  -c /root/workspace/evening-gown/deploy/nginx/nginx.conf

sudo systemctl reload evening-gown-nginx.service
```

不要使用默认的 `nginx.service` 管理当前站点。查看状态：

```bash
sudo systemctl is-enabled evening-gown-nginx.service
sudo systemctl is-active evening-gown-nginx.service
sudo systemctl status evening-gown-nginx.service --no-pager --full
```

如果 Nginx 返回 502，先分别检查后端本机接口和服务日志：

```bash
curl -i http://127.0.0.1:8080/healthz
sudo journalctl -u evening-gown-backend.service -n 100 --no-pager
```

## 6. HTTPS 与 Certbot

证书续期和应用发布是两个独立流程。Certbot 负责更新证书，deploy hook 负责让自定义 Nginx 重新加载证书：

```bash
sudo systemctl status snap.certbot.renew.timer --no-pager --full
sudo systemctl list-timers --all --no-pager | \
  grep -Ei 'certbot|acme|letsencrypt'
```

当前 hook：

```text
/etc/letsencrypt/renewal-hooks/deploy/20-reload-evening-gown-nginx.sh
```

手动验证完整续期链路：

```bash
sudo certbot renew \
  --cert-name fleurlis.cn \
  --dry-run \
  --run-deploy-hooks
```

证书文件更新但浏览器仍显示旧证书时，优先 reload 自定义 Nginx：

```bash
sudo systemctl reload evening-gown-nginx.service
```

不要手动复制 `live/` 或 `archive/` 下的证书，也不要用 `systemctl reload nginx`。

## 7. 常见故障定位

### 后端服务启动失败

```bash
sudo systemctl status evening-gown-backend.service --no-pager --full
sudo journalctl -u evening-gown-backend.service -n 200 --no-pager
sudo ss -ltnp | grep ':8080' || true
```

常见原因是旧的 `go run .` 仍占用 8080、`.env` 不存在、MinIO 凭据错误，或 Go 二进制未生成。

### `/healthz` 中 MinIO 不是 `ok`

检查 `.env` 中的 endpoint、SSL 开关和 bucket 名称，不要只检查 shell 的 `env` 输出：

```bash
grep -E '^(MINIO_ENDPOINT|MINIO_BUCKET|MINIO_USE_SSL)=' \
  /root/workspace/evening-gown/src/backend/.env
sudo systemctl restart evening-gown-backend.service
curl -fsS http://127.0.0.1:8080/healthz
```

### 图片接口返回 404

先确认服务健康，再确认 bucket 是 `normal`。这类 404 通常是应用连接到了正确的 MinIO，但读取了错误的 bucket；改 `.env` 后必须重启 systemd 服务。

### 前端仍是旧版本

```bash
test -f src/frontend/dist/index.html && echo 'dist exists'
grep -o 'assets/titleLogo-[^" ]*\.webp' src/frontend/dist/index.html || true
curl -fsS https://fleurlis.cn/ | head -n 20
```

确认服务器上的 `dist` 已更新后，再清理浏览器缓存或执行强制刷新。静态资源使用长期缓存，不能只依赖普通刷新判断。

### pnpm 报 `ERR_PNPM_IGNORED_BUILDS`

这是 pnpm 阻止依赖安装脚本的提示，不要直接打开全局的危险构建开关。按 pnpm 输出运行一次交互式审批，只批准实际提示的构建依赖（通常是 `esbuild` 或 `@parcel/watcher`），然后重新执行发布脚本：

```bash
cd /root/workspace/evening-gown/src/frontend
pnpm approve-builds
pnpm install --frozen-lockfile
```

## 8. 回滚原则

优先在本地使用 `git revert` 生成反向提交，再按正常流程发布；不要在生产目录直接执行 `git reset --hard`：

```bash
git log --oneline -n 10
git revert COMMIT_SHA
git push origin main
```

服务器同步后重新执行：

```bash
git pull --ff-only
sudo bash scripts/redeploy.sh --systemd --frontend-build build-only
```

发布前至少备份 `src/backend/.env`。证书私钥、数据库连接串、MinIO 密钥和 JWT 密钥始终只保留在服务器环境文件中。

## 9. 常用命令速查

```bash
# 后端
sudo systemctl restart evening-gown-backend.service
sudo systemctl status evening-gown-backend.service --no-pager --full
sudo journalctl -u evening-gown-backend.service -f

# Nginx
sudo systemctl reload evening-gown-nginx.service
sudo systemctl status evening-gown-nginx.service --no-pager --full

# 健康检查
curl -fsS http://127.0.0.1:8080/healthz
curl -fsS https://fleurlis.cn/healthz

# 端口
sudo ss -ltnp | grep -E ':80|:443|:8080' || true
```
