# Notification Service Plan

## Repository

- `kairoai-notification-service`

## Purpose

Publish review results back to GitHub and future notification channels.

## Responsibilities

- Format PR review comments.
- Create or update GitHub check runs.
- Publish final merge gate result.
- Avoid duplicate comments.
- Support Slack, Teams, and email later.

## MVP Endpoints

- `POST /notifications/pr-comment`
- `POST /notifications/status-check`
- `POST /notifications/review-complete`

## Dependencies

- GitHub Service.
- Shared schemas.
- Review Orchestrator.

## Configuration

- `GITHUB_SERVICE_URL`
- `COMMENT_TEMPLATE_PATH`
- `STATUS_CHECK_NAME`
- `LOG_LEVEL`

## MVP Deliverables

- Markdown PR comment renderer.
- GitHub check run update flow.
- Idempotent comment update logic.
- Tests for comment formatting.

## Risks

- Noisy or duplicated comments will reduce trust.
- GitHub check state must match merge gate decisions exactly.
