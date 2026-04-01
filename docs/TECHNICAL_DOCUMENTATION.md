# Technical Documentation: Panchganga Floodwatch Dashboard

This document provides technical details of the **Panchganga Floodwatch Dashboard** architecture, component structure, and integration patterns.

## 1. System Architecture
The dashboard is a single-page application (SPA) built with **React (Vite)**. It follows a modular architecture for data services, configuration, and UI components.

### 🔌 Data Flow
1.  **Ingestion**: `thingspeakAPI.js` fetches data from ThingSpeak channels using Axios.
2.  **Processing**: Data is parsed into a unified internal format (see `services/thingspeakAPI.js`).
3.  **Refinement**: `mslCalculations.js` handles Mean Sea Level (MSL) conversions.
4.  **Classification**: `alertClassification.js` determines the alert level (Normal, Warning, Danger, Extreme).
5.  **Visualization**: Data is passed to the various UI components (Map, Gauges, Charts) via React state.

## 2. Component Hierarchy
-   **Main Dashboard (`MainDashboard.jsx`)**: The parent container managing state for all sensors.
-   **Header Bar (`HeaderBar.jsx`)**: Navigation and university branding.
-   **Interactive Map (`InteractiveMap.jsx`)**: Leaflet-based geospatial visualization.
-   **Water Gauges (`EngineeringGauge.jsx`)**: Precision SVG-based visualization for each sensor.
-   **Live Charts (`LiveDataChart.jsx`)**: Time-series visualization using Chart.js.
-   **Alert Banner (`AlertBanner.jsx`)**: High-priority notices for critical flood levels.
-   **SMS Registration (`QRRegistration.jsx`)**: Logic for QR code and form redirection.

## 3. Configuration System
-   **Sensor Metadata (`src/config/sensors.js`)**: All sensor-specific configuration (IDs, locations, thresholds, and credentials).
-   **Alert Configuration (`src/config/alerts.js`)**: Templates for SMS alerts and visual classification mapping.
-   **Map Defaults (`src/config/mapConfig.js`)**: Initial view state and layer configuration.

## 4. API Integration
The system integrates with the **ThingSpeak JSON API**.
-   **Latest Reading**: `fetchLatestReading(sensorId)`
-   **Historical Data**: `fetchHistoricalData(sensorId, resultsCount)`
-   **Mock Data**: A built-in generation system (`generateMockData`) handles fallback when API keys are not provided, allowing for offline testing and demonstration.

## 5. Security & Performance
-   **CORS Management**: Vite proxy configuration handles potential cross-origin issues during development.
-   **Data Buffering**: The dashboard maintains a history of the last 150 readings to optimize chart performance and reduce API calls.
-   **Lazy Loading**: Components are structured to minimize initial bundle size and optimize load times on university LANs.

---
*For deployment instructions, see [docs/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).*
