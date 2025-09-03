# Contributing

Thank you for helping improve <ECOSYSTEM_NAME> codemods. This project provides automated migrations to help the community adopt new features and upgrade across breaking changes.

## How we work

- Propose: open an issue before large changes
- Safety: codemods must be safe, predictable, idempotent
- Tests: include multiple fixtures (positive/negative/idempotent)
- Documentation: update per-recipe README and root docs

For workflow structure and orchestration details, see: https://docs.codemod.com/cli/workflows

## Getting started

```bash
npm install
npm run lint
npm run validate
npm run typecheck
npm run test
```

## Scaffolding a new codemod

```bash
npx codemod@latest init codemods/my-codemod
```

During prompts, select appropriate options for your use case. Placeholders to adapt:
- Name: `@<NAMESPACE>/<MAJOR_VERSION>/<codemod-name>`

## Commit messages

Use Conventional Commits:
- `feat(scope):` add a new codemod or capability
- `fix(scope):` bugfixes in a transform or tests
- `docs(scope):` docs-only changes
- `refactor(scope):` code changes that neither fix a bug nor add a feature
- `test(scope):` add or adjust fixtures/tests
- `chore(scope):` tooling, CI, formatting, repo hygiene

## Security

See SECURITY.md and report privately.

## License

MIT
