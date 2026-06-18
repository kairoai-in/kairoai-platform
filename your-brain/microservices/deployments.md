# Deployments Repository Plan

## Repository

- `kairoai-deployments`

## Purpose

Store Kubernetes deployment configuration and release overlays.

## Responsibilities

- Helm charts.
- Environment-specific values.
- Service deployment manifests.
- Ingress configuration.
- External secrets integration.
- Workload identity annotations.
- Release promotion configuration.

## Recommended Direction

Use Helm for application deployment into AKS.

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
- Helm release workflow for dev.

## Risks

- Deployment config can drift from service repos.
- Environment-specific values need clear ownership.
- Helm values can become messy unless common values and per-environment values are separated carefully.
