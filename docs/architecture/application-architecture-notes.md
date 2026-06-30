# KairoAI Application Architecture Notes

Diagram: `kairoai-application-architecture.excalidraw`

## Runtime Shape

KairoAI runs as microservices on AKS. Public traffic enters through the configured edge path:

```text
User / GitHub
  -> Azure DNS / Front Door / Application Gateway WAF
  -> AKS ingress
  -> KairoAI services
```

## Microservices

| Service | Role |
| --- | --- |
| `kairoai-dashboard` | Next.js dashboard, GitHub OAuth/session flow, review and repository visibility. |
| `kairoai-api-gateway` | Public FastAPI gateway for GitHub webhooks and external API entry. |
| `kairoai-review-orchestrator` | Creates review jobs, stores workflow state, exposes dashboard read APIs, dispatches async work. |
| `kairoai-review-worker` | Consumes Service Bus review jobs and executes the analysis pipeline. |
| `kairoai-github-service` | GitHub App adapter for installation auth, PR metadata, changed files, checks, and comments. |
| `kairoai-terraform-runner` | Runs Terraform init, validate, plan, and normalized plan output. |
| `kairoai-security-service` | Runs Checkov and normalizes security findings. |
| `kairoai-cost-service` | Runs Infracost and normalizes cost deltas/resource cost output. |
| `kairoai-governance-service` | Evaluates naming, tags, regions, module pinning, and policy rules. |
| `kairoai-ai-service` | Produces scores, merge decision summaries, recommendations, and fix suggestions. |
| `kairoai-notification-service` | Renders and publishes GitHub PR comments/check summaries through GitHub Service. |
| `kairoai-shared` | Shared schemas, event contracts, fixtures, and domain models used by services. |

## Main Pull Request Flow

1. GitHub sends a signed `pull_request` webhook to `api.kairoai.in`.
2. `kairoai-api-gateway` verifies `X-Hub-Signature-256`.
3. API Gateway forwards the review creation request to `kairoai-review-orchestrator`.
4. Review Orchestrator stores the job in Azure PostgreSQL Flexible Server.
5. Review Orchestrator enqueues async work on Azure Service Bus queue `review-analysis`.
6. `kairoai-review-worker` consumes the queued review job.
7. Worker calls `kairoai-github-service` to fetch PR metadata and changed Terraform files.
8. Worker calls Terraform, security, cost, and governance services over internal HTTP.
9. Worker calls `kairoai-ai-service` for AI explanation, summary, and recommendations.
10. AI Service calls Azure AI Foundry / Azure AI Services.
11. Worker persists final results through the orchestrator/database path.
12. Worker or orchestrator calls `kairoai-notification-service`.
13. Notification Service calls GitHub Service to upsert PR comments and check runs.
14. GitHub displays checks, annotations, and comments on the pull request.

## Dashboard Flow

1. User opens `kairoai.in`.
2. `kairoai-dashboard` handles GitHub OAuth and GitHub App installation discovery.
3. Dashboard uses the signed-in user's installation ID to scope repository/review data.
4. Dashboard calls internal Review Orchestrator read APIs:
   - `GET /reviews`
   - `GET /reviews/repositories`
   - `GET /reviews/{id}/analysis`
5. Review Orchestrator returns only data scoped to that GitHub App installation.

## Managed Dependencies

| Dependency | Purpose |
| --- | --- |
| Azure PostgreSQL Flexible Server | Review jobs, review results, repositories, baselines, users/installations. |
| Azure Service Bus | Async review analysis queue between orchestrator and worker. |
| Azure AI Foundry / Azure AI Services | AI summaries, recommendations, and decision support. |
| Azure Key Vault | Runtime secrets mounted into AKS via CSI/Kubernetes secret. |
| Azure Monitor / Application Insights / Log Analytics / Grafana | Logs, metrics, traces, dashboards, and alerts. |
| Hub ACR | Container images consumed by AKS deployments. |

## Communication Style

- External traffic uses HTTPS through Front Door and Application Gateway WAF.
- Service-to-service calls inside AKS use internal HTTP service names.
- Long-running analysis is asynchronous through Azure Service Bus.
- Database access is centralized around Review Orchestrator and worker persistence paths.
- GitHub API calls are abstracted behind `kairoai-github-service`.
- AI provider calls are abstracted behind `kairoai-ai-service` so future providers can be added.

