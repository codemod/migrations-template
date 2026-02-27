# Codemod Template

**Read this when creating a new codemod package.**

---

## 0. Plan variables

When drafting your plan, define:

- **[MIGRATION TASK DESCRIPTION]:** What the migration does (e.g. "Replace deprecated API X with new API Y", "Convert class components to function components", "Migrate from library A to library B").
- **[OPTIONAL: SPECIFIC TRICKY CASES]:** Patterns that need human intuition, domain knowledge, or deep codebase context — list these for the AI step. If the AST codemod can handle everything, omit.

---

## 1. Package structure

```
codemods/<slug>/
├── codemod.yaml
├── workflow.yaml
├── package.json
├── README.md
└── scripts/
    └── codemod.ts
```

Use `@jssg/utils` for common transformations such as import manipulations.

**Supported languages (ast-grep):** TypeScript (`ts`, `tsx`), JavaScript (`js`, `jsx`), Angular (`angular`), Less (`less`), Python (`py`), Go (`go`), Rust (`rs`), Java (`java`), Ruby (`rb`), Kotlin (`kotlin`), Swift (`swift`), C/C++ (`c`, `cpp`), C# (`cs`), PHP (`php`), Scala (`scala`), Lua (`lua`), Elixir (`ex`), Haskell (`hs`), Bash (`bash`), HTML (`html`), CSS (`css`), JSON (`json`), YAML (`yml`), and more.

---

## 2. codemod.yaml

```yaml
schema_version: "1.0"

name: "my-awesome-codemod"
version: "0.1.0"
description: "Transform legacy patterns to modern syntax"
author: "Your Name <you@example.com>"
license: "MIT"
workflow: "workflow.yaml"
category: "migration"

targets:
  languages: ["typescript"]

# Transformation type keywrods/tags — pick one primary per codemod (avoid mixing breaking-change and feature-adoption):
#   upgrade          - upgrade code to newer versions (encompasses breaking changes and feature adoption)
#   breaking-change  - adapt to framework/library breaking API changes
#   feature-adoption - adopt new optional or incremental features
#   security         - address known vulnerabilities or unsafe patterns
#   cross-migration  - replace one library/framework with another
#   i18n             - internationalization migrations or improvements
#   a11y             - accessibility improvements and compliance
#   standardization  - unify patterns, conventions, or APIs across a codebase
#   code-mining      - detect-only: identify, flag, or extract patterns without transforming
keywords: ["upgrade", "breaking-change", "react", "v17-to-v18"]

registry:
  access: "public"
  visibility: "public"
```

---

## 3. workflow.yaml

> **IMPORTANT (agents):** New codemods MUST implement the full node structure below: `apply-transforms` (js-ast-grep and optional Commit steps), `ai-tricky-cases` (when the migration has tricky cases), and `publish`. Include the `params` block. Codemods run on the current branch. 

**Schema comment (first line):**
```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/codemod/codemod/refs/heads/main/schemas/workflow.json
```

**Params schema** — each param must have `name`, `description`, `type`, and `default` where applicable:

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| commit_per_step | boolean | **false** | Commit after each change-producing step with a meaningful message |
| run_ai_step | boolean | false | Run AI step for tricky cases — only add if AI step is needed |
| publish_pr | boolean | false | Push branch and create PR (when true; agents must not push by default) |
| main_branch | string | "main" | Target branch for PR |
| api_token | string | — | secret: true, for GitHub API when gh CLI unavailable |
| pr_title | string | — | Optional |
| pr_body | string | — | Optional, multi_line: true |

**Node structure:** Implement all three nodes below at minimum. Omit only the AI *step* (inside ai-tricky-cases) when all patterns can be handled by the AST codemod; keep the ai-tricky-cases node with `depends_on`. Include all steps (Commit, Push, Create PR) — they are gated by params. **Do not push to remote by default** — the Push step must use `if: params.publish_pr`. **Commit steps** use `if: params.commit_per_step` and must have task-specific, meaningful messages (e.g. `fix: migrate X to Y`, `fix: AI-assisted resolution of [case]`). If the migration can be divided into multiple shippable PRs, add a dedicated node for each part.

### 1. apply-transforms (type: automatic)

- Step 1: "[Task-specific name]" — `js-ast-grep`:
  - `js_file: scripts/codemod.ts`
  - `language: "<target_lang>"` — use ast-grep alias (e.g. `tsx`, `python`, `go`, `rust`)
  - `semantic_analysis: workspace` — **required** when the codemod must verify symbol definitions, trace imports, or update references across files. Without it, `node.definition()` and `node.references()` return no-op. Use Codemod MCP `get_jssg_instructions` for Part 4: Semantic Analysis.
  - `include`: globs for target files (e.g. `**/*.tsx`, `**/*.py`, `**/*.go`, `**/*.rs`)
  - `exclude`: `**/node_modules/**`, `**/vendor/**`, `**/*.test.*`, `**/*.spec.*`, `**/__pycache__/**` (adapt to language)
- Step 2: "Commit AST transformations" — `if: params.commit_per_step`, run:
  ```bash
  git add -A
  [ -n "$(git status --porcelain)" ] && git commit -m "fix: [task-specific meaningful message]" || true
  ```

### 2. ai-tricky-cases (type: automatic, depends_on: [apply-transforms])

- Step 1: AI step — `if: params.run_ai_step`, with:
  - **prompt**: Opening "You are performing a [domain] code migration. Modify files directly." + Goal, Handle these tricky cases (1–6 from [SPECIFIC TRICKY CASES]), The fix, Constraints (preserve behavior, keep formatting, add TODO if unsure)
  - **system_prompt**: Domain expert persona + migration-specific guidance
- Step 2: "Commit AI fixes" — `if: params.commit_per_step`, run:
  ```bash
  git add -A
  [ -n "$(git status --porcelain)" ] && git commit -m "fix: AI-assisted resolution of [tricky-case summary]" || true
  ```

### 3. publish (type: automatic, depends_on: [ai-tricky-cases])

- Step 1: "Push branch to remote" — `if: params.publish_pr`, run:
  ```bash
  BRANCH=$(git branch --show-current)
  git push -u origin "$BRANCH"
  ```
- Step 2: "Create PR to main branch" — `if: params.publish_pr`, run:
  ```bash
  BRANCH=$(git branch --show-current)
  BASE="${PARAM_MAIN_BRANCH:-main}"
  TITLE="${PARAM_PR_TITLE:-fix: [task-specific default title]}"
  BODY="${PARAM_PR_BODY:-Automated codemod: [task-specific default body].}"
  [ -n "$PARAM_API_TOKEN" ] && export GITHUB_TOKEN="$PARAM_API_TOKEN"
  gh pr create --base "$BASE" --head "$BRANCH" --title "$TITLE" --body "$BODY"
  ```

---

## 4. scripts/codemod.ts

- Use `codemod:ast-grep` types: `Edit`, `SgNode`, `Transform`, and the language module (e.g. `codemod:ast-grep/langs/tsx`, `codemod:ast-grep/langs/python`, `codemod:ast-grep/langs/go`)
- Import `useMetricAtom` from `codemod:metrics`
- **Metrics:** Prefer one metric with cardinalities. Choose a descriptive name for the migration.
- **Cardinality definitions** (at top of script):
  ```ts
  // Cardinalities:
  //   change-type: "deterministic" | "human-or-ai"
  //   change-difficulty: "simple" | "hard"
  ```
- **When to use cardinalities** (only if they make sense):
  - **change-type** (`deterministic` | `human-or-ai`): When workflow has AST + optional AI step. Omit if all changes are deterministic.
  - **change-difficulty** (`simple` | `hard`): When there's a mix of straightforward vs complex transforms. Omit if all are similar.
  - **file**: `file: root.filename()` for matched pattern
  - You can add domain-specific cardinalities beyond these.
- **Symbol verification:** When the codemod must distinguish symbols by origin (e.g., only transform `useState` from React, not local variables) or update definitions and references across files, use `node.definition()` and `node.references()`. Enable `semantic_analysis: workspace` in the workflow. Get full instructions via Codemod MCP `get_jssg_instructions`.
- Export default `transform` function.

---

## 5. package.json

```json
{
  "name": "<slug>",
  "version": "0.1.0",
  "description": "[one-line description]",
  "type": "module",
  "scripts": {
    "test": "npx codemod@latest jssg test -l <target_lang> ./scripts/codemod.ts",
    "check-types": "tsc --noEmit"
  },
  "devDependencies": {
    "@codemod.com/jssg-types": "latest",
    "typescript": "latest"
  }
}
```

Use `-l <target_lang>` with ast-grep alias: `tsx`, `typescript`, `python`, `go`, `rust`, `java`, etc.

---

## 6. README.md

Include: **Problem**, **Solution**, **Usage** (`npx codemod workflow run -w codemods/<slug>/workflow.yaml -t /path/to/project`), **Params**, **Metrics**, **Tricky Cases** (when to use `run_ai_step=true`), **What Gets Fixed** (automated vs human/AI).

---

## 7. Include/exclude globs

- **include:** Match by extension (e.g. `**/*.tsx`, `**/*.py`, `**/*.go`, `**/*.rs`, `**/*.java`, `**/*.rb`)
- **exclude:** `**/node_modules/**`, `**/vendor/**`, `**/__pycache__/**`, `**/*.test.*`, `**/*.spec.*` (adapt to language)

---

## 8. Validation

Run `npx codemod workflow validate codemods/<slug>/workflow.yaml` before committing.
