# Cost Service Plan

## Repository

- `kairoai-cost-service`

## Purpose

Estimate Terraform cost impact and identify cost warnings.

## Responsibilities

- Run Infracost.
- Parse cost output.
- Calculate monthly cost delta.
- Identify threshold breaches.
- Produce cost optimization suggestions.

## MVP Endpoints

- `POST /cost/estimate`
- `GET /cost/results/{cost_id}`

## Dependencies

- Infracost CLI.
- Infracost API key.
- Terraform plan JSON.
- Shared schemas.

## Configuration

- `INFRACOST_API_KEY`
- `INFRACOST_BIN`
- `COST_WARNING_PERCENTAGE`
- `COST_BLOCK_AMOUNT`
- `COST_BLOCK_PERCENTAGE`

## MVP Deliverables

- Infracost container integration.
- Cost estimate parser.
- Threshold result logic.
- Tests with fixture Infracost output.

## Risks

- Infracost requires provider-specific context.
- Cost estimates can be incomplete for unsupported resources.
