# VM Validation Log

## 2026-06-18 19:44:20 +05:30 - Azure VM Local Integration Test

VM:

- Host: `kairo-test`
- OS: Ubuntu 24.04 on Azure
- Public IP: `4.240.112.138`

Validated:

- Installed Docker Engine and Docker Compose plugin.
- Installed Python virtual environment tooling.
- Started PostgreSQL and RabbitMQ with Docker Compose.
- Ran `kairoai-review-orchestrator` directly on port `8001`.
- Ran `kairoai-api-gateway` directly on port `8000`.
- Confirmed both `/health` endpoints returned `ok`.
- Sent mock GitHub pull request webhook to API Gateway.
- Confirmed API Gateway returned a `ReviewJob`.
- Confirmed Review Orchestrator persisted the review row in PostgreSQL.
- Restarted Review Orchestrator with `ENABLE_TASK_DISPATCH=true`.
- Started Celery worker connected to RabbitMQ.
- Confirmed `review.dispatch_analysis` placeholder task was received and completed by Celery.

Notes:

- Services were run directly with `PYTHONPATH` pointing at local repo copies to avoid placing a GitHub token on the VM.
- Docker Compose service image builds still require either a GitHub token for private `kairoai-shared` installs or a future packaging strategy for shared contracts.
- PostgreSQL and RabbitMQ were validated as local containers. Hosted production direction remains Azure PostgreSQL Flexible Server plus RabbitMQ/Celery.

## 2026-06-18 19:54:27 +05:30 - GitHub Service Integration Test

Validated:

- Ran a mock GitHub API on the Azure VM.
- Ran `kairoai-github-service` on port `8002`.
- Pointed GitHub Service at the mock GitHub API.
- Ran API Gateway and Review Orchestrator against GitHub Service.
- Sent mock pull request webhook to API Gateway.
- Confirmed Review Orchestrator called GitHub Service for Terraform-only changed files.
- Confirmed `GET /reviews/{review_id}/terraform-files` returned `main.tf`.
- Confirmed `review_terraform_files` table stored the Terraform file metadata.

Proof:

- Review ID: `5bafa566-30dd-4da4-8d38-a7a97e873ec9`
- Persisted Terraform file: `main.tf`

## 2026-06-18 21:05:34 +05:30 - GitHub App Auth Tests

Validated:

- API Gateway webhook signature verification tests passed locally.
- GitHub Service JWT and installation-token tests passed on the Azure VM.

Results:

- API Gateway tests: `4 passed`.
- GitHub Service tests: `7 passed`.

Notes:

- GitHub Service tests were run on the VM because the local Windows Python environment does not have `PyJWT` and `cryptography` installed.
- The real GitHub App has not been created yet.

## 2026-06-19 07:36:00 +05:30 - Real Terraform Validation Worker Test

Validated:

- Installed Terraform `v1.8.5` on the Azure VM test host.
- Started `kairoai-terraform-runner` on port `8003`.
- Restarted API Gateway, GitHub Service, Review Orchestrator, Terraform Runner, and Celery with the VM runtime env.
- Pushed a new Terraform change to `kairoai-in/example-terraform` PR `#1`.
- Confirmed GitHub sent a `pull_request.synchronize` webhook to API Gateway.
- Confirmed Review Orchestrator fetched changed Terraform files through GitHub Service.
- Confirmed Celery called Terraform Runner.
- Confirmed Terraform Runner returned `PASSED`.
- Confirmed Review Orchestrator persisted the Terraform validation result in PostgreSQL.

Proof:

- Review ID: `1db24212-eb47-464c-b632-9b78056d9dd0`
- Changed Terraform files: `main.tf`, `variables.tf`
- `terraform init -backend=false`: exit code `0`
- `terraform fmt -check -recursive`: exit code `0`
- `terraform validate -no-color`: exit code `0`

Notes:

- This validates the first real analysis worker path after the original placeholder Celery task.
- The next useful product step is publishing this result back to GitHub as a Check Run or PR comment.

## 2026-06-19 07:50:54 +05:30 - GitHub Check Run Publishing Test

Validated:

- Added GitHub Service support for installation-scoped Check Run creation.
- Added Review Orchestrator check publishing after Terraform validation.
- Restarted the Azure VM runtime stack with the new code.
- Pushed another update to `kairoai-in/example-terraform` PR `#1`.
- Confirmed Terraform validation still passed.
- Confirmed GitHub Service called GitHub Check Runs API successfully.
- Confirmed `gh pr checks 1 --repo kairoai-in/example-terraform` shows `KairoAI Terraform Validation` as `pass`.

Proof:

- Review ID: `f17b0473-12b4-4d73-ba4a-67cab8cf8496`
- Check name: `KairoAI Terraform Validation`
- GitHub check state: `pass`

Notes:

- This completes the first user-visible feedback loop: PR change to Terraform validation to GitHub check result.
- The next product step can be richer PR comments or adding failure fixtures to validate a blocking check result.

## 2026-06-19 07:59:59 +05:30 - Failing GitHub Check Run Test

Validated:

- Created `kairoai-in/example-terraform` PR `#2` with intentionally unformatted Terraform.
- Confirmed the GitHub App webhook triggered the full analysis path.
- Confirmed Terraform Runner returned a failed validation result because `terraform fmt -check -recursive` failed.
- Confirmed Review Orchestrator persisted the failed result.
- Confirmed GitHub Check Run `KairoAI Terraform Validation` appears as `fail` on PR `#2`.

Proof:

- PR: `https://github.com/kairoai-in/example-terraform/pull/2`
- Review ID: `1cf52398-4ce0-4e6d-9a02-254e776e80c4`
- Changed Terraform files: `main.tf`
- `terraform init -backend=false`: exit code `0`
- `terraform fmt -check -recursive`: exit code `3`
- `terraform validate -no-color`: exit code `0`
- GitHub check state: `fail`

Notes:

- This proves the first merge-gate-ready negative path.
- PR `#2` is intentionally left failing as a visible test fixture unless we decide to close or fix it.
