# Publish orphants to npm

CI passing does **not** publish to npm. You must publish once manually (or via the GitHub Action below).

## Option A — Publish from your machine (fastest)

```powershell
cd D:\OpenSource\os2
npm login
# username: divinaicodes
# password: your npm password
# email + OTP if enabled

npm publish --access public
```

Verify: https://www.npmjs.com/package/orphants

Then install anywhere:

```bash
npx orphants ./src
```

## Option B — Publish via GitHub Actions

1. Create an npm **Automation** token: https://www.npmjs.com/settings/divinaicodes/tokens
2. In GitHub repo **Settings → Secrets and variables → Actions**, add:
   - Name: `NPM_TOKEN`
   - Value: your npm token
3. Go to **Actions → Publish to npm → Run workflow**

## Why the README showed "package not found"

The npm badge reads the registry. Until `npm publish` succeeds, `orphants` does not exist on npmjs.com — even if GitHub CI is green.
