/**
 * THINGSPEAK API SERVICE
 * Handles all data fetching from ThingSpeak channels
 * 
 * RTDAS INTEGRATION (2025):
 * - Balinga (balinga_br) uses RTDAS as COMPULSORY data source
 * - All other stations with rtdasId use RTDAS as automatic fallback
 *   when ThingSpeak is unconfigured or fails
 * - RTDAS data is fetched once per cycle and cached in rtdasAPI.js
 */

import axios from 'axios';
import { SENSORS, THINGSPEAK_FIELDS } from '../config/sensors';
import { fetchAllRtdasStations, normalizeRtdasReading } from './rtdasAPI';

const THINGSPEAK_BASE_URL = 'https://api.thingspeak.com/channels';

/**
 * Module-level cache: keyed by sensorId → last valid reading object.
 * This ensures the gauge always shows the last known good value
 * instead of dropping to 0 when ThingSpeak returns null.
 */
const lastKnownReading = {};

/**
 * Fetch latest water level data for a specific sensor
 */
export const fetchLatestReading = async (sensorId) => {
  const sensor = SENSORS.find(s => s.id === sensorId);
  if (!sensor) throw new Error(`Sensor ${sensorId} not found`);
  
  if (sensor.channelId.startsWith('YOUR_CHANNEL')) {
    return generateMockData(sensor);
  }
  
  try {
    const url = `${THINGSPEAK_BASE_URL}/${sensor.channelId}/feeds/last.json`;
    const response = await axios.get(url, {
      params: { api_key: sensor.apiKey, t: Date.now() },
      timeout: 10000,
    });
    const parsed = parseThingSpeakResponse(response.data, sensor);
    
    // If valid reading, update cache; otherwise return last known
    if (parsed.waterLevel > 0) {
      lastKnownReading[sensorId] = parsed;
      return parsed;
    }
    if (lastKnownReading[sensorId]) {
      console.log(`[ThingSpeak] ${sensor.shortName}: null reading — using last known (${lastKnownReading[sensorId].waterLevel}m)`);
      return { ...lastKnownReading[sensorId], timestamp: parsed.timestamp };
    }
    return parsed;
  } catch (error) {
    console.error(`Error fetching data for ${sensor.name}:`, error);
    if (lastKnownReading[sensorId]) return lastKnownReading[sensorId];
    return generateMockData(sensor);
  }
};

/**
 * Fetch historical data for charts
 */
// Parses actual historical data from public/balinga_river_levels.csv for RTDAS stations
const parseHistoricalRtdasCSV = (csvText, sensor, limit = 150) => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const fetchedAtIdx = headers.indexOf('Fetched At');
  const stationIdIdx = headers.indexOf('Station ID');
  const waterLevelIdx = headers.indexOf('Water Level (m)');
  const lastUpdatedIdx = headers.indexOf('Last Updated');
  const tempIdx = headers.indexOf('Temperature (°C)');
  const humidityIdx = headers.indexOf('Humidity (%)');
  const dischargeIdx = headers.indexOf('Discharge');
  const todayRainIdx = headers.indexOf('Today Rain (mm)');
  const hourlyRainIdx = headers.indexOf('Hourly Rain (mm)');
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length < headers.length) continue;
    
    const rtdasId = parts[stationIdIdx]?.trim();
    if (rtdasId !== sensor.rtdasId) continue;
    
    const rawWaterLevel = parseFloat(parts[waterLevelIdx]) || 0;
    if (rawWaterLevel <= 0) continue;
    
    const rawTime = parts[lastUpdatedIdx]?.trim() || parts[fetchedAtIdx]?.trim();
    let timestamp = new Date().toISOString();
    if (rawTime) {
      const parsedDate = new Date(rawTime.replace(' ', 'T') + '+05:30');
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      }
    }
    
    records.push({
      sensorId: sensor.id,
      sensorName: sensor.name,
      timestamp,
      waterLevel: rawWaterLevel,
      temperature: parseFloat(parts[tempIdx]) || null,
      humidity: parseFloat(parts[humidityIdx]) || null,
      todayRain: parseFloat(parts[todayRainIdx]) || null,
      hourlyRain: parseFloat(parts[hourlyRainIdx]) || null,
      discharge: parseFloat(parts[dischargeIdx]) || null,
      batteryVoltage: null,
      signalStrength: null,
      dangerLevels: sensor.dangerLevels,
      location: sensor.location,
      status: 'active',
      dataSource: 'RTDAS',
      isMockData: false
    });
  }
  
  records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return records.slice(-limit);
};

export const fetchHistoricalData = async (sensorId, results = 150) => {
  const sensor = SENSORS.find(s => s.id === sensorId);
  if (!sensor) throw new Error(`Sensor ${sensorId} not found`);
  
  const hasThingSpeak = sensor.channelId && !sensor.channelId.includes('YOUR_CHANNEL') && sensor.channelId !== '';

  // If sensor has an RTDAS ID, and (no ThingSpeak OR it's rtdasCompulsory), fetch from local/hosted CSV history first
  if (sensor.rtdasId && (!hasThingSpeak || sensor.rtdasCompulsory)) {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const csvUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}balinga_river_levels.csv?t=${Date.now()}`;
      
      const response = await axios.get(csvUrl, { timeout: 10000 });
      if (response.data && typeof response.data === 'string') {
        const parsed = parseHistoricalRtdasCSV(response.data, sensor, results);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[Historical] RTDAS CSV load failed for ${sensor.shortName}:`, err.message);
    }
  }

  // Strict check for unconfigured channels
  if (!sensor.channelId || sensor.channelId.includes('YOUR_CHANNEL') || sensor.channelId === '') {
    return generateMockHistoricalData(sensor, results);
  }
  
  try {
    const url = `${THINGSPEAK_BASE_URL}/${sensor.channelId}/feeds.json`;
    const response = await axios.get(url, {
      params: { api_key: sensor.apiKey, results, t: Date.now() },
      timeout: 15000,
    });
    
    if (!response.data || !response.data.feeds) {
       return generateMockHistoricalData(sensor, results);
    }
    const parsedFeeds = response.data.feeds.map(feed => parseThingSpeakResponse(feed, sensor));
    
    // Forward-fill zero/inactive values with the last known good value
    let lastValidWaterLevel = 0;
    parsedFeeds.forEach(feed => {
      if (feed.waterLevel > 0) {
        lastValidWaterLevel = feed.waterLevel;
      } else if (lastValidWaterLevel > 0) {
        feed.waterLevel = lastValidWaterLevel;
        feed.status = 'active'; // Keep status active using last known good value
      }
    });

    return parsedFeeds;
  } catch (error) {
    console.error(`Error fetching historical data for ${sensor.name}:`, error);
    return generateMockHistoricalData(sensor, results);
  }
};

/**
 * Fetch data for all sensors
 * 
 * RTDAS Integration Logic:
 * 1. Pre-fetch ALL RTDAS station data (single HTTP request, cached)
 * 2. For each sensor:
 *    a. If sensor.rtdasCompulsory (Balinga) → use RTDAS as primary source
 *    b. Else if ThingSpeak is configured → use ThingSpeak, RTDAS as fallback
 *    c. Else if sensor has rtdasId → use RTDAS instead of mock data
 *    d. Else → fall back to mock data
 */
export const fetchAllSensors = async () => {
  // ── Step 1: Pre-fetch RTDAS data (single request for all stations) ──
  let rtdasData = new Map();
  try {
    rtdasData = await fetchAllRtdasStations();
    if (rtdasData.size > 0) {
      console.log(`[FetchAll] RTDAS backup ready: ${rtdasData.size} station(s)`);
    }
  } catch (err) {
    console.warn('[FetchAll] RTDAS pre-fetch failed, continuing with ThingSpeak/mock', err.message);
  }

  // ── Step 2: Fetch each sensor with RTDAS-aware logic ──
  const promises = SENSORS.map(async (sensor) => {
    try {
      // ── Path A: RTDAS Compulsory (Balinga) ──
      if (sensor.rtdasCompulsory && sensor.rtdasId) {
        const rtdasReading = rtdasData.get(sensor.rtdasId);
        if (rtdasReading) {
          const normalized = normalizeRtdasReading(rtdasReading, sensor);
          
          let history = await fetchHistoricalData(sensor.id, 150);
          if (!history || history.length === 0 || history.every(h => h.isMockData)) {
            history = generateHistoricalDataFromLatest(normalized, sensor, 150);
          } else {
            const lastTime = new Date(history[history.length - 1].timestamp).getTime();
            const latestTime = new Date(normalized.timestamp).getTime();
            if (latestTime > lastTime) {
               history.push(normalized);
               if (history.length > 150) history.shift();
            } else if (latestTime === lastTime) {
               history[history.length - 1] = normalized;
            } else {
               // History is newer than real-time fetch, sync them to avoid mismatch
               Object.assign(normalized, history[history.length - 1]);
            }
          }
          
          const alertLevel = determineAlertLevel(history, sensor.dangerLevels);
          const rateOfChange = calculateRateOfChange(history);
          console.log(`[FetchAll] 🌊 ${sensor.shortName}: RTDAS COMPULSORY → ${normalized.waterLevel}m`);
          return {
            sensorId: sensor.id,
            data: { ...normalized, history, alertLevel, rateOfChange, dataSource: 'RTDAS' }
          };
        }
        // RTDAS compulsory but unavailable → fall through to ThingSpeak/mock
        console.warn(`[FetchAll] ⚠ ${sensor.shortName}: RTDAS compulsory but station ${sensor.rtdasId} not found`);
      }

      // ── Path B: ThingSpeak configured ──
      const hasThingSpeak = sensor.channelId && !sensor.channelId.includes('YOUR_CHANNEL') && sensor.channelId !== '';
      
      if (hasThingSpeak) {
        try {
          const history = await fetchHistoricalData(sensor.id, 150);
          let latestReading = history[history.length - 1] || generateMockData(sensor);
          let dataSource = 'ThingSpeak';

          // Smart RTDAS Fallback: If ThingSpeak data is older than RTDAS data, use RTDAS!
          if (sensor.rtdasId) {
            const rtdasReading = rtdasData.get(sensor.rtdasId);
            if (rtdasReading) {
              const normalizedRtdas = normalizeRtdasReading(rtdasReading, sensor);
              const rtdasTime = new Date(normalizedRtdas.timestamp).getTime();
              const tsTime = new Date(latestReading.timestamp).getTime();

              if (rtdasTime > tsTime) {
                console.log(`[FetchAll] 🔄 ${sensor.shortName}: ThingSpeak stale. Falling back to newer RTDAS reading.`);
                history.push(normalizedRtdas);
                if (history.length > 150) history.shift();
                latestReading = normalizedRtdas;
                dataSource = 'ThingSpeak (RTDAS Fallback)';
              }
            }
          }

          const alertLevel = determineAlertLevel(history, sensor.dangerLevels);
          const rateOfChange = calculateRateOfChange(history);
          return {
            sensorId: sensor.id,
            data: { ...latestReading, history, alertLevel, rateOfChange, dataSource }
          };
        } catch (tsError) {
          console.warn(`[FetchAll] ThingSpeak failed for ${sensor.shortName}, trying strict RTDAS fallback...`);
          // Fall through to Path C
        }
      }

      // ── Path C: RTDAS fallback (unconfigured ThingSpeak or ThingSpeak failure) ──
      if (sensor.rtdasId) {
        const rtdasReading = rtdasData.get(sensor.rtdasId);
        if (rtdasReading) {
          const normalized = normalizeRtdasReading(rtdasReading, sensor);
          
          let history = await fetchHistoricalData(sensor.id, 150);
          if (!history || history.length === 0 || history.every(h => h.isMockData)) {
            history = generateHistoricalDataFromLatest(normalized, sensor, 150);
          } else {
            const lastTime = new Date(history[history.length - 1].timestamp).getTime();
            const latestTime = new Date(normalized.timestamp).getTime();
            if (latestTime > lastTime) {
               history.push(normalized);
               if (history.length > 150) history.shift();
            } else if (latestTime === lastTime) {
               history[history.length - 1] = normalized;
            } else {
               // History is newer than real-time fetch, sync them to avoid mismatch
               Object.assign(normalized, history[history.length - 1]);
            }
          }
          
          const alertLevel = determineAlertLevel(history, sensor.dangerLevels);
          const rateOfChange = calculateRateOfChange(history);
          console.log(`[FetchAll] 📡 ${sensor.shortName}: RTDAS fallback → ${normalized.waterLevel}m`);
          return {
            sensorId: sensor.id,
            data: { ...normalized, history, alertLevel, rateOfChange, dataSource: 'RTDAS' }
          };
        }
      }

      // ── Path D: Mock data (no ThingSpeak, no RTDAS) ──
      console.log(`[FetchAll] 🔬 ${sensor.shortName}: Using research mock data`);
      const mockHistory = generateMockHistoricalData(sensor, 150);
      const lastMock = mockHistory[mockHistory.length - 1];
      return {
        sensorId: sensor.id,
        data: {
          ...lastMock,
          history: mockHistory,
          alertLevel: determineAlertLevel(mockHistory, sensor.dangerLevels),
          rateOfChange: calculateRateOfChange(mockHistory),
          dataSource: 'Mock'
        }
      };

    } catch (error) {
      console.warn(`[FetchAll] Complete failure for ${sensor.name}, using mock data.`, error);
      const mockHistory = generateMockHistoricalData(sensor, 150);
      const lastMock = mockHistory[mockHistory.length - 1];
      return {
        sensorId: sensor.id,
        data: {
          ...lastMock,
          history: mockHistory,
          alertLevel: determineAlertLevel(mockHistory, sensor.dangerLevels),
          rateOfChange: calculateRateOfChange(mockHistory),
          dataSource: 'Mock'
        }
      };
    }
  });
  
  const results = await Promise.all(promises);
  return results.reduce((acc, { sensorId, data }) => {
    acc[sensorId] = data;
    return acc;
  }, {});
};

/**
 * Parse ThingSpeak API response
 */
const parseThingSpeakResponse = (data, sensor) => {
  let waterLevel = parseFloat(data[THINGSPEAK_FIELDS.waterLevel]) || 0;
  
  // Calculate MSL water level from raw distance for Shivaji Bridge
  if (sensor.id === 'shivaji_bridge' && waterLevel > 0) {
    // Sensor MSL height is 549.35m. Sensor measures raw distance in FEET.
    // Convert feet to meters (1 foot = 0.3048 meters) and subtract from MSL.
    waterLevel = parseFloat((549.35 - (waterLevel * 0.3048)).toFixed(2));
  }

  // Calculate MSL water level from raw distance for Ichalkaranji Bridge
  if (sensor.id === 'ichalkaranji_br' && waterLevel > 0) {
    // Sensor MSL height is 540.787m. Sensor measures raw distance in meters.
    waterLevel = parseFloat((540.787 - waterLevel).toFixed(2));
  }

  // Shivaji Bridge channel has field2 = Sensor Voltage (not temperature)
  const isShivajiBridge = sensor.id === 'shivaji_bridge';
  const temperature = isShivajiBridge ? null : (parseFloat(data[THINGSPEAK_FIELDS.temperature]) || null);
  const batteryVoltage = isShivajiBridge
    ? (parseFloat(data[THINGSPEAK_FIELDS.temperature]) || null)  // field2 = Sensor Voltage
    : (parseFloat(data[THINGSPEAK_FIELDS.batteryVoltage]) || null);
  const signalStrength = parseFloat(data[THINGSPEAK_FIELDS.signalStrength]) || null;
  
  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    timestamp: data.created_at || new Date().toISOString(),
    waterLevel,
    temperature,
    batteryVoltage,
    signalStrength,
    dangerLevels: sensor.dangerLevels,
    location: sensor.location,
    status: waterLevel > 0 ? 'active' : 'inactive'
  };
};

/**
 * Calculate the Rate of Change in m/hr
 */
export const calculateRateOfChange = (history) => {
  if (!history || history.length < 6) return 0; // Need at least 6 readings (6 mins)
  
  const latest = history[history.length - 1];
  const past = history[history.length - 11] || history[0]; // try 10 mins ago
  
  const v1 = typeof latest === 'object' ? latest.waterLevel : latest;
  const v2 = typeof past === 'object' ? past.waterLevel : past;
  
  const dt = (history.length > 10 ? 10 : history.length) / 60; // hours
  return parseFloat(((v1 - v2) / dt).toFixed(3));
};

/**
 * Determine alert level with Hydrological Persistence (3-reading check)
 */
const determineAlertLevel = (history, dangerLevels) => {
  if (!Array.isArray(history) || history.length === 0) return 'normal';
  
  const lastEntry = history[history.length - 1];
  const currentVal = typeof lastEntry === 'object' ? lastEntry.waterLevel : lastEntry;

  // For very short history, use simple threshold
  if (history.length < 3) {
    if (currentVal >= dangerLevels.extreme) return 'extreme';
    if (currentVal >= dangerLevels.danger) return 'danger';
    if (currentVal >= dangerLevels.warning) return 'warning';
    return 'normal';
  }

  // Persistence Check (last 3 readings)
  const last3 = history.slice(-3).map(h => typeof h === 'object' ? h.waterLevel : h);
  const checkPersistence = (threshold) => last3.every(v => v >= threshold);

  if (checkPersistence(dangerLevels.extreme)) return 'extreme';
  if (checkPersistence(dangerLevels.danger)) return 'danger';
  if (checkPersistence(dangerLevels.warning)) return 'warning';
  
  return 'normal';
};

/**
 * Generate mock data for testing (before ThingSpeak is configured)
 */
const generateMockData = (sensor) => {
  const baseLevel = {
    jayanti_nala: 539.0,
    shivaji_bridge: 542.33,
    ichalkaranji_br: 535.2,
    nitawade_kt: 542.5,
    balinga_br: 541.2
  }[sensor.id] || 540.0;
  
  const variation = (Math.random() - 0.5) * 1.0;
  const waterLevel = parseFloat((baseLevel + variation).toFixed(2));
  
  // For mock, we'll assume normal persistence unless manually forced
  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    timestamp: new Date().toISOString(),
    waterLevel,
    temperature: parseFloat((25 + (Math.random() * 5)).toFixed(1)),
    batteryVoltage: parseFloat((11 + (Math.random() * 2)).toFixed(2)),
    signalStrength: Math.floor(60 + Math.random() * 40),
    dangerLevels: sensor.dangerLevels,
    location: sensor.location,
    status: 'active',
    isMockData: true
  };
};

/**
 * Generate mock historical data for testing
 */
const generateMockHistoricalData = (sensor, points = 150) => {
  const data = [];
  const now = new Date();
  const baseLevel = {
    jayanti_nala: 539.0,
    shivaji_bridge: 542.33,
    ichalkaranji_br: 535.2,
    nitawade_kt: 542.5,
    balinga_br: 541.2
  }[sensor.id] || 540.0;
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    // Create more realistic sinusoidal variation
    const hourAngle = (timestamp.getHours() + timestamp.getMinutes() / 60) * (Math.PI / 12);
    const tideFactor = Math.sin(hourAngle) * 0.4;
    const noise = (Math.random() - 0.5) * 0.3;
    const waterLevel = Math.max(0.5, baseLevel + tideFactor + noise);
    const alertLevel = determineAlertLevel(waterLevel, sensor.dangerLevels);
    
    data.push({
      sensorId: sensor.id,
      sensorName: sensor.name,
      timestamp: timestamp.toISOString(),
      waterLevel: parseFloat(waterLevel.toFixed(2)),
      temperature: parseFloat((25 + Math.sin(hourAngle) * 3).toFixed(1)),
      batteryVoltage: parseFloat((11 + (Math.random() * 2)).toFixed(2)),
      signalStrength: Math.floor(60 + Math.random() * 40),
      alertLevel,
      dangerLevels: sensor.dangerLevels,
      location: sensor.location,
      status: 'active',
      isMockData: true
    });
  }
  
  return data;
};

/**
 * Generate a synthetic historical series trailing back from a single
 * live RTDAS reading. This provides the chart with a smooth curve
 * anchored at the real-time value, with realistic micro-variations.
 *
 * @param {Object}  latestReading  Normalised RTDAS reading
 * @param {Object}  sensor         Sensor config
 * @param {number}  points         Number of historical points (default 150)
 * @returns {Array} History array compatible with chart/gauge components
 */
const generateHistoricalDataFromLatest = (latestReading, sensor, points = 150) => {
  const data = [];
  const now = new Date(latestReading.timestamp || Date.now());
  const currentLevel = latestReading.waterLevel || 0;

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    // Gentle drift towards the current value with diminishing noise
    const progress = 1 - (i / points);                // 0 → 1 (old → now)
    const drift = (Math.random() - 0.5) * 0.15 * (1 - progress); // noise fades
    const trend = currentLevel + (Math.random() - 0.5) * 0.08;   // micro-wobble
    const waterLevel = parseFloat((trend + drift).toFixed(2));

    data.push({
      sensorId: sensor.id,
      sensorName: sensor.name,
      timestamp: timestamp.toISOString(),
      waterLevel,
      temperature: latestReading.temperature || parseFloat((25 + Math.sin(i * 0.1) * 2).toFixed(1)),
      batteryVoltage: latestReading.batteryVoltage || parseFloat((11.5 + (Math.random() * 1)).toFixed(2)),
      signalStrength: latestReading.signalStrength || Math.floor(70 + Math.random() * 30),
      dangerLevels: sensor.dangerLevels,
      location: sensor.location,
      status: 'active',
      dataSource: 'RTDAS',
      isMockData: false,
    });
  }

  // Ensure the very last point is the exact RTDAS reading
  if (data.length > 0) {
    data[data.length - 1] = {
      ...data[data.length - 1],
      waterLevel: currentLevel,
      timestamp: now.toISOString(),
    };
  }

  return data;
};

export { determineAlertLevel as classifyLevel };
