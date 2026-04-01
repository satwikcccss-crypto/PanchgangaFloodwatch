/**
 * SENSOR CONFIGURATION — PanchgangaFloodwatch
 * Centre for Climate Change and Sustainability Studies (CCCSS)
 * Shivaji University, Kolhapur
 *
 * Data Source: RTDAS (Real-Time Data Acquisition System) via ThingSpeak API
 * Sensor Type: Ultrasonic Radar Water Level Sensors installed over bridges/weirs
 * Coordinates: WGS84 Decimal Degrees (converted from field-verified DMS survey data)
 *
 * ⚠️ ACADEMIC DISCLAIMER: All data is research-derived for academic and flood-awareness
 * purposes only. This site is under active development. Official flood decisions must be
 * based on WRD / IMD / CWC authoritative sources. Ownership: CCCSS, Shivaji University.
 */

export const SENSORS = [
  {
    id: 'shivaji_bridge',
    name: 'Chhatrapati Shivaji Maharaj Bridge',
    shortName: 'CSM Bridge',
    channelId: '2505527',
    apiKey: 'GIPQ7GZ7IPG1I0GE',
    sensorType: 'Ultrasonic Radar — RTDAS',
    river: 'Panchganga River',
    location: {
      // DMS: 16°42'25.83"N 74°13'03.09"E
      lat: 16.707175,
      lng: 74.217525
    },
    district: 'Kolhapur',
    authority: 'Kolhapur Municipal Corporation (KMC)',
    description: 'Ultrasonic radar sensor on the Chhatrapati Shivaji Maharaj Bridge over the Panchganga River, Kolhapur. Monitors real-time water stage at the primary urban crossing. Alert thresholds referenced to Rajaram KT Weir MSL datum (WRD Maharashtra).',
    dangerLevels: {
      warning: 542.01,
      danger: 543.00,
      extreme: 545.00,
      hfl: 547.13
    },
    markerColor: '#0f4c81'
  },
  {
    id: 'ichalkaranji_br',
    name: 'Ichalkaranji Bridge',
    shortName: 'Ichalkaranji',
    channelId: 'YOUR_CHANNEL_ID_2',
    apiKey: 'YOUR_API_KEY_2',
    sensorType: 'Ultrasonic Radar — RTDAS',
    river: 'Panchganga River',
    location: {
      // DMS: 16°39'57.04"N, 74°28'33.47"E (field-verified)
      lat: 16.665844,
      lng: 74.475964
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'Ultrasonic radar sensor at Ichalkaranji Bridge on the main Panchganga stem, downstream of Kolhapur city. Key gauging station for downstream flood forecasting. Alert thresholds per WRD RTDSS Krishna basin records.',
    dangerLevels: {
      warning: 536.56,
      danger: 538.00,
      extreme: 539.50,
      hfl: 541.00
    },
    markerColor: '#ef4444'
  },
  {
    id: 'nitawade_kt',
    name: 'Nitawade Kasari River Bridge',
    shortName: 'Nitawade',
    channelId: 'YOUR_CHANNEL_ID_3',
    apiKey: 'YOUR_API_KEY_3',
    sensorType: 'Ultrasonic Radar — RTDAS',
    river: 'Kasari River',
    location: {
      // DMS: 16°44'40.95"N, 74°08'29.95"E (field-verified)
      lat: 16.744708,
      lng: 74.141653
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'Ultrasonic radar sensor at Nitawade Bridge over the Kasari River — a major Panchganga tributary. Monitors upstream inflow into the Kolhapur city reach. Alert levels per WRD RTDSS Krishna (RBL 532.0 m MSL).',
    dangerLevels: {
      warning: 543.00,
      danger: 544.00,
      extreme: 545.50,
      hfl: 547.00
    },
    markerColor: '#f59e0b'
  },
  {
    id: 'balinga_br',
    name: 'Balinge Bhogawati River Bridge',
    shortName: 'Balinge',
    channelId: 'YOUR_CHANNEL_ID_4',
    apiKey: 'YOUR_API_KEY_4',
    sensorType: 'Ultrasonic Radar — RTDAS',
    river: 'Bhogawati River',
    location: {
      // DMS: 16°41'30.00"N, 74°09'55.52"E (field-verified)
      lat: 16.691667,
      lng: 74.165422
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'Ultrasonic radar sensor at Balinge Bridge over the Bhogawati River — a western tributary feeding the Panchganga. Provides early flood signal for Kolhapur city. Alert levels per WRD RTDSS Krishna (RBL 530.5 m MSL).',
    dangerLevels: {
      warning: 542.00,
      danger: 543.00,
      extreme: 544.50,
      hfl: 546.00
    },
    markerColor: '#10b981'
  },
  {
    id: 'jayanti_nala',
    name: 'Jayanti Nala — Wilson Bridge',
    shortName: 'Jayanti Nala',
    channelId: 'YOUR_CHANNEL_ID_5',
    apiKey: 'YOUR_API_KEY_5',
    sensorType: 'Ultrasonic Radar — RTDAS',
    river: 'Jayanti Nala',
    location: {
      // DMS: 16°42'01.61"N 74°13'52.65"E (field-verified)
      lat: 16.700447,
      lng: 74.231292
    },
    district: 'Kolhapur',
    authority: 'Kolhapur Municipal Corporation (KMC)',
    description: 'Ultrasonic radar sensor at Wilson Bridge over the Jayanti Nala — an urban stormwater nala draining into the Panchganga within Kolhapur city. Critical for urban flood early warning. Thresholds aligned with Rajaram KT Weir MSL datum.',
    dangerLevels: {
      warning: 542.07,
      danger: 543.30,
      extreme: 545.61,
      hfl: 547.13
    },
    markerColor: '#8b5cf6'
  }
];

export const getSensorById = (id) => SENSORS.find(sensor => sensor.id === id);

export const getAllSensorLocations = () => SENSORS.map(sensor => ({
  id: sensor.id,
  name: sensor.name,
  position: [sensor.location.lat, sensor.location.lng],
  color: sensor.markerColor
}));

export const THINGSPEAK_API_BASE = 'https://api.thingspeak.com/channels';

export const THINGSPEAK_FIELDS = {
  waterLevel: 'field1',
  temperature: 'field2',
  batteryVoltage: 'field3',
  signalStrength: 'field4'
};
