# Azure Hub-Spoke Infrastructure Design

Last updated: 2026-06-22 12:31:04 +05:30

## Purpose

This document defines the planned Azure infrastructure architecture for KairoAI before Terraform implementation begins.

The target architecture is a secure multi-subscription hub-spoke platform:

- Hub subscription for shared network/security/platform resources.
- Test subscription as a spoke for end-to-end non-production deployment.
- Production subscription as a spoke for production and disaster recovery.
- Central India as the primary region.
- South India as the disaster recovery region.
- Application ingress path: `Internet -> Azure Front Door -> Application Gateway WAF -> AKS`.

No Terraform implementation should start until this plan is reviewed and accepted.

## Subscription Model

| Scope | Subscription | Purpose |
| --- | --- | --- |
| Hub | `kairoai-hub-subscription` / `5b942f88-17e6-4026-ae23-d520365fb916` | Shared security, ingress edge, DNS, state, registry, and connectivity services. |
| Test spoke | `kairoai-test-subscription` / `6b01db76-626a-44a2-8119-17682410914a` | End-to-end test environment for application and platform validation. |
| Prod spoke | `kairoai-prod-subscription` / `a8270be7-dabc-4d92-98db-26a55025b0df` | Production application runtime plus disaster recovery foundation. |

All subscriptions are expected to be under the same tenant. Terraform should use explicit aliased providers for hub, test, prod, and prod-dr scopes.

## Region Model

| Region | Usage |
| --- | --- |
| Central India | Primary region for hub, test, and production runtime. |
| South India | Production disaster recovery region. |

The hub is primarily in Central India. DR-specific resources should live in South India under the production subscription unless a resource is truly global.

## Naming Convention

Naming should be predictable, Azure-compliant, and environment-aware.

Recommended pattern:

```text
<resource-abbrev>-kairoai-<env>-<region-code>-<suffix>
```

Region codes:

- `ci` = Central India.
- `si` = South India.
- `global` = global service scope.

Environment codes:

- `hub`
- `test`
- `prod`
- `prod-dr`

Recommended resource names:

| Resource | Hub | Test | Prod | Prod DR |
| --- | --- | --- | --- | --- |
| Resource group | `rg-kairoai-hub-ci` | `rg-kairoai-test-ci` | `rg-kairoai-prod-ci` | `rg-kairoai-prod-dr-si` |
| VNet | `vnet-kairoai-hub-ci` | `vnet-kairoai-test-ci` | `vnet-kairoai-prod-ci` | `vnet-kairoai-prod-dr-si` |
| AKS | N/A | `aks-kairoai-test-ci` | `aks-kairoai-prod-ci` | Optional: `aks-kairoai-prod-dr-si` |
| ACR | `acrkairoaihubci` | Shared from hub | Shared from hub | Shared from hub |
| Key Vault | `kv-kairoai-hub-ci` | `kv-kairoai-test-ci` | `kv-kairoai-prod-ci` | `kv-kairoai-proddr-si` |
| PostgreSQL | N/A | `psql-kairoai-test-ci` | `psql-kairoai-prod-ci` | Replica/failover target as designed |
| Service Bus | N/A | `sb-kairoai-test-ci` | `sb-kairoai-prod-ci` | Optional DR namespace |
| App Gateway | N/A | `agw-kairoai-test-ci` | `agw-kairoai-prod-ci` | Optional: `agw-kairoai-proddr-si` |
| Front Door | `afd-kairoai-global` | Shared route | Shared route | Shared route |
| Log Analytics | `law-kairoai-hub-ci` | Optional local | `law-kairoai-prod-ci` or hub | `law-kairoai-proddr-si` |
| App Insights | Optional shared | `appi-kairoai-test-ci` | `appi-kairoai-prod-ci` | `appi-kairoai-proddr-si` |
| Terraform state storage | `stkairoaitfstateci` | Uses hub backend | Uses hub backend | Uses hub backend |

Storage account and ACR names must be globally unique and lowercase alphanumeric only. Final names may need suffixes if unavailable.

## Tagging Convention

Apply these tags to every supported resource:

| Tag | Example | Required |
| --- | --- | --- |
| `application` | `kairoai` | Yes |
| `environment` | `hub`, `test`, `prod`, `prod-dr` | Yes |
| `managed_by` | `terraform` | Yes |
| `owner` | `platform` | Yes |
| `cost_center` | `kairoai` | Yes |
| `data_classification` | `internal`, `confidential` | Yes |
| `criticality` | `low`, `medium`, `high` | Yes |
| `region` | `centralindia`, `southindia`, `global` | Yes |

## Network Design

Recommended non-overlapping CIDR layout:

| Network | Region | CIDR |
| --- | --- | --- |
| Hub VNet | Central India | `10.10.0.0/16` |
| Test spoke VNet | Central India | `10.20.0.0/16` |
| Prod spoke VNet | Central India | `10.30.0.0/16` |
| Prod DR spoke VNet | South India | `10.40.0.0/16` |

These ranges are placeholders and must be confirmed against any existing corporate/VPN networks before implementation.

### Hub Subnets

| Subnet | CIDR | Purpose |
| --- | --- | --- |
| `AzureFirewallSubnet` | `10.10.0.0/26` | Required Azure Firewall subnet. |
| `AzureFirewallManagementSubnet` | `10.10.0.64/26` | Firewall management subnet if forced tunneling is used later. |
| `AzureBastionSubnet` | `10.10.1.0/26` | Azure Bastion subnet. |
| `snet-private-endpoints` | `10.10.2.0/24` | Hub private endpoints for shared services. |
| `snet-shared-services` | `10.10.3.0/24` | Shared internal platform services if needed. |

### Test Spoke Subnets

| Subnet | CIDR | Purpose |
| --- | --- | --- |
| `snet-aks-system` | `10.20.0.0/22` | AKS system node pool. |
| `snet-aks-user` | `10.20.4.0/21` | AKS user node pool. |
| `snet-appgw` | `10.20.12.0/24` | Application Gateway WAF v2. |
| `snet-private-endpoints` | `10.20.13.0/24` | Private endpoints for Key Vault, PostgreSQL, Service Bus, etc. |
| `snet-postgres-delegated` | `10.20.14.0/24` | Delegated subnet for PostgreSQL Flexible Server if using VNet injection. |
| `snet-aci-private` | `10.20.15.0/24` | Optional future isolated job execution. |

### Prod Spoke Subnets

| Subnet | CIDR | Purpose |
| --- | --- | --- |
| `snet-aks-system` | `10.30.0.0/22` | AKS system node pool. |
| `snet-aks-user` | `10.30.4.0/21` | AKS user node pool. |
| `snet-appgw` | `10.30.12.0/24` | Application Gateway WAF v2. |
| `snet-private-endpoints` | `10.30.13.0/24` | Private endpoints. |
| `snet-postgres-delegated` | `10.30.14.0/24` | PostgreSQL delegated subnet. |
| `snet-aci-private` | `10.30.15.0/24` | Optional future isolated job execution. |

### Prod DR Subnets

| Subnet | CIDR | Purpose |
| --- | --- | --- |
| `snet-aks-system` | `10.40.0.0/22` | Optional warm standby AKS system pool. |
| `snet-aks-user` | `10.40.4.0/21` | Optional warm standby AKS user pool. |
| `snet-appgw` | `10.40.12.0/24` | Optional DR Application Gateway WAF. |
| `snet-private-endpoints` | `10.40.13.0/24` | DR private endpoints. |
| `snet-postgres-delegated` | `10.40.14.0/24` | DR PostgreSQL replica/failover subnet. |

## VNet Peering

Required peerings:

- Hub Central India <-> Test Central India.
- Hub Central India <-> Prod Central India.
- Hub Central India <-> Prod DR South India.
- Prod Central India <-> Prod DR South India only if needed for replication/failover traffic.

Peering settings:

- Allow forwarded traffic where Azure Firewall routing requires it.
- Allow gateway transit only if a VPN/ExpressRoute gateway is added to hub later.
- Do not allow unnecessary remote gateway usage.
- Use route tables to force spoke egress through Azure Firewall when the policy is finalized.

## Ingress Design

Required ingress path:

```text
Internet
  -> Azure Front Door Premium
  -> Private Link or public origin to Application Gateway WAF
  -> Application Gateway Ingress Controller
  -> AKS services/pods
```

Recommended approach:

- Use Azure Front Door Premium in the hub/global layer.
- Use Application Gateway WAF v2 in each spoke environment.
- Use AGIC to bind Kubernetes ingress resources to Application Gateway.
- Keep environment-specific origins:
  - Test origin: `agw-kairoai-test-ci`.
  - Prod origin: `agw-kairoai-prod-ci`.
  - DR origin: `agw-kairoai-proddr-si` if warm DR is enabled.
- Use `kairoai.in` public DNS zone in hub.
- Planned hostnames:
  - `kairoai.in` for production dashboard.
  - `api.kairoai.in` for production API/GitHub webhook.
  - `test.kairoai.in` for test dashboard.
  - `api.test.kairoai.in` for test API/GitHub webhook.

Open design choice:

- For the first demo-ready production build, use a public Application Gateway WAF origin restricted to Azure Front Door traffic using WAF rules, headers, and origin hardening.
- Keep Front Door Premium Private Link as a hardening phase after validating support and operational complexity for the selected origin pattern.
- Use a separate Front Door route for test, for example `test.kairoai.in` and `api.test.kairoai.in`, instead of mixing test traffic into production routes.

Reason:

- Private Link from Front Door to the origin is more secure, but it can add setup and troubleshooting time.
- The demo target benefits from a working end-to-end route first, while still preventing general internet bypass to the App Gateway origin as much as possible.
- Terraform should keep the origin pattern modular so we can upgrade the origin hardening without redesigning AKS or App Gateway.

## Private DNS Zones

Hub should own and link shared private DNS zones to spokes:

| Zone | Purpose |
| --- | --- |
| `privatelink.azurecr.io` | ACR private endpoint. |
| `privatelink.vaultcore.azure.net` | Key Vault private endpoints. |
| `privatelink.postgres.database.azure.com` | PostgreSQL Flexible Server private endpoint/private DNS. |
| `privatelink.servicebus.windows.net` | Service Bus private endpoint. |
| `privatelink.blob.core.windows.net` | Terraform state and artifact storage private endpoint. |
| `privatelink.monitor.azure.com` | Azure Monitor private link scope if enabled. |
| AKS private DNS zone | If AKS private cluster is enabled. |

Spoke VNets should link to the private DNS zones they require.

## Hub Subscription Resources

Hub should contain shared platform resources:

- Resource group: `rg-kairoai-tfstate-ci`.
- Hub VNet and subnets.
- Azure Firewall and firewall policy.
- Azure Bastion.
- Azure Container Registry.
- Azure Front Door Premium.
- Public DNS zone for `kairoai.in`.
- Private DNS zones.
- Terraform remote state storage account.
- Storage private endpoint and private DNS.
- Shared Log Analytics workspace if central logging is selected.
- Shared Key Vault for platform-level secrets, if required.
- Shared user-assigned managed identities for automation where appropriate.
- Azure Policy assignments at subscription or management-group scope.
- Diagnostic settings for hub resources.

## Test Spoke Resources

Test subscription should contain one resource group and one VNet:

- Resource group: `rg-kairoai-test-ci`.
- Spoke VNet and subnets.
- AKS with:
  - System node pool.
  - User node pool.
  - Azure CNI or Azure CNI Overlay after sizing decision.
  - Workload Identity enabled.
  - OIDC issuer enabled.
  - Azure Policy add-on enabled.
  - AGIC enabled or installed through Helm with managed identity.
- Application Gateway WAF v2.
- Azure PostgreSQL Flexible Server.
- Key Vault.
- Service Bus namespace and queues.
- Application Insights.
- Log Analytics workspace or linkage to central workspace.
- Private endpoints and private DNS links.
- Azure AI Foundry/OpenAI resource and deployments for test.
- User-assigned managed identities for AKS workloads.

## Prod Subscription Resources

Production primary resource group in Central India:

- Resource group: `rg-kairoai-prod-ci`.
- Prod VNet and subnets.
- AKS production cluster.
- Application Gateway WAF v2.
- Azure PostgreSQL Flexible Server.
- Key Vault.
- Service Bus namespace and queues.
- Application Insights.
- Log Analytics workspace or central link.
- Private endpoints and private DNS links.
- Azure AI Foundry/OpenAI production resource and deployments.
- Managed identities and RBAC assignments.

Production DR resource group in South India:

- Resource group: `rg-kairoai-prod-dr-si`.
- DR VNet and subnets.
- DR PostgreSQL replica/failover target.
- DR Key Vault backup/replica strategy.
- Optional warm standby AKS.
- Optional DR Application Gateway WAF.
- Optional DR Service Bus namespace if active-passive messaging is required.
- DR Application Insights/Log Analytics linkage.

DR maturity levels:

| Level | Description |
| --- | --- |
| Level 1 | DR network, resource group, policies, and backup/restore plan only. |
| Level 2 | Database replica/failover target and Key Vault secret restore runbook. |
| Level 3 | Warm standby AKS/App Gateway and Front Door failover route. |

Recommendation for demo: start with Level 2.

Level 2 gives a credible DR story with network foundation, backup/restore, PostgreSQL failover planning, Key Vault recovery, and documented Front Door failover steps without paying for a full warm standby AKS/App Gateway footprint immediately.

Level 3 should be added after the demo or when production RTO/RPO requires warm standby.

## AKS Runtime Design

AKS should use:

- Separate system and user node pools.
- Autoscaling enabled for user pool.
- Kubernetes RBAC integrated with Entra ID.
- Azure Workload Identity for pod access to Azure resources.
- Azure Policy add-on.
- Network policy enabled.
- Managed identity for cluster and kubelet.
- Private API server if operationally acceptable.
- App Gateway Ingress Controller for ingress.
- Key Vault CSI driver or External Secrets Operator for runtime secrets.
- Namespace isolation:
  - `kairoai-system`
  - `kairoai`
  - `monitoring`
  - `ingress`

## Azure AI Foundry Plan

Application AI currently uses Azure AI Foundry/OpenAI-style model deployments.

Planned infrastructure:

- Test: `oai-kairoai-test-ci`.
- Prod: `oai-kairoai-prod-ci`.
- DR: optional `oai-kairoai-proddr-si` if model availability/quota supports it.

Model direction:

- Preferred production target: `gpt-5.5` when quota is available.
- Current working fallback pattern: `gpt-5.1` primary and `gpt-5` fallback.
- AI service must keep deterministic fallback for quota or provider failures.

Required Terraform support:

- Resource creation.
- Private endpoint if supported/required.
- Key Vault storage of endpoint/key.
- AKS workload identity or secret sync for runtime access.

## Terraform State Design

Terraform state should be stored in the hub subscription.

Storage account:

- Name: `stkairoaitfstateci` or globally unique variant.
- Resource group: `rg-kairoai-hub-ci`.
- Public network access disabled after bootstrap path is solved.
- Private endpoint enabled.
- Blob versioning enabled.
- Soft delete enabled.
- Container delete retention enabled.
- Infrastructure encryption enabled where available.
- RBAC-only access preferred.

Suggested state keys:

```text
hubtfstate/kairoai/hub/terraform.tfstate
hubtfstate/kairoai/bootstrap/terraform.tfstate
testtfstate/kairoai/test/terraform.tfstate
prodtfstate/kairoai/prod/terraform.tfstate
prodtfstate/kairoai/prod-dr/terraform.tfstate
```

Bootstrap caveat:

- The first state storage account creation may need a local/bootstrap state or a separate bootstrap workflow.
- After the backend exists, all future Terraform should use remote state.

## Terraform Repository Layout

Recommended repo: `kairoai-infra`.

```text
kairoai-infra/
  README.md
  backend/
    bootstrap/
  environments/
    hub/
      backend.tf
      providers.tf
      main.tf
      variables.tf
      terraform.tfvars.example
    test/
    prod/
    prod-dr/
  modules/
    naming/
    resource-group/
    networking/
    vnet-peering/
    firewall/
    private-dns/
    acr/
    front-door/
    app-gateway-waf/
    aks/
    postgresql-flexible/
    key-vault/
    service-bus/
    monitor/
    ai-foundry/
    managed-identity/
    policy/
  policies/
    azure-policy/
    opa/
  docs/
```

Implementation order:

1. Bootstrap Terraform state.
2. Hub foundation.
3. Test spoke network and shared DNS links.
4. Test runtime services.
5. Test AKS app deployment integration.
6. Prod primary foundation.
7. Prod DR foundation.
8. Prod workload deployment and Front Door routing.

## Terraform Pipeline Design

Status: pipeline implementation is intentionally on hold until the initial infrastructure is designed and provisioned manually/through controlled Terraform runs.

Branch model:

- Feature branches create PRs to `main`.
- PR runs validation and plan.
- Merge to `main` does not automatically apply production without approval.

Planned workflows:

- `terraform-pr.yml`
  - Trigger: PR to `main`.
  - Run `terraform fmt -check`.
  - Run `terraform validate`.
  - Run `tflint`.
  - Run Checkov.
  - Run plan for changed environment.
  - Upload plan artifacts.
  - Comment summary on PR.

- `terraform-apply-test.yml`
  - Trigger: merge to `main` or manual dispatch.
  - Environment approval: `test`.
  - Apply only test environment.

- `terraform-apply-prod.yml`
  - Trigger: manual dispatch.
  - Environment approval: `prod`.
  - Apply prod and prod-dr with explicit confirmation.

Authentication:

- Prefer GitHub Actions OIDC federated credentials to Azure.
- Avoid long-lived Azure client secrets.
- Use separate federated identities/service principals per environment.
- Use least privilege per subscription.

## RBAC Design

Azure RBAC should use least privilege:

| Principal | Scope | Roles |
| --- | --- | --- |
| Terraform hub identity | Hub subscription/resource groups | Network Contributor, Contributor where needed, Storage Blob Data Contributor for state bootstrap, User Access Administrator only when assigning RBAC. |
| Terraform test identity | Test subscription/resource group | Contributor scoped to test RG, Network Contributor where needed, role assignment permissions if creating identities/RBAC. |
| Terraform prod identity | Prod subscription/resource groups | Contributor scoped to prod/prod-dr RGs, controlled approval path. |
| AKS kubelet identity | ACR | AcrPull. |
| AGIC identity | App Gateway RG/resource | Contributor on App Gateway, Reader on resource group. |
| Workload identities | Key Vault / Service Bus / Storage | Narrow data-plane roles only. |
| Platform admins | Subscriptions/RGs | Owner/User Access Administrator only for a small admin group. |
| Developers | GitHub and AKS namespaces | No direct production Azure Owner access. |

Entra ID groups should be used instead of assigning humans directly:

- `grp-kairoai-platform-admins`
- `grp-kairoai-platform-operators`
- `grp-kairoai-developers`
- `grp-kairoai-readers`
- `grp-kairoai-breakglass`

## Azure Policy Design

Policy should be assigned at subscription or management group scope where possible.

Baseline policies:

- Allowed locations: Central India, South India, Global.
- Require tags.
- Deny public network access for Key Vault, PostgreSQL, Storage where private endpoint is required.
- Require secure transfer on storage.
- Require soft delete and purge protection for Key Vault.
- Require diagnostic settings for supported resources.
- Require AKS local accounts disabled where feasible.
- Require AKS Azure Policy add-on.
- Require private endpoint for PaaS services where practical.
- Restrict public IP creation outside approved hub/App Gateway/Front Door patterns.
- Enforce TLS minimum versions.
- Audit unmanaged disks/public blobs.

Policy rollout mode:

1. Start as `Audit`.
2. Fix/remediate detected drift.
3. Move critical policies to `Deny`.
4. Add `DeployIfNotExists` remediation where safe.

## Policy Remediation Plan

Remediation should be managed as code:

- Keep policy definitions and assignments in Terraform.
- Keep exceptions explicit with expiry dates.
- Run policy compliance checks in Terraform pipeline.
- Use managed identity for `DeployIfNotExists` assignments.
- Store remediation decisions in `your-brain/decisions.md`.

Examples:

| Finding | Remediation |
| --- | --- |
| Missing tags | Terraform adds required tags module-wide. |
| Public network enabled | Add private endpoint, disable public network access. |
| Missing diagnostics | Add diagnostic settings module. |
| Key Vault purge protection disabled | Enable purge protection before production. |
| AKS public API too open | Restrict authorized IPs or use private cluster. |

## Security and Secrets

Secrets should flow as:

```text
Terraform creates Key Vault secrets/references
  -> External Secrets Operator or Key Vault CSI Driver
  -> Kubernetes Secrets / mounted volumes
  -> Application pods
```

No application secrets should be committed to Git.

GitHub Actions secrets should be limited to CI/CD integration secrets:

- Azure federated identity configuration.
- Sonar/Snyk tokens.
- Slack webhook.
- Temporary ACR admin credentials only for dev/test until OIDC-based ACR push is implemented.

Production should avoid ACR username/password and use Azure federated identity or scoped tokens.

## Observability

Use Azure Monitor and Application Insights:

- Container insights for AKS.
- App Insights for dashboard/API services.
- Diagnostic settings for Key Vault, PostgreSQL, Service Bus, App Gateway, Front Door, Firewall, ACR.
- Alerts:
  - AKS node pressure.
  - Pod crash loops.
  - PostgreSQL CPU/storage/connections.
  - Service Bus dead-letter count.
  - App Gateway unhealthy backend.
  - Front Door origin health.
  - Key Vault denied access spikes.
  - Firewall denied traffic anomalies.

## Open Questions Before Terraform

Required:

- Confirm Azure CLI/service principal access to hub and test subscriptions. Current local Azure CLI visibility needs validation.
- Confirm final CIDR ranges do not overlap with any existing networks.
- Confirm whether App Gateway public origin locked to Front Door is acceptable for the demo before later Private Link hardening.
- Confirm exact monthly budget ceiling for Firewall, Front Door Premium, App Gateway WAF, AKS, and DR warm standby.

Answered:

- Hub subscription ID: `5b942f88-17e6-4026-ae23-d520365fb916`.
- Test subscription ID: `6b01db76-626a-44a2-8119-17682410914a`.
- Prod subscription ID: `a8270be7-dabc-4d92-98db-26a55025b0df`.
- Subscriptions are under the same tenant.
- Entra ID groups, federated credentials, and role assignments can be created.
- `kairoai.in` is registered in GoDaddy.
- AKS should run inside private VNet subnets.
- Test should use a separate Front Door route.
- DR level for demo should be practical and budget-aware; recommended default is Level 2.
- Terraform pipelines can wait until the core infrastructure design and first build are ready.

Recommended defaults if not specified:

- Use private AKS for prod; use restricted public AKS API for test initially.
- Use Front Door Premium for prod and test routes.
- Use App Gateway WAF v2 in test/prod.
- Start prod DR at Level 2.
- Centralize DNS/private DNS in hub.
- Use GitHub OIDC to Azure for Terraform.

## Public DNS Plan With GoDaddy

`kairoai.in` can remain registered at GoDaddy while Azure manages DNS records.

Current delegated Azure DNS nameservers:

- `ns1-05.azure-dns.com.`
- `ns2-05.azure-dns.net.`
- `ns3-05.azure-dns.org.`
- `ns4-05.azure-dns.info.`

Detailed request flow is documented in `../../kairoai-infra/docs/public-dns-and-ingress-flow.md`.

Recommended approach:

1. Create Azure DNS public zone `kairoai.in` in the hub subscription.
2. Azure DNS will provide authoritative nameservers.
3. Update GoDaddy nameservers for `kairoai.in` to the Azure DNS nameservers.
4. Manage DNS records in Terraform inside the hub environment.
5. Use Azure Front Door-managed TLS certificates for public hostnames where possible.

Alternative:

- Keep DNS records in GoDaddy and create/modify records manually.
- This is faster for one-off demos but weaker for Terraform-managed production because DNS drift is likely.

Recommendation:

- Delegate the domain to Azure DNS before production Terraform is finalized.
- For the demo, temporary GoDaddy records are acceptable only if we record them in the runbook.

## Approval Checkpoint

Before Terraform implementation, review and approve:

- Subscription and region plan.
- Naming convention.
- CIDR/subnet plan.
- Ingress path.
- Hub shared services list.
- Test/prod/prod-dr service list.
- RBAC and policy baseline.
- Terraform pipeline approval gates.
