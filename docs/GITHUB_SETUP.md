# GitHub repository setup

Copy-paste these values into your repo settings on GitHub.

## About (right sidebar → ⚙️ gear icon)

| Field | Value |
|-------|--------|
| **Description** | Kill dead TypeScript types. One command. `npx orphants ./src` |
| **Website** | `https://www.npmjs.com/package/orphants` *(after npm publish)* or leave blank until then |
| **Topics** | See below |

### Topics (paste one per line or comma-separated)

```
typescript
dead-code
unused-types
static-analysis
cli
lint
ts-morph
developer-tools
npm
eslint
knip
```

## Releases

Tag `v0.1.0` is pushed to the repo. After the Release workflow runs, **Releases** will show v0.1.0.

To create future releases:

```bash
git tag v0.2.0
git push origin v0.2.0
```

Update `CHANGELOG.md` first.

## Packages (sidebar)

The **Packages** section on GitHub is for **GitHub Packages** (container/npm registry on GitHub).

`orphants` is published to **npmjs.com**, not GitHub Packages. That is normal.

To publish to npm (shows on npmjs.com, installable via `npx orphants`):

```bash
npm login
npm publish --access public
```

Or use **Actions → Publish to npm** after adding `NPM_TOKEN` secret. See [PUBLISH.md](PUBLISH.md).

## Social preview

**Settings → General → Social preview**

Suggested title: `orphants — find unused TypeScript types`

Suggested image: optional — screenshot of CLI output with unused types listed.

## Pin README sections

On the repo homepage, the README already includes badges, features, and getting started.

## npm package link (after publish)

Add to README website badge target and GitHub About **Website** field:

```
https://www.npmjs.com/package/orphants
```
