import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, LayersControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import { SENSORS } from '../../config/sensors';
import { MAP_CONFIG } from '../../config/mapConfig';
import { getAlertConfig } from '../../config/alerts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Custom Marker Creator
const createMarkerIcon = (isSelected, color, alertLevel) => {
  const size = isSelected ? 48 : 32;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container ${isSelected ? 'selected' : ''}" style="width: ${size}px; height: ${size}px;">
        <div class="marker-pulse" style="background-color: ${color}"></div>
        <div class="marker-core" style="background-color: ${color}; border-color: white;">
           <span class="marker-label">${alertLevel === 'normal' ? '' : '!'}</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const FlyToSensor = ({ selectedSensorId }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedSensorId) {
      const sensor = SENSORS.find(s => s.id === selectedSensorId);
      if (sensor) map.flyTo([sensor.location.lat, sensor.location.lng], 13, { duration: 1.5 });
    }
  }, [selectedSensorId, map]);
  return null;
};

const InteractiveMap = ({ sensorData, selectedSensor, onSensorClick }) => {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={MAP_CONFIG.defaultCenter}
        zoom={MAP_CONFIG.defaultZoom}
        zoomControl={false}
        className="h-full w-full z-10 grayscale-[0.2] contrast-[1.1]"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <FlyToSensor selectedSensorId={selectedSensor} />

        {SENSORS.map((sensor) => {
          const data = sensorData?.[sensor.id];
          const alertLevel = data?.alertLevel || 'normal';
          const alertConfig = getAlertConfig(alertLevel);
          const isSelected = selectedSensor === sensor.id;

          return (
            <Marker
              key={sensor.id}
              position={[sensor.location.lat, sensor.location.lng]}
              icon={createMarkerIcon(isSelected, alertConfig.color, alertLevel)}
              eventHandlers={{
                click: () => onSensorClick?.(sensor.id),
              }}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -20]} 
                opacity={1} 
                className="custom-map-tooltip"
              >
                <div className="tooltip-plate min-w-[140px]">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-tight">
                        {sensor.name}
                      </h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sensor.river}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-slate-800 tabular-nums">
                      {data?.waterLevel?.toFixed(2) || '--'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">m MSL</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${alertConfig.color === '#10b981' ? 'text-emerald-500' : 'text-amber-500'}`}>
                       {data?.rateOfChange > 0 ? 'RISING' : 'STABLE'}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: alertConfig.color }} />
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-10 left-6 z-[1000] space-y-2 pointer-events-none">
         <div className="bg-white/90 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl pointer-events-auto">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Rainfall Intensity Level</h4>
            <div className="space-y-2">
               {[
                 { label: 'Normal / Light', color: '#10b981' },
                 { label: 'Warning / Moderate', color: '#f59e0b' },
                 { label: 'Critical / Heavy', color: '#ef4444' }
               ].map(item => (
                 <div key={item.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.label}</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-academic-blue px-3 py-1.5 rounded-lg text-white text-[8px] font-black tracking-[0.2em] shadow-lg pointer-events-none uppercase">
           CCCSS Flood Monitoring Net
         </div>
      </div>
    </div>
  );
};

export default React.memo(InteractiveMap);
