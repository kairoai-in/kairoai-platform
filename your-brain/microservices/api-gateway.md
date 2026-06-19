# API Gateway Service Plan

## Repository

- `kairoai-api-gateway`

## Purpose

Provide the public entrypoint for KairoAI APIs and GitHub webhooks.

## Responsibilities

- Receive GitHub webhook events.
- Verify GitHub webhook signatures.
- Expose health and readiness endpoints.
- Validate incoming payloads.
- Create or forward review requests to the Review Orchestrator.
- Forward default-branch push events to repository baseline refresh.
- Enforce public API authentication later.

## MVP Endpoints

- `GET /health`
- `GET /ready`
- `POST /api/github/events`
- `POST /reviews`
- `GET /reviews/{review_id}`

## Dependencies

- Review Orchestrator.
- Shared schemas.
- Secret provider for webhook secret.
- Observability adapter.

## Configuration

- `PORT`
- `GITHUB_WEBHOOK_SECRET`
- `REVIEW_ORCHESTRATOR_URL`
- `LOG_LEVEL`
- `ENVIRONMENT`

## MVP Deliverables

- FastAPI service scaffold.
- Webhook signature validation.
- Request logging with correlation IDs.
- OpenAPI output.
- Dockerfile.
- Unit tests for signature validation and payload forwarding.

## Risks

- Incorrect webhook validation can allow forged events.
- Public API must stay small until auth is designed.

## Implemented

- `POST /api/github/events` for pull request webhooks.
- Supported pull request actions: `opened`, `synchronize`, `reopened`, `ready_for_review`.
- Supported push behavior: default-branch pushes refresh the repository security baseline.
- Non-default-branch pushes are accepted and ignored.
- Optional `X-Hub-Signature-256` verification when `GITHUB_WEBHOOK_SECRET` is configured.
- Forwarding to Review Orchestrator review creation.
