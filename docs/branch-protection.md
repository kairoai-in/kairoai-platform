# Branch Protection

KairoAI publishes a GitHub Check Run named:

```text
KairoAI Terraform Validation
```

Use this check as the first MVP merge gate for Terraform pull requests.

## Recommended Rule

For repositories using KairoAI:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require the `KairoAI Terraform Validation` check.
- Require branches to be up to date before merging once CI is stable.

## Manual Setup

In GitHub:

1. Open the repository settings.
2. Go to `Rules` or `Branches`, depending on the repository UI version.
3. Create or edit the rule for `main`.
4. Enable required status checks.
5. Select `KairoAI Terraform Validation`.
6. Save the rule.

## Current Test Repositories

- `kairoai-in/example-terraform` PR `#1` validates the passing path.
- `kairoai-in/example-terraform` PR `#2` intentionally validates the failing path.

## Automation Direction

Later, KairoAI should automate repository setup through either:

- A GitHub App setup flow that can suggest required branch rules.
- An admin CLI/job that configures rulesets for selected repositories.

For now, keep branch protection manual until the product has organization/repository onboarding UX.
