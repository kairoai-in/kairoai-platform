# Decisions

This file records meaningful product and engineering decisions.

## 2026-06-18 16:00:00 +05:30 - Create Platform Repository

Decision:

- Create `kairoai-in/kairoai-platform` as the first repository for the KairoAI platform.

Reason:

- The project needs one central starting point for platform code, architecture notes, and delivery plans.

Impact:

- Initial work will happen in this repo.
- Future repos can be created later for standalone services, infrastructure modules, examples, or documentation if the platform outgrows a monorepo.

## 2026-06-18 16:05:00 +05:30 - Store Working Memory In Repo

Decision:

- Create `your-brain` in the platform repo to store context, decisions, and plans as markdown files.

Reason:

- The project is early and evolving quickly. Keeping project memory in version control prevents decisions from being lost in chat.

Impact:

- Major decisions should be added to `your-brain/decisions.md`.
- Planning changes should be captured in the relevant plan file.

## 2026-06-18 16:05:00 +05:30 - Start With MVP-Oriented Platform Scope

Decision:

- Treat GitHub App integration, Terraform detection/validation, Checkov, Infracost, AI summary, health scoring, merge gate, and PR comments as the first MVP path.

Reason:

- These features prove the main product loop: detect a Terraform PR, analyze it, decide risk, and report back inside GitHub.

Impact:

- Drift detection, module reuse detection, dashboard, and auto-remediation stay out of the first build unless priorities change.

## 2026-06-18 17:10:24 +05:30 - Use Azure As First Production Infrastructure Direction

Decision:

- Plan first production infrastructure around Azure, especially AKS and Key Vault.

Reason:

- The platform needs a clear production target while application work is planned.

Impact:

- Infrastructure planning will assume AKS, Azure Key Vault, Azure PostgreSQL, Azure Container Registry, and Azure Monitor.
- Application services must remain portable through adapters so they can still run on Docker Compose locally and other clouds later.

## 2026-06-18 17:10:24 +05:30 - Plan Separate Microservice Repositories

Decision:

- Plan separate repositories for deployable microservices, shared contracts, infrastructure, and deployments.

Reason:

- The platform has clear service boundaries and will likely need independent service ownership, CI, and deployment paths.

Impact:

- `kairoai-platform` remains the coordination and local integration repo.
- First-wave service repositories should be created before implementation begins.

## 2026-06-18 17:10:24 +05:30 - Use Next.js For Future Dashboard

Decision:

- Use Next.js with TypeScript for the future dashboard frontend.

Reason:

- The dashboard will need organization settings, review history, risk summaries, trend charts, tables, and authenticated workflows.
- Next.js gives a strong API-driven frontend foundation and can be deployed independently.

Impact:

- The future frontend repository should be `kairoai-dashboard`.
- The first MVP can still ship without a dashboard by using GitHub PR comments and check runs as the primary user interface.

## 2026-06-18 17:10:24 +05:30 - Create Service-Level Plans And Schema Plan

Decision:

- Maintain one plan file per microservice and one shared schema/contracts plan.

Reason:

- The platform will have many moving pieces. Each service needs a clear responsibility, API surface, data ownership, dependencies, and MVP scope.

Impact:

- Service planning will live in `your-brain/microservices/`.
- Shared schemas and events will live in `your-brain/schema-and-contracts-plan.md`.
- Repository creation should follow these plans.
