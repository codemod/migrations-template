<div align="center">
  <img src=".github/assets/migrations-template.png" alt="Migrations Template" />
</div>

> **Initial setup guide (remove once the repo is customized)**
> 
> 1. Search and replace placeholders:
>    - `<ECOSYSTEM_NAME>` (e.g., "React", "Node.js", "AcmeLib")
>    - `@<NAMESPACE>` (e.g., `acme`) 
>    - `<MAJOR_VERSION>` (e.g., `v5`)
> 2. Scaffold new codemods under `recipes` and name them like `@<NAMESPACE>/<MAJOR_VERSION> (optional)/<codemod-name>`:
> 
> ```bash
> npx codemod@latest init recipes/my-codemod
> ```
> 
> 3. Build codemod manually or with **[Codemod Studio](https://app.codemod.com/studio) (recommended)** ([Read docs →](https://go.codemod.com/studio-docs)).
> 4. Validate and test:
> 
> ```bash
> npm run validate
> npm run test
> ```
> 
> 5. Commit hooks and CI run lint, validate, typecheck, and tests.
> 
> 6. Publish codemods to [Codemod Registry](https://app.codemod.com/registry):
> 
> ```bash
> # In package directory:
> npx codemod@latest publish
> ```


## Overview

This repository contains codemods (automated migrations) for <ECOSYSTEM_NAME>. These codemods facilitate adopting new features and upgrading across breaking changes.

## Quickstart

```bash
# Run a specific codemod from the registry
npx codemod@latest @<NAMESPACE>/<codemod-name>

# Run locally from a recipe directory
npx codemod@latest workflow run -w workflow.yaml
```

For all commands, see the [full Codemod CLI reference →](https://go.codemod.com/cli-docs)

## Available codemods

> [!CAUTION]
> These scripts change source code. Commit or stash your changes before running them.

List your published codemods here, e.g.:
- `@<NAMESPACE>/<MAJOR_VERSION>/example-codemod` — short description

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT


