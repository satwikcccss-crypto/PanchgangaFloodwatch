/**
 * MAP CONFIGURATION
 * Settings for Interactive Leaflet Map
 */

export const MAP_CONFIG = {
  defaultCenter: [16.7050, 74.2800],   // geographic centre of all 5 RTDAS stations
  defaultZoom: 11,
  minZoom: 10,
  maxZoom: 18,
  
  bounds: [
    [16.55, 74.10],
    [16.85, 74.60]
  ],
  
  mapLayers: {
    osm: {
      name: 'OpenStreetMap (Standard)',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    esriSatellite: {
      name: 'ESRI World Imagery (Satellite)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    },
    esriTopo: {
      name: 'ESRI World Topographic',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    },
    googleHybrid: {
      name: 'Google Maps Hybrid',
      url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    googleSatellite: {
      name: 'Google Maps Satellite',
      url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    googleTerrain: {
      name: 'Google Maps Terrain',
      url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }
  },
  
  sensorMarkerStyles: {
    normal: {
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.8,
      radius: 10,
      weight: 2
    },
    warning: {
      color: '#F59E0B',
      fillColor: '#F59E0B',
      fillOpacity: 0.9,
      radius: 12,
      weight: 3
    },
    danger: {
      color: '#F97316',
      fillColor: '#F97316',
      fillOpacity: 1.0,
      radius: 14,
      weight: 3
    },
    extreme: {
      color: '#EF4444',
      fillColor: '#EF4444',
      fillOpacity: 1.0,
      radius: 16,
      weight: 4
    }
  },
  
  popup: {
    maxWidth: 300,
    minWidth: 200,
    className: 'custom-marker-popup'
  }
};

// Panchganga River Points of Interest
export const RIVER_POI = [
  {
    id: 'confluence',
    name: 'Panchganga Confluence',
    description: 'Meeting point of five rivers: Kasari, Kumbhi, Tulsi, Bhogawati, and Saraswati',
    location: [16.6921, 74.2310],
    type: 'confluence',
    icon: '🌊'
  },
  {
    id: 'panchganga-ghat',
    name: 'Panchganga Ghat',
    description: 'Historic bathing ghat and religious site',
    location: [16.7046, 74.2160],
    type: 'ghat',
    icon: '🛕'
  },
  {
    id: 'krishna-confluence',
    name: 'Krishna River Confluence',
    description: 'Point where Panchganga meets Krishna River',
    location: [16.8124, 74.5672],
    type: 'confluence',
    icon: '🌊'
  }
];

// Helper function to get marker style based on alert level
export const getMarkerStyle = (alertLevel) => {
  return MAP_CONFIG.sensorMarkerStyles[alertLevel] || MAP_CONFIG.sensorMarkerStyles.normal;
};
