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
- `POST /baselines/security`
- `POST /reviews/{review_id}/rerun`
- `POST /reviews/{review_id}/events`

## Dependencies

- PostgreSQL.
- Azure Service Bus for hosted dispatch.
- Celery/RabbitMQ for local compatibility while the migration is completed.
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
- `TASK_DISPATCH_PROVIDER`
- `SERVICE_BUS_CONNECTION_STRING`
- `SERVICE_BUS_QUEUE_NAME`
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
- Dispatches Celery analysis tasks when enabled.
- Calls Terraform Runner, Security Service, AI Service, and GitHub Service during the active review flow.
- Persists security scans and finding classification results.
- Persists repository security baselines from default-branch scans.
- Publishes separate Terraform and Security GitHub Check Runs with annotations.
- Updates the canonical idempotent PR comment.

## Risks

- Orchestration can become too complex if service contracts are unclear.
- Long-running Terraform jobs need timeouts and cancellation.
