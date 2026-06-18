# CI/CD Plan

## Goal

Create a reliable GitHub-native path for testing, building, scanning, and deploying the KairoAI platform.

## Initial GitHub Workflows

Planned workflows:

- Pull request checks.
- Main branch build.
- Container image publish.
- Deployment to dev.
- Release tagging.

## Pull Request Checks

Run on every pull request:

- Lint.
- Format check.
- Unit tests.
- Type checks where applicable.
- Dependency vulnerability scan.
- Docker build validation.

## Main Branch

Run after merge to `main`:

- Repeat pull request checks.
- Build container images.
- Push images to Azure Container Registry.
- Deploy to `dev` after successful build.

## Secrets

Expected CI secrets:

- GitHub App private key.
- GitHub App ID.
- Webhook secret.
- OpenAI API key.
- Infracost API key.
- Azure Container Registry publishing identity.
- Cloud deployment credentials.

## Deployment Direction

Early path:

- Use GitHub Actions.
- Publish Docker images to Azure Container Registry.
- Deploy to AKS dev environment with Helm.
- Use Terraform `azurerm` workflows for Azure infrastructure.

Later path:

- Add staging and production promotion.
- Add database migrations.
- Add rollback support.
- Add preview environments if useful for UI/dashboard work.

## Service Repository Workflow

Each service repository should run:

- Format check.
- Lint.
- Unit tests.
- Contract tests using `kairoai-shared`.
- Docker build.
- Vulnerability scan.
- Push image to ACR after merge to `main`.

Image tagging:

- Commit SHA tag for traceability.
- Semver tag for releases later.
- Environment promotion should reference immutable image tags.

## Infrastructure Repository Workflow

`kairoai-infra` should run:

- Terraform format check.
- Terraform validate.
- Terraform plan on pull requests.
- Terraform apply after merge with environment protection.

State backend:

- Azure Storage Account.
- Separate state key per environment.

## Deployment Repository Workflow

`kairoai-deployments` should run:

- Helm lint.
- Template rendering validation.
- Kubernetes schema validation.
- Deploy to AKS dev after merge.
- Require manual approval for staging and production later.

## Open Questions

- Should deployments require manual approval for staging and production?
- What test coverage threshold should be enforced before public beta?
- Should ACR be per-environment or shared across environments?
- Should Terraform apply be manual for all environments or automatic for dev only?
