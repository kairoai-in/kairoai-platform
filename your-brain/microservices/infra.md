# Infrastructure Repository Plan

## Repository

- `kairoai-infra`

## Purpose

Provision Azure infrastructure for KairoAI.

## Responsibilities

- AKS cluster.
- Azure Key Vault.
- Azure Container Registry.
- Azure Database for PostgreSQL.
- Azure Cache for Redis or queue resources.
- Azure Storage Account.
- Azure Monitor and Application Insights.
- Networking.
- Managed identities and workload identity.

## IaC Direction

Preferred:

- Terraform or OpenTofu modules.

Decision needed:

- Confirm Terraform vs OpenTofu before implementation.

## Environments

- `dev`
- `staging`
- `prod`

## MVP Deliverables

- Azure resource group.
- AKS cluster.
- Key Vault.
- ACR.
- PostgreSQL.
- Basic monitoring.
- Outputs consumed by deployment repo.

## Risks

- AKS can add operational overhead early.
- Secret and identity wiring must be correct before services handle customer data.
