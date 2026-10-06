# Static Frontend Deployment

Live site: [Relay Marketing Workspace](https://christinesbt.github.io/marketing-automation/).

GitHub Pages publishes only the fictional Relay / Vela K75 frontend. The repository also holds documentation and a separate BlogGenerator source copy; those files are excluded from the website artifact.

## Build and Local Preview

```powershell
cd marketing-console-prototype
npm start
```

Local address: http://127.0.0.1:4173. The server binds to loopback only.

```powershell
cd ..
node scripts/build-pages.mjs
```

The output is `dist/pages`. The allowlist contains the HTML entry, four JavaScript modules, two stylesheets and three original SVG illustrations, plus `.nojekyll` and `build-info.json` (12 files total). No Python, documentation, tests, server, environment file, video or model cache is published. The build refuses unknown output files and non-English UI source.

## GitHub Actions

`.github/workflows/pages.yml` checks frontend syntax and runs 19 tests before packaging and publishing the allowlisted artifact. The build has read permissions; the deployment job has only the standard `pages: write` and `id-token: write` permissions needed by the official Pages action. There are no custom credentials or paid services.

Select **GitHub Actions** as the publishing source in the existing repository's Pages settings. Repository visibility and unrelated settings are not changed by this workflow. Each deployment includes its source commit in `build-info.json`.

## Runtime Boundaries

The site uses relative asset paths and hash navigation, so it works under the repository subpath and on a direct route refresh. All campaign work remains in browser storage. The page's content security policy prohibits external connections; it has no backend, model invocation, email sender or production platform integration.

English UI uses British English date and number formatting and explicit US-dollar prices. UTC date inputs use `YYYY-MM-DD HH:mm`. Legacy saved text containing CJK characters is held behind an English review screen. Starting the English demo requires explicit confirmation and a successfully stored exact backup of the original workspace. Cancelling or refreshing this screen does not replace the saved work. Normal reset leaves these backups intact.

Deployment URL and observed verification evidence are recorded in [verification.md](verification.md) after an actual deployment succeeds.
