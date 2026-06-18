# Terraform Runner Service Plan

## Repository

- `kairoai-terraform-runner`

## Purpose

Run Terraform analysis safely and return normalized infrastructure changes.

## Responsibilities

- Prepare isolated workspaces.
- Run `terraform init`.
- Run `terraform validate`.
- Run `terraform plan`.
- Run `terraform show -json`.
- Summarize added, changed, destroyed, and replaced resources.
- Return normalized Terraform changes.

## MVP Endpoints

- `POST /terraform/validate`
- `POST /terraform/plan`
- `GET /terraform/plan/{plan_id}`

## Dependencies

- Terraform CLI.
- GitHub Service or repository checkout input.
- Artifact store for short-lived plan outputs.
- Shared schemas.

## Configuration

- `WORKSPACE_ROOT`
- `ARTIFACT_STORE_URL`
- `TERRAFORM_BIN`
- `JOB_TIMEOUT_SECONDS`
- `MAX_WORKSPACE_SIZE_MB`

## MVP Deliverables

- Fixture-based local Terraform validation.
- Plan JSON parsing.
- Normalized `TerraformChange` output.
- Workspace cleanup.
- Docker image with Terraform CLI.

## Risks

- Terraform plans can contain sensitive values.
- Running untrusted IaC requires strong isolation.
- Provider downloads and remote state access need careful credential handling.
