# Your Brain

This directory stores the working memory for `kairoai-platform`.

Use it to keep durable project context, decisions, and plans close to the code so each build step has a clear trail.

## Files

- `context.md` - product idea, scope, users, and current repo status.
- `decisions.md` - architecture and product decisions as they become firm.
- `infra-plan.md` - infrastructure, cloud, Terraform, runtime, and environment plan.
- `app-plan.md` - application services, APIs, data model, and product delivery plan.
- `ci-cd-plan.md` - build, test, release, deployment, and GitHub automation plan.
- `application-and-repo-plan.md` - repository strategy, service split, Azure direction, portability plan, and execution sequence.
- `schema-and-contracts-plan.md` - shared domain models, events, API contracts, and versioning strategy.
- `microservices/` - one planning file per service or deployable repo.
- `vm-validation-log.md` - validation notes from VM/dev-host integration testing.

## Update Rule

When a meaningful decision is made, record it in `decisions.md` with the timestamp, decision, reason, and impact.

When a plan changes, update the relevant plan file instead of leaving knowledge only in chat.
