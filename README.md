# orphants

Find and kill unused TypeScript types across your entire codebase. Zero config. One command.

## The problem

TypeScript's compiler and every major linter (`eslint`, `tsc --noUnusedLocals`, `knip`) catch unused **variables** and **imports** — but none of them reliably catch unused **type aliases**, **interfaces**, and **enums**.

Large codebases accumulate hundreds of dead types over time. They slow down onboarding, bloat files, and create false confidence that types are being used somewhere.

## What it does

```bash
npx orphants ./src
```

```
Found 847 types across 134 files
✗ 203 unused types detected

  UserResponseDTO     src/types/api.ts:14
  LegacyAuthPayload   src/auth/types.ts:89
  OldCartItem         src/cart/legacy.ts:3
  AdminPermissionMap  src/rbac/types.ts:201
  ...

Run with --fix to remove them
```

```bash
npx orphants ./src --fix
```

```
✓ Removed 203 unused types
✓ 134 files cleaned
```

## Why orphants?

> Knip finds unused **exports**. orphants finds unused **type declarations** — including types that are never referenced anywhere in your project, even in the same file.

| Tool | Catches unused exports | Catches unused type/interface/enum declarations |
|------|------------------------|--------------------------------------------------|
| `tsc --noUnusedLocals` | No | No |
| ts-prune / ts-unused-exports | Yes | No |
| Knip | Yes | No |
| **orphants** | No | **Yes** |

## Install

```bash
npm install -D orphants
```

## CLI

```
orphants <path> [options]
```

| Option | Description |
|--------|-------------|
| `--fix` | Remove unused types in place |
| `--json` | Output results as JSON (for CI / tooling) |
| `--ignore <glob>` | Glob pattern of files to skip (repeatable) |
| `--include-exported` | Also flag exported types with no external consumers |
| `--ci` | Exit with code 1 if any unused types are found |

### Examples

```bash
# Scan src directory (uses nearest tsconfig.json)
npx orphants ./src

# CI check in GitHub Actions
npx orphants ./src --ci

# Also flag exported types nobody imports
npx orphants ./src --include-exported

# Auto-remove dead types (use in dedicated cleanup PRs)
npx orphants ./src --fix

# Skip legacy folders
npx orphants ./src --ignore "**/legacy/**"
```

## CI integration

```yaml
- name: Check for unused types
  run: npx orphants ./src --ci
```

## Programmatic API

```ts
import { findUnusedTypes, removeUnusedTypes } from "orphants";

const result = await findUnusedTypes({ path: "./src" });
console.log(result.unused);

const { fixResult } = await removeUnusedTypes({ path: "./src", fix: true });
console.log(fixResult.removedCount);
```

## What counts as unused

A type is unused if:

- It is never referenced in any expression, type annotation, generic, `extends`, or `implements`
- It is not exported, **or** it is exported but `--include-exported` is set and no other file imports it

## What orphants detects

- `type Foo = ...` — type aliases (including generics)
- `interface Foo { ... }` — interfaces
- `enum Foo { ... }` — enums

## What orphants will not remove

- Types re-exported via `export { Foo }` or `export * from`
- Types referenced in JSDoc (`@param`, `@returns`, `{@link}`)
- Declaration merging targets (multiple `interface Foo` blocks)
- Ambient types in `.d.ts` files (skipped entirely)

## v1 limitations

- No cross-package monorepo analysis
- Template-literal-type internals are out of scope
- `--fix` is destructive — prefer `--ci` in PRs and `--fix` in dedicated cleanup PRs
- Exported types are preserved by default (use `--include-exported` to opt in)

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
