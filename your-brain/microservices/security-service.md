# Security Service Plan

## Repository

- `kairoai-security-service`

## Purpose

Run security scanners and normalize findings.

## Responsibilities

- Run Checkov for MVP.
- Parse Checkov output.
- Normalize security findings.
- Map scanner severity to KairoAI severity.
- Support tfsec and Terrascan later through adapters.

## MVP Endpoints

- `POST /security/scan`
- `GET /security/results/{scan_id}`

## Dependencies

- Checkov.
- Shared schemas.
- Artifact store or workspace input.

## Configuration

- `CHECKOV_BIN`
- `SCAN_TIMEOUT_SECONDS`
- `RULE_CONFIG_PATH`
- `ARTIFACT_STORE_URL`

## MVP Deliverables

- Checkov container integration.
- JSON output parser.
- Normalized `Finding` records.
- Tests with fixture scanner output.

## Risks

- Scanner output changes can break parsing.
- Duplicate findings across future scanners need deduplication.
