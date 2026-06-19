# AI Service Plan

## Repository

- `kairoai-ai-service`

## Purpose

Generate health scores, merge decisions, summaries, recommendations, and suggested fixes.

## Responsibilities

- Aggregate normalized analysis inputs.
- Calculate deterministic health score.
- Apply merge gate rules.
- Generate AI summary.
- Generate recommended fixes.
- Return PR-ready review content.

## MVP Endpoints

- `POST /ai/findings/explain`
- `POST /ai/score`
- `POST /ai/merge-decision`
- `POST /ai/recommendations`
- `POST /ai/review-summary`

## Dependencies

- Azure AI Foundry as the primary MVP AI provider.
- Provider adapter boundary for future AI providers.
- Shared schemas.
- Secret provider.

## Configuration

- `AI_PROVIDER`
- `AI_MODEL`
- `AZURE_AI_FOUNDRY_ENDPOINT`
- `AZURE_AI_FOUNDRY_API_KEY`
- `AZURE_AI_FOUNDRY_DEPLOYMENT`
- `AZURE_AI_FOUNDRY_API_VERSION`
- `MAX_OUTPUT_TOKENS`
- `HEALTH_SCORE_CONFIG_PATH`

## MVP Deliverables

- Finding explanation endpoint with deterministic fallback.
- Deterministic scoring engine.
- Rule-based merge decision.
- AI prompt templates.
- JSON response validation.
- Tests with mocked AI responses.

## Risks

- AI output must be validated before posting to GitHub.
- Merge decisions should not rely only on free-form model text.
