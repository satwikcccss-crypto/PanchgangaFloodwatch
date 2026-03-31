// Alert Classification Service
// CWC (Central Water Commission) standard flood classification logic
import { ALERT_CONFIG } from '../config/alerts';

const { cwcClassification } = ALERT_CONFIG;

/**
 * Classify water level according to CWC standards
 * @param {number} waterLevel - Current water level in meters
 * @param {Object} dangerLevels - Sensor-specific threshold levels
 * @returns {Object} Classification result
 */
export const classifyWaterLevel = (waterLevel, dangerLevels) => {
  if (waterLevel === null || waterLevel === undefined || isNaN(waterLevel)) {
    return {
      ...cwcClassification.normal,
      level: 'normal',
      percentage: 0,
      isActive: false,
    };
  }

  const { warning, danger, extreme } = dangerLevels;

  if (waterLevel >= extreme) {
    return {
      ...cwcClassification.extreme,
      level: 'extreme',
      percentage: Math.min(100, (waterLevel / extreme) * 100),
      isActive: true,
      exceedance: waterLevel - extreme,
    };
  }

  if (waterLevel >= danger) {
    return {
      ...cwcClassification.danger,
      level: 'danger',
      percentage: ((waterLevel - danger) / (extreme - danger)) * 100,
      isActive: true,
      exceedance: waterLevel - danger,
    };
  }

  if (waterLevel >= warning) {
    return {
      ...cwcClassification.warning,
      level: 'warning',
      percentage: ((waterLevel - warning) / (danger - warning)) * 100,
      isActive: true,
      exceedance: waterLevel - warning,
    };
  }

  return {
    ...cwcClassification.normal,
    level: 'normal',
    percentage: Math.min(100, (waterLevel / warning) * 100),
    isActive: false,
    margin: warning - waterLevel,
  };
};

/**
 * Get overall dashboard alert status (highest priority across all sensors)
 * @param {Object} sensorData - All sensor data
 * @param {Array} sensorConfigs - Sensor configurations
 * @returns {Object} Overall status
 */
export const getOverallStatus = (sensorData, sensorConfigs) => {
  let highestPriority = -1;
  let overallStatus = { ...cwcClassification.normal, level: 'normal' };
  let criticalSensors = [];

  sensorConfigs.forEach((sensor) => {
    const data = sensorData[sensor.id];
    if (!data || data.waterLevel === null) return;

    const classification = classifyWaterLevel(data.waterLevel, sensor.dangerLevels);

    if (classification.priority > highestPriority) {
      highestPriority = classification.priority;
      overallStatus = classification;
    }

    if (classification.priority >= 2) {
      criticalSensors.push({
        sensor: sensor,
        classification: classification,
        waterLevel: data.waterLevel,
      });
    }
  });

  return {
    ...overallStatus,
    criticalSensors,
    totalSensors: sensorConfigs.length,
    activeSensors: Object.values(sensorData).filter(d => d && d.isOnline).length,
  };
};

/**
 * Calculate gauge percentage for the engineering gauge display
 * @param {number} waterLevel 
 * @param {Object} dangerLevels 
 * @returns {number} 0-100 percentage
 */
export const getGaugePercentage = (waterLevel, dangerLevels) => {
  if (!waterLevel || waterLevel <= 0) return 0;
  const maxScale = dangerLevels.extreme * 1.2; // 20% above HFL as max gauge
  return Math.min(100, (waterLevel / maxScale) * 100);
};

/**
 * Get trend from historical data
 * @param {Array} feeds - Historical feed data
 * @param {number} fieldNumber - ThingSpeak field number
 * @returns {Object} Trend info
 */
export const calculateTrend = (feeds, fieldNumber = 1) => {
  if (!feeds || feeds.length < 2) {
    return { direction: 'stable', change: 0, symbol: '→' };
  }

  const recent = parseFloat(feeds[feeds.length - 1][`field${fieldNumber}`]) || 0;
  const previous = parseFloat(feeds[feeds.length - 2][`field${fieldNumber}`]) || 0;
  const change = recent - previous;

  if (Math.abs(change) < 0.05) {
    return { direction: 'stable', change: 0, symbol: '→' };
  }

  return change > 0
    ? { direction: 'rising', change: change.toFixed(2), symbol: '↑' }
    : { direction: 'falling', change: Math.abs(change).toFixed(2), symbol: '↓' };
};
