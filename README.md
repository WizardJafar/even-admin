# even-admin-spa

Simple Vite + React admin SPA for editing `site.i18n.ru` and `site.i18n.uz` values through the backend API.

## Features

- Opens directly to the admin page (no auth, no routing).
- Loads translations from `GET /site`.
- Flattens nested keys dynamically (`services.items.0`, `heroStats.0.label`, etc.).
- Edits RU and UZ string values side-by-side.
- Save per key (`PATCH /site` for both RU/UZ when changed).
- Save All changed fields sequentially.
- Search by path or value.
- Grouped sections by first path segment.

## API contract

- `GET {VITE_API_BASE}/site` -> `{ site: { i18n: { ru: {...}, uz: {...} } } }`
- `PATCH {VITE_API_BASE}/site` with body:

```json
{ "path": "site.i18n.ru.headerSubtitle", "value": "..." }
```

## Setup

```bash
npm i
npm run dev
```

Default API base is `http://localhost:5050`.

If your backend is elsewhere, create `.env`:

```bash
VITE_API_BASE=https://even-backend-f3n6.onrender.com
```
