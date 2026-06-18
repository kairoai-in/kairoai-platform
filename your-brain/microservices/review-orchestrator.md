# Review Orchestrator Service Plan

## Repository

- `kairoai-review-orchestrator`

## Purpose

Coordinate review jobs across all analysis services.

## Responsibilities

- Create review jobs.
- Persist job state.
- Dispatch analysis steps.
- Track retries, failures, and completion.
- Aggregate service outputs.
- Trigger AI decision and notification steps.

## MVP Endpoints

- `POST /reviews`
- `GET /reviews/{review_id}`
- `POST /reviews/{review_id}/rerun`
- `POST /reviews/{review_id}/events`

## Dependencies

- PostgreSQL.
- RabbitMQ with Celery.
- GitHub Service.
- Terraform Runner.
- Security Service.
- Cost Service.
- Governance Service.
- AI Service.
- Notification Service.
- Shared schemas.

## Configuration

- `DATABASE_URL`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`
- `GITHUB_SERVICE_URL`
- `TERRAFORM_RUNNER_URL`
- `SECURITY_SERVICE_URL`
- `COST_SERVICE_URL`
- `GOVERNANCE_SERVICE_URL`
- `AI_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`

## MVP Deliverables

- Review lifecycle model.
- PostgreSQL-backed review persistence.
- Changed Terraform file persistence.
- Database migrations before production rollout.
- Step orchestration.
- Celery task-dispatch foundation.
- Retry policy.
- Failure handling.
- Integration tests using mocked services.

## Implemented

- Creates shared-contract review jobs.
- Persists reviews in PostgreSQL.
- Calls GitHub Service to fetch Terraform-only changed files.
- Persists changed Terraform files.
- Exposes `GET /reviews/{reviewId}/terraform-files`.
- Dispatches placeholder Celery task when enabled.

## Risks

- Orchestration can become too complex if service contracts are unclear.
- Long-running Terraform jobs need timeouts and cancellation.
