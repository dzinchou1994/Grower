# Grower

Forum-first cannabis community web app built with Next.js.

## Performance Commands

- `npm run analyze` - builds with bundle analyzer enabled (`ANALYZE=true`).
- `npm run perf:baseline` - builds and writes `.perf/bundle-baseline.json`.
- `npm run perf:budget` - builds and fails if JS bundle budgets are exceeded.

You can tune budgets with environment variables:

- `BUNDLE_BUDGET_TOTAL_BYTES` (default `850000`)
- `BUNDLE_BUDGET_INITIAL_BYTES` (default `650000`)
- `BUNDLE_BUDGET_GROWTH_PERCENT` (default `15`)
