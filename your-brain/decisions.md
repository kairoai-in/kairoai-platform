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

## 2026-06-18 19:27:59 +05:30 - Add VM-Ready Local Integration Stack

Decision:

- Add Docker Compose in `kairoai-platform` for VM/dev-host testing of API Gateway, Review Orchestrator, PostgreSQL, RabbitMQ, and a Celery worker.
- Add PostgreSQL persistence and Celery task-dispatch foundation to `kairoai-review-orchestrator`.

Reason:

- The local sandbox cannot run Docker or full service dependencies, but the platform needs a reproducible VM/dev-host path for integration testing.

Impact:

- Syntax checks can run locally in this workspace.
- Full runtime validation should run on a VM or dev host with Docker installed.
- Review persistence currently uses SQLAlchemy with startup table creation; Alembic migrations should replace this before production.

## 2026-06-18 19:44:20 +05:30 - Validate First Integration Flow On Azure VM

Decision:

- Treat the first VM validation as successful for the initial local integration stack.

Reason:

- API Gateway, Review Orchestrator, PostgreSQL persistence, RabbitMQ, and Celery all worked together on the Azure VM.

Impact:

- The next implementation step can move beyond platform plumbing into service behavior, starting with GitHub Service fetching changed pull request files.
- Docker image builds still need a secure private shared-package strategy before Compose can run all app services as containers.

## 2026-06-18 19:48:30 +05:30 - Implement GitHub Pull Request Metadata And File Contracts

Decision:

- Add `PullRequestFile` to `kairoai-shared`.
- Implement `kairoai-github-service` endpoints for pull request metadata and changed files.

Reason:

- The review workflow needs a service-owned way to fetch GitHub pull request details and identify changed Terraform files.

Impact:

- `kairoai-github-service` can now return shared-contract PR details and changed file lists.
- Changed-file responses default to Terraform-only files.
- Review Orchestrator can integrate GitHub Service next before dispatching Terraform analysis.

## 2026-06-18 19:54:27 +05:30 - Persist Terraform Files During Review Creation

Decision:

- Review Orchestrator should call GitHub Service during review creation to fetch Terraform-only changed files.
- Persist changed Terraform files in PostgreSQL before dispatching downstream analysis.

Reason:

- Terraform analysis, security scanning, cost estimation, and governance evaluation all need a stable list of changed Terraform files tied to the review.

Impact:

- Review Orchestrator now depends on `GITHUB_SERVICE_URL`.
- The local stack includes GitHub Service.
- A new `GET /reviews/{review_id}/terraform-files` endpoint exposes persisted Terraform files for the review.

## 2026-06-18 21:05:34 +05:30 - Prepare Real GitHub App Integration

Decision:

- Add GitHub webhook signature verification in API Gateway.
- Add GitHub App JWT generation and installation-token exchange in GitHub Service.

Reason:

- Before creating the real GitHub App, the platform needs secure webhook verification and installation-scoped GitHub API access.

Impact:

- API Gateway can validate `X-Hub-Signature-256` when `GITHUB_WEBHOOK_SECRET` is configured.
- GitHub Service can generate GitHub App JWTs and exchange them for installation tokens.
- The next milestone is creating the actual GitHub App in the GitHub organization and pointing its webhook URL at the VM/API Gateway.

## 2026-06-18 21:16:02 +05:30 - Use Api Subdomain For GitHub App Webhook

Decision:

- Use `api.kairoai.in` as the stable public API host for the GitHub App webhook.
- Use `https://api.kairoai.in/api/github/events` as the planned GitHub App webhook URL.
- Use Nginx on the Azure VM as the current reverse proxy for the test window.

Reason:

- A stable domain lets the GitHub App configuration stay the same while the backend moves from VM testing to AKS ingress later.
- Nginx gives a simple, production-like reverse proxy path for validating webhook delivery before the full AKS/Helm setup exists.

Impact:

- DNS must add `A api.kairoai.in -> 4.240.112.138` for the current VM.
- Azure NSG must allow inbound `80/tcp` and `443/tcp` before public HTTP/TLS validation can work.
- After DNS and NSG are ready, Certbot can issue TLS for `api.kairoai.in`.
- API Gateway should keep verifying `X-Hub-Signature-256` using `GITHUB_WEBHOOK_SECRET`.
- GitHub Service and Review Orchestrator should prefer installation-scoped GitHub API calls when a webhook includes `installation.id`.

## 2026-06-18 23:33:39 +05:30 - Verify Api Subdomain DNS

Decision:

- Treat `api.kairoai.in` DNS setup as complete for the current VM test endpoint.

Reason:

- DNS resolution now returns `4.240.112.138`, which matches the Azure VM public IP.

Impact:

- The remaining blocker for public webhook validation is Azure network access, not DNS.
- Azure NSG still needs inbound `80/tcp` and `443/tcp` rules before Certbot and GitHub webhook delivery can be validated publicly.

## 2026-06-18 23:39:05 +05:30 - Enable HTTPS For Api Subdomain

Decision:

- Enable HTTPS for `api.kairoai.in` using Let's Encrypt Certbot with the Nginx plugin on the Azure VM.
- Redirect HTTP traffic to HTTPS.

Reason:

- GitHub App webhooks should use a public HTTPS endpoint.
- TLS on the stable API subdomain lets us create the GitHub App now and later move the same host behind AKS ingress.

Impact:

- `https://api.kairoai.in/health` is publicly reachable and returns API Gateway health.
- `http://api.kairoai.in/health` redirects to HTTPS.
- The current certificate expires on `2026-09-16 17:10:05 UTC`.
- Certbot renewal is scheduled on the VM.
- The next step is creating the GitHub App in `kairoai-in` and setting `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_ID`, and `GITHUB_APP_PRIVATE_KEY` in runtime configuration.

## 2026-06-19 00:05:28 +05:30 - Wire GitHub App Runtime Secrets On VM

Decision:

- Store GitHub App runtime secrets in `/home/azureuser/kairoai/runtime.env` on the Azure VM with `600` permissions.
- Start API Gateway, GitHub Service, Review Orchestrator, and Celery through a small VM launcher that loads the runtime env safely.

Reason:

- The GitHub App private key is stored as an escaped single-line dotenv value and should not be sourced directly by shell.
- Runtime secrets need to be available to the VM for real webhook verification and GitHub App installation token exchange.

Impact:

- GitHub Service can generate a GitHub App JWT from the VM runtime env.
- API Gateway now enforces `X-Hub-Signature-256` using `GITHUB_WEBHOOK_SECRET`.
- Public HTTPS verification passed:
- Unsigned webhook request returned `401 Missing signature`.
- Correctly signed unsupported webhook event returned `202 Ignored unsupported GitHub event`.
- The next validation step is redelivering a real GitHub App webhook from GitHub or triggering a pull request event in an installed repository.

## 2026-06-19 00:11:08 +05:30 - Create Example Terraform Repository For App Validation

Decision:

- Create `kairoai-in/example-terraform` as a private test repository.

Reason:

- The GitHub App needs an installed repository where we can trigger real pull request webhooks.
- A lightweight Terraform repo gives KairoAI changed `.tf` files to detect without needing cloud credentials.

Impact:

- The repository default branch is `main`.
- The repo contains a minimal `null_resource` Terraform configuration.
- After the GitHub App is installed on this repo, creating or updating a pull request should trigger the first real end-to-end review flow.

## 2026-06-19 07:22:42 +05:30 - Add First Real Terraform Validation Worker Path

Decision:

- Add a `POST /terraform/validate` API to `kairoai-terraform-runner`.
- Replace the Review Orchestrator Celery placeholder with a call to Terraform Runner.
- Persist Terraform validation results in Review Orchestrator PostgreSQL storage.

Reason:

- The webhook-to-review flow is proven, and the next useful product behavior is validating changed Terraform automatically.
- Keeping Terraform execution in a dedicated service preserves isolation from orchestration and prepares for later plan/security/cost workers.

Impact:

- Shared contracts now include `TerraformValidationRequest`, `TerraformValidationResult`, `TerraformCommandResult`, and `TerraformValidationStatus`.
- Terraform Runner can clone an installed GitHub App repository using installation-scoped credentials and run `terraform init -backend=false`, `terraform fmt -check -recursive`, and `terraform validate -no-color`.
- Review Orchestrator exposes `GET /reviews/{review_id}/terraform-validation` for the latest persisted validation result.
- Local Compose now includes `terraform-runner` on port `8003` and wires `TERRAFORM_RUNNER_URL` into Review Orchestrator and the Celery worker.

## 2026-06-19 07:50:54 +05:30 - Publish Terraform Validation As GitHub Check Run

Decision:

- Publish Terraform validation results back to GitHub as a completed Check Run named `KairoAI Terraform Validation`.

Reason:

- GitHub checks are the clearest MVP feedback surface for pull request validation.
- Checks can later become required branch protection gates, while PR comments can remain richer human-readable summaries.

Impact:

- GitHub Service now owns installation-scoped Check Run creation.
- Review Orchestrator publishes the check after Terraform validation is persisted.
- `PASSED` maps to GitHub `success`, `FAILED` maps to `failure`, and runtime `ERROR` maps to `neutral` for the first MVP behavior.
- The real `example-terraform` PR flow created a passing `KairoAI Terraform Validation` check on PR `#1`.

## 2026-06-19 08:16:28 +05:30 - Add GitHub App Logo And PR Validation Comments

Decision:

- Store the generated GitHub App logo at `docs/assets/kairoai-logo-github-app.png`.
- Publish a concise PR comment after Terraform validation, in addition to the GitHub Check Run.

Reason:

- The GitHub App needs a recognizable app avatar for trust and polish.
- Check Runs are good for merge status, while PR comments explain validation outcomes directly in the conversation.

Impact:

- GitHub Service now supports installation-scoped issue/PR comment creation.
- Review Orchestrator publishes a markdown summary containing status, changed Terraform files, and command exit codes.
- The real failing PR flow on `example-terraform` PR `#2` posted a KairoAI validation comment and a failing check.

## 2026-06-19 09:25:35 +05:30 - Make Validation PR Comments Idempotent

Decision:

- Add a hidden marker to KairoAI Terraform validation PR comments.
- Update the existing marked comment on later runs instead of creating a new comment each time.

Reason:

- Pull requests can receive many `synchronize` webhooks. Reposting the same summary every run would create noisy PR conversations.
- A stable marker keeps the implementation simple while preserving a readable visible comment body.

Impact:

- GitHub Service now supports issue comment upsert by marker.
- Review Orchestrator sends marker `<!-- kairoai:terraform-validation -->` with validation comment requests.
- Future validation runs update the marked KairoAI comment when present.

## 2026-06-19 09:51:25 +05:30 - Maintain Helm Values In Parallel With Runtime Flow

Decision:

- Maintain Helm chart values in parallel with service implementation for the active validated runtime path.
- Use the reusable `kairoai-service` chart for API services and worker processes.

Reason:

- Deployment shape should not lag too far behind application behavior.
- Helm values should describe real, validated services rather than speculative future components.

Impact:

- Dev values now cover API Gateway, GitHub Service, Review Orchestrator, Terraform Runner, and Review Worker.
- Runtime secrets are represented as Kubernetes secret references to `kairoai-runtime-secrets`.
- Azure Key Vault integration remains the planned production secret source through External Secrets or CSI Secrets Store.
- Branch protection docs now define `KairoAI Terraform Validation` as the first required-check candidate.

## 2026-06-19 10:03:55 +05:30 - Add Security Service To Review Analysis Fan-Out

Decision:

- Add `kairoai-security-service` as the next analysis worker after Terraform validation.
- Start security scanning with Checkov and normalize results into shared `Finding` contracts.

Reason:

- Terraform validation proves syntax and formatting, but the product also needs security findings to deliver meaningful infrastructure review value.
- Checkov is a practical first scanner for Terraform IaC and can run locally, in Docker, and in AKS.

Impact:

- Shared contracts now include `SecurityScanRequest`, `SecurityScanResult`, and `SecurityScanStatus`.
- Security Service exposes `POST /security/scan`.
- Review Orchestrator calls Security Service from the Celery review task and persists `security_scan_results`.
- PR comments can include security scan status and blocking findings.
- Platform Compose and dev Helm values now include `security-service`.

## 2026-06-19 13:23:04 +05:30 - Split Terraform And Security GitHub Checks

Decision:

- Publish Terraform validation and security scanning as separate GitHub Check Runs:
  - `KairoAI Terraform Validation`
  - `KairoAI Security Scan`

Reason:

- Terraform syntax/format failures and security findings are different gate categories.
- Separate check names let branch protection require each gate independently.
- The PR comment should stay unified for readability, while checks remain machine-gateable.

Impact:

- Review Orchestrator now publishes two Check Runs after a review analysis task finishes.
- The canonical PR comment still combines Terraform and Security summaries.
- `example-terraform` PR `#2` now shows both checks failing independently on the same commit.

## 2026-06-19 14:39:00 +05:30 - Add Inline GitHub Check Annotations For Security Findings

Decision:

- Add GitHub Check Run annotations for normalized security findings when a finding has a file path and line number.
- Start annotations with `KairoAI Security Scan`; defer Terraform fmt/validate annotations until command output parsing is richer.

Reason:

- PR comments are useful summaries, but inline annotations put findings where developers review code.
- Checkov already provides enough file and line metadata for the first security annotation path.
- GitHub limits annotations per Check Run request, so the MVP caps annotations at 50.

Impact:

- GitHub Service forwards `output.annotations` when creating Check Runs.
- Review Orchestrator maps security finding severities to GitHub annotation levels.
- `example-terraform` PR `#2` shows 11 inline annotations on `security_fixture.tf`.

## 2026-06-19 14:55:00 +05:30 - Make Azure And AWS First-Class MVP Providers

Decision:

- Focus the MVP security/governance experience on Azure and AWS first.
- Keep shared findings, scanner interfaces, comments, checks, and dashboard plans provider-extensible.

Reason:

- Azure is the primary deployment and customer-cloud target for the current platform direction.
- AWS is useful for broad Terraform coverage and known Checkov validation fixtures.
- Hardcoding only one provider would make the product brittle; trying to polish every provider now would slow the MVP.

Impact:

- Security fixtures should include both `CKV_AZURE_*` and `CKV_AWS_*` examples.
- AI enrichment should eventually produce provider-specific remediation examples for Azure and AWS.
- Governance policies should start with Azure/AWS naming, tagging, region, encryption, and network exposure rules.
- GCP, Kubernetes, Helm, and other IaC frameworks remain supported by the normalized model but are not first-class MVP polish targets yet.

## 2026-06-19 15:05:00 +05:30 - Use Azure AI Foundry For AI Enrichment

Decision:

- Use Azure AI Foundry as the primary MVP provider for AI-generated explanations, recommendations, and fix suggestions.
- Keep AI provider configuration behind `AI_PROVIDER` so the service remains adaptable later.

Reason:

- The platform is Azure-first for infrastructure and operations.
- Azure AI Foundry aligns naturally with Azure Key Vault, Azure identity, and the planned AKS production deployment.
- Deterministic scanners and policy engines should still decide pass/fail; AI should explain findings and recommend fixes.

Impact:

- `kairoai-ai-service` defaults to `AI_PROVIDER=azure_ai_foundry`.
- Runtime configuration will use Azure AI Foundry endpoint, deployment/model, API version, and secret-backed credentials.
- Review Orchestrator should call AI Service after deterministic analysis to enrich PR comments, not to determine merge gates.

## 2026-06-19 15:25:50 +05:30 - Prioritize AKS Delivery For June 23

Decision:

- Prioritize Azure AKS/IaC deployment readiness over deeper RAG, dashboard, and baseline classification work until the June 23 deployment target is met.
- Keep baseline/RAG in the architecture direction, but do not let it block the deployable MVP.

Reason:

- The current PR analysis loop is validated on the Azure VM and needs to be promoted to AKS.
- AKS deployment requires coordinated Terraform, ACR images, Helm values, secrets, ingress, and live GitHub App validation.
- New-vs-existing baseline analysis and RAG will be more useful after the core platform runs in the target environment.

Impact:

- Immediate work shifts to `kairoai-infra` and `kairoai-deployments`.
- RabbitMQ on AKS is acceptable for MVP speed, with broker configuration kept externalized for future replacement.
- AI Service can deploy as health-only or enrichment-ready, but deterministic Terraform/Security checks remain the release-critical path.

## 2026-06-19 15:45:00 +05:30 - Add AI Finding Enrichment Contract And Fallback

Decision:

- Add a first AI enrichment endpoint for finding explanations: `POST /ai/findings/explain`.
- Use deterministic fallback recommendations until Azure AI Foundry credentials and adapter behavior are finalized.
- Wire Review Orchestrator to call AI Service after Security Service and include concise recommendations in the PR comment.

Reason:

- Deterministic scanners should continue to own pass/fail decisions.
- Users need plain-English remediation guidance in addition to raw Checkov rule names.
- A fallback keeps the product useful if Azure AI Foundry is not configured or temporarily unavailable.

Impact:

- Shared contracts now include finding explanation request/result models.
- AI Service can explain Checkov findings through fallback recommendation templates.
- Review Orchestrator now has `AI_SERVICE_URL` and appends AI recommendations to the canonical PR comment when findings exist.
- Helm dev values include `kairoai-ai-service` and AI Service wiring.

## 2026-06-19 16:00:00 +05:30 - Classify New And Existing Findings

Decision:

- Add stable finding fingerprints and classify security findings as `NEW` or `EXISTING` against the latest prior scan for the same PR.
- Show finding classification counts in the canonical PR comment.

Reason:

- Teams need to understand whether a PR introduces new risk or repeats already-seen findings.
- This creates the data shape needed for default-branch baselines, dashboards, and future merge gate rules.
- Starting with prior PR scan comparison is safe and useful before implementing full default-branch baseline jobs.

Impact:

- Shared contracts include `ClassifiedFinding`, `FindingClassificationResult`, and `FindingClassificationValue`.
- Review Orchestrator persists finding classification results.
- PR comments now include `New findings`, `Existing findings`, and `Resolved findings` counts.
- Full default-branch baseline comparison remains a follow-up.

## 2026-06-19 16:15:00 +05:30 - Keep Checkov Primary And Add Scanner Abstraction

Decision:

- Keep Checkov as the primary MVP IaC security scanner.
- Add a security scanner abstraction and scanner selection config instead of hardwiring the API directly to `CheckovScanner`.
- Do not add standalone tfsec; prefer Trivy IaC later if a second scanner is needed.

Reason:

- Checkov is already validated end-to-end with Terraform, GitHub checks, annotations, AI recommendations, and finding classification.
- tfsec has effectively moved into the broader Trivy ecosystem, so standalone tfsec is not the best long-term add.
- A scanner abstraction lets the security service add Trivy IaC later without changing the API contract.

Impact:

- `kairoai-security-service` now has a `SecurityScanner` protocol and scanner factory.
- `SECURITY_SCANNERS=checkov` is the default scanner config.
- Helm dev values explicitly set `SECURITY_SCANNERS=checkov`.

## 2026-06-19 16:20:00 +05:30 - Validate Azure And AWS Checkov Findings

Decision:

- Keep AWS and Azure as first-class MVP provider fixtures.
- Use intentionally insecure Terraform fixtures in `example-terraform` to validate `CKV_AWS_*` and `CKV_AZURE_*` findings through the same pipeline.

Reason:

- The product direction is Azure/AWS first, with room for other providers.
- Provider-specific fixtures prove that normalized findings, annotations, AI recommendations, and classification remain provider-flexible.

Impact:

- `example-terraform` PR `#2` now contains AWS S3 and Azure Storage Account security fixtures.
- The live PR flow produced both AWS and Azure findings in one scan.
- The PR comment shows Azure findings as new and prior AWS findings as existing.

## 2026-06-19 18:25:52 +05:30 - Add Default Branch Security Baselines

Decision:

- Add a repository security baseline path that scans the default branch and stores the result separately from PR scans.
- Prefer the latest default-branch baseline when classifying PR security findings as new, existing, or resolved.

Reason:

- Comparing only against prior scans for the same PR can hide newly introduced risk after the first run.
- A clean main-branch baseline lets the PR comment answer the product-critical question: what risk does this change introduce relative to the protected branch?

Impact:

- Shared security scan requests now support `scan_all=true` for full repository scans.
- Review Orchestrator exposes `POST /baselines/security` and persists repository baseline results.
- PR finding classification now uses the repository baseline first and falls back to the latest prior PR scan when no baseline exists.
- The live `example-terraform` PR `#2` now reports all 22 Azure/AWS fixture findings as new against the clean `main` baseline.

## 2026-06-19 18:35:00 +05:30 - Refresh Security Baseline From Default-Branch Push Webhooks

Decision:

- Handle GitHub `push` webhooks in API Gateway when the push targets the repository default branch.
- Forward default-branch pushes to Review Orchestrator's security baseline endpoint.
- Continue ignoring non-default-branch pushes.

Reason:

- Default branch baselines should update when protected branch code changes, without requiring manual API calls.
- PR webhooks should stay focused on review creation, while push webhooks maintain repository baseline state.

Impact:

- `kairoai-api-gateway` now routes `pull_request` events to review creation and default-branch `push` events to baseline refresh.
- The public `https://api.kairoai.in/api/github/events` endpoint was validated with a signed synthetic default-branch push payload.
- The GitHub App should keep `Push` event subscriptions enabled for automatic baseline refresh.

## 2026-06-19 19:35:00 +05:30 - Prepare Service CI For ACR Image Publishing

Decision:

- Extend the six active service CI workflows to build Docker images and publish to ACR on `main` when ACR secrets are configured.
- Keep PR/main tests and local Docker image builds required regardless of ACR availability.
- Skip ACR publishing with a workflow notice when ACR secrets are not present.

Reason:

- AKS deployment needs immutable service images in ACR.
- We do not have final ACR credentials yet, so CI should stay green while still being ready to publish once secrets are added.
- Private `kairoai-shared` installs need a package-read token in each service repo.

Impact:

- Active service workflows now expect optional `ACR_LOGIN_SERVER`, `ACR_USERNAME`, and `ACR_PASSWORD` secrets.
- `KAIROAI_PACKAGE_READ_TOKEN` was added as a repo-level GitHub Actions secret for the six active service repos.
- Current CI validates tests and Docker builds; ACR push starts automatically after ACR secrets are added.

## 2026-06-19 19:50:00 +05:30 - Bootstrap Dev ACR For AKS Images

Decision:

- Manually bootstrap the dev Azure Container Registry while Terraform implementation remains paused.
- Use `acrkairoaidev.azurecr.io` in resource group `rg-kairoai-dev`.
- Keep ACR admin user disabled and use a scoped service principal with `AcrPush` for GitHub Actions publishing.

Reason:

- Service images need a real ACR before AKS deployment validation.
- Creating only the resource group and Basic ACR keeps the manual Azure footprint small while IaC details are still being finalized.
- A scoped push identity is safer than enabling the registry admin account.

Impact:

- Six active service repos now have `ACR_LOGIN_SERVER`, `ACR_USERNAME`, and `ACR_PASSWORD` Actions secrets.
- Six active service images were pushed to ACR with both immutable SHA tags and `dev` tags.
- Dev Helm values now point to `acrkairoaidev.azurecr.io`.
- When Terraform resumes, this manually bootstrapped ACR should either be imported into state or replaced intentionally.
