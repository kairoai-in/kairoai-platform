# KairoAI Architecture Cross-Check Insights

Last reviewed: `2026-06-29 11:55 +05:30`

Reviewed files:

- `app-arch.svg`
- `kairoai-application-architecture.excalidraw`
- `application-architecture-notes.md`
- `infra-arch.svg`

Validation sources:

- Current repos and Helm/ArgoCD values under `kairoai-deployments`.
- Current Terraform docs and modules under `kairoai-infra`.
- Read-only Azure inventory for hub/test/prod subscriptions.
- Read-only prod AKS inventory for namespace `kairoai`.

## Application Architecture Review

### What Matches

- The main PR-review flow is correct: GitHub webhook -> `kairoai-api-gateway` -> `kairoai-review-orchestrator` -> Service Bus -> `kairoai-review-worker` -> analysis services -> GitHub comments/checks.
- The service list in `application-architecture-notes.md` matches the intended microservice architecture: dashboard, API gateway, review orchestrator, review worker, GitHub service, Terraform runner, security, cost, governance, AI, notification, and shared contracts.
- Azure PostgreSQL Flexible Server is correctly shown as the application state/results database.
- Azure Service Bus is correctly shown as the async broker. RabbitMQ should not be shown in the hosted Azure architecture except as local/legacy compatibility.
- Azure AI Foundry / Azure AI Services is correctly behind `kairoai-ai-service`, not called directly by dashboard or workers.
- GitHub API calls being abstracted behind `kairoai-github-service` is correct.
- Dashboard auth/session flow through GitHub OAuth and GitHub App installation is correctly part of the dashboard/application boundary.

### What To Change

- Show `kairoai-review-worker` as a separate deployment but clarify it uses the `kairoai-review-orchestrator` image/package entrypoint. In prod AKS it is deployed as `kairoai-review-worker` using image `acrkairoaihubci.azurecr.io/kairoai-review-orchestrator:prod-v0.1.3`.
- Add `kairoai-runtime-secrets` if the diagram is meant to be operational/deployment-level. It is not a business microservice, but it is deployed in AKS and syncs Key Vault secrets through CSI/Kubernetes secret handling.
- Make the database arrow precise: `review-orchestrator` and `review-worker` need database access. The dashboard should not connect directly to PostgreSQL; it reads through APIs.
- Make the dashboard API path precise: browser/dashboard should call `api.kairoai.in` / API Gateway, and API Gateway should route dashboard read calls to Review Orchestrator. If the diagram shows dashboard directly calling orchestrator, label it as internal/API proxy path, not browser direct access.
- Add a clear arrow from `notification-service` -> `github-service` -> GitHub. Notification service should not call GitHub directly in the clean architecture.
- Add check-run/comment arrows from `github-service` back to GitHub PRs. This is a key product behavior and should be visible.
- Add the baseline/default-branch path if you want completeness: GitHub push/default branch event -> API Gateway -> Review Orchestrator baseline endpoint -> Security Service -> PostgreSQL baseline records.
- Add repository/user isolation note near dashboard/orchestrator: data is scoped by GitHub installation/user context. This matters because we fixed the multi-user visibility concern.

### Missing Or Ambiguous Arrows

- `api-gateway -> review-orchestrator`: create review and dashboard read proxy.
- `review-orchestrator -> Service Bus review-analysis`: enqueue async work.
- `Service Bus review-analysis -> review-worker`: consume async work.
- `review-worker -> github-service`: fetch PR metadata/files and publish final GitHub checks through helper paths.
- `review-worker -> terraform-runner/security/cost/governance/ai-service`: analysis fan-out.
- `ai-service -> Azure AI Services`: AI summary/suggestions.
- `review-worker/orchestrator -> PostgreSQL`: persist review status/results.
- `notification-service -> github-service -> GitHub`: PR comment/check summaries.
- `AKS workloads -> Key Vault/CSI secret sync`: runtime configuration path.

### Current Prod AKS Reality

Current prod deployments in namespace `kairoai`:

- `kairoai-dashboard`
- `kairoai-api-gateway`
- `kairoai-github-service`
- `kairoai-review-orchestrator`
- `kairoai-review-worker`
- `kairoai-terraform-runner`
- `kairoai-security-service`
- `kairoai-cost-service`
- `kairoai-governance-service`
- `kairoai-ai-service`
- `kairoai-notification-service`
- `kairoai-runtime-secrets`

Only dashboard and API gateway have public ingress through Application Gateway:

- `kairoai.in` -> `kairoai-dashboard`
- `api.kairoai.in` -> `kairoai-api-gateway`

All other services are internal ClusterIP services.

## Infrastructure Architecture Review

### What Matches

- The high-level flow is correct: User/GitHub -> GoDaddy delegation -> Azure DNS -> Azure Front Door -> Application Gateway WAF -> AKS -> app services.
- Front Door is correctly placed in the hub/shared subscription. Current live profile is `afd-kairoai-global`; endpoint resource is `afd-kairoai-global/fde-kairoai-global` and public hostname is `fde-kairoai-global-abbxdsduhdbbe5dy.z02.azurefd.net`.
- Hub subscription correctly contains shared ACR `acrkairoaihubci`, public DNS zone `kairoai.in`, private DNS zones, hub VNet, Terraform state storage, hub Key Vault, and hub Log Analytics.
- Test and prod spokes correctly contain AKS, App Gateway WAF, PostgreSQL Flexible Server, Service Bus, Key Vault, App Insights/Log Analytics, and VNet/subnets.
- Prod AI Services is correctly in South India as `oai-kairoai-prod-si` even though it belongs to the prod resource group. This is due to model/quota availability.
- The `snet-aci-private` note is correct conceptually: it is reserved for private ephemeral jobs/runners and currently unused.
- Firewall and Bastion are correctly marked as deferred if your diagram says they are not deployed. They should not appear as active/live traffic path components.

### What To Change

- Mark Key Vault private endpoints as live for hub, test, prod, and prod DR.
- If you keep future private endpoints for ACR, Service Bus, Storage, AI, or Monitor in the diagram, use dashed boxes/arrows and label them `next hardening step`.
- Add AKS private API endpoints explicitly and distinguish them from the four Key Vault private endpoints now deployed in the environment private-endpoint subnets.
- Add the AKS-managed node resource groups if diagram fidelity matters: `rg-kairoai-test-ci-aks-nodes` and `rg-kairoai-prod-ci-aks-nodes`. These contain VMSS node pools, AKS load balancer, NSGs, managed identities, and AKS API private endpoint resources.
- Add managed identities that are live from AKS add-ons, not only generic `Managed identities`: `azurekeyvaultsecretsprovider-*`, `azurepolicy-*`, `*-agentpool`, and prod `ingressapplicationgateway-aks-kairoai-prod-ci`.
- Add `review-analysis` queue as the real runtime queue. `review-jobs` and `analysis-results` exist for compatibility/contracts, but workers use `review-analysis`.
- In the prod DR block, fix `snet-aci-private` CIDR if shown. It should be `10.40.15.0/24`, not `10.30.15.0/24`.
- In the prod DR block, mark AKS/App Gateway/PostgreSQL/Service Bus/AI as feature-gated, not live. Live DR resources are mainly RG/VNet/subnets/private DNS links/Key Vault/Log Analytics/App Insights/action group.
- In the test block, mark Azure AI Foundry as planned/disabled unless you have since enabled it. Live Azure inventory did not show test AI Services.
- Add Front Door custom domain/DNS validation records in the hub DNS section: `@`, `api`, `test`, `test-api`, and `_dnsauth*` TXT records.
- Add Front Door diagnostics and alerts in hub: `alert-afd-kairoai-global-origin-health-low`, `alert-afd-kairoai-global-latency-high`, and diagnostic setting if represented.
- Add PostgreSQL monitoring alerts that are live but not clearly shown: `alert-kairoai-test-postgres-cpu-high`, `alert-kairoai-test-postgres-storage-high`.
- Add AKS node CPU/memory alerts in test if you want observability completeness.
- Fix duplicate or misplaced `snet-aci-private` labels. The extracted infra labels show repeated `snet-aci-private` entries and at least one repeated prod CIDR under DR.
- In the AKS application service list inside the infra diagram, add missing deployed workloads: `kairoai-review-worker` and `kairoai-notification-service`. Optionally add `kairoai-runtime-secrets` as an operational helper.

### Missing Or Ambiguous Infra Arrows

- GoDaddy should point to Azure DNS nameservers, not to Front Door directly.
- Azure DNS records should point to Front Door endpoint/custom domains.
- Front Door should have separate hostname routes:
  - `kairoai.in` -> prod dashboard origin
  - `api.kairoai.in` -> prod API origin
  - `test.kairoai.in` -> test dashboard origin
  - `test-api.kairoai.in` -> test API origin
- Front Door origins should point to the App Gateway public frontend IP/hostname, not directly to AKS.
- Application Gateway should route to AKS ingress/AGIC-managed backend services.
- AKS should connect privately to PostgreSQL Flexible Server through the delegated PostgreSQL subnet/private DNS path.
- AKS should use Service Bus namespace for async messaging.
- AKS workloads should read secrets through Key Vault CSI/runtime secret sync.
- Hub private DNS zones should link to hub/test/prod/prod-dr VNets.
- VNet peering should be bidirectional between hub and each spoke.
- ACR should feed image pulls to AKS clusters. If ACR private endpoint is not implemented yet, do not draw ACR as private-only.

### Current Live Private Endpoint Reality

Live private endpoints found now:

- Test AKS private API endpoint: `kube-apiserver` in `rg-kairoai-test-ci-aks-nodes`.
- Prod AKS private API endpoint: `kube-apiserver` in `rg-kairoai-prod-ci-aks-nodes`.
- Test Key Vault private endpoint: `pe-kv-kairoai-test-ci` -> `10.20.13.4`.
- Hub Key Vault private endpoint: `pe-kv-kairoai-hub-ci` -> `10.10.2.4`.
- Prod Key Vault private endpoint: `pe-kv-kairoai-prod-ci` -> `10.30.13.4`.
- Prod DR Key Vault private endpoint: `pe-kv-kairoai-prod-dr-si` -> `10.40.13.4`.

Not live yet:

- ACR private endpoint.
- Service Bus private endpoint.
- Storage private endpoint for Terraform state.
- Azure AI private endpoint.
- Azure Monitor private link scope/private endpoints.

### Best Diagram Corrections Before Presentation

- Use solid lines for live paths and dashed lines for planned/private hardening.
- Add a small legend: `solid = live`, `dashed = planned`, `gray = deferred/cost gated`.
- Keep Firewall and Bastion gray/deferred, outside the active request path.
- Place Front Door only in hub/shared, not inside prod/test spokes.
- Place App Gateway WAF inside each spoke and make it clear Front Door routes to the correct spoke App Gateway based on hostname.
- Put PostgreSQL inside the spoke VNet path via delegated subnet, not as a pod and not as a generic public database.
- Put Key Vault inside each environment and mark the hub, test, prod, and prod-DR private endpoints as live.
- Put hub Key Vault as shared control-plane only; test/prod Key Vaults are runtime secrets.
- Add ArgoCD/GitOps if this diagram is also meant to show deployment operations. Current runtime uses ArgoCD app manifests in `kairoai-deployments/argocd/apps` watching Helm charts/values.
