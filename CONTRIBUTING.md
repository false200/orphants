## Contributing

Thanks for your interest in orphants!

1. Fork the repo and create a branch.
2. Make your changes with tests.
3. Run `npm test` and `npm run typecheck`.
4. Open a pull request using the PR template.

### Pick an issue

Use [Issues](https://github.com/false200/orphants/issues) and filter by label:

| Label | Good for |
|-------|----------|
| `good first issue` | First-time contributors |
| `help wanted` | Tasks that need extra hands |
| `documentation` | README and docs improvements |
| `bug` | Something broken |
| `enhancement` | New features |
| `typescript` | Detection edge cases |
| `cli` | Flags and terminal output |
| `question` | Ask before you code |

New to the repo? Look for **`good first issue`** first.

### Project structure

- `src/scanner.ts` – collect type/interface/enum declarations
- `src/resolver.ts` – reference analysis and unused detection rules
- `src/remover.ts` – safe AST removal via ts-morph
- `src/cli.ts` – CLI entry point
- `test/fixtures/` – miniature TS projects for integration tests

### Release checklist

1. Update version in `package.json`
2. `npm test && npm run build`
3. `npm publish`
