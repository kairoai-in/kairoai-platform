# Governance Service Plan

## Repository

- `kairoai-governance-service`

## Purpose

Evaluate organization governance policies against Terraform changes.

## Responsibilities

- Validate required tags.
- Validate naming conventions.
- Check approved regions.
- Check module version pinning.
- Enforce encryption rules.
- Support repository-level and organization-level policy config.

## MVP Endpoints

- `POST /governance/evaluate`
- `GET /governance/results/{governance_id}`

## Dependencies

- Shared schemas.
- Policy configuration source.
- Terraform change summaries.

## Configuration

- `DEFAULT_POLICY_PATH`
- `ORG_POLICY_SOURCE`
- `GOVERNANCE_MODE`

## MVP Deliverables

- Static policy config format.
- Required tags check.
- Approved regions check.
- Module version pinning check.
- Normalized governance findings.

## Risks

- Governance must be configurable per organization.
- Hardcoded policies can make early demos brittle.
