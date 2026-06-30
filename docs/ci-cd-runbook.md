# KairoAI CI/CD Runbook

Last updated: 2026-06-24 13:25:49 +05:30

## Scope

This document records the current CI/CD design for KairoAI application repositories and Terraform infrastructure.

Application repositories:

- `kairoai-api-gateway`
- `kairoai-github-service`
- `kairoai-review-orchestrator`
- `kairoai-terraform-runner`
- `kairoai-security-service`
- `kairoai-cost-service`
- `kairoai-governance-service`
- `kairoai-ai-service`
- `kairoai-notification-service`
- `kairoai-dashboard`

Infrastructure and deployment repositories:

- `kairoai-infra`
- `kairoai-deployments`

## Branch Strategy

Application repositories:

- `main` is the primary integration branch.
- `ci/app-pipeline` is the persistent pipeline work branch for CI/CD rollout and fixes.
- Short-lived future branches should use `feature/*`, `fix/*`, `chore/*`, `test/*`, or `ci/*`.
- Do not delete `ci/app-pipeline` yet because pipeline work may continue there.

Terraform repository:

- `hub` maps to hub subscription changes.
- `test` maps to test spoke subscription changes.
- `main` maps to production subscription changes.
- `azure/*` is the short-lived branch pattern for Terraform changes.

Deployment repository:

- `test` receives test image tag updates from service pipelines.
- `prod` is reserved for production image promotion.
- `main` is reserved for shared or stable deployment state after ArgoCD branch watching is finalized.

## Application PR Pipeline

Application PR checks run on pull requests into `main`.

Backend services run:

- Unit/lint checks.
- Docker build smoke test.
- SonarCloud report.
- Snyk report.
- Slack/email failure notification when quality gates fail.

Dashboard runs:

- `npm ci`.
- `npm run lint`.
- `npm run build`.
- Docker build smoke test.
- SonarCloud report.
- Snyk npm report.
- Slack/email failure notification when quality gates fail.

Ordering:

- Backend: unit/lint -> SonarCloud -> Snyk -> notify on failure.
- Dashboard: npm/lint/build/Docker smoke -> SonarCloud -> Snyk npm -> notify on failure.

## Application Merge Pipeline

After an approved PR is merged to `main`, each application repository runs its image promotion workflow:

- Build Docker image.
- Authenticate to Azure with GitHub OIDC.
- Push immutable SHA tag and `dev` tag to shared ACR.
- Run Trivy image scan in report-only mode.
- Update the matching Helm test values file in `kairoai-deployments` branch `test`.
- Send Slack/email notification if image build, ACR push, or Helm values update fails.

Current shared ACR:

- `acrkairoaihubci.azurecr.io`

Helm test values are updated under:

- `kairoai-deployments/envs/dev/*.values.yaml`

## GitHub OIDC And Azure Access

Each application repository has its own Entra application/service principal for GitHub Actions OIDC.

Pattern:

- App display name: `app-<repo-name>-github-actions`
- Federated subjects:
  - `repo:kairoai-in/<repo-name>:pull_request`
  - `repo:kairoai-in/<repo-name>:ref:refs/heads/main`
  - `repo:kairoai-in/<repo-name>:ref:refs/heads/ci/app-pipeline`
- Azure role:
  - `AcrPush` scoped to hub ACR.

Required repository secrets:

- `ACR_LOGIN_SERVER`
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `HELM_REPO_TOKEN`
- `AUTO_PR_TOKEN`
- `SONAR_TOKEN`
- `SNYK_TOKEN`
- `SLACK_INCOMING_WEBHOOK`
- `KAIROAI_PACKAGE_READ_TOKEN` for Python services that install private shared packages.

Old static ACR secrets may still exist in some repositories:

- `ACR_USERNAME`
- `ACR_PASSWORD`

They are no longer used by updated workflows and should be removed after one stable release cycle.

## Approval Model

Current approval model:

- PRs are approved manually from `ElzabethOps`.
- `CODEOWNERS` points to `@kairoai-in/reviewer`.
- One approval is expected before merge.
- `ci/app-pipeline` is kept after merge.

Important limitation:

- Some private repository branch protection and required review enforcement needs a paid GitHub plan.
- Until that is upgraded, approval is process-enforced rather than fully GitHub-enforced.
- Do not make application repositories public just for enforcement unless explicitly approved.

## Terraform Pipeline

`kairoai-infra` has separate Terraform PR and apply paths.

PR checks run sequentially:

- `terraform fmt`
- `terraform validate`
- Checkov security scan
- Terraform plan
- OPA policy checks
- Failure notification

Apply behavior:

- Apply is environment-aware by branch.
- Apply requires the matching label, merged PR state, and reviewer approval process.
- `hub`, `test`, and `main/prod` use separate remote state containers:
  - `hubtfstate`
  - `testtfstate`
  - `prodtfstate`

Terraform pipelines are structurally complete, but infrastructure modules and resources will continue to evolve as the hub-spoke architecture is finalized.

## Completed Rollout

Backend microservices completed and verified end-to-end:

- `kairoai-api-gateway`
- `kairoai-github-service`
- `kairoai-review-orchestrator`
- `kairoai-terraform-runner`
- `kairoai-security-service`
- `kairoai-cost-service`
- `kairoai-governance-service`
- `kairoai-ai-service`
- `kairoai-notification-service`

Frontend completed and verified end-to-end:

- `kairoai-dashboard`

For each completed repository:

- PR checks passed.
- PR was approved from `ElzabethOps`.
- PR was merged without deleting `ci/app-pipeline`.
- Post-merge image workflow succeeded.
- Image was pushed to ACR using OIDC.
- Helm test values update succeeded.

## Next Improvements

- Enable enforceable branch protection once the GitHub plan supports private repo rules.
- Remove unused static ACR username/password secrets after confirming OIDC remains stable.
- Add production promotion workflows that update `kairoai-deployments` `prod` branch.
- Add ArgoCD sync validation once final branch watching is configured.
- Add signed image or provenance controls if required for production governance.
- Add reusable workflow templates or composite actions to reduce duplicated YAML across services.
