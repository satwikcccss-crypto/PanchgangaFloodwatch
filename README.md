# PanchgangaFloodwatch — RTDAS Dashboard

**Owner:** Centre for Climate Change and Sustainability Studies (CCCSS), Shivaji University, Kolhapur  
**Project:** DST–SERB, Govt. of India Sponsored Research  
**Developed by:** Er. Satwik K. Udupi  
**Status:** 🚀 **Production-Ready / SCADA Redesign Applied**

---

## Technical Overview
The Panchganga Floodwatch platform has been transformed into a high-fidelity **SCADA** command center. 

### Key Features (Redesign v2.0)
- **SCADA SVG Integration**: High-fidelity engineering gauges with animated wave physics.
- **Nomenclature Standard**: Global migration to **RWL (Radar Water Level)** terminology.
- **Standardized Units**: All monitoring performed in **Meters (m MSL)**.
- **Clean Command Center Layout**: Removed redundant statistical bars to prioritize GIS map interactions.
- **Dynamic WSL Monitoring**: Renamed analytical views to **WSL (Water Surface Elevation)**.

---

## RWL Monitoring Stations

| Station | River | Lat (DD) | Lng (DD) | Authority |
|---|---|---|---|---|
| Chhatrapati Shivaji Maharaj Bridge | Panchganga | 16.707175 | 74.217525 | KMC |
| Ichalkaranji Bridge | Panchganga | 16.665844 | 74.475964 | WRD |
| Nitawade Kasari River Bridge | Kasari River | 16.744708 | 74.141653 | WRD |
| Balinge Bhogawati River Bridge | Bhogawati River | 16.691667 | 74.165422 | WRD |
| Jayanti Nala — Wilson Bridge | Jayanti Nala | 16.700447 | 74.231292 | KMC |

---

## Recent Updates Audit (April 2026)

| Update | Action Taken | Status |
|---|---|---|
| **SVG Gauge Implementation** | Replaced CSS bars with animated SVG telemetry units. | ✅ Complete |
| **Nomenclature Shift** | Migrated `RWS`/`RG` to `RWL` globally. | ✅ Complete |
| **Unit Standardization** | Unified all displays to Meters (m). | ✅ Complete |
| **Danger Level Calibration** | Applied precise WRD-standard elevation thresholds. | ✅ Complete |
| **UI Streamlining** | Removed `StatsOverview` and "Stage Intensity" widgets. | ✅ Complete |

---

*© 2026 CCCSS, Shivaji University, Kolhapur — All Rights Reserved*
