// MSL (Mean Sea Level) Calculation Utilities

/**
 * Convert sensor reading to MSL elevation
 * @param {number} sensorReading - Water level reading from sensor (meters above sensor base)
 * @param {number} sensorElevation - Sensor base elevation in meters MSL
 * @returns {number} Water level in meters MSL
 */
export const toMSL = (sensorReading, sensorElevation) => {
  if (sensorReading === null || sensorReading === undefined) return null;
  return sensorElevation + sensorReading;
};

/**
 * Convert MSL to local depth
 * @param {number} mslLevel - Water level in meters MSL  
 * @param {number} sensorElevation - Sensor base elevation MSL
 * @returns {number} Local water depth in meters
 */
export const fromMSL = (mslLevel, sensorElevation) => {
  if (mslLevel === null) return null;
  return mslLevel - sensorElevation;
};

/**
 * Convert meters to feet
 * @param {number} meters 
 * @returns {number}
 */
export const metersToFeet = (meters) => {
  if (meters === null || meters === undefined) return null;
  return meters * 3.28084;
};

/**
 * Convert feet to meters
 * @param {number} feet 
 * @returns {number}
 */
export const feetToMeters = (feet) => {
  if (feet === null || feet === undefined) return null;
  return feet / 3.28084;
};

/**
 * Format MSL display string
 * @param {number} level - Level in meters
 * @param {number} elevation - Base elevation MSL
 * @param {string} unit - 'm' or 'ft'
 * @returns {string}
 */
export const formatMSLDisplay = (level, elevation, unit = 'm') => {
  if (level === null || level === undefined) return 'N/A';
  
  const mslValue = elevation + level;
  
  if (unit === 'ft') {
    return `${metersToFeet(mslValue).toFixed(1)} ft MSL`;
  }
  return `${mslValue.toFixed(2)} m MSL`;
};

/**
 * Calculate flood stage descriptor
 * @param {number} waterLevel 
 * @param {Object} dangerLevels 
 * @returns {string} descriptive stage
 */
export const getFloodStage = (waterLevel, dangerLevels) => {
  if (!waterLevel || waterLevel <= 0) return 'No Data';
  
  const { warning, danger, extreme } = dangerLevels;
  const pctOfWarning = (waterLevel / warning) * 100;
  
  if (waterLevel >= extreme) return 'Above HFL';
  if (waterLevel >= danger) return 'Flood Stage';
  if (waterLevel >= warning) return 'Alert Stage';
  if (pctOfWarning > 80) return 'Rising';
  if (pctOfWarning > 50) return 'Moderate';
  return 'Low';
};
