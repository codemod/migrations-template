> **Remove this section once the repo is customized**
> 
> Framework/SDK maintainers: This template comes with setup guides, utilities, and a GitHub Action to help you and your community build and publish codemods with ease. After the set up, once you approve codemod PRs, they’ll be automatically published as official codemods to the [Codemod Registry](https://app.codemod.com/registry) under your org scope. Check out the [Node.js codemods](https://codemod.link/nodejs-official) for an example. See [AUTO_PUBLISH_SETUP.md](.github/AUTO_PUBLISH_SETUP.md) for setup instructions.

Official <FRAMEWORK_OR_SDK_OR_ORG> codemods to help users adopt new features and handle breaking changes with ease.

Community contributions are welcome and appreciated! Check open issues for codemods to build, or open a new one if something’s missing. See the [contribution guide](./CONTRIBUTING.md) for details.


## Running codemods
> [!CAUTION]
> Caution: Codemods modify code! Run them only on Git-tracked files, and commit or stash changes first.
### From the registry 
Recommended for better UX, downloads the package from [registry](https://app.codemod.com/registry).

```bash
npx codemod@latest <codemod-name>
```
For example: 
```
npx codemod@latest @nodejs/tmpDir-to-tmpdir
```
### From the source 
```bash
npx codemod workflow run -w /path/to/folder/containing/workflow.yaml
```

> [!NOTE]
> By default, codemods run in the current folder. Add `-t /target/path` to your command to change it.


See the [Codemod docs](https://go.codemod.com/cli-docs) for all CLI commands and options.


## Security

See [SECURITY.md](./SECURITY.md).


## License

MIT

