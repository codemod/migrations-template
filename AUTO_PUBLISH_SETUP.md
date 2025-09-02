# Auto-Publishing Setup

This repository automatically publishes codemods from the `recipes/` directory to the Codemod Registry when you push changes to `main`.

## Quick Setup

1. **Get API key**: [https://app.codemod.com/api-keys](https://app.codemod.com/api-keys)
2. **Run setup script**:
   ```bash
   ./scripts/setup-auto-publish.sh
   ```

The script will ask for your API key, registry scope (e.g., `your-org`), and registry URL.

## How It Works

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

## Example

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
