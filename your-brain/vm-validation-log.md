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

## 2026-06-18 19:54:27 +05:30 - GitHub Service Integration Test

Validated:

- Ran a mock GitHub API on the Azure VM.
- Ran `kairoai-github-service` on port `8002`.
- Pointed GitHub Service at the mock GitHub API.
- Ran API Gateway and Review Orchestrator against GitHub Service.
- Sent mock pull request webhook to API Gateway.
- Confirmed Review Orchestrator called GitHub Service for Terraform-only changed files.
- Confirmed `GET /reviews/{review_id}/terraform-files` returned `main.tf`.
- Confirmed `review_terraform_files` table stored the Terraform file metadata.

Proof:

- Review ID: `5bafa566-30dd-4da4-8d38-a7a97e873ec9`
- Persisted Terraform file: `main.tf`
