# Infrastructure Repository Plan

## Repository

- `kairoai-infra`

## Purpose

Provision Azure infrastructure for KairoAI.

## Responsibilities

- AKS cluster.
- Azure Key Vault.
- Azure Container Registry.
- Azure Database for PostgreSQL Flexible Server.
- RabbitMQ broker resources or Kubernetes deployment path.
- Azure Storage Account.
- Terraform remote state backend.
- Azure Monitor and Application Insights.
- Networking.
- Managed identities and workload identity.

## IaC Direction

- Terraform.
- `azurerm` provider.
- Azure Storage Account backend for remote state.

## State Plan

- Use a dedicated Azure Storage Account for Terraform state.
- Use one state container.
- Use separate state keys per environment.
- Enable storage account protections such as versioning and soft delete where practical.
- Access state from CI/CD through Azure identity.

## Environments

- `dev`
- `staging`
- `prod`

## MVP Deliverables

- Azure resource group.
- AKS cluster.
- Key Vault.
- ACR.
- PostgreSQL Flexible Server.
- Storage Account and container for Terraform state.
- Basic monitoring.
- Outputs consumed by deployment repo.

## Risks

- AKS can add operational overhead early.
- Secret and identity wiring must be correct before services handle customer data.
