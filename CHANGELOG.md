# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-21

### Added

- CLI to find unused TypeScript `type`, `interface`, and `enum` declarations
- `--fix` to remove dead types in place
- `--json` for machine-readable output
- `--ci` exit code for pull request gates
- `--ignore` glob support for skipping paths
- `--include-exported` to flag exported types with no external consumers
- Programmatic API: `findUnusedTypes`, `removeUnusedTypes`
- Re-export, JSDoc, and declaration-merge safety rules
- 90%+ test coverage with fixture-based integration tests

[0.1.0]: https://github.com/false200/orphants/releases/tag/v0.1.0
