# AGENTS.md

Project instructions for AI agents working in this codemod monorepo.

## Project Overview

This monorepo contains Codemod packages. Each codemod lives under `codemods/<slug>/` with its own `workflow.yaml`, `codemod.yaml`, `scripts/codemod.ts`, and tests. Codemod scripts are TypeScript; jssg is polyglot and transforms any supported language.

Use these instructions when the user requests code migrations or analysis — via CLI or Codemod platform. Examples: "upgrade React v18→v19", "migrate Jest→Vitest", "replace legacy API X with Y".

Use Codemod MCP when creating new codemods or improving existing ones — especially when the migration needs to verify imports, detect symbol definitions, or change references across files.

See [CONTRIBUTING.md](CONTRIBUTING.md) for PR conventions, commit message format, and safety requirements.

## Build and Test

- **Lint:** `npm run lint`
- **Format:** `npm run format`
- **Types:** `npm run typecheck`
- **Per-codemod tests:** `cd codemods/<slug> && npm test` (runs jssg test)
- **Workflow validation:** `npx codemod workflow validate codemods/<slug>/workflow.yaml`

## Creating New Codemods

1. **Plan first.** Create a plan and give the user a chance to tweak before implementation.
2. **Use** `codemod@latest init` and Codemod MCP tools.
   - Call `get_jssg_instructions` from the Codemod MCP for jssg/ast-grep guidance.
   - **When patterns depend on symbol origin or cross-file references** (e.g., verifying imports, checking where a symbol is defined, finding references), use semantic analysis: `node.definition()` and `node.references()`. Enable `semantic_analysis: workspace` in the workflow. See jssg-instructions for details.
3. **Target language:** Use jssg/ast-grep alias (e.g. `tsx`, `python`, `go`, `rust`, `java`).
4. **Full spec:** Read [docs/CODEMOD-TEMPLATE.md](docs/CODEMOD-TEMPLATE.md) for file structure, workflow nodes, params, metrics, and examples.
5. **Workflow structure:** Use the full workflow from [docs/CODEMOD-TEMPLATE.md](docs/CODEMOD-TEMPLATE.md) (apply-transforms with Create branch + Commit steps, ai-tricky-cases when tricky cases exist, publish node).

If the user's request is unclear, gather what you can and work with them to reach clarity before implementing.

## Links

- [CONTRIBUTING.md](CONTRIBUTING.md) — conventions and safety
- [docs/CODEMOD-TEMPLATE.md](docs/CODEMOD-TEMPLATE.md) — complete codemod package specification
