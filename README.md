# Piece Rate Payroll — MJM Palm Oil Mill

React + Vite dashboard for piece-rate payroll, backed by Supabase.

## Local setup

```bash
npm install
cp .env.example .env      # then fill in your Supabase URL + anon key
npm run dev
```

The Dashboard runs on mock sample data (`src/data/mockDashboard.js`) until
real Supabase tables are wired up — see `src/lib/supabaseClient.js`.

## Project structure

```
src/
  components/   Sidebar, Topbar, stat tiles, chart, table — reusable UI pieces
  pages/        One file per sidebar destination (Dashboard is built out,
                 the rest are placeholders to build next)
  data/         Mock dashboard data + summary/ranking helpers
  lib/          Supabase client, currency/number formatting
  styles/       Design tokens (light/dark) + layout & component CSS
```

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which builds and deploys
on every push to `main`.

One-time setup on GitHub:

1. **Settings → Pages → Build and deployment → Source**: change from
   "Deploy from a branch" to **GitHub Actions**.
2. **Settings → Secrets and variables → Actions**: add repository secrets
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as your
   local `.env`) so the production build can reach Supabase.

After that, `git push` to `main` builds and deploys automatically — no
manual `npm run build` step needed.

## Adding real data

Supabase tables to design next, based on the piece rate documents (Lab,
Ramp, Process):

- `workers` — name, role (operator / assistant / station head), station, basic wage
- `stations` — department/station list matching the piece rate categories
- `piece_rate_master` — versioned rates per station/task (mirrors the
  Version / Date Amended / Effective Date columns in the source PDFs)
- `piece_rate_entries` — daily production/task logs feeding the payout calc
- `penalties`, `incentives` — rule definitions + applied entries per period

Once those exist, replace the calls in `src/data/mockDashboard.js` with
Supabase queries — the page components already consume a
`{ name, workers, pieceRate, basicTopUp, penalty, incentive }` shape per
department, so only the data-fetching layer changes.
