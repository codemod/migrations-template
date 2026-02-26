# SAMPLE CODEMOD: react-hoist-nested-components

Move React components defined inside other components to module scope to prevent state resets and subtle re-render bugs. Closure-dependent edge cases are skipped and clearly flagged with a comment.

## Problem

Defining a React component inside another component causes it to be recreated on every render:

- **State resets**: Child component state is lost on each parent re-render
- **Performance**: React treats it as a new component type and unmounts/remounts
- **Hook issues**: Hooks in the nested component run in a fresh instance each time

## Solution

Hoist nested components to module scope so they are defined once. Components that depend on outer-scope variables (closures) cannot be safely hoisted and are **skipped** with a flag comment for manual fixing.

## Usage

```bash
npx codemod workflow run -w codemods/react-hoist-nested-components/workflow.yaml -t /path/to/your/project
```

Or run the transform directly:

```bash
npx codemod jssg run -l tsx ./scripts/codemod.ts /path/to/project
```

## Params

| Param         | Type    | Default | Description                                  |
|---------------|---------|---------|----------------------------------------------|
| create_branch | boolean | true    | Create git branch and commit after each step |
| run_ai_step   | boolean | false   | Run AI step for closure-dependent cases     |
| publish_pr    | boolean | false   | Create PR after push                         |
| main_branch   | string  | main    | Target branch for PR                         |

## Metrics

- **react-hoist-nested-components**:
  - `change-type: hoisted` — component was moved to module scope
  - `change-type: skipped-closure` — closure-dependent, flag comment added
  - `component-form: arrow` | `function-decl` — form of hoisted component

## Tricky Cases (when to use `run_ai_step=true`)

1. **Closure-dependent nested components** — when the inner component uses variables from the outer scope (props, state, local vars), the codemod adds a comment and skips. You must manually hoist and pass those values as props.
2. **Deeply nested components** — multiple levels of nesting may need incremental manual review.
3. **Components that reference each other** — if Inner and Nested both need hoisting and reference each other, ordering matters.

## What Gets Fixed

### Automated (AST)

- `const Inner = () => <div />` inside a component → hoisted to module scope
- `function Inner() { return <div /> }` inside a component → hoisted to module scope

### Skipped / Flagged

- Nested components that use outer scope variables (state, props, locals) → comment added: `// codemod: closure-dependent — hoist manually and pass outer vars as props`

## License

MIT
