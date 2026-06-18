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
- Push images to the selected registry.
- Deploy to `dev` after successful build.

## Secrets

Expected CI secrets:

- GitHub App private key.
- GitHub App ID.
- Webhook secret.
- OpenAI API key.
- Infracost API key.
- Container registry credentials, if not using GitHub token-based publishing.
- Cloud deployment credentials.

## Deployment Direction

Early path:

- Use GitHub Actions.
- Publish Docker images.
- Deploy to a simple dev environment first.

Later path:

- Add staging and production promotion.
- Add database migrations.
- Add rollback support.
- Add preview environments if useful for UI/dashboard work.

## Open Questions

- Which container registry should be used first: GitHub Container Registry, AWS ECR, or another registry?
- Which deployment target should be used first?
- Should deployments require manual approval for staging and production?
- What test coverage threshold should be enforced before public beta?
