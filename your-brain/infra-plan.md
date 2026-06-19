# Infrastructure Plan

## Goal

Define the infrastructure path for running the KairoAI platform from local MVP to production.

## MVP Infrastructure

- Use Docker Compose for local development.
- Run the API service, worker service, PostgreSQL, and local queue compatibility services where needed.
- Use local mounted workspaces for Terraform analysis jobs during development.
- Store secrets in local `.env` files that are not committed.

## Core Runtime Components

- PostgreSQL for reviews, findings, scores, GitHub installation metadata, and job history.
- Azure Service Bus for hosted background jobs and async workflow dispatch.
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
- Use Azure Database for PostgreSQL Flexible Server for durable state.
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
- Azure Database for PostgreSQL Flexible Server for application data.
- Azure Storage Account for Terraform state and optional artifacts.
- Azure Monitor and Application Insights for observability.
- Azure Workload Identity for service access to Azure resources.

Possible additions as requirements become clearer:

- Azure Service Bus namespace and queue for hosted review dispatch.
- Azure Cache for Redis only if caching is needed later.
- Azure Blob Storage for analysis artifacts.
- Azure Front Door or Application Gateway for ingress strategy.

## Open Questions

- Should Terraform plan execution run in the main platform cluster or in separate sandbox workers?
- What is the first acceptable isolation model for customer repository code?
- What data retention policy should apply to Terraform plans and scan results?
- Should AKS ingress start with NGINX Ingress Controller, Application Gateway Ingress Controller, or another ingress path?
- What Service Bus SKU, namespace name, queue settings, retry/dead-letter behavior, and identity model should dev use?

## June 23 Deployment Priority

Until the 2026-06-23 AKS target is met, infrastructure work takes priority over deeper RAG, dashboard, and baseline-classification features.

Release-critical Azure pieces:

- AKS for workloads.
- ACR for service images.
- Azure Key Vault for runtime secrets.
- Azure PostgreSQL Flexible Server for application state.
- Azure Service Bus queue `review-analysis` for hosted worker dispatch.
- NGINX ingress for `api.kairoai.in`.
- Azure Storage Account for Terraform remote state.
- Azure Monitor / Log Analytics basics.

Validation target:

- Reproduce the current Azure VM GitHub App flow on AKS using `example-terraform` PR `#2`.
