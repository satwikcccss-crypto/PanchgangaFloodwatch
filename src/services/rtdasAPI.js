/**
 * RTDAS API SERVICE — Client-Side River Level Fetcher
 * ====================================================
 * Fetches real-time river level data from the NHP Maharashtra RTDAS portal.
 *
 * The RTDAS site embeds all station data as hidden <input> fields in HTML.
 * This service fetches the page, parses the hidden inputs, and returns
 * structured data for the 4 target Panchganga basin stations:
 *
 *   2004 → Nitawade       (Kasari River)
 *   2005 → Balinga        (Bhogawati River) ← PRIMARY / COMPULSORY
 *   2006 → Wadange        (Shiroli Bridge / Panchganga)
 *   2007 → Ichalkaranji   (Panchganga River)
 *
 * Data Source: http://115.242.142.174:8080/NHPMH/Public/
 * Proxied via Vite dev-server at /api/rtdas (see vite.config.js)
 */

import axios from 'axios';

// ── RTDAS Configuration ────────────────────────────────────────────────────

/** Direct RTDAS URL (used via Vite proxy in dev) */
const RTDAS_PROXY_PATH = '/api/rtdas';

/** Public CORS proxy fallbacks for production / GitHub Pages deployment */
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

/** Original RTDAS endpoint (for proxy wrappers) */
const RTDAS_ORIGIN_URL = 'http://115.242.142.174:8080/NHPMH/Public/';

/** Target RTDAS station IDs we care about */
const TARGET_STATION_IDS = ['2004', '2005', '2006', '2007'];

/** Fields to extract from the RTDAS hidden inputs */
const RTDAS_FIELDS = [
  'location_id',
  'location_name',
  'water_level',
  'deschage',
  'lastUpdateList',
  'mst_today_rain',
  'mst_hour_rain',
  'mst_temp',
  'mst_humidity',
  'mst_arwl_river_flag',
  'latitude',
  'longitude',
];

// ── Singleton cache ────────────────────────────────────────────────────────

let _cachedData = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

// ── Core fetch logic ───────────────────────────────────────────────────────

/**
 * Attempt to fetch the RTDAS HTML page.
 * Tries Vite proxy first, then falls back to public CORS proxies.
 * @returns {string|null} Raw HTML text, or null on failure
 */
const fetchRtdasHtml = async () => {
  // 1. Try the Vite dev-server proxy (works in local dev)
  try {
    const res = await axios.get(RTDAS_PROXY_PATH, {
      timeout: 15000,
      responseType: 'text',
      headers: { Accept: 'text/html,*/*' },
    });
    if (res.data && typeof res.data === 'string' && res.data.includes('<input')) {
      console.log('[RTDAS] ✅ Fetched via Vite proxy');
      return res.data;
    }
  } catch (err) {
    console.warn('[RTDAS] Vite proxy unavailable, trying CORS proxies...', err.message);
  }

  // 2. Try public CORS proxies
  for (const makeUrl of CORS_PROXIES) {
    const url = makeUrl(RTDAS_ORIGIN_URL);
    try {
      const res = await axios.get(url, {
        timeout: 20000,
        responseType: 'text',
        headers: { Accept: 'text/html,*/*' },
      });
      if (res.data && typeof res.data === 'string' && res.data.includes('<input')) {
        console.log(`[RTDAS] ✅ Fetched via CORS proxy`);
        return res.data;
      }
    } catch (err) {
      console.warn(`[RTDAS] CORS proxy failed: ${err.message}`);
    }
  }

  console.error('[RTDAS] ❌ All fetch attempts failed');
  return null;
};

/**
 * Parse hidden <input> fields from the RTDAS HTML.
 * Returns a Map of stationId → { field: value, ... }
 */
const parseRtdasHtml = (html) => {
  // Build lookup: "fieldname_N" → value
  const lookup = {};
  const inputRegex = /<input[^>]+type=["']hidden["'][^>]*>/gi;
  let match;
  while ((match = inputRegex.exec(html)) !== null) {
    const tag = match[0];
    const idMatch = tag.match(/id="([^"]+)"/);
    const valMatch = tag.match(/value="([^"]*)"/);
    if (idMatch && valMatch) {
      lookup[idMatch[1]] = valMatch[1];
    }
  }

  const count = parseInt(lookup['count'] || '0', 10);
  if (!count) {
    console.warn('[RTDAS] No station count found in HTML');
    return new Map();
  }

  const stations = new Map();

  for (let i = 1; i <= count; i++) {
    const locId = lookup[`location_id_${i}`] || '';
    if (!TARGET_STATION_IDS.includes(locId)) continue;

    const stationData = {};
    for (const field of RTDAS_FIELDS) {
      stationData[field] = lookup[`${field}_${i}`] || '';
    }
    stations.set(locId, stationData);
  }

  return stations;
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch and parse all RTDAS stations. Uses a 30s TTL cache to avoid
 * redundant fetches when the dashboard calls fetchAllSensors().
 *
 * @returns {Map<string, Object>} Map of rtdasId → raw station data
 */
export const fetchAllRtdasStations = async () => {
  const now = Date.now();

  // Return cached data if still fresh
  if (_cachedData && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    console.log('[RTDAS] Using cached data');
    return _cachedData;
  }

  const html = await fetchRtdasHtml();
  if (html) {
    _cachedData = parseRtdasHtml(html);
    _cacheTimestamp = now;

    console.log(`[RTDAS] Parsed ${_cachedData.size} station(s):`,
      [..._cachedData.keys()].join(', '));

    return _cachedData;
  }

  // If HTML fetch fails (e.g., in production / GitHub Pages when proxies fail),
  // try loading from the static JSON file generated by the scheduled fetcher.
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const jsonUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}rtdas.json`;
    console.log(`[RTDAS] HTML fetch failed. Trying static JSON fallback: ${jsonUrl}`);
    const res = await axios.get(jsonUrl, { timeout: 10000 });
    if (res.data && typeof res.data === 'object') {
      const stations = new Map();
      Object.entries(res.data).forEach(([key, val]) => {
        stations.set(key, val);
      });
      if (stations.size > 0) {
        _cachedData = stations;
        _cacheTimestamp = now;
        console.log(`[RTDAS] ✅ Loaded ${stations.size} station(s) from static JSON`);
        return _cachedData;
      }
    }
  } catch (err) {
    console.warn('[RTDAS] ❌ Static JSON fallback failed:', err.message);
  }

  // Return stale cache if available, else empty
  return _cachedData || new Map();
};

/**
 * Get a single RTDAS station reading by its rtdasId.
 *
 * @param {string} rtdasId  e.g. '2005' for Balinga
 * @returns {Object|null} Raw RTDAS station data or null
 */
export const getRtdasStation = async (rtdasId) => {
  const stations = await fetchAllRtdasStations();
  return stations.get(rtdasId) || null;
};

/**
 * Convert raw RTDAS station data into the normalised telemetry format
 * used by the dashboard (matching ThingSpeak parsed output).
 *
 * @param {Object} raw       Raw RTDAS fields
 * @param {Object} sensor    Sensor config from sensors.js
 * @returns {Object}         Normalised reading
 */
export const normalizeRtdasReading = (raw, sensor) => {
  const waterLevel = parseFloat(raw.water_level) || 0;
  const temperature = parseFloat(raw.mst_temp) || null;
  const humidity = parseFloat(raw.mst_humidity) || null;
  const todayRain = parseFloat(raw.mst_today_rain) || null;
  const hourlyRain = parseFloat(raw.mst_hour_rain) || null;
  const discharge = parseFloat(raw.deschage) || null;

  // Parse RTDAS timestamp (format: "DD-MM-YYYY HH:MM:SS" or similar)
  let timestamp = new Date().toISOString();
  if (raw.lastUpdateList) {
    try {
      // Try common RTDAS formats
      const ts = raw.lastUpdateList.trim();
      // DD-MM-YYYY HH:MM:SS → ISO
      const ddmmyyyy = ts.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):?(\d{2})?/);
      if (ddmmyyyy) {
        const [, dd, mm, yyyy, hh, mi, ss = '00'] = ddmmyyyy;
        timestamp = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+05:30`).toISOString();
      } else {
        // Try direct parse
        const parsed = new Date(ts);
        if (!isNaN(parsed.getTime())) timestamp = parsed.toISOString();
      }
    } catch {
      // keep current time as fallback
    }
  }

  return {
    sensorId: sensor.id,
    sensorName: sensor.name,
    timestamp,
    waterLevel,
    temperature,
    humidity,
    todayRain,
    hourlyRain,
    discharge,
    batteryVoltage: null,
    signalStrength: null,
    dangerLevels: sensor.dangerLevels,
    location: sensor.location,
    status: waterLevel > 0 ? 'active' : 'inactive',
    dataSource: 'RTDAS',        // Flag so UI can distinguish
    rtdasStationId: raw.location_id,
    rtdasStationName: raw.location_name,
    isMockData: false,
  };
};

/**
 * Invalidate the RTDAS cache (e.g. after a manual refresh).
 */
export const invalidateRtdasCache = () => {
  _cachedData = null;
  _cacheTimestamp = 0;
};
