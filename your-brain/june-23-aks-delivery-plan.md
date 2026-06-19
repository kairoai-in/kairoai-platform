# June 23 AKS Delivery Plan

## Goal

Deploy the current KairoAI MVP flow to Azure AKS with Terraform-managed infrastructure and Helm-managed workloads by 2026-06-23.

MVP flow to preserve:

- GitHub App webhook ingestion.
- PR changed Terraform file detection.
- Terraform validation check and annotations.
- Checkov security scan check and annotations.
- Default-branch security baseline classification.
- Unified idempotent PR comment.
- PostgreSQL-backed review state.
- RabbitMQ/Celery async worker flow.

## Scope Priority

### Must Have By June 23

- Azure Terraform dev environment for:
  - Resource group.
  - Azure Container Registry.
  - AKS.
  - Azure Key Vault.
  - Azure PostgreSQL Flexible Server.
  - Azure Storage Account for Terraform state.
  - Log Analytics / Azure Monitor basics.
- Helm values for active services:
  - API Gateway.
  - GitHub Service.
  - Review Orchestrator.
  - Review Worker.
  - Terraform Runner.
  - Security Service.
  - AI Service placeholder or health-only deployment if enrichment is not wired yet.
- RabbitMQ deployment strategy for MVP:
  - Prefer RabbitMQ in AKS for June 23 speed.
  - Keep broker config externalized so it can move later.
- NGINX ingress for `api.kairoai.in`.
- GitHub App webhook URL pointed at AKS ingress after validation.
- GitHub App `pull_request` and `push` event subscriptions enabled for PR reviews and default-branch baseline refresh.
- ACR image build/push path from CI or manual fallback.
- Runtime secrets stored outside git and loaded into AKS through Kubernetes secrets or Key Vault integration.
- End-to-end PR #2 validation against AKS.

### Should Have If Time Allows

- Azure AI Foundry config wired into AI Service, without blocking deterministic checks.
- AI enrichment endpoint stub with deterministic fallback.
- Baseline scheduling/refresh automation beyond the manual MVP endpoint.
- Basic dashboard placeholder service only if it does not risk deployment scope.

### Defer Until After June 23

- Full RAG pipeline.
- GitHub App onboarding UI.
- Advanced baseline scheduling, historical trend views, and organization-level baseline policy controls.
- Production-grade multi-tenant dashboard.
- Advanced sandbox isolation for customer repository execution.
- Cost service and governance service full implementation.

## Execution Plan

### June 19

- Finish documenting Azure/AWS provider focus and Azure AI Foundry direction.
- Freeze MVP service list for AKS deployment.
- Review Terraform and Helm gaps.
- Decide RabbitMQ-on-AKS for MVP unless a managed RabbitMQ option is immediately available.

### June 20

- Complete Terraform dev environment:
  - ACR.
  - AKS.
  - Key Vault.
  - PostgreSQL Flexible Server.
  - Networking basics.
  - Outputs needed by deployment.
- Add or validate remote state bootstrap.
- Add GitHub Actions or documented manual steps for Terraform plan/apply.

### June 21

- Build and push service images to ACR.
- Finalize Helm values for dev AKS.
- Deploy RabbitMQ, API services, worker, Terraform Runner, Security Service.
- Create Kubernetes secrets from current runtime env values.
- Validate internal service health.

### June 22

- Configure ingress/TLS for `api.kairoai.in`.
- Point GitHub App webhook to AKS endpoint.
- Run live PR validation against `example-terraform`.
- Fix AKS-specific runtime issues.
- Add basic monitoring/log access notes.

### June 23

- Stabilization day:
  - Re-run end-to-end PR success/failure tests.
  - Confirm check runs, annotations, PR comments.
  - Confirm PostgreSQL persistence.
  - Confirm worker retry/logging behavior.
  - Document deployment commands and known limitations.

## AKS Runtime Shape

Ingress:

- `api.kairoai.in` -> API Gateway service.

Internal services:

- API Gateway calls Review Orchestrator.
- API Gateway forwards default-branch push events to Review Orchestrator baseline refresh.
- Review Orchestrator/Celery calls GitHub Service, Terraform Runner, Security Service, AI Service later.
- GitHub Service calls GitHub APIs using GitHub App credentials.
- Terraform Runner and Security Service clone repositories using installation tokens.

State:

- PostgreSQL Flexible Server for review and analysis data.
- RabbitMQ for Celery broker.
- Kubernetes secrets or Key Vault-backed secrets for runtime credentials.

Images:

- ACR hosts one image per service repo.
- Helm values reference immutable tags for validation runs.

## Risk Controls

- Keep deterministic checks independent from AI.
- Do not block AKS deployment on Azure AI Foundry.
- Keep RabbitMQ swappable through environment config.
- Use GitHub PR #2 as the failing validation fixture.
- Keep the Azure VM as a fallback/debug reference until AKS flow is validated.

## Immediate Next Action

Move to application deployment readiness while Terraform details are paused:

1. Validate Helm rendering for all active services.
2. Add or confirm image build/push workflows for the six active services.
3. Add required GitHub Actions secrets to each active service repo:
   - `ACR_LOGIN_SERVER`
   - `ACR_USERNAME`
   - `ACR_PASSWORD`
   - `KAIROAI_PACKAGE_READ_TOKEN` if `kairoai-shared` remains private.
4. Define the runtime Kubernetes secret creation path from current VM values to `kairoai-runtime-secrets`.
5. Keep Terraform module implementation paused until exact IaC requirements are confirmed.
6. Resume `kairoai-infra` only after the Azure resource shape is confirmed.
