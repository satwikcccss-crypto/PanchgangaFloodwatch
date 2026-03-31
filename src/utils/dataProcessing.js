// Data Processing Utilities

/**
 * Format timestamp for display
 * @param {string|Date} timestamp 
 * @param {string} format - 'time', 'date', 'datetime', 'relative'
 * @returns {string}
 */
export const formatTimestamp = (timestamp, format = 'datetime') => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid';
  
  const options = {
    timeZone: 'Asia/Kolkata',
  };
  
  switch (format) {
    case 'time':
      return date.toLocaleTimeString('en-IN', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    case 'date':
      return date.toLocaleDateString('en-IN', { ...options, day: '2-digit', month: 'short', year: 'numeric' });
    case 'datetime':
      return date.toLocaleString('en-IN', { 
        ...options, 
        day: '2-digit', month: 'short', 
        hour: '2-digit', minute: '2-digit' 
      });
    case 'relative':
      return getRelativeTime(date);
    case 'chart':
      return date.toLocaleTimeString('en-IN', { ...options, hour: '2-digit', minute: '2-digit' });
    default:
      return date.toLocaleString('en-IN', options);
  }
};

/**
 * Get relative time string
 * @param {Date} date 
 * @returns {string}
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds < 30) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

/**
 * Format water level value
 * @param {number} level 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatWaterLevel = (level, decimals = 2) => {
  if (level === null || level === undefined || isNaN(level)) return '--';
  return level.toFixed(decimals);
};

/**
 * Process ThingSpeak feeds for Chart.js
 * @param {Array} feeds 
 * @param {number} fieldNumber
 * @returns {Object} { labels, data }
 */
export const processChartData = (feeds, fieldNumber = 1) => {
  if (!feeds || !Array.isArray(feeds)) return { labels: [], data: [] };
  
  const labels = feeds.map(feed => formatTimestamp(feed.created_at, 'chart'));
  const data = feeds.map(feed => {
    const val = parseFloat(feed[`field${fieldNumber}`]);
    return isNaN(val) ? null : val;
  });
  
  return { labels, data };
};

/**
 * Calculate statistics from data array
 * @param {Array<number>} data 
 * @returns {Object}
 */
export const calculateStats = (data) => {
  const validData = data.filter(v => v !== null && !isNaN(v));
  if (validData.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0, count: 0 };
  }
  
  return {
    min: Math.min(...validData),
    max: Math.max(...validData),
    avg: validData.reduce((a, b) => a + b, 0) / validData.length,
    current: validData[validData.length - 1],
    count: validData.length,
  };
};

/**
 * Debounce function for performance
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
