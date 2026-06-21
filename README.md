# orphants

Find and kill unused TypeScript types across your entire codebase. Zero config. One command.

**Documentation** · [Contributing](CONTRIBUTING.md) · [License](LICENSE)

[![CI](https://github.com/false200/orphants/actions/workflows/ci.yml/badge.svg)](https://github.com/false200/orphants/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/orphants?label=npm&color=cb3837)](https://www.npmjs.com/package/orphants)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

---

## Table of Contents

- [Features](#-features)
- [Getting started](#-getting-started)
- [Usage](#-usage)
- [CI integration](#-ci-integration)
- [Programmatic API](#-programmatic-api)
- [How it works](#-how-it-works)
- [Comparison](#-comparison)
- [FAQ](#-faq)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Features

- **Zero config.** Point at a path — orphants discovers `tsconfig.json` automatically.
- **Dead type detection.** Finds unused `type`, `interface`, and `enum` declarations.
- **Auto-fix.** Remove unused types in place with `--fix`.
- **CI-ready.** Exit code 1 when dead types exist — built for pull request gates.
- **JSON output.** Machine-readable results for scripts and dashboards.
- **Export analysis.** Optionally flag exported types with no external consumers.
- **Ignore globs.** Skip legacy or generated folders with `--ignore`.
- **Safe by default.** Preserves re-exports, JSDoc references, and declaration merging.
- **Programmatic API.** Use as a library, not just a CLI.
- **Local only.** All analysis runs on your machine — nothing is uploaded.
- **Free.** Completely free and open source under MIT.

> Knip finds unused **exports**. orphants finds unused **type declarations** — including types never referenced anywhere, even in the same file.

---

## 🚀 Getting started

### npm

```bash
npx orphants ./src
```

Install as a dev dependency:

```bash
npm install -D orphants
```

### Example output

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

Remove dead types:

```bash
npx orphants ./src --fix
```

```
✓ Removed 203 unused types
✓ 134 files cleaned
```

### Requirements

- Node.js 18+
- A TypeScript project with a discoverable `tsconfig.json`
- Linux, macOS, or Windows

---

## 📖 Usage

```
orphants <path> [options]
```

| Option | Description |
|--------|-------------|
| `--fix` | Remove unused types in place |
| `--json` | Output results as JSON |
| `--ignore <glob>` | Glob pattern of files to skip (repeatable) |
| `--include-exported` | Also flag exported types with no external consumers |
| `--ci` | Exit with code 1 if any unused types are found |

```bash
# Scan a directory or file
npx orphants ./src
npx orphants ./src/types/api.ts

# Fail CI when dead types exist
npx orphants ./src --ci

# Flag exported types nobody imports
npx orphants ./src --include-exported

# Remove dead types (review the diff before merging)
npx orphants ./src --fix

# Skip legacy folders
npx orphants ./src --ignore "**/legacy/**"

# JSON output
npx orphants ./src --json
```

---

## 🔄 CI integration

```yaml
- name: Check for unused types
  run: npx orphants ./src --ci
```

---

## 🧩 Programmatic API

```ts
import { findUnusedTypes, removeUnusedTypes } from "orphants";

const result = await findUnusedTypes({ path: "./src" });
console.log(result.stats);
console.log(result.unused);

const { fixResult } = await removeUnusedTypes({ path: "./src" });
console.log(fixResult.removedCount);
```

---

## 🔍 How it works

orphants uses [ts-morph](https://github.com/dsherret/ts-morph) for AST analysis — no regex, no guesswork.

1. **Scan** — collect every `type`, `interface`, and `enum` (skips `.d.ts`)
2. **Resolve** — `findReferencesAsNodes()` per declaration with safety rules
3. **Report** — human-readable or JSON output
4. **Remove** — optional in-place deletion via `--fix`

**Protected from removal**

- Re-exports (`export { Foo }`, `export * from`)
- JSDoc references (`@param`, `@returns`, `{@link}`)
- Declaration merging (multiple `interface Foo` blocks)
- Ambient `.d.ts` declarations

**v1 limitations**

- Single tsconfig scope (no cross-package monorepo analysis)
- Template-literal-type internals out of scope

---

## 📊 Comparison

| Tool | Unused exports | Unused type / interface / enum |
|------|:--------------:|:------------------------------:|
| `tsc --noUnusedLocals` | — | No |
| ts-prune / ts-unused-exports | Yes | No |
| Knip | Yes | No |
| **orphants** | — | **Yes** |

---

## ❓ FAQ

**How is this different from Knip or ts-prune?**  
Those tools focus on unused exports. orphants targets type declarations that are never referenced — including non-exported aliases in the same file.

**Will `--fix` break my code?**  
Only declarations with zero references are removed, after safety checks. Prefer `--ci` in PRs and `--fix` in dedicated cleanup PRs.

**Does it upload my source code?**  
No. Everything runs locally.

---

## 🛠 Development

```bash
git clone https://github.com/false200/orphants.git
cd orphants
npm install
npm test
npm run build
node dist/cli.js ./src
```

---

## 🏆 Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

To become a contributor, fork the repo, add your changes with tests, and open a pull request.

---

## 📄 License

This project is open-source software licensed under the [MIT license](LICENSE).
