/**
 * THINGSPEAK API SERVICE
 * Handles all data fetching from ThingSpeak channels
 */

import axios from 'axios';
import { SENSORS, THINGSPEAK_FIELDS } from '../config/sensors';

const THINGSPEAK_BASE_URL = 'https://api.thingspeak.com/channels';

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
      params: { api_key: sensor.apiKey },
      timeout: 10000,
    });
    return parseThingSpeakResponse(response.data, sensor);
  } catch (error) {
    console.error(`Error fetching data for ${sensor.name}:`, error);
    return generateMockData(sensor);
  }
};

/**
 * Fetch historical data for charts
 */
export const fetchHistoricalData = async (sensorId, results = 150) => {
  const sensor = SENSORS.find(s => s.id === sensorId);
  if (!sensor) throw new Error(`Sensor ${sensorId} not found`);
  
  // Strict check for unconfigured channels
  if (!sensor.channelId || sensor.channelId.includes('YOUR_CHANNEL') || sensor.channelId === '') {
    return generateMockHistoricalData(sensor, results);
  }
  
  try {
    const url = `${THINGSPEAK_BASE_URL}/${sensor.channelId}/feeds.json`;
    const response = await axios.get(url, {
      params: { api_key: sensor.apiKey, results },
      timeout: 15000,
    });
    
    if (!response.data || !response.data.feeds) {
       return generateMockHistoricalData(sensor, results);
    }

    return response.data.feeds.map(feed => parseThingSpeakResponse(feed, sensor));
  } catch (error) {
    console.error(`Error fetching historical data for ${sensor.name}:`, error);
    return generateMockHistoricalData(sensor, results);
  }
};

/**
 * Fetch data for all sensors
 */
export const fetchAllSensors = async () => {
  const promises = SENSORS.map(sensor =>
    fetchHistoricalData(sensor.id, 150)
      .then(history => {
        const latestReading = history[history.length - 1] || generateMockData(sensor);
        
        // Calculate Hydrological State at the Aggregation Level
        const alertLevel = determineAlertLevel(history, sensor.dangerLevels);
        const rateOfChange = calculateRateOfChange(history);

        return { 
          sensorId: sensor.id, 
          data: { 
            ...latestReading, 
            history, 
            alertLevel, 
            rateOfChange 
          } 
        };
      })
      .catch(error => {
        console.warn(`API Error for ${sensor.name}, falling back to research data.`, error);
        const mockHistory = generateMockHistoricalData(sensor, 150);
        const lastMock = mockHistory[mockHistory.length - 1];
        return {
          sensorId: sensor.id,
          data: { 
            ...lastMock, 
            history: mockHistory, 
            alertLevel: determineAlertLevel(mockHistory, sensor.dangerLevels),
            rateOfChange: calculateRateOfChange(mockHistory)
          }
        };
      })
  );
  
  const results = await Promise.all(promises);
  return results.reduce((acc, { sensorId, data, error }) => {
    acc[sensorId] = error ? { ...data, error } : data;
    return acc;
  }, {});
};

/**
 * Parse ThingSpeak API response
 */
const parseThingSpeakResponse = (data, sensor) => {
  const waterLevel = parseFloat(data[THINGSPEAK_FIELDS.waterLevel]) || 0;
  const temperature = parseFloat(data[THINGSPEAK_FIELDS.temperature]) || null;
  const batteryVoltage = parseFloat(data[THINGSPEAK_FIELDS.batteryVoltage]) || null;
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
    jayanti_nala: 540.5,
    shivaji_bridge: 541.8,
    ichalkaranji_br: 535.2,
    nitawade_kt: 542.5,
    balinga_br: 541.2
  }[sensor.id] || 540.0;
  
  const variation = (Math.random() - 0.5) * 1.0;
  const waterLevel = parseFloat(waterLevelRaw.toFixed(2));
  
  // For mock, we'll assume normal persistence unless manually forced
  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    timestamp: new Date().toISOString(),
    waterLevel: parseFloat(waterLevel.toFixed(2)),
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
    jayanti_nala: 540.5,
    shivaji_bridge: 541.8,
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

export { determineAlertLevel as classifyLevel };
