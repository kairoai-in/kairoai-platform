# Dashboard Frontend Plan

## Repository

- `kairoai-dashboard`

## Purpose

Provide a web dashboard for organization-level visibility after the GitHub PR workflow MVP is working.

## Stack

- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui or a small internal component system.
- TanStack Query.
- TanStack Table.
- Recharts or ECharts.
- Zod.

## Responsibilities

- Show review history.
- Show repository risk summaries.
- Show cost and security trends.
- Manage organization settings.
- Manage governance policies later.
- Show GitHub App installation state.

## MVP Timing

Dashboard is not required for the first PR-review MVP.

First user interface:

- GitHub PR comments.
- GitHub check runs.

Dashboard implementation can start after the 2026-06-20 AKS validation pause point.

Start the dashboard now because these are true:

- The active services are deployed to AKS.
- GitHub App webhooks reach the AKS API Gateway through the temporary `api.kairoai.in` VM Nginx bridge.
- PR validation, security findings, AI recommendations, and GitHub checks are validated from AKS on `example-terraform` PR `#2`.
- Review Orchestrator has read APIs for review detail, Terraform validation, security scan results, and changed Terraform files.

Recommended start date:

- Start the actual `kairoai-dashboard` repo next.
- Keep the first dashboard slice narrow: authenticated shell, review list, review detail, findings table, and links back to GitHub PR/checks.
- Do not block dashboard start on final Terraform/IaC cleanup, AKS ingress replacement, or Azure AI Foundry production credentials.

Reason:

- Before AKS validation, GitHub PR comments and checks are enough UI for the MVP.
- Starting the dashboard too early would force UI work against unstable APIs.
- Starting right after AKS validation lets the dashboard use real persisted review data instead of mock-only screens.

## Initial Screens

- Login.
- Organization selector.
- Review list.
- Review detail.
- Repository settings.
- Policy settings.

## Risks

- Building dashboard too early can distract from proving the PR review loop.
- UI needs stable APIs from platform services.
