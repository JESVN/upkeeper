# Cookbook

Step-by-step guides for the changes this project makes repeatedly. A guide is ordered and ends in verify steps; the contracts it relies on live in `docs/` and are linked rather than restated. Design rationale lives in an [Agent Note](../../.agents/notes/README.md).

| Guide | Use when |
|---|---|
| [adding-a-provider.md](adding-a-provider.md) | Adding an application (config only), a manager row, or a new mechanism |
| [adding-a-cleanup-rule.md](adding-a-cleanup-rule.md) | Adding or widening a rule that deletes something |
| [verifying-a-release-source.md](verifying-a-release-source.md) | Replacing a `# TBD` version source with a confirmed one |

Writing a new guide: number the steps, make every step verifiable on its own, and put the check that proves the step worked immediately after it. If a guide needs more than about ten steps, the change it describes is too large to do in one pass.
