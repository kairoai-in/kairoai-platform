# Application And Repository Plan

## Purpose

This file defines how we will proceed from idea to implementation.

The immediate goal is to plan the application, create the right repositories, and keep the architecture flexible enough to run on:

- Local Docker Compose for development and testing.
- Azure AKS for the first production direction.
- Other clouds later with limited application changes.

## Guiding Principles

- Build the MVP around the main product loop first: GitHub PR event -> Terraform analysis -> AI decision -> PR feedback.
- Keep cloud-specific logic outside application business logic.
- Package every service as a container.
- Keep service configuration environment-driven.
- Use adapters for GitHub, AI providers, scanners, storage, queues, and cloud services.
- Start with clear service boundaries, but avoid unnecessary complexity inside each service.
- Make local development easy before optimizing production infrastructure.

## Recommended Repository Strategy

Create separate repositories for major deployable services and platform areas.

Recommended first repositories:

| Repository | Purpose |
| --- | --- |
| `kairoai-platform` | Central planning, shared docs, architecture, local compose, platform coordination. |
| `kairoai-api-gateway` | Public API, health endpoint, GitHub webhook entrypoint, auth boundary. |
| `kairoai-github-service` | GitHub App installation handling, PR/file fetching, comments, checks, annotations. |
| `kairoai-review-orchestrator` | Review job creation, workflow state, service coordination, retry handling. |
| `kairoai-terraform-runner` | Terraform init/validate/plan/show JSON execution in isolated workspaces. |
| `kairoai-security-service` | Checkov first, later tfsec/Terrascan, normalized security findings. |
| `kairoai-cost-service` | Infracost execution, cost delta, optimization suggestions. |
| `kairoai-governance-service` | Tags, naming, regions, module version rules, organization policy checks. |
| `kairoai-ai-service` | Health score, merge decision, AI summary, recommendations, fix suggestions. |
| `kairoai-notification-service` | PR comments, GitHub check runs, status updates, future alerts. |
| `kairoai-shared` | Shared schemas, contracts, SDK clients, common test fixtures. |
| `kairoai-infra` | Azure infrastructure, AKS, Key Vault, ACR, PostgreSQL Flexible Server, storage, networking, identities, Terraform `azurerm`. |
| `kairoai-deployments` | Helm charts, Kubernetes manifests, environment overlays, release config. |

Optional later repositories:

| Repository | Purpose |
| --- | --- |
| `kairoai-dashboard` | Web dashboard for organization risk, review history, trends, and settings. |
| `kairoai-policy-packs` | Reusable governance policies and security rule packs. |
| `kairoai-examples` | Demo Terraform repos and sample PRs for testing. |
| `kairoai-docs` | Public docs site if docs outgrow platform repo. |

## Strong Recommendation

Create service repositories now, but implement the first MVP with strict API contracts and simple internals.

This gives us clean ownership boundaries without forcing us to solve every distributed-systems problem on day one.

For the first build, we should also keep a local integration environment in `kairoai-platform` using Docker Compose so the full product loop can run from one place.

## Service Responsibilities

### API Gateway

- Receive GitHub webhook events.
- Verify webhook signatures.
- Expose health and basic platform APIs.
- Forward valid events to the review orchestrator.
- Keep public request handling separate from internal job processing.

### GitHub Service

- Manage GitHub App interactions.
- Fetch pull request metadata and changed files.
- Clone or request repository content as needed.
- Create PR comments.
- Create and update check runs.
- Add future line-level annotations.

### Review Orchestrator

- Create review jobs.
- Track status across analysis steps.
- Coordinate Terraform, security, cost, governance, AI, and notification services.
- Handle retries and partial failures.
- Persist review history.

### Terraform Runner

- Prepare isolated job workspace.
- Run Terraform init, validate, plan, and show JSON.
- Return normalized Terraform change summaries.
- Avoid leaking credentials or raw sensitive plan output.

### Security Service

- Run Checkov for MVP.
- Normalize findings into one shared finding schema.
- Add tfsec and Terrascan later through scanner adapters.

### Cost Service

- Run Infracost.
- Produce monthly cost estimate, delta, and resource-level breakdown.
- Flag threshold-based warnings or blockers.

### Governance Service

- Evaluate required tags.
- Validate naming conventions.
- Check approved regions.
- Enforce module pinning and encryption rules.
- Load policy config from repository, organization defaults, or platform settings.

### AI Service

- Combine normalized inputs.
- Calculate Terraform Health Score.
- Produce merge gate decision: `APPROVED`, `WARNING`, or `BLOCKED`.
- Generate PR-ready review summary.
- Generate recommended fixes.

### Notification Service

- Publish PR review comment.
- Update GitHub check run status.
- Send future Slack, Teams, or email alerts.

### Shared Package

- Define shared contracts.
- Keep event schemas stable.
- Provide common clients and test fixtures.
- Prevent every service from inventing its own finding format.

## Cloud Portability Plan

The application should not directly depend on Azure SDKs except in infrastructure-facing adapters.

Use these abstractions:

| Need | Portable Interface | Azure First Implementation | Local/Test Implementation |
| --- | --- | --- | --- |
| Secrets | Secret provider | Azure Key Vault | `.env` or local secret file |
| Queue | Job/event queue | RabbitMQ with Celery | RabbitMQ container |
| Database | SQL persistence | Azure Database for PostgreSQL Flexible Server | PostgreSQL container |
| Object storage | Artifact store | Azure Blob Storage | Local filesystem or MinIO |
| Container runtime | OCI containers | AKS | Docker Compose |
| Identity | Workload identity | Azure Workload Identity | Local env credentials |
| Logs/metrics | Observability adapter | Azure Monitor/Application Insights | Console/OpenTelemetry collector |

## Azure Infrastructure Direction

First Azure target:

- AKS for running services.
- Azure Key Vault for secrets.
- Azure Database for PostgreSQL Flexible Server for durable platform state.
- RabbitMQ with Celery for MVP queueing and async jobs.
- Azure Container Registry for service images.
- Azure Blob Storage for non-sensitive artifacts if needed.
- Azure Monitor and Application Insights for logs, metrics, and traces.
- Azure Workload Identity for pod access to Azure resources.

Recommended infrastructure repository:

- `kairoai-infra`.

IaC direction:

- Terraform with the `azurerm` provider.
- Azure Storage Account remote state.

Recommended deployment repository:

- `kairoai-deployments`.

Deployment direction:

- Helm charts for AKS releases.

Keep these separate because infrastructure provisioning and Kubernetes release configuration change at different speeds.

## Local Development Plan

`kairoai-platform` should own the local integration environment:

- `docker-compose.yml` for all services.
- Local PostgreSQL.
- Local RabbitMQ.
- Local mock or sandbox GitHub webhook input.
- Local `.env.example`.
- Sample Terraform repositories or fixtures.

Each service repo should still run independently with:

- Unit tests.
- Linting.
- Dockerfile.
- Local service README.
- Contract tests against shared schemas.

## API And Event Contracts

Use shared contracts from `kairoai-shared`.

Initial events:

- `github.pull_request.received`.
- `review.created`.
- `terraform.analysis.completed`.
- `security.scan.completed`.
- `cost.estimate.completed`.
- `governance.evaluation.completed`.
- `ai.decision.completed`.
- `notification.published`.
- `review.completed`.
- `review.failed`.

Initial shared models:

- `ReviewJob`.
- `RepositoryRef`.
- `PullRequestRef`.
- `TerraformChange`.
- `Finding`.
- `CostEstimate`.
- `GovernanceResult`.
- `HealthScore`.
- `MergeDecision`.
- `Recommendation`.

## First Implementation Sequence

1. Create all first-wave repositories in the GitHub organization.
2. Add minimal README and service purpose to each repo.
3. Define shared schemas in `kairoai-shared`.
4. Build API Gateway webhook receiver.
5. Build GitHub Service for PR metadata and changed file detection.
6. Build Review Orchestrator with database-backed job state.
7. Build Terraform Runner with local fixture support.
8. Add Checkov scanning in Security Service.
9. Add Infracost in Cost Service.
10. Add simple governance checks.
11. Add deterministic scoring and merge gate rules.
12. Add AI-generated summary.
13. Publish PR comment and GitHub check run.
14. Wire local Docker Compose integration.
15. Add Azure infra plan and AKS deployment manifests.

## Suggested Tech Choices

Recommended backend:

- Python FastAPI for API-facing services.
- Python workers for scanner-heavy services.
- PostgreSQL for state.
- RabbitMQ with Celery for MVP queueing.
- Pydantic for contracts.
- OpenTelemetry for tracing.

Why:

- Terraform, Checkov, Infracost, and AI workflow integration fit well with Python.
- FastAPI gives simple OpenAPI docs and quick service scaffolding.
- Pydantic helps keep contracts strict across services.

Alternative:

- NestJS is also valid if the team prefers TypeScript across all services.

Current recommendation:

- Use Python for the MVP unless there is a strong team preference for Node.js.

## CI/CD Direction

Each service repo:

- Lint.
- Test.
- Build Docker image.
- Publish image to Azure Container Registry.
- Run dependency/security scans.

Platform/deployment repos:

- Validate Docker Compose.
- Validate Kubernetes manifests and Helm charts.
- Run Terraform plan for infra changes.
- Deploy to dev after merge.
- Use manual approvals for staging and production later.

## Key Decisions Needed Next

- Confirm repository list before creation.
- Confirm backend stack: Python FastAPI or Node.js NestJS.
- Confirm whether `kairoai-platform` remains a coordination repo only or also contains local compose and integration tests.
- Confirm hosted RabbitMQ strategy: RabbitMQ on AKS first or managed RabbitMQ-compatible broker later.

## My Recommendation For Next Step

Proceed like this:

1. Create the first-wave repositories listed above.
2. Keep `kairoai-platform` as the central coordination and local integration repo.
3. Use Python FastAPI for MVP services.
4. Use RabbitMQ with Celery locally and in MVP, while keeping broker details behind task/queue adapters.
5. Use Azure AKS, Key Vault, PostgreSQL Flexible Server, ACR, and Azure Monitor as the production direction.
6. Create `kairoai-shared` early so contracts stay clean before services diverge.
7. Delay dashboard, drift detection, module reuse, and auto-remediation until the PR review loop works end to end.
