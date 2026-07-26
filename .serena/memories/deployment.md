# HTTPS deployment boundary

- Local ignored files `deploy/nginx/nginx.conf` and `deploy/nginx/nginx.http-only.conf` target `fleurlis.cn` and `www.fleurlis.cn`.
- Both expose the Let's Encrypt HTTP-01 webroot at `/var/www/letsencrypt/.well-known/acme-challenge/`.
- The HTTPS config points Nginx at `/etc/letsencrypt/live/fleurlis.cn/fullchain.pem` and `privkey.pem`; comments say certbot maintains them.
- The HTTP-only config is a bootstrap/troubleshooting config and deliberately references no certificate.
- No certbot invocation, renewal hook, systemd timer, cron entry, or certificate reload command exists in the repository or `scripts/redeploy.sh`; renewal scheduling must be checked on the server.
- These real configs are excluded by root `.gitignore`; the tracked `nginx.conf.example` is HTTP-only and uses placeholder domains.