<p align="center">
  <strong>orphants</strong><br/>
  Find and kill unused TypeScript types across your entire codebase.<br/>
  Zero config. One command.
</p>

<p align="center">
  <a href="https://github.com/false200/orphants/actions/workflows/ci.yml"><img src="https://github.com/false200/orphants/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/orphants"><img src="https://img.shields.io/npm/v/orphants.svg" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node >= 18"></a>
</p>

<p align="center">
  <a href="https://github.com/false200/orphants">GitHub</a> ·
  <a href="https://www.npmjs.com/~divinaicodes">npm</a> ·
  <a href="https://github.com/false200/orphants/issues">Issues</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

**orphants** is a zero-config CLI that finds and removes dead **type aliases**, **interfaces**, and **enums** in TypeScript projects — the declarations that `eslint`, `tsc --noUnusedLocals`, and Knip never reliably catch.

Maintained by **[divinaicodes](https://www.npmjs.com/~divinaicodes)** · [false200/orphants](https://github.com/false200/orphants)

## Features

- **Zero config** — point at a path; discovers `tsconfig.json` automatically
- **Detects unused `type`, `interface`, and `enum`** declarations across your project
- **`--fix`** — auto-remove dead types in place
- **`--ci`** — exit code 1 when unused types exist (perfect for GitHub Actions)
- **`--json`** — machine-readable output for tooling and dashboards
- **`--include-exported`** — optionally flag exported types with no external consumers
- **`--ignore`** — skip files via glob patterns (e.g. legacy folders)
- **Safe by default** — preserves re-exports, JSDoc references, and declaration merging
- **Programmatic API** — use as a library, not just a CLI
- **90%+ test coverage** with fixture-based integration tests

> Knip finds unused **exports**. orphants finds unused **type declarations** — including types never referenced anywhere, even in the same file.

## Get started

The fastest way to try orphants:

```bash
npx orphants ./src
```

Install as a dev dependency:

```bash
npm install -D orphants
```

Then run:

```bash
npx orphants ./src
npx orphants ./src --fix
npx orphants ./src --ci
```

Works with any project that has a `tsconfig.json`.

## Showcase

**Scan for dead types:**

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

**Remove them:**

```bash
npx orphants ./src --fix
```

```
✓ Removed 203 unused types
✓ 134 files cleaned
```

**CI in GitHub Actions:**

```yaml
- name: Check for unused types
  run: npx orphants ./src --ci
```

## Why orphants?

| Tool | Unused exports | Unused type / interface / enum declarations |
|------|:--------------:|:-------------------------------------------:|
| `tsc --noUnusedLocals` | — | No |
| ts-prune / ts-unused-exports | Yes | No |
| Knip | Yes | No |
| **orphants** | — | **Yes** |

## Requirements

- **Node.js** 18 or later
- A **TypeScript project** with a discoverable `tsconfig.json`
- Linux, macOS, or Windows

## Usage

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

### Examples

```bash
# Scan a directory
npx orphants ./src

# Scan a single file
npx orphants ./src/types/api.ts

# CI gate — fail the build if dead types exist
npx orphants ./src --ci

# Also flag exported types nobody imports
npx orphants ./src --include-exported

# Auto-remove (use in a dedicated cleanup PR)
npx orphants ./src --fix

# Skip legacy code
npx orphants ./src --ignore "**/legacy/**"

# JSON for scripts and dashboards
npx orphants ./src --json
```

### Programmatic API

```ts
import { findUnusedTypes, removeUnusedTypes } from "orphants";

const result = await findUnusedTypes({ path: "./src" });
console.log(result.stats);
console.log(result.unused);

const { fixResult } = await removeUnusedTypes({ path: "./src" });
console.log(fixResult.removedCount);
```

Use `--help` for the full CLI reference:

```bash
npx orphants --help
```

## Internals

orphants uses **[ts-morph](https://github.com/dsherret/ts-morph)** to walk your TypeScript AST — it does **not** regex your source files.

1. **Scan** — collect every `type`, `interface`, and `enum` declaration (skips `.d.ts`)
2. **Resolve** — call `findReferencesAsNodes()` per declaration and apply safety rules
3. **Report** — print human-readable or JSON results
4. **Remove** — optionally delete unused nodes and save files (`--fix`)

```
src/
  cli.ts       # CLI entry (commander)
  scanner.ts   # Collect type declarations
  resolver.ts  # Reference analysis & unused rules
  remover.ts   # Safe AST deletion
  reporter.ts  # stdout formatting
  index.ts     # Public programmatic API
```

**What counts as unused**

- Never referenced in a type annotation, generic, `extends`, `implements`, or expression
- Not exported — or exported with `--include-exported` and zero external consumers

**What orphants will not remove**

- Types re-exported via `export { Foo }` or `export * from`
- Types referenced in JSDoc (`@param`, `@returns`, `{@link}`)
- Declaration merging targets (multiple `interface Foo` blocks)
- Ambient types in `.d.ts` files

## FAQ

**How is this different from Knip or ts-prune?**  
Those tools focus on unused **exports** and project-level dead code. orphants targets **type declarations** that exist in your codebase but are never referenced — including non-exported aliases in the same file.

**Will `--fix` break my code?**  
It only removes declarations with zero references after safety checks. Use `--ci` in PRs and `--fix` in dedicated cleanup PRs. Review the diff before merging.

**Does it work on monorepos?**  
v1 analyzes within a single tsconfig project. Cross-package references in monorepos are out of scope for now.

**Does it upload my code anywhere?**  
No. orphants runs entirely on your machine. All analysis is local.

**Can I ignore certain folders?**  
Yes: `npx orphants ./src --ignore "**/legacy/**" --ignore "**/*.generated.ts"`

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

```bash
git clone https://github.com/false200/orphants.git
cd orphants
npm install
npm test
```

Report bugs and request features on [GitHub Issues](https://github.com/false200/orphants/issues).

## Build

To build and run orphants locally:

```bash
# Clone the repository
git clone https://github.com/false200/orphants.git
cd orphants

# Install dependencies
npm install

# Run tests (builds first)
npm test

# Build the CLI
npm run build

# Run locally
node dist/cli.js ./src
# or during development:
npm run dev -- ./src
```

## License

orphants is under the [MIT license](LICENSE).

## Links

- **GitHub:** [github.com/false200/orphants](https://github.com/false200/orphants)
- **npm author:** [npmjs.com/~divinaicodes](https://www.npmjs.com/~divinaicodes)
- **Issues:** [github.com/false200/orphants/issues](https://github.com/false200/orphants/issues)
- **Also by divinaicodes:** [tooltrim](https://www.npmjs.com/package/tooltrim) — open-source MCP proxy
