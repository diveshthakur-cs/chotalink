# ChotaLink

ChotaLink is a lightweight React frontend that lets sellers create custom short links, share them, and see how each link performs. Everything runs entirely in the browser using `localStorage`, so you can simulate a backend workflow without leaving the client.

## Features
- Generate unique short links with optional custom aliases
- Optional expiry (predefined presets + custom duration)
- Simulated redirect: clicking a short link inside the dashboard opens the destination URL and increments the click counter
- Dashboard with original URL, short link, clicks, expiration status, delete + copy actions, QR code generation, and inline edit/delete controls
- Downloadable QR codes (SVG + PNG) for every short link
- Simple analytics snapshot that surfaces total clicks, active links, top performer, and a 7-day trend built from click history

## Getting started
```bash
npm install
npm run dev
```
The development server defaults to `http://localhost:5173`.

To produce a production build:
```bash
npm run build
npm run preview
```

## Implementation notes
- **Storage** – Short links are persisted in `localStorage` (`chotalink::links` key). Clearing browser storage resets the app.
- **IDs & aliases** – Aliases are normalized (lowercase, numbers, dashes only) and validated for uniqueness; when the user does not provide one, a random 6-character slug is generated.
- **Expiry** – Users can select a preset duration (no expiry, 7 days, 30 days) or enter a custom number of days. Expired links are visually muted and cannot be opened.
- **Click tracking** – Each simulated redirect stores a timestamp so we can build a lightweight 7-day click trend without a real backend.
- **Styling** – Plain CSS (no UI framework) to keep the bundle lean while still providing a responsive layout.

## Assumptions
- A custom alias must use letters, numbers, or dashes. Invalid aliases are rejected instead of automatically sanitizing into a different value.
- Because there is no backend, the `https://cl.in/alias` links (QR codes, copy buttons, etc.) are for presentation only — scanning or sharing them outside the app will not resolve without a real server.
- Browser clipboard access might be unavailable in some environments; the UI silently ignores copy failures.
