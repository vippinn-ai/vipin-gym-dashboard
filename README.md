# Vipin's Training Ledger

An installable, source-linked training dashboard built from Vipin's canonical coaching context, progress workbook and supporting evidence.

## Dashboard

The application lives in [`gym-dashboard`](gym-dashboard/). It includes the complete training journal, progression views, recovery tracking, nutrition calculations, coaching decisions, evidence gallery, archive and verification queue.

## Update workflow

After a workout, append the new record to the canonical Markdown and workbook without removing history, then run:

```powershell
cd gym-dashboard
npm ci
npm run sync-data
npm test
npm run build
```

Pushing the synchronized files to `main` deploys the dashboard through GitHub Pages.

## Public-data notice

This repository intentionally includes the coaching record, workbook and evidence images for public dashboard access.
