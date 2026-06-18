# Microservice Plans

This directory stores one plan per service or deployable repository.

## First-Wave Repositories

- `api-gateway.md` - public API and GitHub webhook entrypoint.
- `github-service.md` - GitHub App API integration.
- `review-orchestrator.md` - review workflow coordination.
- `terraform-runner.md` - Terraform validation and plan execution.
- `security-service.md` - Checkov-first security scanning.
- `cost-service.md` - Infracost-based cost analysis.
- `governance-service.md` - tags, naming, regions, and policy checks.
- `ai-service.md` - scoring, merge decision, AI summaries, and recommendations.
- `notification-service.md` - PR comments and GitHub check runs.
- `shared.md` - shared schemas, events, fixtures, and contracts.
- `infra.md` - Azure infrastructure provisioning.
- `deployments.md` - Kubernetes and environment deployment config.

## Later Repository

- `dashboard.md` - Next.js frontend dashboard after the PR workflow MVP.

## Update Rule

When service scope changes, update that service file and add any firm decision to `../decisions.md` with a timestamp.
