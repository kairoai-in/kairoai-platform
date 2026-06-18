# KairoAI Platform Context

## Source Idea

Kairo is an AI-powered infrastructure review and governance platform for Terraform pull requests.

The platform acts like an AI Cloud Architect. It reviews infrastructure-as-code changes before merge and answers:

> Should this infrastructure change be merged?

## Core Problem

Terraform pull requests are often reviewed manually by engineers who may not have deep expertise in cloud security, cloud architecture, cost optimization, and governance.

This can lead to:

- Security misconfigurations.
- Unexpected cloud costs.
- Poor infrastructure design.
- Missing required tags or standards.
- Duplicate infrastructure patterns.
- Infrastructure drift.
- Slow pull request reviews.

## Proposed Solution

Kairo automatically reviews Terraform changes in GitHub pull requests and produces:

- Terraform Health Score.
- Merge Gate Result.
- Security Findings.
- Cost Impact Report.
- Governance Findings.
- AI Recommendations.
- Suggested Fixes.

## MVP Scope

Build first:

- GitHub App integration.
- Pull request event handling.
- Terraform file detection.
- Terraform validation.
- Checkov scan.
- Infracost estimate.
- AI summary generation.
- Health Score calculation.
- Merge Gate decision.
- Pull request comment posting.

Later:

- tfsec.
- Terrascan.
- Drift detection.
- Module reuse detection.
- Dashboard.
- Auto-remediation pull requests.

## Initial Service Map

- API Gateway Service.
- GitHub Integration Service.
- Review Orchestrator Service.
- Terraform Execution Service.
- Security Analysis Service.
- Cost Analysis Service.
- Governance Service.
- Drift Detection Service.
- AI Intelligence Service.
- Notification Service.

## Current Repository

- Organization: `kairoai-in`.
- Repository: `kairoai-platform`.
- Initial status: empty platform repository cloned locally.
- First memory directory: `your-brain`.

## Working Notes

- The raw idea came from `idea.md` in the workspace root.
- The org repo was created with GitHub CLI.
- This repository should become the main platform codebase unless a later decision splits services into separate repos.
