# Infrastructure Plan

## Goal

Define the infrastructure path for running the KairoAI platform from local MVP to production.

## MVP Infrastructure

- Use Docker Compose for local development.
- Run the API service, worker service, PostgreSQL, and Redis locally.
- Use local mounted workspaces for Terraform analysis jobs during development.
- Store secrets in local `.env` files that are not committed.

## Core Runtime Components

- PostgreSQL for reviews, findings, scores, GitHub installation metadata, and job history.
- Redis for background job queues and short-lived orchestration state.
- Containerized analysis tools:
  - Terraform CLI.
  - Checkov.
  - Infracost.
  - Later: tfsec and Terrascan.

## Terraform Execution Environment

- Run Terraform analysis in isolated job workspaces.
- Avoid persisting checked-out customer code longer than needed.
- Capture normalized outputs instead of raw sensitive plans where possible.
- Use strict job timeouts and resource limits.

## Cloud Direction

Azure is the first production infrastructure direction.

Preferred early production path:

- Run services on Azure Kubernetes Service.
- Store secrets in Azure Key Vault.
- Store container images in Azure Container Registry.
- Provision Azure resources with Terraform and the `azurerm` provider.
- Store Terraform remote state in an Azure Storage Account.
- Use Azure Database for PostgreSQL for durable state.
- Use Azure Monitor and Application Insights for observability.
- Use Azure Workload Identity for pod access to Azure resources.

Portability requirement:

- Application services should run locally through Docker Compose.
- Cloud-specific integrations should sit behind adapters.
- Future cloud implementations should not require rewriting core business logic.

## Environments

- `local` for developer machines.
- `dev` for early hosted testing.
- `staging` for GitHub App integration testing.
- `prod` for customer-facing installs.

## Terraform State Plan

Remote state backend:

- Azure Storage Account.
- Dedicated state container.
- Separate state key per environment.

Recommended state layout:

- `kairoai/dev/terraform.tfstate`
- `kairoai/staging/terraform.tfstate`
- `kairoai/prod/terraform.tfstate`

Access pattern:

- CI/CD uses Azure federated identity or service principal credentials.
- Human access should be limited to platform maintainers.
- State storage should enable versioning, soft delete, and restricted network access where practical.

## Azure Services Planned For Application

First production direction:

- Azure Kubernetes Service for workloads.
- Azure Key Vault for secrets.
- Azure Container Registry for images.
- Azure Database for PostgreSQL for application data.
- Azure Storage Account for Terraform state and optional artifacts.
- Azure Monitor and Application Insights for observability.
- Azure Workload Identity for service access to Azure resources.

Possible additions as requirements become clearer:

- Azure Service Bus for durable eventing.
- Azure Cache for Redis for queueing/caching.
- Azure Blob Storage for analysis artifacts.
- Azure Front Door or Application Gateway for ingress strategy.

## Open Questions

- Should Terraform plan execution run in the main platform cluster or in separate sandbox workers?
- What is the first acceptable isolation model for customer repository code?
- What data retention policy should apply to Terraform plans and scan results?
- Should MVP queueing use Redis first or Azure Service Bus from the start?
- Should AKS ingress start with NGINX Ingress Controller, Application Gateway Ingress Controller, or another ingress path?
