# Sunbridge Freight

A pro-design-studio quality freight forwarding website for **Sunbridge Freight**, deployed via GitHub Pages.

**Live URL (once merged to `main`):** https://yariv33.github.io/

## Stack

Pure static HTML / CSS / JS — no build step, no framework. Jekyll passes files through unchanged.

- `index.html` — single-page marketing site (hero, services, coverage map, stats, how-we-work, industries, testimonial, ESG, certifications, footer)
- `quote.html` — dedicated quote/contact page with a validated form
- `404.html` — branded not-found page
- `assets/css/styles.css` — single layered stylesheet (~1k lines)
- `assets/js/main.js` — vanilla JS (sticky header, reveal-on-scroll, stat counters, mobile nav, track dialog, form validation, mailto dispatch)
- `assets/favicon.svg`, `assets/img/og-cover.svg` — brand marks

## Brand

- **Name:** Sunbridge Freight — _"Bridging continents, daily."_
- **Palette:** light shades of orange (`#FFE0CC` → `#FFB877` → `#E8843C` → `#D86F1F`) on warm off-white `#FBFAF7`, with deep navy ink `#1A2331` and a muted teal accent `#2F8F6F` for ESG sections.
- **Type:** Fraunces (display) + Inter (UI/body) + JetBrains Mono (numerals), via Google Fonts.

## Contact form

The quote form uses **`mailto:`** delivery — submit opens the visitor's email client with all fields pre-filled and the message addressed to `hello@sunbridgefreight.com`. To switch to a real form endpoint (Web3Forms or Formspree), see the HTML comment block above the `<form id="quote-form">` element in `quote.html`. It's a three-line swap.

## Content note

All company stats, certifications, testimonials and partner logos in this site are **illustrative placeholders** for a fictional brand. Replace before any real commercial use.

## Local preview

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

GitHub Pages serves this user-site from the `main` branch. To go live, merge `claude/freight-forwarding-website-Yzx6y` → `main` (or temporarily change Pages source in repo Settings → Pages for a preview from the feature branch).
