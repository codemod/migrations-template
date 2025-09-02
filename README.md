<div align="center">
  <img src=".github/assets/migrations-template.png" alt="<ECOSYSTEM_NAME> Codemods" />
</div>

> **Remove this section once the repo is customized**
> Framework/SDK maintainers: This template comes with setup guides, utilities, and a GitHub Action to help you and your community build and publish codemods with ease. Once you, the repo maintainers, approve codemod PRs, they’ll be automatically published as official codemods to the [Codemod Registry](https://app.codemod.com/registry) under your org scope. Check out the [Node.js codemods](https://codemod.link/nodejs-official) for an example. See [AUTO_PUBLISH_SETUP.md](.github/AUTO_PUBLISH_SETUP.md) for setup instructions.

This repository contains codemods for <FRAMEWORK_OR_SDK_NAME>. These codemods facilitate adopting new features and upgrading across breaking changes.


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


