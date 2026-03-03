---
schema_version: "1.0"
name: "sample-codemod"
version: "0.1.0"
description: "Move React components defined inside other components to module scope to prevent state resets and re-render bugs"
author: "Codemod Authors"
license: "MIT"
workflow: "workflow.yaml"
category: "migration"
targets:
  languages: ["typescript"]
keywords: ["react", "upgrade", "standardization", "performance"]
registry:
  access: "public"
  visibility: "public"
---

# Operational Instructions for sample-codemod

Instructions for AI agents to read, adapt, run, and execute this codemod workflow safely.

## Reading the Workflow Graph

Parse `workflow.yaml`. The execution graph is:

1. **apply-transforms** — AST transformations via `scripts/codemod.ts`
2. **ai-tricky-cases** — `depends_on: [apply-transforms]`; AI step for closure-dependent cases
3. **publish** — `depends_on: [ai-tricky-cases]`; push and create PR when `params.publish_pr` is true

Run nodes in this topological order. Steps inside each node run sequentially.

## Step-by-Step Execution

1. Execute each node in topological order.
2. **After each change-producing step:** Run validation before proceeding.
   - `npm test` — jssg tests
   - `npm run check-types` — typecheck (or equivalent)
   - `npx codemod workflow validate workflow.yaml` — workflow schema
3. Review diffs. Proceed only when validation passes and changes look correct.
4. If validation fails or diffs are wrong, fix and retry before continuing.

## AI Steps

When `params.run_ai_step` is true, the ai-tricky-cases node runs an AI step. Treat the AI step **prompt** (in workflow.yaml) as context for edge cases that the AST codemod cannot safely handle—e.g. closure-dependent nested components.

- Apply AI changes only where the workflow indicates (inside ai-tricky-cases).
- Keep AI edits localized and reviewable. Add TODOs if unsure.
- Do not re-describe the migration; the prompt already covers the goal and constraints.

## Adapting the Workflow and Scripts

To adapt for user code patterns:

- **Include/exclude globs** — Adjust `include` and `exclude` in the js-ast-grep step to match the target project layout.
- **Script logic** — Modify `scripts/codemod.ts` to add or refine patterns. Run tests after changes.
- **Params** — Use `run_ai_step=true` when the codebase has closure-dependent nested components that need manual/AI resolution.
