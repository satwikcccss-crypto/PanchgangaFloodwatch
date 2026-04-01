import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Map as MapIcon, Layers, Maximize2, Info } from 'lucide-react';
import { SENSORS } from '../../config/sensors';
import { MAP_CONFIG, RIVER_POI, getMarkerStyle } from '../../config/mapConfig';
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
    <div className="flex flex-col items-center gap-1 min-w-[70px]">
        <div className="text-[10px] font-black font-mono tracking-tighter text-slate-800">
            {level.toFixed(2)}m
        </div>
        <div className="w-8 h-32 bg-slate-50 border-2 border-slate-900 relative rounded-sm overflow-hidden shadow-inner">
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/10" style={{ height: `${((sensor.dangerLevels.warning - baseMsl) / range) * 100}%` }} />
            <div 
                className="absolute left-0 right-0 bg-yellow-500/20" 
                style={{ 
                    bottom: `${((sensor.dangerLevels.warning - baseMsl) / range) * 100}%`, 
                    height: `${((sensor.dangerLevels.danger - sensor.dangerLevels.warning) / range) * 100}%` 
                }} 
            />
            <div 
                className="absolute left-0 right-0 bg-red-500/20" 
                style={{ 
                    bottom: `${((sensor.dangerLevels.danger - baseMsl) / range) * 100}%`, 
                    height: `${((topMsl - sensor.dangerLevels.danger) / range) * 100}%` 
                }} 
            />
            <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-700 ease-out z-10"
                style={{ height: `${fillPercentage}%` }}
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400/50 animate-pulse" />
            </div>
            <div className="absolute left-0 right-0 h-px bg-slate-900 border-t border-white/50 z-20" style={{ bottom: `${fillPercentage}%` }} />
        </div>
        <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">MSL STAGE</div>
    </div>
  );
};

const FlyToSensor = ({ selectedSensorId }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedSensorId) {
      const sensor = SENSORS.find(s => s.id === selectedSensorId);
      if (sensor) map.flyTo([sensor.location.lat, sensor.location.lng], 14);
    }
  }, [selectedSensorId, map]);
  return null;
};

const InteractiveMap = ({ sensorData, selectedSensor, onSensorClick }) => {
  const bhogavatiPath = useMemo(() => [
    [16.6917, 74.1653], // Balinga Bridge
    [16.7112, 74.1678], // Prayag Sangam connection
  ], []);

  const kasariPath = useMemo(() => [
    [16.7458, 74.1431], // Nitawade weir
    [16.7112, 74.1678], // Prayag Sangam connection
  ], []);

  const jayantiPath = useMemo(() => [
    [16.7000, 74.2300], // Jayanti Nala Wilson Bridge
    [16.7030, 74.2350], // Meets Panchganga
  ], []);

  const panchgangaPath = useMemo(() => [
    [16.7112, 74.1678], // Prayag Sangam 
    [16.7030, 74.2350], // Jayanti confluence
    [16.7050, 74.2433], // Rajaram KT Weir
    [16.7119, 74.2722], // Shivaji Bridge (Wadange stretch)
    [16.6850, 74.3500], 
    [16.6656, 74.4761], // Ichalkaranji
  ], []);

  const pathOptions = { color: '#0ea5e9', weight: 4, opacity: 0.8, dashArray: '8, 8' };
  const nalaOptions = { color: '#8b5cf6', weight: 3, opacity: 0.7, dashArray: '5, 5' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="academic-panel h-full flex flex-col overflow-hidden shadow-sm"
    >
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <MapIcon className="w-5 h-5 text-academic-blue" />
          <h2 className="text-sm font-bold font-serif text-academic-blue uppercase tracking-tight">Panchganga Basin Geospatial Network</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">Real-time Node Status</span>
        </div>
      </div>
      
      <div className="relative flex-1 min-h-[350px]">
        <MapContainer
          center={MAP_CONFIG.defaultCenter}
          zoom={MAP_CONFIG.defaultZoom}
          className="h-full w-full z-10"
        >
          <LayersControl position="topright">
            <BaseLayer name="OpenStreetMap (Default)" checked>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            </BaseLayer>
            <BaseLayer name="Google Map Hybrid">
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google Maps" />
            </BaseLayer>
            <BaseLayer name="ESRI Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
            </BaseLayer>
            <BaseLayer name="ESRI Topography">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
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
          
          {/* TRIBUTARIES */}
          <Polyline positions={bhogavatiPath} pathOptions={pathOptions} />
          <Polyline positions={kasariPath} pathOptions={pathOptions} />
          <Polyline positions={panchgangaPath} pathOptions={{ ...pathOptions, color: '#3b82f6', weight: 5, dashArray: 'none' }} />
          <Polyline positions={jayantiPath} pathOptions={nalaOptions} />
          
          {/* POINTS OF INTEREST */}
          {RIVER_POI.map((poi) => (
            <CircleMarker
              key={poi.id}
              center={poi.location}
              radius={6}
              pathOptions={{
                color: '#475569',
                fillColor: '#94a3b8',
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Popup className="radar-popup">
                <div className="p-1 px-2">
                  <span className="text-xl inline-block mb-1">{poi.icon}</span>
                  <h3 className="font-serif font-black text-slate-800 text-sm">{poi.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{poi.description}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* SENSORS */}
          {SENSORS.map((sensor) => {

            const data = sensorData?.[sensor.id];
            const alertLevel = data?.alertLevel || 'normal';
            const alertConfig = getAlertConfig(alertLevel);
            const isSelected = selectedSensor === sensor.id;
            
            return (
              <CircleMarker
                key={sensor.id}
                center={[sensor.location.lat, sensor.location.lng]}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                  color: isSelected ? 'white' : alertConfig.color,
                  fillColor: alertConfig.color,
                  fillOpacity: 0.9,
                  weight: isSelected ? 4 : 2,
                }}
                eventHandlers={{ click: () => onSensorClick?.(sensor.id) }}
              >
                <Popup maxWidth={320} className="radar-popup">
                  <div className="p-1 flex items-start gap-4 min-w-[280px]">
                    <div className="flex-1 space-y-2">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{sensor.authority}</span>
                            <h3 className="font-serif font-black text-academic-blue text-sm uppercase leading-tight mt-0.5">{sensor.name}</h3>
                        </div>
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex justify-between items-center text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            <span className="font-semibold">Current Level:</span>
                            <span className="font-bold text-academic-blue">{data?.waterLevel?.toFixed(2) || '--'} m MSL</span>
                          </div>
                          <div className="flex justify-between text-amber-600 px-2 border-b border-slate-100 pb-0.5">
                            <span>Warning:</span>
                            <span className="font-semibold">{sensor.dangerLevels.warning}m</span>
                          </div>
                          <div className="flex justify-between text-orange-600 px-2 border-b border-slate-100 pb-0.5">
                            <span>Danger:</span>
                            <span className="font-semibold">{sensor.dangerLevels.danger}m</span>
                          </div>
                          <div className="flex justify-between text-red-600 px-2">
                            <span>HFL:</span>
                            <span className="font-semibold">{sensor.dangerLevels.hfl}m</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${data?.isMockData ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${data?.isMockData ? 'text-amber-600' : 'text-slate-400'}`}>
                                {data?.isMockData ? 'Mode: Demo Data' : 'Live Telemetry Active'}
                              </span>
                            </div>
                            {data?.timestamp && (
                              <span className="text-[8px] font-mono text-slate-400">
                                {new Date(data.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                        </div>
                    </div>
                    <MicroRadarGauge sensor={sensor} data={data} />
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Institutional Credit Over Map */}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white border border-slate-200 px-3 py-1.5 rounded-md text-[9px] tracking-widest font-bold text-slate-500 shadow-sm pointer-events-none">
          SHIVAJI UNIVERSITY KOLHAPUR • CCCSS
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(InteractiveMap);

