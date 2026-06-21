# Field Ledger — shared travel expense tracker

A multi-currency, split-with-companions expense tracker. Static frontend + one
Netlify Function that persists each trip as a JSON blob in **Netlify Blobs**,
keyed by a short trip code everyone shares.

```
.
├── public/
│   └── index.html        # the whole app (frontend)
├── netlify/
│   └── functions/
│       └── trip.mjs       # GET/PUT/DELETE /api/trip?code=XXX  -> Netlify Blobs
├── netlify.toml           # build + routing config
└── package.json           # declares @netlify/blobs
```

## How the data flows

- Each trip is stored under the key `trip:<CODE>` in a Blobs store called `trips`.
- The frontend `save()`s the whole trip (debounced) on every change via `PUT /api/trip?code=…`.
- It pulls fresh data on load and whenever the tab regains focus.
- The trip code is remembered in `localStorage`, plus a local cache so the app
  paints instantly and survives brief offline moments.
- Concurrency is **last-write-wins** — fine for a small group, but if two people
  edit the exact same second, one edit can overwrite the other. Tap the “Synced”
  indicator to pull the latest before making big changes.

## Deploy (Git — recommended)

1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Netlify reads `netlify.toml`, runs `npm install`, and deploys.
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. Open the site URL. Start a trip, share the code, done.

## Deploy (CLI)

```bash
npm install            # pulls @netlify/blobs
npm i -g netlify-cli
netlify deploy --build --prod
```

## Local development

```bash
npm install
netlify dev            # serves the site + functions + a local Blobs sandbox
```

## Notes

- **Netlify Blobs requirements:** Blobs is available on Netlify's standard plans;
  no separate database to provision. Storage and access control are automatic.
- **No auth:** anyone with a trip code can read/write that trip. Codes are random
  (~900M combinations) but not secret-grade. Don't store sensitive data, and
  treat the code like a shared room key.
- **Exchange rates** are seeded and editable in-app; the “Fetch latest” button
  calls a public rates API from the browser and falls back to manual editing if
  blocked.
- **Not for card data:** never store card numbers or other regulated data here.
