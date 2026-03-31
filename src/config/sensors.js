export const SENSORS = [
  {
    id: 'jayanti_nala',
    name: 'Jayanti Nala Wilson Bridge',
    channelId: 'YOUR_CHANNEL_ID_1',
    apiKey: 'YOUR_API_KEY_1',
    location: {
      lat: 16.7000, 
      lng: 74.2300 
    },
    district: 'Kolhapur',
    authority: 'Kolhapur Municipal Corporation (KMC)',
    description: 'Verified urban nala crossing from KMC drainage + WRD flood-line maps (central Kolhapur on Jayanti Nala joining Panchganga). Uses Rajaram KT Weir MSL standards.',
    dangerLevels: {
      warning: 542.07,
      danger: 543.30,
      extreme: 545.61,
      hfl: 547.13
    },
    markerColor: '#0f4c81' // academic blue
  },
  {
    id: 'shivaji_bridge',
    name: 'Shivaji Bridge',
    channelId: 'YOUR_CHANNEL_ID_2',
    apiKey: 'YOUR_API_KEY_2',
    location: {
      lat: 16.7112,
      lng: 74.2238
    },
    district: 'Kolhapur',
    authority: 'Kolhapur Municipal Corporation (KMC)',
    description: 'Wadange GD station, immediate upstream of Shivaji Bridge area. Uses Rajaram KT Weir MSL alert baseline.',
    dangerLevels: {
      warning: 542.07,
      danger: 543.30,
      extreme: 545.61,
      hfl: 547.13
    },
    markerColor: '#8b5cf6'
  },
  {
    id: 'ichalkaranji_br',
    name: 'Ichalkaranji Bridge',
    channelId: 'YOUR_CHANNEL_ID_3',
    apiKey: 'YOUR_API_KEY_3',
    location: {
      lat: 16.6850,
      lng: 74.4550
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'Official GD station at Ichalkaranji bridge on main Panchganga stem. Thresholds per WRD RTDSS Krishna.',
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
    name: 'Nitawade KT Weir',
    channelId: 'YOUR_CHANNEL_ID_4',
    apiKey: 'YOUR_API_KEY_4',
    location: {
      lat: 16.7458,
      lng: 74.1431
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'GD station at Kasari tributary. Alert levels confirmed via RTDSS Krishna (RBL 532.0m).',
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
    name: 'Balinga Bridge',
    channelId: 'YOUR_CHANNEL_ID_5',
    apiKey: 'YOUR_API_KEY_5',
    location: {
      lat: 16.6917,
      lng: 74.1653
    },
    district: 'Kolhapur',
    authority: 'WRD Maharashtra',
    description: 'GD station at Balinga bridge (Bhogawati). Alert levels confirmed via RTDSS Krishna (RBL 530.5m).',
    dangerLevels: {
      warning: 542.00,
      danger: 543.00,
      extreme: 544.50,
      hfl: 546.00
    },
    markerColor: '#10b981'
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

