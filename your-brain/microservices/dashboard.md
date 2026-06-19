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

Dashboard should start after the AKS-hosted GitHub review loop works, not before.

Start the dashboard when these are true:

- The active services are deployed to AKS.
- GitHub App webhooks are pointed at AKS ingress.
- PR validation, annotations, AI recommendations, and baseline classification are validated from AKS.
- Review Orchestrator has stable read APIs for review history, review detail, findings, and repository summaries.

Recommended start date:

- Start UX/API planning immediately after AKS validation.
- Start the actual `kairoai-dashboard` repo after the June 23 AKS target is stable.

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
