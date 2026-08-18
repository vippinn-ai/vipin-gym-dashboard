# Vipin's Training Ledger

A source-linked, installable gym coaching dashboard generated from the canonical Markdown context, Excel workbook and evidence folder in the parent directory.

## Local use

```powershell
npm install
npm run sync-data
npm test
npm run dev
```

Create the production site with `npm run build`; the deployable files are written to `dist/`.

## After every workout

1. Append the workout sets, load basis, clean/assisted status, RIR, recovery, coaching assessment and next-session targets to the canonical Markdown file. Never remove history.
2. Update the matching Excel sheets without deleting or overwriting historical rows. Keep uncertain values marked `To verify`.
3. From this folder, run `npm run sync-data`, then `npm test`, then `npm run build`.
4. Review the dashboard and commit the synchronized source files, evidence and generated website data together.

The sync script only reads the canonical files. It copies publishable snapshots into `public/sources`, evidence into `public/evidence`, and writes the normalized source-linked dataset to `src/generated/gym-data.json`.

## GitHub Pages

The repository workflow at `.github/workflows/deploy-gym-dashboard.yml` builds and deploys the site when the canonical files, evidence or dashboard code change on `main`. In GitHub, enable **Settings → Pages → Source: GitHub Actions**.

This dashboard intentionally publishes the full coaching record, source workbook, Markdown and evidence images. Treat the repository as public-data-ready only when that remains acceptable.
