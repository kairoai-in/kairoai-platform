# Local Integration

This folder contains local/VM integration helpers.

## Run On A VM Or Dev Host

Create `.env` from `.env.example` and set `GITHUB_TOKEN` if Docker builds need to install private GitHub dependencies.

```powershell
docker compose up --build
```

## Send A Mock GitHub Webhook

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/api/github/events `
  -Headers @{ "X-GitHub-Event" = "pull_request"; "X-GitHub-Delivery" = "local-delivery-1" } `
  -ContentType "application/json" `
  -InFile .\local\mock-github-pr-webhook.json
```

Expected result:

- API Gateway returns `202`.
- Review Orchestrator creates a review row in PostgreSQL.
- Review Orchestrator asks GitHub Service for Terraform-only changed files.
- If `ENABLE_TASK_DISPATCH=true`, Review Orchestrator also dispatches the placeholder Celery task through RabbitMQ.
