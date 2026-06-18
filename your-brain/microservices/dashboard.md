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

Dashboard should start after the end-to-end GitHub review loop works.

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
