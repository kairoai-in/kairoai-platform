# Schema And Contracts Plan

## Purpose

Define shared schemas, events, API contracts, and compatibility rules before implementation begins.

The goal is to keep every microservice aligned while still allowing independent repositories and deployments.

## Repository

Planned repository:

- `kairoai-shared`

## Recommended Stack

- Python package for shared Pydantic models.
- JSON Schema export for language-neutral validation.
- OpenAPI fragments for HTTP APIs.
- Contract test fixtures for all service repositories.

Future option:

- Add TypeScript schema generation for `kairoai-dashboard`.

## Versioning

- Start with `v1alpha1` contracts during MVP.
- Use additive schema changes when possible.
- Never remove or rename a field without a version bump.
- Include `schema_version` on persisted events and integration payloads.
- Keep sample payloads beside each schema.

## Core Domain Models

### RepositoryRef

Fields:

- `provider`
- `owner`
- `repo`
- `default_branch`
- `clone_url`
- `installation_id`

### PullRequestRef

Fields:

- `number`
- `title`
- `head_sha`
- `base_sha`
- `head_branch`
- `base_branch`
- `author`
- `url`

### ReviewJob

Fields:

- `review_id`
- `repository`
- `pull_request`
- `status`
- `created_at`
- `updated_at`
- `started_at`
- `completed_at`
- `failure_reason`

Statuses:

- `CREATED`
- `RUNNING`
- `WAITING`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

### TerraformChange

Fields:

- `resource_address`
- `resource_type`
- `provider`
- `action`
- `before_summary`
- `after_summary`
- `risk_flags`

Actions:

- `CREATE`
- `UPDATE`
- `DELETE`
- `REPLACE`
- `NOOP`

### Finding

Fields:

- `finding_id`
- `source`
- `category`
- `severity`
- `title`
- `description`
- `resource_address`
- `file_path`
- `line_start`
- `line_end`
- `rule_id`
- `recommendation`
- `blocking`

Severity:

- `INFO`
- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### CostEstimate

Fields:

- `currency`
- `current_monthly_cost`
- `new_monthly_cost`
- `monthly_delta`
- `percentage_delta`
- `resource_costs`
- `threshold_result`

### GovernanceResult

Fields:

- `policy_id`
- `policy_name`
- `result`
- `findings`
- `metadata`

Results:

- `PASS`
- `WARN`
- `FAIL`

### HealthScore

Fields:

- `overall_score`
- `security_score`
- `governance_score`
- `cost_score`
- `maintainability_score`
- `reusability_score`
- `drift_score`
- `weights`
- `explanation`

### MergeDecision

Fields:

- `decision`
- `reason`
- `blocking_findings`
- `warnings`
- `required_actions`
- `confidence`

Decisions:

- `APPROVED`
- `WARNING`
- `BLOCKED`

### Recommendation

Fields:

- `recommendation_id`
- `category`
- `title`
- `description`
- `suggested_fix`
- `estimated_impact`
- `priority`

## Event Contracts

All events should include:

- `event_id`
- `event_type`
- `schema_version`
- `occurred_at`
- `producer`
- `correlation_id`
- `review_id`
- `payload`

Initial events:

- `github.pull_request.received`
- `review.created`
- `review.started`
- `terraform.analysis.completed`
- `security.scan.completed`
- `cost.estimate.completed`
- `governance.evaluation.completed`
- `ai.decision.completed`
- `notification.published`
- `review.completed`
- `review.failed`

## API Contract Rules

- Public service APIs must expose OpenAPI.
- Internal APIs should use shared models from `kairoai-shared`.
- Error responses should use one standard `ErrorResponse` schema.
- Every API should accept and return `correlation_id` for tracing.

## Testing Requirements

- Each service repo should include contract tests using shared fixtures.
- `kairoai-shared` should run schema validation tests.
- Breaking schema changes must fail CI unless a new version is introduced.

## Open Questions

- Should events initially move over Redis streams, Celery tasks, HTTP callbacks, or Azure Service Bus?
- Should the shared package publish to GitHub Packages, PyPI private registry, or be consumed by Git submodule/subtree during early MVP?
- How much raw Terraform plan data can safely be stored?
