# Publishing Guide for pizzamcp

## Prerequisites

1. Make sure you're logged into NPM with the account that owns the `pizzamcp` package:
   ```bash
   npm whoami
   ```

2. If not logged in, login with:
   ```bash
   npm login
   ```

## Publishing Steps

### 1. Version Update (if needed)

Update the version in `package.json` if this is a new release:
```bash
npm version patch    # for bug fixes (1.0.0 -> 1.0.1)
npm version minor    # for new features (1.0.0 -> 1.1.0)  
npm version major    # for breaking changes (1.0.0 -> 2.0.0)
```

### 2. Build the Project

```bash
npm run build
```

### 3. Test the Build

```bash
node test-mcp.js
```

### 4. Publish to NPM

```bash
npm publish
```

### 5. Verify Publication

Check that the package is available:
```bash
npm info pizzamcp
```

## Post-Publication Testing

Test the published package:
```bash
# In a temporary directory
npx pizzamcp
```

## Files Included in Publication

The following files will be published (based on .gitignore and package.json):

- `dist/` - Compiled JavaScript
- `package.json`
- `README.md`
- `LICENSE`
- `amp-config-example.json`

## Troubleshooting

### Permission Issues
If you get permission errors, make sure you're logged in with the correct NPM account that owns the `pizzamcp` package.

### Version Conflicts
If the version already exists on NPM, you'll need to bump the version number in `package.json`.

### Build Errors
Make sure all TypeScript compiles correctly with `npm run build` before publishing.

## Automatic Publishing with GitHub Actions (Optional)

You can set up automatic publishing by creating `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Remember to add your NPM token to GitHub secrets as `NPM_TOKEN`.
