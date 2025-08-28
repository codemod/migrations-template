<div align="center">
  <img width="128" height="128" src=".github/assets/logo.png" alt="Migrations Repo" />
</div>

<h1 align="center"><ECOSYSTEM_NAME> codemods</h1>

> Initial setup guide (remove once the repo is customized)

1. Search and replace placeholders:
   - `<ECOSYSTEM_NAME>` (e.g., "React", "Node.js", "AcmeLib")
   - `<NAMESPACE>` (e.g., `acme`)
   - `<MAJOR_VERSION>` (e.g., `v5`)
2. Keep codemods under `recipes/` and name them like `<namespace>/<MAJOR_VERSION>/<codemod-name>`.
3. Scaffold new codemods interactively:

```bash
npx codemod@latest init recipes/my-codemod
```

4. Validate and test:

```bash
npm run validate
npm run test
```

5. Commit hooks and CI run lint, validate, typecheck, and tests.

---

## Overview

This repository contains codemods (automated migrations) for <ECOSYSTEM_NAME>. These codemods facilitate adopting new features and upgrading across breaking changes.

## Quickstart

```bash
# Run a specific codemod from the registry
npx codemod@latest <NAMESPACE>/<MAJOR_VERSION>/<codemod-name>

# Run locally from a recipe directory
codemod run -w workflow.yaml
```

See the Codemod CLI docs for full command reference: https://docs.codemod.com/cli/workflows

## Available codemods

> [!CAUTION]
> These scripts change source code. Commit or stash your changes before running them.

List your published codemods here, e.g.:
- `<NAMESPACE>/<MAJOR_VERSION>/example-codemod` — short description

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT


