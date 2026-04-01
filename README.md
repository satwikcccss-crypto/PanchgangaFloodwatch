# PanchgangaFloodwatch — RTDAS Dashboard

**Owner:** Centre for Climate Change and Sustainability Studies (CCCSS), Shivaji University, Kolhapur  
**Project:** DST–SERB, Govt. of India Sponsored Research  
**Title:** *"IoT and Geoinformatics Based Flood Monitoring and Prediction System for Panchganga River Basin"*  
**Guidance:** Dr. S. S. Panhalkar | Dr. G. S. Nivhekar  
**Developed by:** Er. Satwik K. Udupi  
**Status:** 🚧 Under Active Development

---

## ⚠️ Academic Disclaimer

This dashboard and all data within it are the intellectual property of **CCCSS, Shivaji University, Kolhapur**. All sensor readings are academic and research-derived. This site is **not** an authoritative flood warning system. Official emergency decisions must be based on **WRD Maharashtra / IMD / CWC** sources. Unauthorised reproduction of data or design is prohibited.

---

## What This Dashboard Does

Real-time water level data is captured by **ultrasonic radar sensors** installed over bridges and weirs on the Panchganga River and its tributaries. Telemetry is transmitted via the **RTDAS (Real-Time Data Acquisition System)** portal and integrated with the **ThingSpeak IoT API**. The dashboard visualises live MSL water levels, triggers CWC-standard flood alerts, and enables SMS-based community warning registration.

---

## RTDAS Monitoring Stations — Correct Coordinates

All coordinates are WGS84 Decimal Degrees, converted from field-verified DMS survey data.

| Station | River | Lat (DD) | Lng (DD) | DMS Source | Authority |
|---|---|---|---|---|---|
| Chhatrapati Shivaji Maharaj Bridge | Panchganga | 16.707150 | 74.221667 | 16°42'25.74"N, 74°13'18"E | KMC |
| Ichalkaranji Bridge | Panchganga | 16.665844 | 74.475964 | 16°39'57.04"N, 74°28'33.47"E | WRD Maharashtra |
| Nitawade Kasari River Bridge | Kasari River | 16.744708 | 74.141653 | 16°44'40.95"N, 74°08'29.95"E | WRD Maharashtra |
| Balinge Bhogawati River Bridge | Bhogawati River | 16.691667 | 74.165422 | 16°41'30.00"N, 74°09'55.52"E | WRD Maharashtra |
| Jayanti Nala — Wilson Bridge | Jayanti Nala | 16.700000 | 74.230000 | KMC drainage map (update with field DMS) | KMC |

> **Action Required:** Field-verify DMS for Jayanti Nala / Wilson Bridge and update `src/config/sensors.js`.

---

## Developer Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run
```bash
git clone https://github.com/satwikcccss-crypto/PanchgangaFloodwatch.git
cd PanchgangaFloodwatch
npm install
npm run dev
```

---

## Connecting Real ThingSpeak RTDAS Data

1. Open `src/config/sensors.js`
2. For each sensor, replace the placeholder values:

```js
channelId: 'YOUR_CHANNEL_ID_1',   // → replace with real ThingSpeak channel ID
apiKey:    'YOUR_API_KEY_1',       // → replace with Read API Key from ThingSpeak
```

3. ThingSpeak field mapping (configured in `src/config/sensors.js`):

| Field | Data |
|---|---|
| `field1` | Water level (m MSL) |
| `field2` | Temperature (°C) |
| `field3` | Battery voltage (V) |
| `field4` | Signal strength (%) |

4. Until channels are configured, the dashboard shows **clearly labelled Demo Data** — the mock data keys now correctly match sensor IDs (fix applied Apr 2026).

---

## SMS Alert Registration — QR Code

1. Open `src/config/alerts.js`
2. Update the form URL:

```js
registrationFormUrl: 'https://forms.gle/YOUR_ACTUAL_FORM_ID',
```

The QR code in the dashboard will auto-generate from this URL. If the URL still contains `YOUR_GOOGLE_FORM_ID`, the dashboard will show a placeholder with a clear "Form URL Not Configured" message.

---

## Known Issues Fixed (April 2026 Audit)

| # | Issue | File | Status |
|---|---|---|---|
| 1 | Mock data base-level keys mismatched sensor IDs → all gauges showed 540.0 m | `thingspeakAPI.js` | ✅ Fixed |
| 2 | Shivaji Bridge coordinates contradicted river path | `sensors.js` | ✅ Fixed (field DMS applied) |
| 3 | `StatsOverview` component imported but never rendered | `MainDashboard.jsx` | ✅ Fixed |
| 4 | `sensor.sensorType` field missing from config → blank in UI | `sensors.js` | ✅ Added |
| 5 | QR URL hardcoded in component, bypassed `alerts.js` config | `QRRegistration.jsx` | ✅ Fixed |
| 6 | `alerts.js` had placeholder `YOUR_GOOGLE_FORM_ID` | `alerts.js` | ✅ Updated to real URL |
| 7 | "Live Telemetry Active" shown even when using demo data | `InteractiveMap.jsx` | ✅ Now shows Demo/Live status |
| 8 | Map popup only opened on click — no hover tooltip | `InteractiveMap.jsx` | ✅ Added hover Tooltip |
| 9 | River polylines (Bhogawati, Kasari, Panchganga, Jayanti) drawn on map | `InteractiveMap.jsx` | ✅ Removed per instruction |
| 10 | All station names/descriptions were generic — not matching actual bridges | `sensors.js` | ✅ Updated with correct names |
| 11 | No academic disclaimer visible on dashboard | `MainDashboard.jsx` | ✅ Added footer + Info panel |
| 12 | Info panel missing WRD contact, data system details, full disclaimer | `MainDashboard.jsx` | ✅ Expanded with full content |
| 13 | QR Registration panel too large, misaligned with sidebar | `QRRegistration.jsx` | ✅ Redesigned compact |
| 14 | Language toggle (EN/MR) had no effect — non-functional UI element | `HeaderBar.jsx` | ⚠️ Retained button, no i18n wiring yet |
| 15 | Map center/zoom did not cover all 5 stations properly | `mapConfig.js` | ✅ Updated center & zoom |

---

## Pending Actions for Developer

- [ ] Replace all 5 `YOUR_CHANNEL_ID_N` and `YOUR_API_KEY_N` in `sensors.js`
- [ ] Update `ALERT_CONFIG.registrationFormUrl` in `alerts.js` with final Google Form link
- [ ] Field-verify and update DMS for Jayanti Nala / Wilson Bridge
- [ ] Wire up language toggle (EN ↔ MR) to a proper React i18n context
- [ ] Remove `isMockData: true` labels once live RTDAS channels are active
- [ ] Add WRD official danger levels for all 5 stations after field calibration
- [ ] Test all ThingSpeak API responses for correct field mapping

---

## File Structure

```
src/
├── config/
│   ├── sensors.js          ← Station config, coordinates, danger levels
│   ├── alerts.js           ← CWC classification, QR form URL, message templates
│   └── mapConfig.js        ← Leaflet map settings
├── services/
│   ├── thingspeakAPI.js    ← RTDAS/ThingSpeak API calls + mock fallback
│   └── alertClassification.js
├── components/
│   ├── Dashboard/
│   │   ├── MainDashboard.jsx   ← Root layout, StatsOverview, disclaimer footer
│   │   ├── HeaderBar.jsx
│   │   └── StatsOverview.jsx   ← 5-card station summary row
│   ├── Map/
│   │   └── InteractiveMap.jsx  ← Leaflet map, hover tooltips, station markers
│   ├── Alerts/
│   │   ├── AlertBanner.jsx
│   │   └── QRRegistration.jsx  ← Compact SMS registration widget
│   ├── Charts/
│   │   └── LiveDataChart.jsx
│   └── WaterGauge/
│       └── EngineeringGauge.jsx
└── utils/
    ├── mslCalculations.js
    └── dataProcessing.js
```

---

*© CCCSS, Shivaji University, Kolhapur — All Rights Reserved*
