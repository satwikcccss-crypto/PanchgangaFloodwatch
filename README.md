# Panchganga River Flood Monitoring Dashboard

Professional, real-time hydrological monitoring and alert system for the **Panchganga River Basin**, developed for the **Centre for Climate Change and Sustainability Studies (CCCSS)**, Shivaji University, Kolhapur.

![Dashboard Overview](https://raw.githubusercontent.com/satwikcccss-crypto/PanchgangaFloodwatch/master/public/screenshot.png) *(Placeholder)*

## 🌊 Project Overview

This dashboard provides engineering-grade visualization of river water levels across five critical locations in the Panchganga basin. It integrates real-time IoT sensor data (via ThingSpeak) with professional hydrological standards (MSL) to provide early warnings and data-driven insights for flood management.

### Key Features:
*   **Engineering-Grade Visualization**: Custom-built water gauges with 0.1m precision mapping.
*   **Real-time Telemetry**: Integration with IoT radar sensors for live water level updates.
*   **Intelligent Alerting**: Automated classification (Normal, Warning, Danger, Extreme) based on official WRD/CWC thresholds.
*   **Interactive Maps**: Geospatial visualization of sensor networks with sync-shuffle interaction.
*   **Data Analytics**: Time-series historical analysis and rate-of-change telemetry.
*   **SMS Registration**: QR-based system for citizens to register for localized alerts.

## 🛠️ Tech Stack
*   **Frontend**: React + Vite
*   **Styling**: Tailwind CSS + Framer Motion (Animations)
*   **Maps**: Leaflet + React-Leaflet
*   **Charts**: Chart.js + React-Chartjs-2
*   **Icons**: Lucide React
*   **API**: Axios (ThingSpeak / RTDSS integration)

## 🚀 Quick Start (Development)

### Using Google IDX (Recommended)
1.  Open the project in Google IDX.
2.  The environment will auto-configure and start the development server.

### Local Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/satwikcccss-crypto/PanchgangaFloodwatch.git
    cd PanchgangaFloodwatch
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start development server**:
    ```bash
    npm run dev
    ```

## 📋 Documentation
Detailed documentation is available in the `docs/` directory:
*   [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)
*   [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
*   [Issues & Fixes Log](./docs/ISSUES_AND_FIXES.md)
*   [Developer Instructions](./DEVELOPER_INSTRUCTIONS.md)

## 🤝 Support & Ownership
*   **Institution**: CCCSS, Shivaji University, Kolhapur
*   **Lead Developers**: Dr. S. S. Panhalkar & Dr. G. S. Nivhekar
*   **Engineering Lead**: Er. Satwik K. Udupi

---
*Developed as part of the DST, SERB Govt of India sponsored project.*
