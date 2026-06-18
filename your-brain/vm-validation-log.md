# VM Validation Log

## 2026-06-18 19:44:20 +05:30 - Azure VM Local Integration Test

VM:

- Host: `kairo-test`
- OS: Ubuntu 24.04 on Azure
- Public IP: `4.240.112.138`

Validated:

- Installed Docker Engine and Docker Compose plugin.
- Installed Python virtual environment tooling.
- Started PostgreSQL and RabbitMQ with Docker Compose.
- Ran `kairoai-review-orchestrator` directly on port `8001`.
- Ran `kairoai-api-gateway` directly on port `8000`.
- Confirmed both `/health` endpoints returned `ok`.
- Sent mock GitHub pull request webhook to API Gateway.
- Confirmed API Gateway returned a `ReviewJob`.
- Confirmed Review Orchestrator persisted the review row in PostgreSQL.
- Restarted Review Orchestrator with `ENABLE_TASK_DISPATCH=true`.
- Started Celery worker connected to RabbitMQ.
- Confirmed `review.dispatch_analysis` placeholder task was received and completed by Celery.

Notes:

- Services were run directly with `PYTHONPATH` pointing at local repo copies to avoid placing a GitHub token on the VM.
- Docker Compose service image builds still require either a GitHub token for private `kairoai-shared` installs or a future packaging strategy for shared contracts.
- PostgreSQL and RabbitMQ were validated as local containers. Hosted production direction remains Azure PostgreSQL Flexible Server plus RabbitMQ/Celery.
