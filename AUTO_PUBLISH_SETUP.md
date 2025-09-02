# Auto-Publishing Setup

This repository includes two auto-publishing workflows for different use cases:

1. **Direct Auto-Publish**: Automatically publishes when changes are pushed to `main`
2. **PR-based Auto-Publish**: Detects changes in PRs and waits for maintainer approval

Both workflows publish codemods from the `recipes/` directory to the Codemod Registry.

## Quick Setup

1. **Get API key**: [https://app.codemod.com/api-keys](https://app.codemod.com/api-keys)
2. **Run setup script**:
   ```bash
   ./scripts/setup-auto-publish.sh
   ```

The script will ask for your API key, registry scope (e.g., `your-org`), and registry URL.

## How It Works

### Direct Auto-Publish (Default)
- **Trigger**: Push to `main` branch
- **Process**: Automatically detects changes and publishes
- **Best for**: Solo maintainers or trusted teams

### PR-based Auto-Publish (Recommended for Open Source)
- **Trigger**: Pull request with codemod changes
- **Process**: 
  1. Bot detects changed codemods in PR
  2. Posts comment with pre-filled publish commands
  3. Waits for maintainer approval (thumbs up reaction)
  4. Executes publishing commands when approved
- **Best for**: Open source projects with community contributions

### Common Features
- **New codemods**: Published for the first time
- **Updated codemods**: Version bumped and republished  
- **Removed codemods**: Automatically unpublished
- **Package naming**: `@your-scope/recipe-name`

## Testing

```bash
# Test locally (recommended)
CODEMOD_API_KEY="your-key" CODEMOD_REGISTRY_SCOPE="your-org" node scripts/test-auto-publish.mjs

# Or test with real workflow
# Make changes to recipes/ and push to main
```

## Troubleshooting

- **"Failed to login"**: Check API key is correct and has publishing permissions
- **"No recipes changed"**: Workflow only runs when `recipes/` files are modified
- **"Package already exists"**: Normal for updates - version will be bumped automatically

## Security

- API keys are stored as **encrypted GitHub secrets**
- Never exposed in code, logs, or documentation
- Only GitHub Actions can access the key

## Manual Setup

If you prefer manual setup:

1. **GitHub Secrets**: `CODEMOD_API_KEY` (your API key)
2. **GitHub Variables**: 
   - `CODEMOD_REGISTRY_SCOPE` (your organization scope)
   - `CODEMOD_REGISTRY_URL` (registry URL, optional)

## Examples

### Direct Auto-Publish
```bash
# 1. Make changes
echo "console.log('test');" > recipes/my-codemod/tests/input.js

# 2. Commit and push
git add recipes/my-codemod/
git commit -m "Add test case"
git push origin main

# 3. GitHub Actions automatically publishes to registry
# 4. Available at: https://registry.codemod.com/@your-scope/my-codemod
```

### PR-based Auto-Publish
```bash
# 1. Community contributor opens PR with codemod changes
# 2. Bot automatically posts comment:
#    "Show a thumbs up to this comment and I'll run:
#     git tag -a v1.0.0@my-codemod -m 'Release version v1.0.0 for my-codemod'
#     git push origin --tags"

# 3. Maintainer reviews and gives thumbs up 👍
# 4. Bot executes commands and updates comment with success
# 5. Codemod is published to registry
```
