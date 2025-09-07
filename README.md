> **Remove this section once the repo is customized**
> 
> Framework/SDK maintainers: This template comes with setup guides, utilities, and a GitHub Action to help you and your community build and publish codemods with ease.
> ## One-time Setup
>
> ### Secure a scope for your org
> 1. Sign up at [app.codemod.com](https://app.codemod.com) with your GitHub account.  
> 2. Install the Codemod app:
>   - Go to [app.codemod.com/studio](https://app.codemod.com/studio)  
>   - In **Results**, click **Select Repo**  
>   - Installing the app for a repo in your GitHub org reserves a **scope** matching your org name.  
>     - Example: only admins of the `nodejs` org can publish codemods starting with `@nodejs`.  
>     - All official codemods appear in the Registry under that scope.  
>   - **Important:** In each `codemod.yaml`, make sure `name` starts with your scope.
>
> ### Authorize GitHub Action
> 1. Generate an API key at [app.codemod.com/api-keys](https://app.codemod.com/api-keys).  
> 2. In your repo: **Settings → Environments**  
>   - Create an environment (e.g. `production`) if it doesn’t exist.  
>   - Open it → **Add environment secret**:  
>     - Name: `CODEMOD_API_KEY`  
>     - Value: the key from step 1.  
>
> ✅ Done! Now, after a codemod PR is merged, you can trigger a GitHub Action to auto-publish it to the [Codemod Registry](https://app.codemod.com/registry) under your org scope. See [Node.js codemods](https://codemod.link/nodejs-official) for an example.
---

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

