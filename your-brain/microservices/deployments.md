# Deployments Repository Plan

## Repository

- `kairoai-deployments`

## Purpose

Store Kubernetes deployment configuration and release overlays.

## Responsibilities

- Helm charts or Kustomize overlays.
- Environment-specific values.
- Service deployment manifests.
- Ingress configuration.
- External secrets integration.
- Workload identity annotations.
- Release promotion configuration.

## Recommended Direction

Start with Helm if we expect reusable service charts.

Use one shared service chart pattern for:

- API services.
- Worker services.
- Scanner services.

## Environments

- `local`
- `dev`
- `staging`
- `prod`

## MVP Deliverables

- Namespace definitions.
- Common service chart.
- API Gateway deployment.
- Review Orchestrator deployment.
- Shared config maps and secrets references.
- Dev environment values.

## Risks

- Deployment config can drift from service repos.
- Environment-specific values need clear ownership.
