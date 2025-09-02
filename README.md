# <ECOSYSTEM_NAME> Codemods

<div align="center">
  <img src=".github/assets/migrations-template.png" alt="<ECOSYSTEM_NAME> Codemods" width="400" />
</div>

This repository serves as a template for open-source migrations, allowing contributors & framework maintainers to quickly whip up a repository for codemods that resolve breaking changes, refactors, and more.

This template repository comes pre-configured with a GitHub workflow that automatically publishes the latest version of your codemods, keeping them up-to-date on [Codemod Registry](https://app.codemod.com/registry).

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
> 6. Set up auto-publishing to [Codemod Registry](https://app.codemod.com/registry):
> 
> ```bash
> # Get API key from https://app.codemod.com/api-keys
> ./scripts/setup-auto-publish.sh
> ```
> 
> This automatically publishes codemods when you push changes to `recipes/`. See [AUTO_PUBLISH_SETUP.md](./AUTO_PUBLISH_SETUP.md) for details.


## Overview

This repository contains codemods (automated migrations) for <ECOSYSTEM_NAME>. These codemods facilitate adopting new features and upgrading across breaking changes.

Codemods, public or private, are preferred to reside in repositories owned by the main organization of their respective projects. This repository serves as a template for codemod packages, allowing contributors to quickly create a repository for their published codemods.

This template repository comes pre-configured with a GitHub workflow that automatically publishes the latest version of your codemod, eliminating the need to manually publish codemods after making updates.

## Quick Setup

> **Initial setup guide (remove once the repo is customized)**

1. **Search and replace placeholders:**
   - `<ECOSYSTEM_NAME>` (e.g., "React", "Node.js", "AcmeLib")
   - `@<NAMESPACE>` (e.g., `acme`) 
   - `<MAJOR_VERSION>` (e.g., `v5`)

2. **Scaffold new codemods under `recipes`:**
   ```bash
   npx codemod@latest init recipes/my-codemod
   ```

3. **Build your codemod** manually or with **[Codemod Studio](https://app.codemod.com/studio)** (recommended) ([Read docs →](https://go.codemod.com/studio-docs))

4. **Validate and test:**
   ```bash
   pnpm run validate
   pnpm run test
   ```

5. **Set up auto-publishing** to [Codemod Registry](https://app.codemod.com/registry):
   - Get API key from [https://app.codemod.com/api-keys](https://app.codemod.com/api-keys)
   - Add `CODEMOD_API_KEY` as a GitHub secret
   - Optionally set `CODEMOD_REGISTRY_SCOPE` and `CODEMOD_REGISTRY_URL` as variables
   
   See [AUTO_PUBLISH_SETUP.md](./AUTO_PUBLISH_SETUP.md) for details.

## Auto-Publishing Workflows

This template includes **two auto-publishing workflows**:

### 1. **Direct Auto-Publish** (Default)
- Automatically publishes when changes are pushed to `main`
- Best for: Solo maintainers or trusted teams
- Requires: API key configuration

### 2. **PR-based Auto-Publish** (Recommended for Open Source)
- Detects codemod changes in pull requests
- Posts a comment with pre-filled publish commands
- Waits for maintainer approval (thumbs up reaction)
- Best for: Open source projects with community contributions
- Requires: API key configuration + maintainer permissions

**Example PR workflow:**
1. Community contributor opens PR with codemod changes
2. Bot detects changes and posts comment with publish commands
3. Maintainer reviews and gives thumbs up 👍
4. Bot automatically executes publishing commands
5. Comment updates with success confirmation

By doing so, any change made to the `main` branch of your repository will automatically be published to Codemod Registry.

## Running Codemods

To run your codemods use the codemod command below:

```bash
npx codemod@latest @<NAMESPACE>/<codemod-name>
```

- `codemod-name` - name of transform. Use the name of your codemod in Codemod Registry.

See the [Codemod CLI documentation](https://go.codemod.com/cli-docs) for a full list of available commands and options.

## Available Codemods

> [!CAUTION]
> These scripts change source code. Commit or stash your changes before running them.

List your published codemods here, e.g.:
- `@<NAMESPACE>/<MAJOR_VERSION>/example-codemod` — short description

## Important

After using this template, it's recommended that you update this README with:

1. Details about what your codemod does (e.g. before/after code snippets)
2. A link to the published codemod in Codemod Registry
3. The accurate run command

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT


