# KairoAI Terraform Pipeline Architecture Notes

Diagram: `kairoai-terraform-pipeline-architecture.excalidraw`

Generator: `generate-terraform-pipeline-architecture.mjs`

Source workflows:

- `kairoai-infra/.github/workflows/terraform-pr.yml`
- `kairoai-infra/.github/workflows/terraform-apply.yml`

## Branch and Environment Contract

| PR target | Environment | Primary Terraform root | Secondary root | Subscription | Required apply label |
| --- | --- | --- | --- | --- | --- |
| `hub` | `hub` | `environments/hub` | None | `5b942f88-17e6-4026-ae23-d520365fb916` | `apply-hub` |
| `test` | `test` | `environments/test` | None | `6b01db76-626a-44a2-8119-17682410914a` | `apply-test` |
| `main` | `prod` | `environments/prod` | `environments/prod-dr` | `a8270be7-dabc-4d92-98db-26a55025b0df` | `apply-prod` |

Infrastructure work uses retained `azure/*` branches and opens a PR into exactly one protected target branch. Production and prod-DR intentionally share the `main` promotion lane; prod is processed first and prod-DR second.

## Pull Request Pipeline

The PR workflow runs for opened, synchronized, reopened, or ready-for-review PRs into `hub`, `test`, or `main` when Terraform, policy, Terraform workflow, or local action files change.

The dependency chain is sequential and fail-fast:

1. **Terraform Context** maps the PR base branch to environment, root, subscription, apply label, optional prod-DR root, and author.
2. **Terraform Format** runs Terraform 1.8.5 with `terraform fmt -check -recursive`.
3. **Terraform Validate** initializes without a backend and validates the selected root. The `main` lane validates both prod and prod-DR.
4. **Terraform Security** installs Checkov and scans the entire repository. It currently uses `--soft-fail`.
5. **Terraform Plan** authenticates to Azure through OIDC, initializes the real backend, creates a binary plan, exports JSON, and uploads artifacts. The `main` lane plans prod and prod-DR sequentially.
6. **Terraform Policy** downloads the plan JSON artifacts and runs Conftest 0.56.0 against `policies/opa/terraform`. OPA is the active hard policy gate.
7. Any failed stage triggers the shared Slack/email notification action.

PR concurrency is scoped to the PR number and cancels stale runs when a newer commit is pushed.

## Plan Artifacts

The workflow uploads:

- `terraform-plan-hub`
- `terraform-plan-test`
- `terraform-plan-prod`
- `terraform-plan-prod-dr`

Each contains `tfplan` and `tfplan.json`. These artifacts support OPA and review evidence. They are deliberately not consumed by the post-merge apply workflow because the final merged branch may differ from the PR merge candidate.

## Apply Gate

The apply workflow starts when a PR into `hub`, `test`, or `main` is closed. It applies only when all conditions are true:

1. The PR was merged.
2. The PR contains the environment-specific `apply-*` label.
3. GitHub reports at least one unique `APPROVED` review.
4. Branch mapping succeeded.

Branch protection and `.github/CODEOWNERS` require review from `@kairoai-in/reviewer`. `Elzabeth-L` and `ElzabethOps` are the current reviewer accounts.

A PR closed without merge is skipped quietly. A merged PR missing its label or approval is skipped and sends a gate notification.

## Post-Merge Apply

1. The apply job enters the mapped GitHub Environment: `hub`, `test`, or `prod`.
2. It checks out the merged target branch.
3. `azure/login` exchanges the GitHub OIDC token for Azure access.
4. Terraform initializes the real backend and acquires the state lock.
5. Terraform creates a fresh `apply.tfplan`.
6. Terraform applies that reviewed fresh plan.
7. For `main`, it then repeats init, plan, and apply for `environments/prod-dr`.
8. Any failure stops the sequential chain and sends a failure notification.

Apply concurrency is scoped to the base branch and uses `cancel-in-progress: false`, preventing overlapping mutation for the same environment.

## Remote State

Remote state is centralized in the hub subscription:

- Resource group: `rg-kairoai-tfstate-ci`
- Storage account: `stkairoaitfstateci`

| Container | State key |
| --- | --- |
| `hubtfstate` | `kairoai/hub/terraform.tfstate` |
| `hubtfstate` | `kairoai/bootstrap/terraform.tfstate` |
| `testtfstate` | `kairoai/test/terraform.tfstate` |
| `prodtfstate` | `kairoai/prod/terraform.tfstate` |
| `prodtfstate` | `kairoai/prod-dr/terraform.tfstate` |

Separate keys isolate state and blast radius. Azure Blob locking protects each state from concurrent mutation.

## Azure OIDC Trust

Live Entra application: `app-kairoai-terraform-github-actions`.

Live federated subjects verified on 2026-06-29:

- `repo:kairoai-in/kairoai-infra:pull_request`
- `repo:kairoai-in/kairoai-infra:ref:refs/heads/hub`
- `repo:kairoai-in/kairoai-infra:ref:refs/heads/test`
- `repo:kairoai-in/kairoai-infra:ref:refs/heads/main`
- `repo:kairoai-in/kairoai-infra:environment:hub`
- `repo:kairoai-in/kairoai-infra:environment:test`
- `repo:kairoai-in/kairoai-infra:environment:prod`

The issuer is GitHub Actions and the audience is `api://AzureADTokenExchange`. No Azure client secret is stored.

Required GitHub secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `SLACK_INCOMING_WEBHOOK`
- Optional SMTP notification secrets

## Azure RBAC

The federated Terraform identity requires:

- `Contributor` on hub, test, and prod subscriptions.
- `Storage Blob Data Contributor` on the hub Terraform state storage account.
- Cross-subscription permissions needed for hub-spoke peering, shared private DNS links, and shared services.
- `User Access Administrator` only where Terraform must create role assignments.

The last role is highly privileged and should eventually be narrowed or moved into a separate RBAC bootstrap workflow.

## Reusable Module Layer

Environment roots compose reusable modules for:

- Naming and resource groups
- Networking, VNet peering, private DNS, and private endpoints
- ACR and Front Door
- Application Gateway WAF and AKS
- PostgreSQL Flexible Server
- Key Vault and Service Bus
- Monitor and AI Foundry
- Managed identities and policy assignments

Modules own reusable Azure resource contracts. Environment roots own provider configuration, backend selection, cross-subscription composition, feature gates, and environment-specific values.

## Hard Gates and Report-Only Controls

Hard gates:

- Branch mapping
- Terraform formatting and validation
- Azure OIDC login
- Backend initialization and plan
- OPA policy checks
- Merge, apply label, and independent approval
- Fresh post-merge plan and apply

Report-only today:

- Checkov Terraform scanning uses `--soft-fail` while the hardening backlog is being closed.

## Current Gaps

1. Checkov is installed without a pinned version and is report-only.
2. The apply workflow triggers for every closed PR to a target branch, including documentation-only PRs; the gate then requires an apply label or sends a warning.
3. The PR workflow does not post a concise Terraform plan summary directly onto the PR.
4. There is no explicit destructive-change approval gate based on plan actions.
5. Scheduled drift-detection plans are not configured.
6. Terraform still needs a private/self-hosted runner before tfstate and Key Vault public access can be fully disabled.
7. `User Access Administrator` should be narrowed or separated from routine infrastructure deployment.

## Regeneration

From `kairoai-platform`:

```powershell
node docs\architecture\generate-terraform-pipeline-architecture.mjs
```

Open the generated `.excalidraw` file with the VS Code Excalidraw extension.
