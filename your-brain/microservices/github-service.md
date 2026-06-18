# GitHub Service Plan

## Repository

- `kairoai-github-service`

## Purpose

Own all GitHub App interactions.

## Responsibilities

- Manage GitHub App authentication.
- Resolve installation tokens.
- Fetch pull request metadata.
- Fetch changed files.
- Fetch repository contents or clone metadata.
- Create and update check runs.
- Post pull request comments.
- Add line-level annotations later.

## MVP Endpoints

- `GET /github/repos/{owner}/{repo}/pulls/{number}`
- `GET /github/repos/{owner}/{repo}/pulls/{number}/files`
- `POST /github/repos/{owner}/{repo}/pulls/{number}/comments`
- `POST /github/repos/{owner}/{repo}/checks`

## Dependencies

- GitHub API.
- Shared schemas.
- Secret provider for GitHub App private key.
- Optional artifact store for fetched metadata.

## Configuration

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_API_BASE_URL`
- `LOG_LEVEL`

## MVP Deliverables

- GitHub App token generation.
- PR file detection.
- PR comment creation.
- Check run creation and update.
- Tests with mocked GitHub API responses.

## Risks

- GitHub rate limits.
- Installation token caching must be correct.
- Comments should be updated idempotently to avoid noisy PRs.
