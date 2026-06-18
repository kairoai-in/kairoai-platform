# Application Plan

## Product Loop

The first working loop should be:

1. GitHub pull request event arrives.
2. Platform detects changed Terraform files.
3. Review job is created.
4. Terraform validation runs.
5. Checkov scan runs.
6. Infracost estimate runs.
7. AI Intelligence creates summary, score, and merge decision.
8. Notification service posts a PR comment and status check.

## MVP Services

For the first implementation, prefer a simple service layout that can later split into separate deployable services.

Initial modules:

- API and GitHub webhook handler.
- Review orchestrator.
- GitHub client.
- Terraform analysis runner.
- Security scanner adapter.
- Cost analyzer adapter.
- Governance evaluator.
- AI decision engine.
- Notification publisher.

## API Surface

Initial endpoints:

- `GET /health`.
- `POST /api/github/events`.
- `POST /reviews`.
- `GET /reviews/{reviewId}`.
- `POST /reviews/{reviewId}/rerun`.

Internal service boundaries can be implemented as modules first, then promoted to services if needed.

## Data Model Draft

Key entities:

- `github_installation`.
- `repository`.
- `pull_request`.
- `review_job`.
- `terraform_change`.
- `finding`.
- `cost_estimate`.
- `governance_result`.
- `health_score`.
- `merge_decision`.
- `notification_event`.

## Health Score Categories

Initial category weights:

- Security: 35%.
- Governance: 20%.
- Cost Efficiency: 15%.
- Maintainability: 15%.
- Reusability: 10%.
- Drift Risk: 5%.

## Merge Gate Results

- `APPROVED`.
- `WARNING`.
- `BLOCKED`.

Initial block conditions:

- Critical security issue exists.
- Public database is detected.
- Storage is unencrypted.
- Cost increase exceeds configured threshold.
- Required governance tags are missing.

## Open Questions

- Should the first backend be Python FastAPI or Node.js NestJS?
- Which OpenAI model should power the first AI decision engine?
- Should the first implementation be a modular monolith or multiple services from day one?
- What is the first schema for normalized findings across Checkov, Infracost, and governance checks?
