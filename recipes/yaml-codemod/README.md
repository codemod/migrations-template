# yaml-codemod

Transform legacy code patterns

## Installation

```bash
# Install from registry
npx codemod@latest run yaml-codemod

# Or run locally
npx codemod@latest workflow run -w workflow.yaml
```

## Usage

This codemod transforms typescript code by:

- Converting `var` declarations to `const`/`let`
- Removing debug statements
- Modernizing syntax patterns

## Development

```bash
# Test the transformation
npx codemod@latest workflow run -w workflow.yaml

# Validate the workflow
npx codemod@latest validate -w workflow.yaml

# Publish to registry
npx codemod@latest login
npx codemod@latest publish
```

## License

MIT 