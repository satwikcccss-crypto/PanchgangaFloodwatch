import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';
import { SENSORS } from '../../config/sensors';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getAlertConfig } from '../../config/alerts';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

const MicroRadarGauge = ({ sensor, data }) => {
  const level = data?.waterLevel || 0;
  const rawBase = sensor.dangerLevels.warning - 2;
  const rawTop = sensor.dangerLevels.hfl + 2;
  const baseMsl = Math.floor(rawBase * 5) / 5;
  const topMsl = Math.ceil(rawTop * 5) / 5;
  const range = (topMsl - baseMsl) || 1;
  const fillPercentage = Math.max(0, Math.min(100, ((level - baseMsl) / range) * 100));

  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      <div className="text-[11px] font-black font-mono tracking-tighter text-slate-800">
        {level.toFixed(2)}m
      </div>
      <div className="w-8 h-28 bg-slate-50 border-2 border-slate-900 relative rounded-sm overflow-hidden shadow-inner">
        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/10"
          style={{ height: `${((sensor.dangerLevels.warning - baseMsl) / range) * 100}%` }} />
        <div className="absolute left-0 right-0 bg-yellow-500/20"
          style={{
            bottom: `${((sensor.dangerLevels.warning - baseMsl) / range) * 100}%`,
            height: `${((sensor.dangerLevels.danger - sensor.dangerLevels.warning) / range) * 100}%`
          }} />
        <div className="absolute left-0 right-0 bg-red-500/20"
          style={{
            bottom: `${((sensor.dangerLevels.danger - baseMsl) / range) * 100}%`,
            height: `${((topMsl - sensor.dangerLevels.danger) / range) * 100}%`
          }} />
        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-700 ease-out z-10"
          style={{ height: `${fillPercentage}%` }}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400/50 animate-pulse" />
        </div>
        <div className="absolute left-0 right-0 h-px bg-slate-900 border-t border-white/50 z-20"
          style={{ bottom: `${fillPercentage}%` }} />
      </div>
      <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">MSL</div>
    </div>
  );
};

const FlyToSensor = ({ selectedSensorId }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedSensorId) {
      const sensor = SENSORS.find(s => s.id === selectedSensorId);
      if (sensor) map.flyTo([sensor.location.lat, sensor.location.lng], 14, { duration: 1.2 });
    }
  }, [selectedSensorId, map]);
  return null;
};

const InteractiveMap = ({ sensorData, selectedSensor, onSensorClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="academic-panel h-full flex flex-col overflow-hidden shadow-sm"
    >
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <MapIcon className="w-5 h-5 text-academic-blue" />
          <div>
            <h2 className="text-sm font-bold font-serif text-academic-blue uppercase tracking-tight">
              Panchganga Basin — RTDAS Station Network
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Hover over a station marker to view live telemetry data
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {SENSORS.length} Active Nodes
          </span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[350px]">
        <MapContainer
          center={MAP_CONFIG.defaultCenter}
          zoom={MAP_CONFIG.defaultZoom}
          className="h-full w-full z-10"
        >
          <LayersControl position="topright">
            <BaseLayer name="OpenStreetMap" checked>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </BaseLayer>
            <BaseLayer name="Google Hybrid">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                attribution="Google Maps"
              />
            </BaseLayer>
            <BaseLayer name="ESRI Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />
            </BaseLayer>
            <BaseLayer name="ESRI Topography">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri"
              />
            </BaseLayer>
          </LayersControl>

          <LayersControl position="bottomright">
            <LayersControl.Overlay name="Precipitation Radar (Live)" checked>
              <TileLayer
                url="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=8c6f40fc4f2c52789ab7fb96bcce2d72"
                attribution="OpenWeatherMap"
                opacity={0.6}
              />
            </LayersControl.Overlay>
          </LayersControl>

          <FlyToSensor selectedSensorId={selectedSensor} />

          {SENSORS.map((sensor) => {
            const data = sensorData?.[sensor.id];
            const alertLevel = data?.alertLevel || 'normal';
            const alertConfig = getAlertConfig(alertLevel);
            const isSelected = selectedSensor === sensor.id;
            const waterLevel = data?.waterLevel;
            const isMock = data?.isMockData;

            return (
              <CircleMarker
                key={sensor.id}
                center={[sensor.location.lat, sensor.location.lng]}
                radius={isSelected ? 13 : 9}
                pathOptions={{
                  color: isSelected ? '#1e3a5f' : alertConfig.color,
                  fillColor: alertConfig.color,
                  fillOpacity: 0.92,
                  weight: isSelected ? 4 : 2,
                }}
                eventHandlers={{ click: () => onSensorClick?.(sensor.id) }}
              >
                {/* Tooltip — shows on HOVER */}
                <Tooltip
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                  permanent={false}
                  className="rtdas-tooltip"
                >
                  <div style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 13px',
                    minWidth: '220px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                    fontFamily: 'inherit'
                  }}>
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '7px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
                        {sensor.river} • {sensor.authority}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f4c81', display: 'block', marginTop: '2px', lineHeight: 1.2 }}>
                        {sensor.name}
                      </span>
                    </div>

                    {/* Water level row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Water Level</span>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: alertConfig.color, fontFamily: 'monospace', lineHeight: 1.1 }}>
                          {waterLevel != null ? `${waterLevel.toFixed(2)} m` : '—'}
                          <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, marginLeft: '3px' }}>MSL</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: '99px',
                        background: alertConfig.bgColor, color: alertConfig.color,
                        border: `1px solid ${alertConfig.color}40`
                      }}>
                        {alertConfig.label}
                      </span>
                    </div>

                    {/* Thresholds */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      {[
                        { label: 'Warn', val: sensor.dangerLevels.warning, color: '#f59e0b' },
                        { label: 'Danger', val: sensor.dangerLevels.danger, color: '#f97316' },
                        { label: 'HFL', val: sensor.dangerLevels.hfl, color: '#ef4444' },
                      ].map(t => (
                        <div key={t.label} style={{ flex: 1, background: '#f8fafc', borderRadius: '6px', padding: '4px 5px', textAlign: 'center', border: `1px solid ${t.color}30` }}>
                          <span style={{ fontSize: '8px', color: t.color, fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>{t.label}</span>
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#334155', fontFamily: 'monospace' }}>{t.val}m</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '5px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 700 }}>
                        {sensor.sensorType}
                      </span>
                      <span style={{
                        fontSize: '8px', fontWeight: 700,
                        color: isMock ? '#f59e0b' : '#10b981',
                        display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: isMock ? '#f59e0b' : '#10b981',
                          display: 'inline-block'
                        }} />
                        {isMock ? 'Demo Data' : 'Live RTDAS'}
                      </span>
                    </div>
                  </div>
                </Tooltip>

                {/* Popup — shows on CLICK (detailed) */}
                <Popup maxWidth={300} className="radar-popup">
                  <div style={{ padding: '4px', minWidth: '260px', fontFamily: 'inherit' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {sensor.authority}
                      </span>
                      <h3 style={{ fontWeight: 900, color: '#0f4c81', fontSize: '13px', margin: '2px 0', lineHeight: 1.2 }}>
                        {sensor.name}
                      </h3>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>{sensor.river}</span>
                    </div>
                    <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.6, borderLeft: '2px solid #e2e8f0', paddingLeft: '8px', marginBottom: '8px', fontStyle: 'italic' }}>
                      {sensor.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                      <span>📍 {sensor.location.lat.toFixed(4)}°N, {sensor.location.lng.toFixed(4)}°E</span>
                      <span style={{ color: isMock ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                        {isMock ? '⚠ Demo Data' : '● Live RTDAS'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Institutional footer over map */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold text-slate-500 shadow-sm pointer-events-none">
          CCCSS • SHIVAJI UNIVERSITY KOLHAPUR
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(InteractiveMap);
