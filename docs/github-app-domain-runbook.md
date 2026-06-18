# GitHub App And Domain Runbook

## Domain Plan

Use:

- Webhook host: `api.kairoai.in`
- Webhook path: `/api/github/events`
- Full webhook URL after TLS: `https://api.kairoai.in/api/github/events`

Required DNS:

- `A api.kairoai.in -> 4.240.112.138`

Verified:

- `api.kairoai.in` resolves to `4.240.112.138` as of `2026-06-18 23:33:39 +05:30`.

Optional:

- `A kairoai.in -> 4.240.112.138`

## Azure Network Rules

The VM already has Nginx configured locally, and the VM firewall is not blocking traffic.

Open these inbound ports in the Azure NSG:

- `80/tcp` for HTTP and Let's Encrypt validation.
- `443/tcp` for HTTPS webhooks.
- Keep `22/tcp` restricted to trusted IPs where possible.

## Nginx

Current VM Nginx routes:

- `GET /health` -> API Gateway `http://127.0.0.1:8000/health`
- `POST /api/github/events` -> API Gateway `http://127.0.0.1:8000/api/github/events`

After DNS points to the VM, enable TLS with Certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.kairoai.in
```

## GitHub App Settings

Create the GitHub App in the `kairoai-in` organization.

Webhook URL:

```text
https://api.kairoai.in/api/github/events
```

Webhook secret:

- Generate a strong random value.
- Set it in API Gateway as `GITHUB_WEBHOOK_SECRET`.

Permissions:

- Repository contents: Read.
- Pull requests: Read and Write.
- Checks: Read and Write.
- Metadata: Read.

Events:

- `pull_request`

Pull request actions handled by API Gateway:

- `opened`
- `synchronize`
- `reopened`
- `ready_for_review`

## Runtime Secrets

API Gateway:

- `GITHUB_WEBHOOK_SECRET`
- `REVIEW_ORCHESTRATOR_URL`

GitHub Service:

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- Optional local/testing fallback: `GITHUB_TOKEN`

## Current Status

- Nginx is installed and configured on the Azure VM.
- DNS for `api.kairoai.in` resolves to the VM.
- Azure NSG does not currently allow public HTTP access to port `80`.
- HTTPS/TLS is pending until public HTTP is reachable for certificate validation.
- GitHub App has not been created yet.
