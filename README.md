# even-admin-spa

Simple Vite + React admin SPA for editing `site.i18n.ru` and `site.i18n.uz` values through the backend API.

## Features

- Opens directly to the admin page (no auth, no routing).
- Loads translations from `GET /site`.
- Flattens nested keys dynamically (`services.items.0`, `heroStats.0.label`, etc.).
- Edits RU and UZ values side-by-side for every key (string/number/boolean/null).
- Save per key (`PATCH /site` for both RU/UZ when changed).
- Save All changed fields sequentially.
- Search by path or value.
- Uzbek interface labels for client-friendly editing.
- Key selector (`select`) to edit one key at a time in a simple flow.

## API contract

- Only key values are edited and sent in `value`; key paths are never renamed.

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


## UI stack

- DaisyUI (includes Tailwind utility classes) is loaded via CDN in `index.html`.
- Components in `src/AdminPage.jsx` use Tailwind/DaisyUI classes (`card`, `btn`, `input`, `alert`, etc.).
