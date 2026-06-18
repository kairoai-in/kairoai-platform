# Shared Package Plan

## Repository

- `kairoai-shared`

## Purpose

Provide shared schemas, event contracts, API clients, and test fixtures.

## Responsibilities

- Define Pydantic models.
- Export JSON Schema.
- Store sample payload fixtures.
- Provide common error and pagination schemas.
- Provide lightweight service clients if useful.
- Keep contract tests consistent across services.

## Package Contents

- `kairoai_shared.models`
- `kairoai_shared.events`
- `kairoai_shared.errors`
- `kairoai_shared.fixtures`
- `kairoai_shared.contracts`

## MVP Deliverables

- Core domain schemas.
- Event envelope schema.
- Finding schema.
- Health score schema.
- Merge decision schema.
- JSON fixtures.
- CI for schema validation.

## Risks

- Shared packages can become dumping grounds.
- Keep business logic inside services, not in shared models.
