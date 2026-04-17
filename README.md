# xp-demo-mbng

**MBNG · Cross-platform Landing Page Demo**

A React + Vite demo landing page integrating AppsFlyer Smart Script (Cross-platform Landing Page).  
Demonstrates impression firing and per-platform Direct Click URL generation for attribution tracking across iOS, Android, Galaxy Store, and PC.

**Live demo:** https://luvgaram.github.io/xp-demo-mbng/

---

## Overview

This project was built to demonstrate AppsFlyer's Cross-platform Landing Page with Smart Script feature. The UI is modeled after a Mabinogi Mobile (MBNG) 1st anniversary festival page, and shows how AppsFlyer attribution works end-to-end on a real landing page scenario.

---

## Features

- **Auto impression firing** — On page load, an impression is automatically sent to `impressions.onelink.me`
- **Per-platform Direct Click URL generation** — Attribution-tagged click URLs are generated for 4 platforms: App Store (iOS), Google Play (Android), Galaxy Store, and PC
- **UTM parameter mapping** — Incoming UTM parameters from the referral URL are automatically mapped to AppsFlyer parameters
- **Debug panels** — Impression URL is shown on page load; Direct Click URLs are shown on CTA button hover

---

## UTM Parameter Mapping

| UTM Parameter | AppsFlyer Parameter | Notes |
|---|---|---|
| `utm_source` | `pid` / `af_media_source` | `pid` for iOS & Android, `af_media_source` for others |
| `utm_campaign` | `c` / `af_campaign` | `c` for iOS & Android, `af_campaign` for others |
| `utm_medium` | `af_campaign_id` / `af_c_id` | Auto-converted to `af_c_id` for iOS & Android |
| `utm_term` | `af_adset` | |
| `utm_content` | `af_ad` | |
| `inchnl` | `af_channel` | |
| `fbclid` | `af_sub2` + `fbclid` | Facebook Click ID |
| `gclid` | `af_sub4` + `gclid` | Google Click ID |

---

## Smart Script Integration Flow

```
Page load
│
├── 1. generateOneLinkURL()
│     └── Generates impression URL (includes af_xplatform=true)
│           └── fireImpressionsLink() → sends to impressions.onelink.me
│
├── 2. Remove af_xplatform from afParameters
│     (not needed in Direct Click URLs)
│
└── 3. generateDirectClickURL() × 4 platforms
      ├── iOS     → app.appsflyersdk.com/id1111742921
      ├── Android → app.appsflyersdk.com/com.xptest.mbng
      ├── Galaxy  → engagements.appsflyersdk.com/.../android/com.xptest.mbng.galaxy
      └── PC      → engagements.appsflyersdk.com/.../nativepc/11117429211111
```

---

## Platform Configuration

| Platform | platformName | App ID | Redirect URL |
|---|---|---|---|
| App Store | `ios` | `id1111742921` | apps.apple.com |
| Google Play | `android` | `com.xptest.mbng` | play.google.com |
| Galaxy Store | `android` | `com.xptest.mbng.galaxy` | apps.samsung.com |
| PC | `nativepc` | `11117429211111` | mabinogimobile.nexon.com |

> Galaxy Store uses `android` as the `platformName`. `galaxy` is not a supported platform name in Smart Script.

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (`motion/react`)
- AppsFlyer Smart Script (CDN)

---

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.  
To verify Smart Script is working, open DevTools → Network tab and filter by `impressions.onelink.me`.

---

## Deployment

Pushing to the `main` branch triggers an automatic build and deployment to GitHub Pages via GitHub Actions.

```
Push to main
→ .github/workflows/deploy.yml
→ npm run build
→ Deploy dist/ to gh-pages branch
→ https://luvgaram.github.io/xp-demo-mbng/
```

---

## SRI Readiness

When AppsFlyer officially releases SRI (Sub-Resource Integrity) support, update the Smart Script `<script>` tag in `index.html` as follows:

**Step 1.** Replace `latest` with the version-pinned URL provided by AppsFlyer.  
**Step 2.** Add `integrity` and `crossorigin` attributes:

```html
<script
  src="https://onelinksmartscript.appsflyer.com/onelink-smart-script-2.x.x.js"
  integrity="sha384-<hash provided by AppsFlyer>"
  crossorigin="anonymous"
></script>
```

> Never compute the hash manually. Always use the value from the official AppsFlyer communication.

---

## References

- [Cross-platform Landing Pages with Smart Script — AppsFlyer Support](https://support.appsflyer.com/hc/en-us/articles/18440789126289)
- [Smart Script V2 — AppsFlyer Developer Hub](https://dev.appsflyer.com/hc/docs/dl_smart_script_v2)
- [Official Sample Demo Page — GitHub](https://github.com/AppsFlyerSDK/appsflyer-sample-app-smartscript-demo-page)

