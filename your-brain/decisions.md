# Decisions

This file records meaningful product and engineering decisions.

## 2026-06-18 16:00:00 +05:30 - Create Platform Repository

Decision:

- Create `kairoai-in/kairoai-platform` as the first repository for the KairoAI platform.

Reason:

- The project needs one central starting point for platform code, architecture notes, and delivery plans.

Impact:

- Initial work will happen in this repo.
- Future repos can be created later for standalone services, infrastructure modules, examples, or documentation if the platform outgrows a monorepo.

## 2026-06-18 16:05:00 +05:30 - Store Working Memory In Repo

Decision:

- Create `your-brain` in the platform repo to store context, decisions, and plans as markdown files.

Reason:

- The project is early and evolving quickly. Keeping project memory in version control prevents decisions from being lost in chat.

Impact:

- Major decisions should be added to `your-brain/decisions.md`.
- Planning changes should be captured in the relevant plan file.

## 2026-06-18 16:05:00 +05:30 - Start With MVP-Oriented Platform Scope

Decision:

- Treat GitHub App integration, Terraform detection/validation, Checkov, Infracost, AI summary, health scoring, merge gate, and PR comments as the first MVP path.

Reason:

- These features prove the main product loop: detect a Terraform PR, analyze it, decide risk, and report back inside GitHub.

Impact:

- Drift detection, module reuse detection, dashboard, and auto-remediation stay out of the first build unless priorities change.

## 2026-06-18 17:10:24 +05:30 - Use Azure As First Production Infrastructure Direction

Decision:

- Plan first production infrastructure around Azure, especially AKS and Key Vault.

Reason:

- The platform needs a clear production target while application work is planned.

Impact:

- Infrastructure planning will assume AKS, Azure Key Vault, Azure PostgreSQL, Azure Container Registry, and Azure Monitor.
- Application services must remain portable through adapters so they can still run on Docker Compose locally and other clouds later.

## 2026-06-18 17:10:24 +05:30 - Plan Separate Microservice Repositories

Decision:

- Plan separate repositories for deployable microservices, shared contracts, infrastructure, and deployments.

Reason:

- The platform has clear service boundaries and will likely need independent service ownership, CI, and deployment paths.

Impact:

- `kairoai-platform` remains the coordination and local integration repo.
- First-wave service repositories should be created before implementation begins.

## 2026-06-18 17:10:24 +05:30 - Use Next.js For Future Dashboard

Decision:

- Use Next.js with TypeScript for the future dashboard frontend.

Reason:

- The dashboard will need organization settings, review history, risk summaries, trend charts, tables, and authenticated workflows.
- Next.js gives a strong API-driven frontend foundation and can be deployed independently.

Impact:

- The future frontend repository should be `kairoai-dashboard`.
- The first MVP can still ship without a dashboard by using GitHub PR comments and check runs as the primary user interface.

## 2026-06-18 17:10:24 +05:30 - Create Service-Level Plans And Schema Plan

Decision:

- Maintain one plan file per microservice and one shared schema/contracts plan.

Reason:

- The platform will have many moving pieces. Each service needs a clear responsibility, API surface, data ownership, dependencies, and MVP scope.

Impact:

- Service planning will live in `your-brain/microservices/`.
- Shared schemas and events will live in `your-brain/schema-and-contracts-plan.md`.
- Repository creation should follow these plans.

## 2026-06-18 17:25:49 +05:30 - Use Terraform Azurerm For Azure Infrastructure

Decision:

- Use Terraform with the `azurerm` provider for infrastructure as code.
- Store Terraform remote state in an Azure Storage Account.

Reason:

- Azure is the first production target, and Terraform with `azurerm` is the clearest path for provisioning AKS, Key Vault, ACR, PostgreSQL, storage, identities, and monitoring.
- Remote state in Azure Storage keeps state durable, centralized, and accessible from CI/CD.

Impact:

- The infrastructure repository should be `kairoai-infra`.
- The infra repo should include backend configuration for Azure Storage remote state.
- Infrastructure CI/CD should run Terraform format, validate, plan, and apply with environment controls.
- This is a current plan and can change if later requirements push us toward a different IaC strategy.

## 2026-06-18 17:25:49 +05:30 - Keep Terraform And Helm In Separate Repositories

Decision:

- Keep Azure infrastructure Terraform code in `kairoai-infra`.
- Keep Helm charts and Kubernetes deployment configuration in `kairoai-deployments`.

Reason:

- Terraform provisions Azure resources outside and around the cluster.
- Helm deploys application workloads inside AKS.
- These layers change at different speeds and should have separate review, promotion, and rollback paths.

Impact:

- `kairoai-infra` owns resource groups, AKS, Key Vault, ACR, PostgreSQL, storage accounts, networking, identities, and monitoring.
- `kairoai-deployments` owns Helm charts, values files, release config, ingress, external secret references, and workload identity annotations.
- CI/CD can independently plan/apply infra changes and package/deploy application releases.

## 2026-06-18 17:25:49 +05:30 - Build And Push Service Images To Azure Container Registry

Decision:

- Service CI/CD will test, build container images, and push them to Azure Container Registry.

Reason:

- ACR is the natural registry for AKS-based deployment and can integrate cleanly with Azure identities and deployment pipelines.

Impact:

- Each service repository should include GitHub Actions for linting, tests, Docker build, and image push.
- Deployment automation should deploy image tags from ACR using Helm.
- Local development should still support Docker Compose without depending on ACR.

## 2026-06-18 19:10:05 +05:30 - Build Shared Contracts First

Decision:

- Start implementation by expanding `kairoai-shared` with the first real domain contracts and fixtures.

Reason:

- Every service depends on consistent payloads for reviews, repositories, pull requests, Terraform changes, findings, costs, governance results, scores, decisions, recommendations, and events.

Impact:

- `kairoai-shared` now acts as the contract spine for the rest of the platform.
- API Gateway, GitHub Service, and Review Orchestrator should integrate these shared contracts next.

## 2026-06-18 19:15:40 +05:30 - Implement First Webhook To Review Contract Flow

Decision:

- Wire `kairoai-api-gateway` and `kairoai-review-orchestrator` to `kairoai-shared` contracts.
- Add the first flow where a GitHub pull request webhook becomes a `ReviewJob`.

Reason:

- This proves the first product heartbeat: GitHub event in, review job created out.

Impact:

- `kairoai-api-gateway` now accepts supported pull request events and forwards review creation requests.
- `kairoai-review-orchestrator` now creates and returns shared-contract `ReviewJob` records using an in-memory store for the first implementation.
- PostgreSQL-backed persistence and queue dispatch remain next-step work.

## 2026-06-18 19:17:38 +05:30 - Use Azure PostgreSQL Flexible Server For Persistence

Decision:

- Use Azure Database for PostgreSQL Flexible Server for hosted application persistence.
- Do not run PostgreSQL as an application pod in AKS for hosted environments.

Reason:

- Managed PostgreSQL gives stronger durability, backups, maintenance, and operational separation than running the database inside the application cluster.

Impact:

- `kairoai-infra` should provision Azure PostgreSQL Flexible Server.
- Application services should connect through environment-driven `DATABASE_URL` configuration.
- Local development can still use a PostgreSQL container through Docker Compose.

## 2026-06-18 19:17:38 +05:30 - Use RabbitMQ With Celery For Async Work

Decision:

- Use RabbitMQ with Celery for background jobs and async workflow dispatch.
- Do not use Azure Service Bus as the planned queue for the MVP.

Reason:

- Celery fits the Python service stack and scanner-heavy workloads well.
- RabbitMQ gives a portable broker that can run locally and in Azure-hosted environments.

Impact:

- `kairoai-review-orchestrator` should dispatch analysis and notification work through Celery tasks.
- RabbitMQ should be part of local Docker Compose.
- Hosted environments can start with RabbitMQ on AKS or a managed RabbitMQ-compatible service if selected later.
- Queue abstractions should still keep broker details out of business logic.
