# Epicenter — Frontend

React + Vite + Tailwind implementation of the Epicenter disaster
verification platform's citizen-facing and verification-team pages.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Structure

```
src/
├── App.jsx                    — top-level page router (simple client-side state, no real routes yet)
├── App.css                    — hero-specific styling (background image, gutters, responsive breakpoints)
├── index.css                  — global styles, design tokens, and the shared .page-container gutter system
├── main.jsx                   — React entry point
├── assets/                    — logo files, hero background, about-section visual
├── components/
│   ├── Header.jsx              — shared nav bar, including the signed-in account dropdown / mobile menu
│   ├── Footer.jsx               — shared footer
│   └── sections/                — Home page sections (Stats, About, Features, How It Works)
└── pages/
    ├── Home.jsx                 — landing page
    ├── ReportIncident.jsx       — citizen incident report form + post-submit status tracker
    └── VerificationLogin.jsx    — officer login page with live stats bar
```

## Design system

- **Palette:** dark ink (`#0b0d12`) background with a red alert accent (`#e42430`) — defined in `tailwind.config.js` and `index.css`'s `:root` custom properties.
- **Type:** Sora (display/headings) + Manrope (body), loaded via Google Fonts in `index.html`.
- **Gutters:** every page uses the shared `.page-container` class (defined in `index.css`) for consistent left/right margins that scale across breakpoints (20px mobile → 88px at 1440px+). Use this class instead of ad-hoc `px-*` values when adding new sections.
- **Logo:** the mark is a custom "epicenter" motif (concentric rings radiating from a center point) — not a stock icon. Source files are the exported PNGs in `src/assets/`; there's no editable source format checked in, so regenerate from scratch if the mark needs to change.

## Auth integration point

`Header.jsx` accepts an `auth` prop:

```js
auth: null                                    // guest — shows the "Guest Mode" pill
auth: { name, email, avatarUrl? }             // signed in — shows avatar, account dropdown, "My Reports" / "Sign out"
```

`ReportIncident.jsx` currently manages `auth` as local demo state (a `signIn()` function that sets a hardcoded user on click, so the signed-in UI can be reviewed without a backend). **Replace this with real Google Sign-In** — swap `signIn()` for your actual OAuth flow, and pass the real resulting user object into `auth` the same way. The UI itself (dropdown, mobile menu, success-screen messaging) doesn't need to change.

`onNavigate('sign-out')` and `onNavigate('my-reports')` are the two special navigation events `Header` fires from the signed-in menu — `ReportIncident.jsx`'s `handleHeaderNavigate` shows how to intercept them (currently: sign-out clears local state, my-reports shows a placeholder alert since that page doesn't exist yet).

## Known gaps / next steps

- No real routing (React Router, etc.) — page switching is just `useState` in `App.jsx`. Fine for a small number of pages, but will need real routes once there's a "My Reports" page, deep links, etc.
- No backend wiring — the report form's submit handler is entirely local/simulated (see `handleSubmit` in `ReportIncident.jsx`), including the fake reference ID and the demo status-tracker animation. Replace with real `fetch` calls to the backend API once ready.
- Verification Login's stats bar (`STATS` in `VerificationLogin.jsx`) is hardcoded sample data — wire to a real `/dashboard/stats`-style endpoint.
- "My Reports" page doesn't exist yet — only a placeholder alert is wired to the nav item.
