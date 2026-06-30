# KairoAI CI/CD Workflow Architecture Notes

Diagram: `kairoai-ci-cd-workflow-architecture.excalidraw`

Generator: `generate-ci-workflow-architecture.mjs`

## Scope

The architecture applies to these image-producing repositories:

- `kairoai-dashboard`
- `kairoai-api-gateway`
- `kairoai-github-service`
- `kairoai-review-orchestrator`
- `kairoai-terraform-runner`
- `kairoai-security-service`
- `kairoai-cost-service`
- `kairoai-governance-service`
- `kairoai-ai-service`
- `kairoai-notification-service`

`kairoai-review-worker` is deployed separately but uses the review-orchestrator image. `kairoai-shared` is a library repository and runs library CI without an image release workflow.

## Workflow Files

| File | Responsibility |
| --- | --- |
| `.github/workflows/auto-pr.yml` | Opens a PR from supported short-lived branches into `main`. |
| `.github/workflows/ci.yml` | Runs PR verification and calls reusable SonarCloud and Snyk workflows. |
| `.github/workflows/ci-sonar-check.yaml` | Runs SonarCloud analysis and exposes a quality-gate output. |
| `.github/workflows/ci-snyk-check.yaml` | Runs Python or npm dependency scanning and exposes a scan result. |
| `.github/workflows/ci-build.yaml` | Runs after merge to `main`, builds the test image, and updates Helm test values. |
| `.github/workflows/ci-docker-build.yaml` | Authenticates to Azure with OIDC, builds/scans images, and pushes to ACR. |
| `.github/workflows/cd-helm-test.yaml` | Updates the service image tag on the deployments `test` branch. |
| `.github/workflows/release.yaml` | Promotes an existing immutable ACR image to versioned production tags and opens a deployments `prod` PR. |
| `.github/actions/notification-action/action.yaml` | Sends optional SMTP email and Slack failure notifications. |
| `kairoai-deployments/.github/workflows/helm.yml` | Lints Helm, renders manifests, runs kubeconform, and reports Checkov policy findings. |

## End-to-End Flow

### 1. Short-Lived Branch to Pull Request

1. A developer pushes `ci/**`, `feature/**`, `fix/**`, `chore/**`, or `test/**`.
2. `auto-pr.yml` checks whether an open PR already exists.
3. If missing, it creates a PR into protected `main` using `AUTO_PR_TOKEN` or `GITHUB_TOKEN`.
4. Branch protection requires the PR path and an independent reviewer approval before merge.

### 2. Pull Request Verification

Backend repositories run:

1. Python 3.11 setup and pip caching.
2. Private `kairoai-shared` package authentication.
3. `pip install -e ".[dev]"`.
4. `ruff check .`.
5. `pytest`.
6. Docker build smoke test.

The dashboard runs:

1. Node.js 24 setup and npm caching.
2. `npm ci`.
3. `npm run lint`.
4. `npm run build`.
5. Docker build smoke test.

Both variants then call SonarCloud followed by Snyk. The dependency chain is sequential, so a failed verification stage prevents downstream quality jobs from starting. PR concurrency cancels an older run when the same PR receives a newer commit.

### 3. Merge to Test Image Promotion

1. Closing a merged PR into `main`, or manually dispatching the workflow, starts `ci-build.yaml`.
2. The current pilot gate requires only a merge; approval and `build` label checks remain commented out.
3. The reusable Docker workflow derives the immutable seven-character commit SHA tag.
4. GitHub Actions authenticates to Azure through OIDC and logs into hub ACR.
5. The image is built with `<sha7>` and `dev` tags.
6. Trivy scans HIGH/CRITICAL image findings and uploads SARIF in report-only mode.
7. Both tags are pushed to ACR.
8. `cd-helm-test.yaml` updates `.image.tag` in `envs/dev/<service>.values.yaml` on the deployments `test` branch.
9. The deployments Helm workflow runs lint, render, kubeconform, and Checkov checks.

### 4. Production Release

1. Publishing a GitHub Release or manually dispatching `release.yaml` starts promotion.
2. The version must match `vX.Y.Z` or a supported `alpha`, `beta`, or `rc` prerelease.
3. The workflow resolves the existing immutable source image from the release commit SHA or explicit input.
4. The source image is pulled from ACR with five retry attempts.
5. Trivy creates release SARIF evidence.
6. The exact same image is tagged and pushed as:
   - `vX.Y.Z`
   - `release-vX.Y.Z`
   - `prod-vX.Y.Z`
   - `prod-latest`
7. No production rebuild occurs; the tested image bytes are promoted.
8. The workflow updates `envs/prod/<service>.values.yaml` on `release/<service>/prod-vX.Y.Z`.
9. A PR is opened into the deployments `prod` branch.
10. After Helm validation and reviewer approval, the PR is merged.
11. Argo CD watches `prod`, renders the matching Helm values, and reconciles the `kairoai` namespace in production AKS.

## Hard Gates

- Ruff, pytest, npm lint, and npm build.
- Docker smoke build.
- Required Azure/ACR secret checks.
- Azure OIDC and ACR authentication.
- Immutable source image pull and production tag push.
- Helm values file validation and Git update.
- Helm lint and kubeconform strict schema validation.
- PR branch protection and reviewer approval.

## Report-Only Controls

- Snyk dependency scanning currently uses `continue-on-error` and reports its result.
- Trivy image and release scanning uses `exit-code: 0` and uploads SARIF.
- Helm Checkov uses `--soft-fail`.
- SonarCloud behavior differs slightly among copied reusable workflows; its output can trigger notification, but action failures are generally handled in report mode.

## Required Secrets

| Category | Secrets |
| --- | --- |
| Azure and ACR | `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `ACR_LOGIN_SERVER` |
| Quality | `SONAR_TOKEN`, `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION`, `SNYK_TOKEN` |
| GitHub repositories | `KAIROAI_PACKAGE_READ_TOKEN`, `AUTO_PR_TOKEN`, `HELM_REPO_TOKEN` |
| Notifications | `SLACK_INCOMING_WEBHOOK`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`, `MAIL_TO` |

Azure authentication uses GitHub OIDC with `id-token: write`; no long-lived Azure client secret or ACR password is required.

## Known Gaps

1. The deployments repository contains production Argo CD Applications that watch `prod`, but no checked-in test Argo Application currently watches `test`.
2. The Helm workflow renders `envs/dev` values even when validating a production PR; it should render the affected environment or both dev and prod sets.
3. Snyk, Trivy, and Kubernetes Checkov are report-only and do not currently block promotion.
4. The pilot merge gate has approval and `build` label enforcement commented out.
5. Dashboard verification failures are not consistently included in its notification condition when downstream quality jobs are skipped.
6. Reusable workflows are copied into each service repository. A centrally versioned reusable-workflow repository would reduce drift.

## Regeneration

From `kairoai-platform`:

```powershell
node docs\architecture\generate-ci-workflow-architecture.mjs
```

Open the generated `.excalidraw` file with the VS Code Excalidraw extension.
