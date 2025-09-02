# Auto-Publishing Setup

This repository includes an auto-publishing workflow that automatically publishes codemods to the Codemod Registry when changes are merged to `main`.

## Quick Setup

1. **Get API key**: [https://app.codemod.com/api-keys](https://app.codemod.com/api-keys)
2. **Create GitHub Environment** (required for secrets):
   - Go to your repository → Settings → Environments
   - Click "New environment"
   - Name it `production` (or any name you prefer)
   - Click "Configure environment"
3. **Add secrets to the environment**:
   - In the environment settings, add these secrets:
     - `CODEMOD_API_KEY`: Your API key from step 1
   - Optionally add these variables:
     - `CODEMOD_REGISTRY_SCOPE`: Your organization scope (e.g., `your-org`)
     - `CODEMOD_REGISTRY_URL`: Registry URL (defaults to `https://registry.codemod.com`)

## How It Works

### Auto-Publish Workflow
- **Trigger**: Push to `main` branch
- **Process**: 
  1. Automatically detects changes in `recipes/` directory
  2. Publishes new/updated codemods to the registry
  3. Unpublishes removed codemods
  4. Auto-resolves version conflicts (bumps patch version)

### PR Detection Workflow
- **Trigger**: Pull request with codemod changes
- **Process**: 
  1. Bot detects changed codemods in PR
  2. Posts comment: "Codemods will be auto-published on merge to main"
  3. No action required - just merge the PR

### Features
- **New codemods**: Published for the first time
- **Updated codemods**: Version bumped and republished  
- **Removed codemods**: Automatically unpublished
- **Package naming**: `@your-scope/recipe-name`

## Troubleshooting

- **"Failed to login"**: Check API key is correct and has publishing permissions
- **"No recipes changed"**: Workflow only runs when `recipes/` files are modified
- **"Package already exists"**: Normal for updates - version will be bumped automatically

## Security

- API keys are stored as **encrypted GitHub secrets**
- Never exposed in code, logs, or documentation
- Only GitHub Actions can access the key

## Examples

### Auto-Publish on Merge
```bash
# 1. Make changes to codemod
echo "console.log('test');" > recipes/my-codemod/tests/input.js

# 2. Create PR
git add recipes/my-codemod/
git commit -m "Add test case"
git push origin feature-branch
# Create PR on GitHub

# 3. Bot comments: "Codemods will be auto-published on merge to main"

# 4. Merge PR to main
git checkout main
git merge feature-branch
git push origin main

# 5. GitHub Actions automatically publishes to registry
# 6. Available at: https://registry.codemod.com/@your-scope/my-codemod
```

### Environment Setup Screenshots
1. **Repository Settings** → **Environments** → **New environment**
2. **Name**: `production` → **Configure environment**
3. **Add secrets**: `CODEMOD_API_KEY` with your API key
4. **Add variables** (optional): `CODEMOD_REGISTRY_SCOPE`, `CODEMOD_REGISTRY_URL`
