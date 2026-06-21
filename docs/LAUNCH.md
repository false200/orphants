# Launch checklist

Use this after pushing to GitHub and publishing to npm.

## Before launch

- [x] Repository URL set to `https://github.com/false200/orphants`
- [ ] Push to GitHub and add topics: `typescript`, `dead-code`, `static-analysis`, `ts-morph`, `cli`
- [ ] Publish: `npm publish --access public`
- [ ] Verify: `npx orphants ./test/fixtures/basic-unused/src`

## Reddit r/typescript (draft)

**Title:** I built a CLI to find dead TypeScript type aliases — orphants

**Body:**

TypeScript linters catch unused variables, but unused `type Foo = ...` declarations pile up silently.

I built **orphants** — zero-config CLI that finds (and optionally removes) unused type aliases, interfaces, and enums using ts-morph reference analysis.

```bash
npx orphants ./src
npx orphants ./src --fix
```

Unlike Knip/ts-prune (unused exports), orphants targets type declarations that are never referenced anywhere — even in the same file.

GitHub: [your-repo-url]
Feedback welcome!

## Show HN (draft)

**Title:** Orphants – find unused TypeScript types (type aliases, interfaces, enums)

**Body:**

I kept running into files full of `type UserResponseDTO = ...` that nothing referenced. tsc and eslint don't flag them; Knip focuses on exports.

orphants walks your tsconfig project and uses ts-morph `findReferencesAsNodes()` to detect dead types. Supports `--ci`, `--json`, `--include-exported`, and `--fix`.

Would love feedback from folks with large TS codebases.

## Dev.to post outline

1. The gap: unused types vs unused exports
2. Why `tsc --noUnusedLocals` doesn't help
3. Demo: before/after on a fixture project
4. Edge cases handled (re-exports, JSDoc, declaration merging)
5. CI integration snippet

## Awesome list PRs

- [awesome-typescript](https://github.com/dzharii/awesome-typescript) — dead code / tooling section
- [awesome-nodejs](https://github.com/sindresorhus/awesome-nodejs) — CLI tools section
