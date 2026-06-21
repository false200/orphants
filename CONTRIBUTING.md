## Contributing

Thanks for your interest in orphants!

1. Fork the repo and create a branch.
2. Make your changes with tests.
3. Run `npm test` and `npm run typecheck`.
4. Open a pull request with a clear description.

### Project structure

- `src/scanner.ts` — collect type/interface/enum declarations
- `src/resolver.ts` — reference analysis and unused detection rules
- `src/remover.ts` — safe AST removal via ts-morph
- `src/cli.ts` — CLI entry point
- `test/fixtures/` — miniature TS projects for integration tests

### Release checklist

1. Update version in `package.json`
2. `npm test && npm run build`
3. `npm publish`
