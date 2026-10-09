# Valorant Codex

Next.js site built from the pipeline output in `../images` (folders + `stats.json` files).
There is no database: pages read the folders directly at build time.

## Run

    npm install
    npm run dev          # http://localhost:3000
    npm run build && npm start   # production

Don't run `dev` and `build` at the same time, they share the `.next` folder.

## Updating

    python ../pipeline.py   # refresh data/images/stats.json
    npm run build           # (or just reload the dev server)

## Images

`public/images` is a Windows junction to `../images` (no copy). Recreate with:

    mklink /J public\images ..\images
